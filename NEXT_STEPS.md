# SpreadsheetFix — status and next steps

_Last updated 2026-10-19._

SpreadsheetFix (formerly RowRescue) is a privacy-first, client-side CSV/Excel cleaner.
Next.js 16 on Vercel, Clerk auth, Neon Postgres, Stripe billing.

**Status: live on https://spreadsheetfix.com.** Sign-up/sign-in and a test-mode Pro purchase
were confirmed working on 2026-10-14. Payments are still Stripe **test mode**, so no real money yet.

## Where things are

- **Vercel**: project `rowrescue`, team `will-kellys-projects-cad10b2e` (CLI user platospanda-6012).
  Production deploys automatically from `main` via the GitHub integration (last: merge of PR #1,
  2026-10-19). It serves
  `spreadsheetfix.com` (primary), `www.spreadsheetfix.com` (308 → apex) and `rowrescue.vercel.app`.
  TLS certificates are Let's Encrypt, auto-renewed by Vercel.
- **GitHub**: `cryptocloudz-ship-it/rowrescue` (public). `main` is the production branch and is up to
  date (PR #1 merged `seo-growth` on 2026-10-19). Ship changes by merging PRs into `main`; pushes to
  other branches create preview deploys.
- **Domain**: `spreadsheetfix.com` registered 2026-10-14 via Letshost.ie (registrar Tucows).
  Nameservers are `ns9.dnsireland.com` / `ns10.dnsireland.com`; that is where the editable
  Letshost zone lives. (The domain was first delegated to ns5/ns6/ns7, which serve a parking zone
  that the Letshost zone editor does not change.)
  `rowrescue.com` belongs to a third party (registered at Namecheap 2026-09-05), so do not use it.
- **DNS zone** (Letshost, Edit Zone – spreadsheetfix.com):
  - `@` A `216.198.79.1` and `64.29.17.1`, `www` CNAME `091d936f2dbc330a.vercel-dns-017.com` (Vercel)
  - `clerk` → `frontend-api.clerk.services`, `accounts` → `accounts.clerk.services`
  - `clkmail`, `clk._domainkey`, `clk2._domainkey` → `*.i3t4gj3g1359.clerk.services` (Clerk email)
  - Email (iCloud+ Custom Email Domain, owner's Apple account): `@` MX `10 mx01/mx02.mail.icloud.com`,
    `@` TXT `v=spf1 include:icloud.com ~all` and `apple-domain=…`, `sig1._domainkey` CNAME →
    `sig1.dkim.spreadsheetfix.com.at.icloudmailadmin.com`. Addresses: hello@, support@, billing@,
    will@. Send/receive tested 2026-10-19. `SUPPORT_EMAIL` in `src/config/site.ts` is shown in
    the footers, privacy policy and terms; use it as the Stripe support email when going live.
- **Clerk**: production instance on `spreadsheetfix.com` (all records verified), application name
  "SpreadsheetFix" (renamed from "TidySheet"). Live keys are in Vercel production env.
- **Stripe**: Vercel Marketplace sandbox `rowrescue-payments` (test mode, unclaimed).
  Keys are `RR_`-prefixed env vars. Products "SpreadsheetFix Pro" and "SpreadsheetFix Team" with
  monthly/yearly EUR prices (price IDs in `NEXT_PUBLIC_STRIPE_*_PRICE_ID`). Webhook
  `we_1UPpiRAMuW35ARQqVsgV8zXK` → `https://spreadsheetfix.com/api/stripe/webhook`,
  secret in `RR_STRIPE_WEBHOOK_SECRET`. `scripts/stripe-setup.mjs` is idempotent, test-mode only.

## Next steps

- Google Search Console: add spreadsheetfix.com and submit `/sitemap.xml`.
- Before taking real money: `vercel integration resource claim rowrescue-payments`, rerun
  `scripts/stripe-setup.mjs --live` with live keys, and enable Stripe Tax if VAT-registered.
- Not built yet: handling for refunds, disputes and early-fraud-warning events.
- Housekeeping: re-add the older Stripe/Clerk secrets as "sensitive" in Vercel; revoke the deployment
  protection bypass token if unused; decide whether to rename the GitHub repo and Vercel project; the old Letshost DNS zone for rowrescue.com is unused.

## Gotchas

- Vercel CLI v64 misparses `vercel env run ... -- <cmd>` and can deploy files as a new project.
  Put global flags first (`vercel --scope … env run …`) or avoid `env run` entirely.
- `robots.ts` decides at **build** time: preview builds block all crawlers, so never promote a
  preview build to production. Merge to `main` (or, if needed, `vercel deploy --prod`) instead.
- Manual `vercel deploy` from a git **worktree** gets BLOCKED ("commit author doesn't have permission"):
  the CLI doesn't pick up the GitHub remote there and the author email isn't a team member. Deploy
  from the main checkout, or from a clean `git archive <sha>` export with `.vercel/project.json`
  copied in.
- Next.js replaces (doesn't merge) `openGraph` per page; spread `DEFAULT_OPEN_GRAPH` from `src/config/site.ts`.
- Pre-existing lint errors (terms page quotes, `<a>` links in the pricing footer) and two `tsc`
  errors in `rules.test.ts`; they don't block the Vercel build.
- Local builds need placeholder env (DATABASE_URL, STRIPE_SECRET_KEY, a fake `pk_test_` Clerk key)
  because the DB and Stripe clients initialise at import.
