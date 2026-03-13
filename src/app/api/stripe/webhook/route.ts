import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle.
 * In production, verify signature with Stripe SDK and update Neon DB.
 *
 * Events handled:
 * - checkout.session.completed → Create/update subscription record
 * - customer.subscription.updated → Update plan/status
 * - customer.subscription.deleted → Downgrade to free
 * - invoice.payment_failed → Mark as past_due
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // In production, verify with Stripe SDK:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

  // MVP: Parse the event for structure
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const customerEmail = session.customer_email as string;

      // TODO: Upsert user in Neon
      // await db.query(`
      //   UPDATE users
      //   SET stripe_customer_id = $1,
      //       stripe_subscription_id = $2,
      //       plan = 'pro',
      //       subscription_status = 'active'
      //   WHERE email = $3
      // `, [customerId, subscriptionId, customerEmail]);

      console.log(
        `[Stripe] checkout.session.completed: ${customerEmail}, sub=${subscriptionId}`
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const subId = subscription.id as string;
      const status = subscription.status as string;
      const periodEnd = subscription.current_period_end as number;

      // TODO: Update subscription in Neon
      // await db.query(`
      //   UPDATE users
      //   SET subscription_status = $1,
      //       current_period_end = to_timestamp($2)
      //   WHERE stripe_subscription_id = $3
      // `, [status, periodEnd, subId]);

      console.log(
        `[Stripe] subscription.updated: sub=${subId}, status=${status}, end=${periodEnd}`
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const subId = subscription.id as string;

      // TODO: Downgrade user to free
      // await db.query(`
      //   UPDATE users
      //   SET plan = 'free',
      //       subscription_status = 'canceled',
      //       stripe_subscription_id = NULL
      //   WHERE stripe_subscription_id = $1
      // `, [subId]);

      console.log(`[Stripe] subscription.deleted: sub=${subId}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      // TODO: Mark as past_due
      // await db.query(`
      //   UPDATE users
      //   SET subscription_status = 'past_due'
      //   WHERE stripe_customer_id = $1
      // `, [customerId]);

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
