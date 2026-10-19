import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import {
  handleChargeRefunded,
  handleDisputeCreated,
  handleEarlyFraudWarning,
  subscriptionsForPaymentIntent,
} from "../riskEvents";

type Fake = {
  charges: Record<string, Partial<Stripe.Charge>>;
  invoicePayments: Record<string, { id: string; invoice: string }[]>; // keyed by payment intent
  invoices: Record<string, Partial<Stripe.Invoice>>;
  subscriptions: Record<string, Stripe.Subscription.Status>;
};

function fakeStripe(data: Fake, pageSize = 100) {
  const cancel = vi.fn(async (id: string) => {
    data.subscriptions[id] = "canceled";
    return { id };
  });
  const refund = vi.fn(async () => ({ id: "re_1" }));
  const client = {
    charges: { retrieve: vi.fn(async (id: string) => data.charges[id]) },
    invoicePayments: {
      list: vi.fn(async (params: Stripe.InvoicePaymentListParams) => {
        const all = data.invoicePayments[params.payment!.payment_intent!] ?? [];
        const start = params.starting_after ? all.findIndex((p) => p.id === params.starting_after) + 1 : 0;
        const slice = all.slice(start, start + pageSize);
        return { data: slice, has_more: start + pageSize < all.length };
      }),
    },
    invoices: { retrieve: vi.fn(async (id: string) => data.invoices[id]) },
    subscriptions: {
      retrieve: vi.fn(async (id: string) => ({ id, status: data.subscriptions[id] })),
      cancel,
    },
    refunds: { create: refund },
  };
  return { client: client as unknown as Parameters<typeof handleChargeRefunded>[0], cancel, refund };
}

const subInvoice = (sub: string): Partial<Stripe.Invoice> => ({
  parent: { type: "subscription_details", subscription_details: { subscription: sub } } as Stripe.Invoice.Parent,
});

function baseData(): Fake {
  return {
    charges: { ch_1: { id: "ch_1", payment_intent: "pi_1", refunded: false } },
    invoicePayments: { pi_1: [{ id: "inpay_1", invoice: "in_1" }] },
    invoices: { in_1: subInvoice("sub_1") },
    subscriptions: { sub_1: "active" },
  };
}

describe("subscriptionsForPaymentIntent", () => {
  it("follows pagination and ignores non-subscription invoices", async () => {
    const data = baseData();
    data.invoicePayments.pi_1 = [
      { id: "inpay_1", invoice: "in_1" },
      { id: "inpay_2", invoice: "in_2" },
      { id: "inpay_3", invoice: "in_3" },
    ];
    data.invoices.in_2 = { parent: null };
    data.invoices.in_3 = subInvoice("sub_2");
    const { client } = fakeStripe(data, 1);
    expect(await subscriptionsForPaymentIntent(client, "pi_1")).toEqual(["sub_1", "sub_2"]);
  });
});

describe("handleChargeRefunded", () => {
  it("cancels the subscription on a full refund", async () => {
    const data = baseData();
    const { client, cancel } = fakeStripe(data);
    const out = await handleChargeRefunded(client, { id: "ch_1", payment_intent: "pi_1", refunded: true } as Stripe.Charge);
    expect(out).toEqual({ subscriptionIds: ["sub_1"], canceled: ["sub_1"] });
    expect(cancel).toHaveBeenCalledWith("sub_1", { prorate: false, invoice_now: false });
  });

  it("leaves the subscription alone on a partial refund", async () => {
    const { client, cancel } = fakeStripe(baseData());
    const out = await handleChargeRefunded(client, { id: "ch_1", payment_intent: "pi_1", refunded: false } as Stripe.Charge);
    expect(out.skipped).toBe("partial refund");
    expect(cancel).not.toHaveBeenCalled();
  });

  it("is a no-op on retry once the subscription is canceled", async () => {
    const data = baseData();
    data.subscriptions.sub_1 = "canceled";
    const { client, cancel } = fakeStripe(data);
    const out = await handleChargeRefunded(client, { id: "ch_1", payment_intent: "pi_1", refunded: true } as Stripe.Charge);
    expect(out).toEqual({ subscriptionIds: ["sub_1"], canceled: [] });
    expect(cancel).not.toHaveBeenCalled();
  });

  it("skips charges with no payment intent", async () => {
    const { client } = fakeStripe(baseData());
    const out = await handleChargeRefunded(client, { id: "ch_x", payment_intent: null, refunded: true } as Stripe.Charge);
    expect(out.skipped).toBe("no payment intent");
  });
});

describe("handleDisputeCreated", () => {
  it("retrieves the charge when the dispute has no payment intent, then cancels", async () => {
    const { client, cancel } = fakeStripe(baseData());
    const out = await handleDisputeCreated(client, { id: "dp_1", charge: "ch_1", payment_intent: null } as Stripe.Dispute);
    expect(out.canceled).toEqual(["sub_1"]);
    expect(cancel).toHaveBeenCalledOnce();
  });
});

describe("handleEarlyFraudWarning", () => {
  it("refunds an actionable warning idempotently and cancels", async () => {
    const { client, refund, cancel } = fakeStripe(baseData());
    const out = await handleEarlyFraudWarning(client, {
      id: "issfr_1",
      charge: "ch_1",
      payment_intent: "pi_1",
      actionable: true,
    } as Stripe.Radar.EarlyFraudWarning);
    expect(out).toEqual({ subscriptionIds: ["sub_1"], canceled: ["sub_1"], refunded: true });
    expect(cancel).toHaveBeenCalledOnce();
    expect(refund).toHaveBeenCalledWith(
      { charge: "ch_1", reason: "fraudulent", metadata: { early_fraud_warning: "issfr_1" } },
      { idempotencyKey: "efw-refund-issfr_1" }
    );
  });

  it("does not refund a non-actionable warning", async () => {
    const { client, refund } = fakeStripe(baseData());
    const out = await handleEarlyFraudWarning(client, {
      id: "issfr_2",
      charge: "ch_1",
      payment_intent: "pi_1",
      actionable: false,
    } as Stripe.Radar.EarlyFraudWarning);
    expect(out.refunded).toBe(false);
    expect(refund).not.toHaveBeenCalled();
  });
});
