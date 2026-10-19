"use client";

import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/site";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui">

      <SiteHeader />

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] mb-2">Terms of Service</h1>
        <p className="text-sm font-medium text-ink-muted mb-12">Last Updated: October 2026</p>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed mb-4">
            By accessing or using the SpreadsheetFix application (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">2. Description of Service</h2>
          <p className="leading-relaxed mb-4">
            SpreadsheetFix is a client-side data cleaning application. We provide a set of tools to format, deduplicate, and validate CSV and Excel data within your web browser. Due to our privacy-first architecture, your file contents are never transmitted to our servers for processing.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">3. Refund & Fair Use Policy</h2>
          <div className="p-6 my-6 bg-surface border border-rule rounded-lg">
            <p className="leading-relaxed text-ink-body">
              We offer a <strong>7-day money-back guarantee</strong> on all paid subscriptions. To prevent abuse, this guarantee is strictly subject to a <strong>Fair Use Policy</strong>.
            </p>
            <p className="leading-relaxed mt-4 text-ink-body">
              We actively monitor account usage patterns. If we determine that the Service has been abused (e.g., executing massive data cleanups immediately followed by a refund request, or sharing a single account credential across multiple users), we reserve the right to <strong>deny your refund request</strong> and instantly terminate your access.
            </p>
          </div>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">4. User Accounts</h2>
          <p className="leading-relaxed mb-4">
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">5. Limitation of Liability</h2>
          <p className="leading-relaxed mb-4">
            In no event shall SpreadsheetFix, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">6. Contact Us</h2>
          <p className="leading-relaxed mb-4">
            For refund requests or any questions about these Terms, contact us at{" "}
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
