"use client";

import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getUtmParams } from "@/lib/utm";
import { trackCheckoutStarted } from "@/lib/analytics";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PLANS, FREE_MAX_ROWS, PRO_MAX_ROWS, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY, TEAM_PRICE_MONTHLY, TEAM_PRICE_YEARLY, formatEuro, formatRows, TEAM_MIN_SEATS } from "@/config/plans";

// What a year of monthly Pro costs, minus the yearly price
const PRO_YEARLY_SAVING = formatEuro((PLANS.pro.priceMonthly ?? 0) * 12 - (PLANS.pro.priceYearly ?? 0));

const FEATURES = [
  { name: "Exports per day", free: String(PLANS.free.limits.maxExportsPerDay), pro: "Unlimited", team: "Unlimited" },
  { name: "Max rows per file", free: FREE_MAX_ROWS, pro: PRO_MAX_ROWS, team: formatRows(PLANS.team.limits.maxRows) },
  { name: "Remove duplicates", free: true, pro: true, team: true },
  { name: "Remove empty rows/columns", free: true, pro: true, team: true },
  { name: "Trim whitespace", free: true, pro: true, team: true },
  { name: "Normalize headers", free: true, pro: true, team: true },
  { name: "Fix encoding (Ã© → é)", free: true, pro: true, team: true },
  { name: "Normalize dates", free: true, pro: true, team: true },
  { name: "Normalize & validate emails", free: true, pro: true, team: true },
  { name: "Normalize numbers", free: false, pro: true, team: true },
  { name: "Normalize & validate phones", free: false, pro: true, team: true },
  { name: "Strip HTML", free: false, pro: true, team: true },
  { name: "Required-field & range validation", free: false, pro: true, team: true },
  { name: "Excel export", free: false, pro: true, team: true },
  { name: "Change log & summary", free: false, pro: true, team: true },
  { name: "Saved presets", free: "3 (local)", pro: "Unlimited (synced)", team: "Unlimited (shared)" },
  { name: "Shared preset library", free: false, pro: false, team: true },
  { name: "Team audit log", free: false, pro: false, team: true },
  { name: "Seat management", free: false, pro: false, team: true },
  { name: "Watermark", free: "Yes", pro: "No", team: "No" },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-ink-body">{value}</span>;
  }
  return value ? (
    <Check className="w-4 h-4 text-accent mx-auto" aria-label="Included" />
  ) : (
    <Minus className="w-4 h-4 text-ink-faint mx-auto" aria-label="Not included" />
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);

  async function handleCheckout(priceId: string) {
    setLoading(priceId);

    const plan = priceId === proPriceId ? "pro" : "team";
    trackCheckoutStarted({ plan, billing_period: yearly ? "yearly" : "monthly" });

    try {
      const utm = getUtmParams();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, utm }),
      });
      if (res.status === 401) {
        window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/pricing")}`;
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const proMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!;
  const proYearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!;
  const teamMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID!;
  const teamYearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID!;

  const proPriceId = yearly ? proYearlyPriceId : proMonthlyPriceId;
  const teamPriceId = yearly ? teamYearlyPriceId : teamMonthlyPriceId;

  return (
    <div className="min-h-screen bg-paper text-ink font-ui">
      <SiteHeader />

      <main id="main-content" className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-[640px]">
            <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Pricing</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-body">
              Clean files up to {FREE_MAX_ROWS} rows free, without an account. Upgrade for larger files, every rule and Excel
              export.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3">
            <div role="group" aria-label="Billing period" className="inline-flex p-1 rounded-md border border-rule bg-surface">
              <button
                type="button"
                aria-pressed={!yearly}
                onClick={() => setYearly(false)}
                className={`min-h-10 px-4 rounded text-sm font-medium transition-colors ${
                  !yearly ? "bg-paper text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={yearly}
                onClick={() => setYearly(true)}
                className={`min-h-10 px-4 rounded text-sm font-medium transition-colors ${
                  yearly ? "bg-paper text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                Yearly · save up to 31%
              </button>
            </div>
            <p className="text-sm text-ink-muted">7-day money-back guarantee on paid plans.</p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-20">
          {/* Free */}
          <div className="rounded-lg border border-rule bg-paper p-7 flex flex-col">
            <h2 className="font-semibold">Free</h2>
            <p className="mt-1 text-sm text-ink-muted">Small files, no account.</p>
            <p className="mt-6 text-[40px] leading-none font-semibold tracking-[-0.02em]">€0</p>
            <p className="mt-2 min-h-10 text-sm text-ink-muted">No account required</p>
            <Link
              href="/clean"
              className="mt-6 inline-flex justify-center items-center min-h-12 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted transition-colors"
            >
              Open the cleaner
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-lg border border-accent bg-paper p-7 flex flex-col">
            <h2 className="font-semibold">Pro</h2>
            <p className="mt-1 text-sm text-ink-muted">Large files, all rules, Excel export.</p>
            <p className="mt-6 text-[40px] leading-none font-semibold tracking-[-0.02em]">
              {yearly ? PRO_PRICE_YEARLY : PRO_PRICE_MONTHLY}
              <span className="ml-2 text-base font-normal text-ink-muted">{yearly ? "per year" : "per month"}</span>
            </p>
            <p className="mt-2 min-h-10 text-sm text-ink-muted">
              {yearly ? (
                `${formatEuro(Math.round((PLANS.pro.priceYearly ?? 0) / 12))} a month, billed yearly. Saves ${PRO_YEARLY_SAVING}.`
              ) : (
                <>
                  Or{" "}
                  <button
                    type="button"
                    onClick={() => setYearly(true)}
                    className="text-accent hover:text-accent-strong underline underline-offset-2"
                  >
                    {PRO_PRICE_YEARLY} a year
                  </button>
                  , which saves {PRO_YEARLY_SAVING}.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => handleCheckout(proPriceId)}
              disabled={!!loading}
              className="mt-6 inline-flex justify-center items-center min-h-12 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong disabled:opacity-50 transition-colors"
            >
              {loading === proPriceId ? "Redirecting…" : "Choose Pro"}
            </button>
          </div>

          {/* Team */}
          <div className="rounded-lg border border-rule bg-paper p-7 flex flex-col">
            <h2 className="font-semibold">Team</h2>
            <p className="mt-1 text-sm text-ink-muted">Shared presets and an audit log.</p>
            <p className="mt-6 text-[40px] leading-none font-semibold tracking-[-0.02em]">
              {yearly ? TEAM_PRICE_YEARLY : TEAM_PRICE_MONTHLY}
              <span className="ml-2 text-base font-normal text-ink-muted">{yearly ? "per seat, per year" : "per seat, per month"}</span>
            </p>
            <p className="mt-2 min-h-10 text-sm text-ink-muted">
              {yearly ? `${formatEuro(Math.round((PLANS.team.priceYearly ?? 0) / 12))} a month per seat, billed yearly.` : `Minimum ${TEAM_MIN_SEATS} seats.`}
            </p>
            <button
              type="button"
              onClick={() => handleCheckout(teamPriceId)}
              disabled={!!loading}
              className="mt-6 inline-flex justify-center items-center min-h-12 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50 transition-colors"
            >
              {loading === teamPriceId ? "Redirecting…" : "Choose Team"}
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Compare plans</h2>
        <div className="mt-6 rounded-lg border border-rule overflow-x-auto mb-20">
          <table className="w-full min-w-[560px] text-left border-collapse text-[15px]">
            <thead>
              <tr className="bg-surface text-[13px] text-ink-muted">
                <th scope="col" className="py-3 px-5 font-medium border-b border-rule w-2/5">Feature</th>
                <th scope="col" className="py-3 px-5 font-medium border-b border-rule text-center">Free</th>
                <th scope="col" className="py-3 px-5 font-medium border-b border-rule text-center text-accent">Pro</th>
                <th scope="col" className="py-3 px-5 font-medium border-b border-rule text-center">Team</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.name} className="border-b border-rule last:border-b-0">
                  <th scope="row" className="py-3 px-5 font-normal text-ink-body">{feature.name}</th>
                  <td className="py-3 px-5 text-center"><FeatureCell value={feature.free} /></td>
                  <td className="py-3 px-5 text-center"><FeatureCell value={feature.pro} /></td>
                  <td className="py-3 px-5 text-center"><FeatureCell value={feature.team} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-[760px]">
          <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Questions</h2>
          <div className="mt-6 border-t border-rule">
            <FaqItem
              question="Is my data private?"
              answer="Files are processed by JavaScript in your browser. Their contents are never uploaded. We store only your account email and billing details."
            />
            <FaqItem
              question="Can I use SpreadsheetFix without an account?"
              answer="Yes. The Free plan needs no sign-up: open the cleaner and choose a file. You only need an account to upgrade to Pro or Team."
            />
            <FaqItem
              question="Which file formats are supported?"
              answer="CSV, TSV and Excel (.xlsx) files up to 50 MB. Encoding and delimiter are detected automatically."
            />
            <FaqItem
              question="Can I cancel at any time?"
              answer="Yes. Cancel from the Billing page. You keep paid features until the end of the current billing period."
            />
            <FaqItem
              question="What happens to my presets if I downgrade?"
              answer="Synced presets stay saved but become read-only. You can still load them in the cleaner, or delete them. Presets stored in your browser are not affected."
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-rule py-5">
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-ink-body leading-relaxed">{answer}</p>
    </div>
  );
}
