import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { HomeHero } from "@/components/marketing/HomeHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { TOOLS } from "@/content/tools";
import { HUBS, hubNameInline, hubPath } from "@/content/hubs";
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OPEN_GRAPH, LOGO_PATH, SUPPORT_EMAIL, absoluteUrl } from "@/config/site";
import { PLANS, FREE_RULES, TEAM_MIN_SEATS, formatEuro, formatRows } from "@/config/plans";
import { ALL_RULES, RULE_MAP } from "@/lib/engine/rules";
import { TotalsCheck } from "@/components/ui/TotalsCheck";
import { heroTotals } from "@/content/heroSample";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/" },
};

const ORG_ID = absoluteUrl("/#organization");

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web browser)",
    image: absoluteUrl("/og-image.png"),
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
      {
        "@type": "Offer",
        name: "Pro",
        price: String((PLANS.pro.priceMonthly ?? 0) / 100),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String((PLANS.pro.priceMonthly ?? 0) / 100),
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
    ],
    featureList: [
      "Runs in the browser; files are never uploaded",
      "Totals check on amount columns before and after cleaning",
      "Remove duplicate rows",
      "Normalize mixed date formats",
      "Validate email addresses",
      "Trim whitespace",
      "Fix character encoding",
      "Merge CSV files",
      "Export to Excel",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(LOGO_PATH),
    email: SUPPORT_EMAIL,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": ORG_ID },
  },
];

// Examples are fixes the engine really makes; see src/lib/engine/rules
const RULE_EXAMPLES: { id: string; before: string; after: string }[] = [
  { id: "normalizeDate", before: "03/09/2026", after: "2026-09-03" },
  { id: "normalizeNumbers", before: "€1.250,00", after: "1250.00" },
  { id: "trimWhitespace", before: " Acme   Supplies ", after: "Acme Supplies" },
  { id: "deduplicateRows", before: "Row 4 = row 2", after: "Row 4 removed" },
  { id: "fixEncoding", before: "CafÃ©", after: "Café" },
  { id: "normalizeHeaders", before: "Invoice Date", after: "invoice_date" },
];

// Computed by the real engine at build time from the hero example file
const HERO_TOTALS = heroTotals();

const free = PLANS.free.limits;
const pro = PLANS.pro;
const team = PLANS.team;

