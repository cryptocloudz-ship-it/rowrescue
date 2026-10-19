import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "Free CSV Cleaning Tools",
  description:
    "Free, private tools to remove duplicates, fix dates and encoding, validate emails, trim spaces and merge CSV files. Everything runs in your browser.",
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
          Each tool runs in your browser, so your data is never uploaded. Free for files up to 5,000 rows.
        </p>
        <ul className="mt-12 grid md:grid-cols-2 gap-x-12 border-t border-rule">
          {TOOLS.map((t) => (
            <li key={t.slug} className="border-b border-rule">
              <Link href={`/${t.slug}`} className="group block py-6">
                <h2 className="text-lg font-semibold group-hover:text-accent">{t.name}</h2>
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
