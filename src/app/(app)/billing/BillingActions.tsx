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
    <div className="flex flex-wrap gap-3">
        {hasStripeCustomer && (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="min-h-11 px-5 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-ink-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : null}
            {loading ? "Loading…" : "Manage subscription"}
          </button>
        )}
        {plan === "free" && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="min-h-11 px-5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : null}
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </button>
        )}
    </div>
  );
}
