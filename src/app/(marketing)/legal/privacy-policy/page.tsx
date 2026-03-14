"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm font-medium text-slate-400 mb-12">Last Updated: March 2026</p>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">1. Our Core Promise: 100% Client-Side Processing</h2>
          <p className="leading-relaxed mb-4">
            Unlike traditional SaaS platforms, RowRescue operates entirely inside your web browser. When you upload a spreadsheet for cleaning, <strong>the contents of your file never leave your device.</strong> We do not upload, transmit, store, or parse your spreadsheet data on our servers.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">2. Information We Do Collect</h2>
          <p className="leading-relaxed mb-4">
            While we do not upload your spreadsheets, we do collect specific metadata required to run the service and manage subscriptions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Account Data:</strong> Email address, name, and profile imaging provided via third-party authentication (e.g., Google or GitHub).</li>
            <li><strong>Billing Data:</strong> Processed securely via Stripe. We do not store raw credit card numbers.</li>
            <li><strong>Usage Analytics:</strong> Anonymized metrics on which rules are toggled or how many rows were cleaned (without any actual row data) to help us improve the tool.</li>
            <li><strong>User Presets:</strong> Custom configurations and rule recipes are synced to our database if you upgrade to a Team plan so they can be shared.</li>
          </ul>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">3. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We prioritize the security of the minimal data we do store. All backend communications for authentication and billing use TLS encryption. Our databases are strictly access-controlled and regularly audited.
          </p>
        </section>

        <section className="mb-10 text-slate-300">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">4. Your Rights (GDPR)</h2>
          <p className="leading-relaxed mb-4">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. You may request to access, correct, delete, or restrict the use of your Personal Data. Contact our support team to exercise these rights.
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
