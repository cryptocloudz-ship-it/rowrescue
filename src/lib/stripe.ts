import Stripe from "stripe";

// RR_-prefixed keys come from the Vercel Marketplace Stripe integration; the unprefixed ones are the
// older manually added keys, kept as a fallback for local development.
export const stripe = new Stripe((process.env.RR_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY)!, {
  typescript: true,
});
