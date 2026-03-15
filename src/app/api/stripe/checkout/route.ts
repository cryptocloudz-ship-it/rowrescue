import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId, utm } = await request.json();

  // Validate priceId against known Stripe price IDs
  const allowedPriceIds = new Set(
    [
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID,
    ].filter(Boolean)
  );

  if (!priceId || !allowedPriceIds.has(priceId)) {
    return NextResponse.json(
      { error: "Invalid price ID" },
      { status: 400 }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
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
