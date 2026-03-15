"use client";

import { Check, X, ShieldCheck, Zap, Activity } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getUtmParams } from "@/lib/utm";
import { trackCheckoutStarted } from "@/lib/analytics";

const FEATURES = [
  { name: "Exports per day", free: "5", pro: "Unlimited", team: "Unlimited" },
  { name: "Max rows per file", free: "5,000", pro: "Unlimited", team: "Unlimited" },
  { name: "Remove duplicates", free: true, pro: true, team: true },
  { name: "Remove empty rows/columns", free: true, pro: true, team: true },
  { name: "Trim whitespace", free: true, pro: true, team: true },
  { name: "Normalize headers", free: true, pro: true, team: true },
  { name: "Normalize dates", free: false, pro: true, team: true },
  { name: "Normalize numbers", free: false, pro: true, team: true },
  { name: "Normalize emails/phones", free: false, pro: true, team: true },
  { name: "Strip HTML", free: false, pro: true, team: true },
  { name: "Validate & quarantine", free: false, pro: true, team: true },
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
    return <span className="text-sm font-medium text-slate-300">{value}</span>;
  }
  return value ? (
    <Check className="w-5 h-5 text-primary mx-auto drop-shadow-[0_0_8px_rgba(13,242,223,0.5)]" />
  ) : (
    <X className="w-5 h-5 text-slate-600 mx-auto" />
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
    <div className="min-h-screen bg-background-dark text-slate-100 font-display relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <header className="glass-header sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center neon-glow">
              <Activity className="size-5 text-background-dark font-bold" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight neon-text-glow">
              RowRescue
            </span>
          </Link>
          <Link
            href="/clean"
            className="px-5 py-2.5 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold transition-all neon-glow text-sm"
          >
            Start Cleaning
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Stop wasting hours cleaning <br/> spreadsheets manually.
          </h1>
          <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Get your data ready for analysis in seconds, not hours. Start for free today, upgrade when you need to process massive files.
          </p>
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 p-1.5 glass-panel rounded-full border border-primary/20">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  !yearly
                    ? "bg-primary text-background-dark neon-glow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  yearly
                    ? "bg-primary text-background-dark neon-glow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Yearly
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  yearly
                    ? "bg-background-dark/30 text-background-dark"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  Save 31%
                </span>
              </button>
            </div>
            <span className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full border border-primary/20 text-sm font-bold text-slate-300">
              <ShieldCheck className="w-5 h-5 text-primary" /> 14-day money-back guarantee
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {/* Free */}
          <div className="glass-panel border border-primary/10 rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xl font-bold text-slate-100">Free</h3>
            <p className="text-sm text-slate-400 mt-2 h-10">
              Perfect for quick cleanups on smaller files
            </p>
            <div className="mt-6 mb-6">
              <span className="text-5xl font-extrabold text-slate-100">€0</span>
              <span className="text-slate-500 ml-2 font-medium">/month</span>
            </div>
            <Link
              href="/clean"
              className="flex items-center justify-center w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-700 font-bold transition-colors"
            >
              Start Cleaning — Free
            </Link>
            <p className="text-xs text-slate-500 mt-4 text-center font-medium">
              No account required
            </p>
          </div>

          {/* Pro */}
          <div className="glass-panel border-2 border-primary rounded-2xl p-8 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(13,242,223,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-background-dark text-xs font-bold rounded-full uppercase tracking-widest neon-glow">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-primary neon-text-glow">Pro</h3>
            <p className="text-sm text-slate-400 mt-2 h-10">
              Full automated power for data professionals
            </p>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-slate-100">
                {yearly ? "€99" : "€12"}
              </span>
              <span className="text-slate-500 ml-2 font-medium">
                {yearly ? "/year" : "/month"}
              </span>
            </div>
            {yearly ? (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">€8.25/mo effective</p>
                <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                  Save €45/yr
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-400">
                  or <button onClick={() => setYearly(true)} className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 transition-colors">€99/year — save €45</button>
                </p>
              </div>
            )}
            <button
              onClick={() => handleCheckout(proPriceId)}
              disabled={!!loading}
              className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-4 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold text-lg shadow-sm disabled:opacity-50 transition-all neon-glow"
            >
              {loading === proPriceId ? "Redirecting..." : "Clean My Data Now"}
              {loading !== proPriceId && <Zap className="w-5 h-5" />}
            </button>
            <p className="text-xs text-primary/80 mt-4 text-center flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" /> Fully refundable within 14 days
            </p>
          </div>

          {/* Team */}
          <div className="glass-panel border border-primary/10 rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xl font-bold text-slate-100">Team</h3>
            <p className="text-sm text-slate-400 mt-2 h-10">
              Shared rules and presets for your organization
            </p>
            <div className="mt-6 mb-2">
              <span className="text-5xl font-extrabold text-slate-100">
                {yearly ? "€249" : "€29"}
              </span>
              <span className="text-slate-500 ml-2 font-medium">
                {yearly ? "/seat/yr" : "/seat/mo"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {yearly ? "€20.75/mo per seat" : "Minimum 2 seats"}
            </p>
            <button
              onClick={() => handleCheckout(teamPriceId)}
              disabled={!!loading}
              className="flex items-center justify-center w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-700 font-bold transition-colors disabled:opacity-50"
            >
              {loading === teamPriceId ? "Redirecting..." : "Upgrade to Team"}
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="glass-panel border border-primary/10 rounded-2xl overflow-hidden mb-24">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 bg-slate-900/50">
                  <th className="py-5 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider w-1/3">
                    Feature
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-slate-300 text-center uppercase tracking-wider">
                    Free
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-primary text-center uppercase tracking-wider bg-primary/5">
                    Pro
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-slate-300 text-center uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {FEATURES.map((feature, idx) => (
                  <tr key={feature.name} className={`hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}`}>
                    <td className="py-4 px-6 text-sm font-medium text-slate-300">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <FeatureCell value={feature.free} />
                    </td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <FeatureCell value={feature.pro} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <FeatureCell value={feature.team} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto glass-panel border border-primary/10 rounded-3xl p-10 md:p-14 mb-20 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <FaqItem
              question="Is my data really private?"
              answer="Absolutely. 100% of the file processing happens instantly inside your browser using JavaScript. Your spreadsheet contents are never uploaded to any remote server or cloud bucket. We strictly only store your account email and basic billing metadata."
            />
            <FaqItem
              question="Can I use RowRescue without creating an account?"
              answer="Yes! Our Free tier is completely frictionless with zero sign-up required. Simply drag your file in and start cleaning immediately. Accounts are only needed if you decide to upgrade to Pro or Team features."
            />
            <FaqItem
              question="What file formats are supported?"
              answer="We natively support CSV, TSV, and Excel (.xlsx) files up to a generous 50MB in the browser. We safely auto-detect your file's specific encoding format and delimiter type."
            />
            <FaqItem
              question="Can I cancel my subscription anytime?"
              answer="Yes. You can cancel your subscription inside your Billing dashboard with exactly two clicks. You will retain full access to all premium features until the end of your current active billing cycle."
            />
            <FaqItem
              question="What happens to my cleaning presets if I downgrade?"
              answer="Your cloud-synced custom presets will safely remain saved in our secure database but they will shift to a read-only state. You can continue to use and export them indefinitely. Local browser presets are completely unaffected."
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-primary/10 glass-panel py-10 relative z-10 w-full">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span>&copy; {new Date().getFullYear()} RowRescue. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <a href="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms</a>
            <a href="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/legal/cookie-policy" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-primary/10 pb-8 last:border-0 last:pb-0">
      <h3 className="text-lg font-bold text-slate-200">{question}</h3>
      <p className="text-base text-slate-400 mt-3 leading-relaxed">{answer}</p>
    </div>
  );
}
