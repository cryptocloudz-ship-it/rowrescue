import Stripe from "stripe";

// STRIPE_LIVE_* is the live account, set in Vercel production only. RR_-prefixed keys come from the
// Vercel Marketplace Stripe sandbox (test mode); the unprefixed ones are older manually added keys,
// kept as a fallback for local development.
export const stripe = new Stripe(
  (process.env.STRIPE_LIVE_SECRET_KEY || process.env.RR_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY)!,
  {
    typescript: true,
  }
);
