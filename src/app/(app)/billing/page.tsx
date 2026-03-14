import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPlanLimits } from "@/config/plans";
import { BillingActions } from "./BillingActions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const showSuccess = params.success === "true";
  const limits = getPlanLimits(user.plan);
  const periodEnd = user.currentPeriodEnd
    ? new Date(user.currentPeriodEnd).toLocaleDateString("en-IE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background-dark text-slate-200 selection:bg-primary/30">
      <header className="border-b border-primary/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/clean" className="text-2xl font-extrabold text-primary neon-text-glow tracking-tight flex items-center gap-2 drop-shadow-[0_0_8px_rgba(13,242,223,0.8)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            RowRescue
          </Link>
          <Link
            href="/clean"
            className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-current group-hover:-translate-x-1 transition-transform" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {showSuccess && (
            <div className="mb-8 p-5 glass-panel bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in fade-in slide-in-from-top-4 shadow-[0_0_30px_rgba(52,211,153,0.1)] flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-emerald-400 flex-shrink-0 drop-shadow flex-shrink-0 mt-0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div>
                <p className="text-base font-bold text-emerald-300">Subscription activated!</p>
                <p className="text-sm font-medium text-emerald-400/80 mt-1">You now have access to all Pro features.</p>
              </div>
            </div>
          )}

          <h1 className="text-4xl font-extrabold text-slate-100 mb-2 tracking-tight">
            Billing & Subscription
          </h1>
          <p className="text-slate-400 font-medium mb-10 text-lg">Manage your plan, limits, and billing details.</p>

          {/* Current Plan */}
          <div className="glass-panel border border-primary/20 rounded-3xl p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary/10">
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                  Current Plan
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-5 py-2 glass-panel bg-primary/10 border border-primary/30 text-primary text-sm font-extrabold rounded-xl capitalize tracking-widest shadow-[inset_0_0_15px_rgba(13,242,223,0.1)] neon-text-glow">
                    {user.plan} PLAN
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Subscription Status</p>
                  {user.subscriptionStatus ? (
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        {user.subscriptionStatus === "active" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          user.subscriptionStatus === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : 
                          user.subscriptionStatus === "past_due" ? "bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-slate-500"
                        }`}></span>
                      </span>
                      <span
                        className={`text-lg font-extrabold capitalize ${
                          user.subscriptionStatus === "active"
                            ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.2)]"
                            : user.subscriptionStatus === "past_due"
                              ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.2)]"
                              : "text-slate-500"
                        }`}
                      >
                        {user.subscriptionStatus.replace("_", " ")}
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-extrabold text-slate-300">Free Account</p>
                  )}
                </div>

                {periodEnd && (
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {user.subscriptionStatus === "canceled" ? "Access Until" : "Next Billing Date"}
                    </p>
                    <p className="text-lg font-bold text-slate-200">{periodEnd}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner mt-8 relative overflow-hidden">
                {user.plan === "pro" && <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />}
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-slate-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Plan Limits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  <div className="glass-panel bg-slate-800/60 border border-slate-700 p-4 rounded-xl hover:border-primary/30 transition-colors">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Max Rows</p>
                    <p className="text-xl font-extrabold text-slate-100">{limits.maxRows.toLocaleString()}</p>
                  </div>
                  <div className="glass-panel bg-slate-800/60 border border-slate-700 p-4 rounded-xl hover:border-primary/30 transition-colors">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Exports/Day</p>
                    <p className={`text-xl font-extrabold ${limits.maxExportsPerDay === Infinity ? 'text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.5)]' : 'text-slate-100'}`}>
                      {limits.maxExportsPerDay === Infinity ? "Unlimited" : limits.maxExportsPerDay}
                    </p>
                  </div>
                  <div className="glass-panel bg-slate-800/60 border border-slate-700 p-4 rounded-xl hover:border-primary/30 transition-colors">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Formats</p>
                    <div className="flex gap-2 flex-wrap">
                      {limits.allowedExportFormats.map(fmt => (
                        <span key={fmt} className="text-xs font-bold bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700 uppercase shadow-inner">
                          .{fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel bg-slate-800/60 border border-slate-700 p-4 rounded-xl hover:border-primary/30 transition-colors">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Presets</p>
                    <p className={`text-xl font-extrabold ${limits.maxPresets === Infinity ? 'text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.5)]' : 'text-slate-100'}`}>
                      {limits.maxPresets === Infinity ? "Unlimited" : limits.maxPresets}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BillingActions
            plan={user.plan}
            hasStripeCustomer={!!user.stripeCustomerId}
          />
        </div>
      </main>
    </div>
  );
}