const PRICING = [
  {
    name: PLANS.free.name,
    price: "€0",
    period: "",
    items: [
      `Up to ${formatRows(free.maxRows)} rows`,
      `${FREE_RULES.length} of ${ALL_RULES.length} rules`,
      "CSV export",
      `${free.maxExportsPerDay} exports a day`,
      "Watermark on exports",
    ],
    link: { href: "/clean", label: "Open the cleaner" },
  },
  {
    name: pro.name,
    price: formatEuro(pro.priceMonthly ?? 0),
    period: `per month, or ${formatEuro(pro.priceYearly ?? 0)} a year`,
    items: [
      `Up to ${formatRows(pro.limits.maxRows)} rows`,
      `All ${ALL_RULES.length} rules`,
      "CSV and Excel export",
      "Change log and PDF report",
      "No watermark",
    ],
    link: { href: "/pricing", label: "Choose Pro" },
  },
  {
    name: team.name,
    price: formatEuro(team.priceMonthly ?? 0),
    period: "per seat, per month",
    items: [`From ${TEAM_MIN_SEATS} seats`, "Everything in Pro", "Shared presets", "Audit log", "Team billing"],
    link: { href: "/pricing", label: "Choose Team" },
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui tabular-nums">
      <JsonLd data={STRUCTURED_DATA} />
      <SiteHeader />

      <main id="main-content">
        <HomeHero />

        <section id="security" className="bg-surface border-y border-rule scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Where your data goes</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-3">
              <div className="border-t border-rule-strong pt-5">
                <dt className="font-semibold">Your browser</dt>
                <dd className="mt-2 text-ink-body leading-relaxed">
                  Files are parsed and cleaned by JavaScript running in this tab, so you clean CSV and Excel files
                  without uploading them. Their contents are never sent to our servers.
                </dd>
              </div>
              <div className="border-t border-rule-strong pt-5">
                <dt className="font-semibold">Our servers</dt>
                <dd className="mt-2 text-ink-body leading-relaxed">
                  We store your account email, billing details and a daily export count, nothing from your files. We
                  are based in the EU and GDPR applies. Because file contents never reach us, cleaning client or
                  customer data here is GDPR-friendly: there is no upload for us to process or secure.
                </dd>
              </div>
              <div className="border-t border-rule-strong pt-5">
                <dt className="font-semibold">How to check</dt>
                <dd className="mt-2 text-ink-body leading-relaxed">
                  Open DevTools → Network while you clean a file. There is no upload request.
                </dd>
              </div>
            </dl>
            <Link href="/security" className="mt-10 inline-block text-accent font-medium hover:text-accent-strong">
              How SpreadsheetFix handles your data
            </Link>
          </div>
        </section>

        <section id="rules" className="scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">What gets fixed</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-body max-w-[640px]">
              Every change appears in a preview before you export. Your original file is never modified; you download
              a cleaned copy.
            </p>
            <div className="mt-10 rounded-lg border border-rule overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <thead>
                  <tr className="bg-surface text-left text-[13px] text-ink-muted">
                    <th scope="col" className="px-5 py-3 font-medium border-b border-rule">Rule</th>
                    <th scope="col" className="px-5 py-3 font-medium border-b border-rule">Before</th>
                    <th scope="col" className="px-5 py-3 font-medium border-b border-rule">After</th>
                    <th scope="col" className="px-5 py-3 font-medium border-b border-rule text-right">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {RULE_EXAMPLES.map((ex) => {
                    const rule = RULE_MAP.get(ex.id);
                    const isFree = FREE_RULES.includes(ex.id);
                    return (
                      <tr key={ex.id} className="border-b border-rule last:border-b-0">
                        <td className="px-5 py-3.5 font-medium">{rule?.name ?? ex.id}</td>
                        <td className="px-5 py-3.5 font-data text-sm text-ink-muted whitespace-pre">{ex.before}</td>
                        <td className="px-5 py-3.5 font-data text-sm text-accent">{ex.after}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-ink-muted">{isFree ? "Free" : "Pro"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              {ALL_RULES.length - RULE_EXAMPLES.length} more rules in the cleaner, including phone numbers, email
              validation and required-field checks.
            </p>
          </div>
        </section>

        <section id="totals" className="border-t border-rule scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="lg:w-[380px] shrink-0">
              <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Totals that still add up</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-body">
                After cleaning, every amount column is totalled before and after. Removed rows are listed, so the
                difference is accounted for to the cent. If a value itself changed, you see by how much before you
                export.
              </p>
              <p className="mt-4 text-sm text-ink-muted">Included on every plan. Pro adds it to the downloadable summary report.</p>
            </div>
            <figure className="m-0 flex-1 min-w-0">
              <TotalsCheck reconciliation={HERO_TOTALS} />
              <figcaption className="mt-3 text-sm text-ink-muted">
                The totals check for the example file at the top of this page.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="tools" className="border-t border-rule scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Single-purpose tools</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              For one specific fix. Or browse them by job:{" "}
              {HUBS.map((h, i) => (
                <span key={h.slug}>
                  {i > 0 && (i === HUBS.length - 1 ? " and " : ", ")}
                  <Link href={hubPath(h)} className="text-accent hover:text-accent-strong underline underline-offset-2">
                    {hubNameInline(h)}
                  </Link>
                </span>
              ))}
              .
            </p>
            <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 border-t border-rule">
              {TOOLS.map((t) => (
                <li key={t.slug} className="border-b border-rule">
                  <Link href={`/${t.slug}`} className="group block py-5 pr-6">
                    <span className="font-semibold group-hover:text-accent">{t.name}</span>
                    <span className="block mt-1 text-sm leading-relaxed text-ink-muted">{t.h1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="bg-surface border-y border-rule scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Pricing</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              Start free. Upgrade for larger files, every rule and Excel export.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PRICING.map((plan) => (
                <div key={plan.name} className="rounded-lg border border-rule bg-paper p-7 flex flex-col">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-4 text-[36px] leading-none font-semibold tracking-[-0.02em]">{plan.price}</p>
                  <p className="mt-2 min-h-5 text-sm text-ink-muted">{plan.period}</p>
                  <ul className="mt-6 space-y-2.5 text-[15px] text-ink-body flex-1">
                    {plan.items.map((item) => (
                      <li key={item} className="border-t border-rule pt-2.5">{item}</li>
                    ))}
                  </ul>
                  <Link
                    href={plan.link.href}
                    className="mt-7 inline-flex justify-center items-center min-h-11 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted transition-colors"
                  >
                    {plan.link.label}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link href="/pricing" className="text-accent hover:text-accent-strong underline underline-offset-2">
                Full plan comparison
              </Link>
            </p>
          </div>
        </section>

        <section>
          <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Clean a file now.</h2>
              <p className="mt-3 text-lg text-ink-body">No account needed. The file stays on your computer.</p>
            </div>
            <Link
              href="/clean"
              className="inline-flex justify-center items-center min-h-12 px-6 rounded-md bg-accent text-white font-semibold hover:bg-accent-strong transition-colors"
            >
              Open the cleaner
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
