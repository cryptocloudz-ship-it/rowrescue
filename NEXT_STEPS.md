# SpreadsheetFix — status and next steps

_Last updated 2026-10-14._

SpreadsheetFix (formerly RowRescue) is a privacy-first, client-side CSV/Excel cleaner.
Next.js 16 on Vercel, Clerk auth, Neon Postgres, Stripe billing.

## Where things are

- **Vercel**: project `rowrescue`, team `will-kellys-projects-cad10b2e` (CLI user platospanda-6012).
  Production is deployed from commit `888f305` and serves `rowrescue.vercel.app`.
  Domains attached: `spreadsheetfix.com` (primary) and `www.spreadsheetfix.com` (308 → apex).
- **GitHub**: `cryptocloudz-ship-it/rowrescue` (public). Branch `seo-growth` holds all recent work
  and has **not been pushed**; `main` is still the original March version.
- **Domain**: `spreadsheetfix.com` registered 2026-10-14 via Letshost.ie (DNS Ireland nameservers).
  `rowrescue.com` belongs to a third party (registered at Namecheap 2026-09-05), so do not use it.
  The old Letshost DNS zone for rowrescue.com is unused.
- **Stripe**: Vercel Marketplace sandbox `rowrescue-payments` (test mode, unclaimed).
  Keys are `RR_`-prefixed env vars. Products "SpreadsheetFix Pro" and "SpreadsheetFix Team" with
  monthly/yearly EUR prices (price IDs in `NEXT_PUBLIC_STRIPE_*_PRICE_ID`). Webhook
  `we_1UPpiRAMuW35ARQqVsgV8zXK` → `https://spreadsheetfix.com/api/stripe/webhook`,
  secret in `RR_STRIPE_WEBHOOK_SECRET`. `scripts/stripe-setup.mjs` is idempotent, test-mode only.

## Blocked on the owner

1. **DNS at Letshost** (Edit Zone – spreadsheetfix.com): delete the `@` A record (185.43.232.252)
   and the `www` CNAME, then add:
   - `@` A `216.198.79.1`
   - `@` A `64.29.17.1`
   - `www` CNAME `091d936f2dbc330a.vercel-dns-017.com.`
2. **Clerk**: the production instance is configured for rowrescue.com, so sign-in loads from
   `clerk.rowrescue.com`, which doesn't resolve. **Sign-in, sign-up and checkout are broken until
   this is fixed.** In Clerk → Production → Developers → Domains, change the domain to spreadsheetfix.com,
   add the CNAMEs Clerk lists to the Letshost zone, then set the new keys yourself:
   `vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --force` and
   `vercel env add CLERK_SECRET_KEY production --sensitive --force`. Redeploy production afterwards.

## After DNS and Clerk are done

- Verify https://spreadsheetfix.com, the www redirect, and that Clerk loads from clerk.spreadsheetfix.com.
- Test purchase with card 4242 4242 4242 4242; confirm `/billing` shows Pro (this proves the webhook works).
- Google Search Console: add spreadsheetfix.com and submit `/sitemap.xml`.
- Before taking real money: `vercel integration resource claim rowrescue-payments`, rerun
  `scripts/stripe-setup.mjs --live` with live keys, and enable Stripe Tax if VAT-registered.
- Not built yet: handling for refunds, disputes and early-fraud-warning events.
- Housekeeping: re-add the older Stripe/Clerk secrets as "sensitive" in Vercel; revoke the deployment
  protection bypass token if unused; decide whether to push `seo-growth` and rename the GitHub repo
  and Vercel project.

## Gotchas

- Vercel CLI v64 misparses `vercel env run ... -- <cmd>` and can deploy files as a new project.
  Put global flags first (`vercel --scope … env run …`) or avoid `env run` entirely.
- `robots.ts` decides at **build** time: preview builds block all crawlers, so never promote a
  preview build to production. Deploy with `vercel deploy --prod` instead.
- Next.js replaces (doesn't merge) `openGraph` per page; spread `DEFAULT_OPEN_GRAPH` from `src/config/site.ts`.
- Local builds need placeholder env (DATABASE_URL, STRIPE_SECRET_KEY, a fake `pk_test_` Clerk key)
  because the DB and Stripe clients initialise at import.
