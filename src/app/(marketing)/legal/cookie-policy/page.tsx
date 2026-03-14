"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-display relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <header className="glass-header sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
            className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-xl hover:bg-primary/20 font-bold transition-all text-sm"
          >
            Start Cleaning
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 relative z-10 prose prose-invert prose-slate">
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-sm font-medium text-slate-400 mb-12">Last Updated: March 2026</p>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">1. What are cookies?</h2>
          <p className="leading-relaxed mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">2. The Essential Cookies We Use</h2>
          <p className="leading-relaxed mb-4">
            We use a minimal number of essential cookies to provide our core services. Because these cookies are strictly necessary to deliver the application, you cannot refuse them without impacting how our site functions.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Authentication:</strong> Provided by Clerk to keep you securely signed in to your account.</li>
            <li><strong>Billing:</strong> Secure tokens used by Stripe to manage your subscription sessions.</li>
            <li><strong>Preferences:</strong> Like saving your choice to dismiss our onboarding guides or cookie banners (e.g., `rowrescue_cookie_consent`).</li>
          </ul>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">3. Analytics and Performance Cookies (Optional)</h2>
          <p className="leading-relaxed mb-4">
            We use third-party analytics (like Sentry for error tracking) to help us understand how visitors use the RowRescue application. These cookies collect information such as the pages you visit, the links you click, and the buttons you use. The information collected is anonymized and aggregated. You can decline these cookies using our Cookie Consent banner.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">4. Managing Your Cookie Preferences</h2>
          <p className="leading-relaxed mb-4">
            In addition to our integrated cookie banner, you can control your cookie settings directly through your browser. Most web browsers allow some control of most cookies through the browser settings.
          </p>
        </section>

        <div className="border-t border-slate-800 pt-8 mt-12">
          <Link href="/pricing" className="text-primary hover:underline font-bold">
            &larr; Back to Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}
