#!/usr/bin/env node
/**
 * Idempotently create SpreadsheetFix's Stripe catalog and webhook endpoint.
 *
 *   test:  vercel --scope <team> env run -e production -- node scripts/stripe-setup.mjs
 *   live:  STRIPE_LIVE_SECRET_KEY=rk_live_… node scripts/stripe-setup.mjs --live
 *          (the live key is a sensitive Vercel var, so the CLI can't read it; supply it in your shell)
 *
 * - One Product per plan (Pro, Team), monthly + yearly Prices keyed by lookup_key.
 * - Webhook endpoint for the events src/app/api/stripe/webhook/route.ts handles.
 * - Prints price IDs (not secret). A newly created webhook signing secret is written straight
 *   into Vercel (sensitive) and never printed: STRIPE_LIVE_WEBHOOK_SECRET in production for --live,
 *   otherwise RR_STRIPE_WEBHOOK_SECRET in production and preview.
 * - Refuses to run against a live key unless --live is passed.
 */
import Stripe from "stripe";
import { spawnSync } from "node:child_process";

const live = process.argv.includes("--live");
const keyVar = live ? "STRIPE_LIVE_SECRET_KEY" : "RR_STRIPE_SECRET_KEY";
const key = process.env[keyVar];
if (!key) {
  console.error(`${keyVar} is not set.`);
  process.exit(1);
}
const isTestKey = /^(sk|rk)_test_/.test(key);
if (!isTestKey && !live) {
  console.error(`Refusing to run: ${keyVar} is not a test-mode key. Pass --live to override.`);
  process.exit(1);
}
if (isTestKey && live) {
  console.error(`Refusing to run: --live was passed but ${keyVar} is a test-mode key.`);
  process.exit(1);
}
const secretVar = live ? "STRIPE_LIVE_WEBHOOK_SECRET" : "RR_STRIPE_WEBHOOK_SECRET";
const secretTargets = live ? ["production"] : ["production", "preview"];

const stripe = new Stripe(key);
const WEBHOOK_URL = process.env.STRIPE_WEBHOOK_URL || "https://spreadsheetfix.com/api/stripe/webhook";
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "radar.early_fraud_warning.created",
];

const CATALOG = [
  {
    plan: "pro",
    name: "SpreadsheetFix Pro",
    description: "Clean files up to 500,000 rows, every cleaning rule, Excel export, no watermark.",
    prices: [
      { lookup_key: "rowrescue_pro_monthly", unit_amount: 1200, interval: "month", env: "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID" },
      { lookup_key: "rowrescue_pro_yearly", unit_amount: 9900, interval: "year", env: "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID" },
    ],
  },
  {
    plan: "team",
    name: "SpreadsheetFix Team",
    description: "Everything in Pro plus shared presets, audit log and seat management. Priced per seat.",
    prices: [
      { lookup_key: "rowrescue_team_monthly", unit_amount: 2900, interval: "month", env: "NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID" },
      { lookup_key: "rowrescue_team_yearly", unit_amount: 24900, interval: "year", env: "NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID" },
    ],
  },
];

async function findProduct(plan) {
  const res = await stripe.products.search({ query: `metadata['rowrescue_plan']:'${plan}' AND active:'true'` });
  return res.data[0] ?? null;
}

const output = {};

for (const item of CATALOG) {
  let product = await findProduct(item.plan);
  if (!product) {
    product = await stripe.products.create({
      name: item.name,
      description: item.description,
      metadata: { rowrescue_plan: item.plan },
    });
    console.log(`created product ${item.name} ${product.id}`);
  } else {
    console.log(`found product ${item.name} ${product.id}`);
  }

  const existing = await stripe.prices.list({ lookup_keys: item.prices.map((p) => p.lookup_key), active: true });
  for (const p of item.prices) {
    let price = existing.data.find((x) => x.lookup_key === p.lookup_key);
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "eur",
        unit_amount: p.unit_amount,
        recurring: { interval: p.interval },
        lookup_key: p.lookup_key,
        tax_behavior: "inclusive",
      });
      console.log(`  created price ${p.lookup_key} ${price.id}`);
    } else {
      console.log(`  found price ${p.lookup_key} ${price.id}`);
    }
    output[p.env] = price.id;
  }
}

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const endpoint = endpoints.data.find((e) => e.url === WEBHOOK_URL);
if (endpoint) {
  const missing = WEBHOOK_EVENTS.filter((e) => !endpoint.enabled_events.includes(e));
  if (missing.length) {
    await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: WEBHOOK_EVENTS });
    console.log(`updated webhook ${endpoint.id} events (+${missing.join(", ")})`);
  } else {
    console.log(`found webhook ${endpoint.id} -> ${WEBHOOK_URL}`);
  }
  console.log("webhook signing secret unchanged (only available at creation)");
} else {
  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: "SpreadsheetFix subscription lifecycle",
  });
  console.log(`created webhook ${created.id} -> ${WEBHOOK_URL}`);
  for (const target of secretTargets) {
    const r = spawnSync(
      "vercel",
      ["env", "add", secretVar, target, "--sensitive", "--force", "--yes", "--non-interactive"],
      { input: created.secret, stdio: ["pipe", "ignore", "pipe"], encoding: "utf8" }
    );
    console.log(`  ${secretVar} -> ${target}: ${r.status === 0 ? "saved" : "FAILED " + (r.stderr || "").trim().slice(-200)}`);
  }
}

console.log("\nPRICE_IDS " + JSON.stringify(output));
