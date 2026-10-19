"use client";

import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/site";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui">

      <SiteHeader />

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] mb-2">Privacy Policy</h1>
        <p className="text-sm font-medium text-ink-muted mb-12">Last Updated: March 2026</p>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">1. Our Core Promise: 100% Client-Side Processing</h2>
          <p className="leading-relaxed mb-4">
            Unlike traditional SaaS platforms, SpreadsheetFix operates entirely inside your web browser. When you upload a spreadsheet for cleaning, <strong>the contents of your file never leave your device.</strong> We do not upload, transmit, store, or parse your spreadsheet data on our servers.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">2. Information We Do Collect</h2>
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

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">3. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We prioritize the security of the minimal data we do store. All backend communications for authentication and billing use TLS encryption. Our databases are strictly access-controlled and regularly audited.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">4. Your Rights (GDPR)</h2>
          <p className="leading-relaxed mb-4">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. You may request to access, correct, delete, or restrict the use of your Personal Data. To exercise these rights, email us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">5. Contact Us</h2>
          <p className="leading-relaxed mb-4">
            For any questions about this Privacy Policy or your data, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </section>

        <div className="border-t border-rule pt-8 mt-12">
          <Link href="/pricing" className="text-accent hover:underline font-semibold">
            &larr; Back to Pricing
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
