import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { PLANS } from "@/config/plans";
import type Stripe from "stripe";

function priceIdToPlan(priceId: string): "pro" | "team" | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (planId === "free") continue;
    if (
      plan.stripePriceIdMonthly === priceId ||
      plan.stripePriceIdYearly === priceId
    ) {
      return planId as "pro" | "team";
    }
  }
  return null;
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;

      if (!clerkUserId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const item = subscription.items.data[0];
      const priceId = item?.price.id;
      const plan = priceIdToPlan(priceId) ?? "pro";
      const periodEnd = item?.current_period_end;

      await db
        .update(users)
        .set({
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          plan,
          subscriptionStatus: "active",
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
      const status = subscription.status;
      const updatedItem = subscription.items.data[0];
      const updatedPeriodEnd = updatedItem?.current_period_end;
      const mappedStatus =
        status === "active" ||
        status === "past_due" ||
        status === "canceled" ||
        status === "trialing" ||
        status === "incomplete"
          ? status
          : null;

      if (mappedStatus) {
        await db
          .update(users)
          .set({
            subscriptionStatus: mappedStatus,
            currentPeriodEnd: updatedPeriodEnd
              ? new Date(updatedPeriodEnd * 1000)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeSubscriptionId, subscription.id));
      }

      console.log(
        `[Stripe] subscription.updated: sub=${subscription.id}, status=${status}`
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

    default:
      console.log(`[Stripe] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
