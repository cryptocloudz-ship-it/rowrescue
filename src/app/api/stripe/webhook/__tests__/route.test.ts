import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  event: null as unknown,
  subscription: null as unknown,
  provisionTeam: vi.fn(),
  syncSeatCount: vi.fn(),
  dbSet: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: () => mocks.event },
    subscriptions: { retrieve: async () => mocks.subscription },
  },
}));
vi.mock("@/db", () => ({
  db: { update: () => ({ set: (values: unknown) => (mocks.dbSet(values), { where: async () => {} }) }) },
}));
vi.mock("@/lib/teams/data", () => ({ provisionTeam: mocks.provisionTeam, syncSeatCount: mocks.syncSeatCount }));
vi.mock("@/config/plans", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/config/plans")>()),
  planForPriceId: (id?: string) => (id === "price_team" ? "team" : id === "price_pro" ? "pro" : null),
}));

const { POST } = await import("../route");

function subscription(priceId: string, quantity: number, status = "active") {
  return { id: "sub_1", status, items: { data: [{ price: { id: priceId }, quantity, current_period_end: 1_900_000_000 }] } };
}

async function send(event: unknown) {
  mocks.event = event;
  const req = new NextRequest("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": "t=1,v1=x" },
  });
  return POST(req);
}

beforeEach(() => vi.clearAllMocks());

describe("Stripe webhook: teams", () => {
  const checkout = {
    type: "checkout.session.completed",
    data: { object: { client_reference_id: "user_1", subscription: "sub_1", customer: "cus_1", metadata: {} } },
  };

  it("creates a team sized to the seats bought on a Team checkout", async () => {
    mocks.subscription = subscription("price_team", 5);
    const res = await send(checkout);
    expect(res.status).toBe(200);
    expect(mocks.dbSet).toHaveBeenCalledWith(expect.objectContaining({ plan: "team", stripeSubscriptionId: "sub_1" }));
    expect(mocks.provisionTeam).toHaveBeenCalledWith("user_1", "sub_1", 5);
  });

  it("doesn't create a team for a Pro checkout", async () => {
    mocks.subscription = subscription("price_pro", 1);
    await send(checkout);
    expect(mocks.provisionTeam).not.toHaveBeenCalled();
  });

  it("follows seat changes on a Team subscription", async () => {
    await send({ type: "customer.subscription.updated", data: { object: subscription("price_team", 8) } });
    expect(mocks.syncSeatCount).toHaveBeenCalledWith("sub_1", 8);
  });

  it("leaves seats alone when a subscription is canceled", async () => {
    await send({ type: "customer.subscription.updated", data: { object: subscription("price_team", 8, "canceled") } });
    expect(mocks.syncSeatCount).not.toHaveBeenCalled();
  });
});
