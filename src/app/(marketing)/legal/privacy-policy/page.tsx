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
        <p className="text-sm font-medium text-ink-muted mb-12">Last Updated: 25 October 2026</p>

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
            <li><strong>User Presets:</strong> On Pro and Team plans, presets you save (a name, the rules you chose and their settings, including any column names you picked and any value you typed into a Filter Rows condition) are synced to our database so you can use them on any device. On Team, presets you mark as shared are visible to your team. Presets never contain rows or cell values read from your files. Free-plan presets stay in your browser.</li>
            <li><strong>Team Data:</strong> On Team plans, we store who is in the team, the email addresses of pending invites, and an audit log of preset changes and members joining or leaving (who did what, and when). The audit log never contains file contents.</li>
          </ul>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">3. Service Providers</h2>
          <p className="leading-relaxed mb-4">
            We use a small number of providers to run SpreadsheetFix. None of them receive the contents of your files.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Clerk:</strong> sign-in and account management (your email address, name and profile image).</li>
            <li><strong>Stripe:</strong> payments and subscriptions (billing details; we never see full card numbers).</li>
            <li><strong>Vercel:</strong> hosting (standard request data such as IP address and browser type, in server logs).</li>
            <li><strong>Neon:</strong> our database (the account, subscription, preset and team data described above).</li>
            <li><strong>Resend:</strong> sends team invite emails (the invitee&apos;s email address, the team name and the join link).</li>
            <li><strong>Google Analytics:</strong> usage analytics, only if you accept analytics cookies (pages visited and counts such as rows cleaned, never file contents).</li>
          </ul>
          <p className="leading-relaxed mb-4">
            Some of these providers process data outside the EEA. Where they do, they rely on safeguards such as Standard Contractual Clauses.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">4. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We prioritize the security of the minimal data we do store. All backend communications for authentication and billing use TLS encryption. Our databases are strictly access-controlled and regularly audited.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">5. Your Rights (GDPR)</h2>
          <p className="leading-relaxed mb-4">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. You may request to access, correct, delete, or restrict the use of your Personal Data. To exercise these rights, email us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">6. Contact Us</h2>
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
