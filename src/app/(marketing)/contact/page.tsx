import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { DEFAULT_OPEN_GRAPH, SITE_NAME, SUPPORT_EMAIL, absoluteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SpreadsheetFix about support, billing, security or a file that didn’t clean the way you expected.",
  alternates: { canonical: "/contact" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Contact | SpreadsheetFix", url: "/contact" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            url: absoluteUrl("/contact"),
            mainEntity: {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
              email: SUPPORT_EMAIL,
              contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL },
            },
          },
        ]}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Contact</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline underline-offset-2">{SUPPORT_EMAIL}</a>{" "}
          for support, billing and security questions.
        </p>
        <dl className="mt-12 max-w-[720px] border-t border-rule">
          <div className="py-5 border-b border-rule">
            <dt className="font-semibold">A file didn’t clean as expected</dt>
            <dd className="mt-1.5 text-ink-body leading-relaxed">
              Describe the problem and include a few example values with any personal data changed. Please don’t send
              the original file; we never need it.
            </dd>
          </div>
          <div className="py-5 border-b border-rule">
            <dt className="font-semibold">Billing and refunds</dt>
            <dd className="mt-1.5 text-ink-body leading-relaxed">
              Signed-in customers can manage their plan from the <Link href="/billing" className="text-accent underline underline-offset-2">billing page</Link>.
              The refund terms are on the <Link href="/pricing" className="text-accent underline underline-offset-2">pricing page</Link>.
            </dd>
          </div>
          <div className="py-5 border-b border-rule">
            <dt className="font-semibold">Security</dt>
            <dd className="mt-1.5 text-ink-body leading-relaxed">
              How files are handled is described on the <Link href="/security" className="text-accent underline underline-offset-2">security page</Link>.
              Report vulnerabilities to the address above.
            </dd>
          </div>
        </dl>
      </main>
      <SiteFooter />
    </div>
  );
}
