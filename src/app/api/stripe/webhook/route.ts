import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { planForPriceId } from "@/config/plans";
import type Stripe from "stripe";

type StoredStatus = "active" | "past_due" | "canceled" | "trialing" | "incomplete";

/** Collapse Stripe's subscription statuses into the ones we store. Terminal states count as canceled. */
function storedStatus(status: Stripe.Subscription.Status): StoredStatus {
  switch (status) {
    case "active":
    case "past_due":
    case "trialing":
    case "incomplete":
    case "canceled":
      return status;
    default: // unpaid, incomplete_expired, paused
      return "canceled";
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      (process.env.RR_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET)!
    );
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.client_reference_id ?? session.metadata?.clerkUserId;

      if (!clerkUserId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const item = subscription.items.data[0];
      const priceId = item?.price.id;
      const plan = planForPriceId(priceId) ?? "pro";
      const periodEnd = item?.current_period_end;

      await db
        .update(users)
        .set({
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          plan,
          subscriptionStatus: storedStatus(subscription.status),
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, clerkUserId));

      console.log(
        `[Stripe] checkout.session.completed: user=${clerkUserId}, plan=${plan}`
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = storedStatus(subscription.status);
      const updatedItem = subscription.items.data[0];
      const updatedPeriodEnd = updatedItem?.current_period_end;
      // Plan changes made in the Customer Portal arrive here as a new price
      const plan = status === "canceled" ? "free" : planForPriceId(updatedItem?.price.id);

      await db
        .update(users)
        .set({
          ...(plan && { plan }),
          subscriptionStatus: status,
          currentPeriodEnd: updatedPeriodEnd
            ? new Date(updatedPeriodEnd * 1000)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeSubscriptionId, subscription.id));

      console.log(
        `[Stripe] subscription.updated: sub=${subscription.id}, status=${subscription.status}`
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await db
        .update(users)
        .set({
          plan: "free",
          subscriptionStatus: "canceled",
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeSubscriptionId, subscription.id));

      console.log(`[Stripe] subscription.deleted: sub=${subscription.id}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await db
        .update(users)
        .set({
          subscriptionStatus: "past_due",
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));

      console.log(
        `[Stripe] invoice.payment_failed: customer=${customerId}`
      );
      break;
    }

    case "invoice.paid": {
      // A successful retry after a failed payment restores access
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await db
        .update(users)
        .set({ subscriptionStatus: "active", updatedAt: new Date() })
        .where(and(eq(users.stripeCustomerId, customerId), eq(users.subscriptionStatus, "past_due")));

      console.log(`[Stripe] invoice.paid: customer=${customerId}`);
      break;
    }

    default:
      console.log(`[Stripe] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
