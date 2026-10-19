import type Stripe from "stripe";

/**
 * Refund, dispute and early-fraud-warning handling.
 *
 * Policy:
 * - Full refund → end the subscription now (a partial refund is treated as a goodwill credit).
 * - Dispute opened → end the subscription now so the customer isn't charged again.
 * - Actionable early fraud warning → refund the charge (cheaper than losing a dispute) and end
 *   the subscription.
 *
 * Charges are resolved to subscriptions through Stripe's object graph (API 2025-03-31.basil and
 * later): PaymentIntent → paid InvoicePayments → Invoice.parent.subscription_details.
 */

type StripeClient = Pick<Stripe, "charges" | "invoicePayments" | "invoices" | "subscriptions" | "refunds">;

/** Subscription statuses that can still bill or grant access, so are worth canceling. */
const CANCELABLE = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due", "incomplete", "unpaid", "paused"]);

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/** The PaymentIntent behind a charge, retrieving the charge if the event object didn't carry it. */
export async function paymentIntentForCharge(
  stripe: StripeClient,
  chargeRef: string | Stripe.Charge,
  paymentIntentRef?: string | Stripe.PaymentIntent | null
): Promise<string | null> {
  const fromEvent = idOf(paymentIntentRef);
  if (fromEvent) return fromEvent;
  const charge = typeof chargeRef === "string" ? await stripe.charges.retrieve(chargeRef) : chargeRef;
  return idOf(charge.payment_intent);
}

/** IDs of the subscriptions whose invoices were paid by this PaymentIntent (usually zero or one). */
export async function subscriptionsForPaymentIntent(stripe: StripeClient, paymentIntentId: string): Promise<string[]> {
  const invoiceIds = new Set<string>();
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.invoicePayments.list({
      payment: { type: "payment_intent", payment_intent: paymentIntentId },
      status: "paid",
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
    });
    for (const p of page.data) {
      const id = idOf(p.invoice as string | { id: string });
      if (id) invoiceIds.add(id);
    }
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1].id;
  }

  const subscriptionIds = new Set<string>();
  for (const invoiceId of invoiceIds) {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice.parent?.type !== "subscription_details") continue;
    const sub = idOf(invoice.parent.subscription_details?.subscription);
    if (sub) subscriptionIds.add(sub);
  }
  return [...subscriptionIds];
}

/** Cancel each subscription that is still live. Returns the IDs that were canceled by this call. */
export async function cancelSubscriptions(stripe: StripeClient, subscriptionIds: string[]): Promise<string[]> {
  const canceled: string[] = [];
  for (const id of subscriptionIds) {
    const sub = await stripe.subscriptions.retrieve(id);
    if (!CANCELABLE.has(sub.status)) continue; // already canceled: webhook retries are no-ops
    await stripe.subscriptions.cancel(id, { prorate: false, invoice_now: false });
    canceled.push(id);
  }
  return canceled;
}

export type RiskOutcome = {
  /** Subscriptions resolved from the charge. */
  subscriptionIds: string[];
  /** Of those, the ones this event canceled. The DB should be downgraded for all of subscriptionIds. */
  canceled: string[];
  refunded?: boolean;
  skipped?: string;
};

export async function handleChargeRefunded(stripe: StripeClient, charge: Stripe.Charge): Promise<RiskOutcome> {
  if (!charge.refunded) return { subscriptionIds: [], canceled: [], skipped: "partial refund" };
  const pi = await paymentIntentForCharge(stripe, charge, charge.payment_intent);
  if (!pi) return { subscriptionIds: [], canceled: [], skipped: "no payment intent" };
  const subscriptionIds = await subscriptionsForPaymentIntent(stripe, pi);
  return { subscriptionIds, canceled: await cancelSubscriptions(stripe, subscriptionIds) };
}

export async function handleDisputeCreated(stripe: StripeClient, dispute: Stripe.Dispute): Promise<RiskOutcome> {
  const pi = await paymentIntentForCharge(stripe, dispute.charge, dispute.payment_intent);
  if (!pi) return { subscriptionIds: [], canceled: [], skipped: "no payment intent" };
  const subscriptionIds = await subscriptionsForPaymentIntent(stripe, pi);
  return { subscriptionIds, canceled: await cancelSubscriptions(stripe, subscriptionIds) };
}

export async function handleEarlyFraudWarning(
  stripe: StripeClient,
  warning: Stripe.Radar.EarlyFraudWarning
): Promise<RiskOutcome> {
  const pi = await paymentIntentForCharge(stripe, warning.charge, warning.payment_intent);
  const subscriptionIds = pi ? await subscriptionsForPaymentIntent(stripe, pi) : [];
  const canceled = await cancelSubscriptions(stripe, subscriptionIds);

  let refunded = false;
  // Not actionable means it's already disputed or fully refunded
  if (warning.actionable) {
    await stripe.refunds.create(
      { charge: idOf(warning.charge)!, reason: "fraudulent", metadata: { early_fraud_warning: warning.id } },
      { idempotencyKey: `efw-refund-${warning.id}` }
    );
    refunded = true;
  }
  return { subscriptionIds, canceled, refunded };
}
