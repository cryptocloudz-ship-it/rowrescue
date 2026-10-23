import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui">

      <SiteHeader />

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] mb-2">Cookie Policy</h1>
        <p className="text-sm font-medium text-ink-muted mb-12">Last Updated: March 2026</p>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">1. What are cookies?</h2>
          <p className="leading-relaxed mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">2. The Essential Cookies We Use</h2>
          <p className="leading-relaxed mb-4">
            We use a minimal number of essential cookies to provide our core services. Because these cookies are strictly necessary to deliver the application, you cannot refuse them without impacting how our site functions.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Authentication:</strong> Provided by Clerk to keep you securely signed in to your account.</li>
            <li><strong>Billing:</strong> Secure tokens used by Stripe to manage your subscription sessions.</li>
            <li><strong>Preferences:</strong> Like saving your choice to dismiss our onboarding guides or cookie banners (e.g., `rowrescue_cookie_consent`).</li>
          </ul>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">3. Analytics and Performance Cookies (Optional)</h2>
          <p className="leading-relaxed mb-4">
            We use third-party analytics (like Sentry for error tracking) to help us understand how visitors use the SpreadsheetFix application. These cookies collect information such as the pages you visit, the links you click, and the buttons you use. The information collected is anonymized and aggregated. You can decline these cookies using our Cookie Consent banner.
          </p>
        </section>

        <section className="mb-10 text-ink-body">
          <h2 className="text-2xl font-semibold text-ink mb-4">4. Managing Your Cookie Preferences</h2>
          <p className="leading-relaxed mb-4">
            In addition to our integrated cookie banner, you can control your cookie settings directly through your browser. Most web browsers allow some control of most cookies through the browser settings.
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
