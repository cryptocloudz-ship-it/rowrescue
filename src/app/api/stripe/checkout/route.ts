import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { PLANS, planForPriceId } from "@/config/plans";
import { ensureUser } from "@/lib/billing/ensureUser";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId, utm } = await request.json();

  // Only our own plan prices can be bought
  const plan = planForPriceId(priceId);
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid price ID" },
      { status: 400 }
    );
  }

  const user = await ensureUser(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const seats = PLANS[plan].seats;
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [
      seats
        ? { price: priceId, quantity: seats.min, adjustable_quantity: { enabled: true, minimum: seats.min, maximum: seats.max } }
        : { price: priceId, quantity: 1 },
    ],
    allow_promotion_codes: true,
    client_reference_id: userId,
    success_url: `${request.nextUrl.origin}/billing?success=true`,
    cancel_url: `${request.nextUrl.origin}/pricing`,
    metadata: {
      clerkUserId: userId,
      ...(utm?.utm_source && { utm_source: String(utm.utm_source).slice(0, 500) }),
      ...(utm?.utm_medium && { utm_medium: String(utm.utm_medium).slice(0, 500) }),
      ...(utm?.utm_campaign && { utm_campaign: String(utm.utm_campaign).slice(0, 500) }),
    },
  };

  // Use existing Stripe customer if available, otherwise pass email
  if (user.stripeCustomerId) {
    sessionParams.customer = user.stripeCustomerId;
  } else {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}
