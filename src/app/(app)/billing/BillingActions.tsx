"use client";

import { useState } from "react";

export function BillingActions({
  plan,
  hasStripeCustomer,
}: {
  plan: string;
  hasStripeCustomer: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!;
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel border border-primary/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(13,242,223,0.05)] relative overflow-hidden">
      <h2 className="text-xl font-bold text-slate-100 mb-6 tracking-tight relative z-10">Actions</h2>
      <div className="flex flex-wrap gap-4 relative z-10">
        {hasStripeCustomer && (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="px-6 py-3 bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl hover:bg-slate-700/80 transition-all font-bold disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : null}
            {loading ? "Loading..." : "Manage Subscription"}
          </button>
        )}
        {plan === "free" && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="px-6 py-3 bg-primary text-background-dark rounded-xl hover:brightness-110 font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(13,242,223,0.2)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] neon-glow flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-background-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            )}
            {loading ? "Redirecting..." : "Upgrade to Pro"}
          </button>
        )}
      </div>
    </div>
  );
}
