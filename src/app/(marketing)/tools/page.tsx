import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, toolNeedsPro } from "@/content/tools";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";
import { FREE_MAX_ROWS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Free CSV Cleaning Tools",
  description:
    "Free, private CSV tools to remove duplicates, fix dates and encoding, validate emails, trim spaces and merge files. Runs in your browser, no upload.",
  alternates: { canonical: "/tools" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Free CSV Cleaning Tools | SpreadsheetFix", url: "/tools" },
};

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: TOOLS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.name,
            url: absoluteUrl(`/${t.slug}`),
          })),
        }}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Free CSV cleaning tools</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Each tool runs in your browser, so you can clean a CSV or Excel file without uploading it: the contents never
          reach our servers, which keeps client and bank data GDPR-friendly. Most are free for files up to {FREE_MAX_ROWS} rows;
          the ones marked Pro use rules from the Pro plan.
        </p>
        <ul className="mt-12 grid md:grid-cols-2 gap-x-12 border-t border-rule">
          {TOOLS.map((t) => (
            <li key={t.slug} className="border-b border-rule">
              <Link href={`/${t.slug}`} className="group block py-6">
                <h2 className="text-lg font-semibold group-hover:text-accent">
                  {t.name}
                  {toolNeedsPro(t) && (
                    <span className="ml-2 align-middle text-xs font-medium text-ink-muted border border-rule rounded px-1.5 py-0.5">Pro</span>
                  )}
                </h2>
                <p className="mt-1.5 text-ink-body leading-relaxed">{t.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
