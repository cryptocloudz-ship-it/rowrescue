import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "CSV and Excel Problem Guides",
  description:
    "Fixes for Excel changing dates, garbled characters, duplicates that won’t go away, European numbers and hidden spaces, plus when to use CSV or XLSX.",
  alternates: { canonical: "/guides" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "CSV and Excel Problem Guides | SpreadsheetFix", url: "/guides" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: GUIDES.map((g, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: g.h1,
              url: absoluteUrl(`/guides/${g.slug}`),
            })),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">CSV and Excel problem guides</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Each guide starts from what you see on screen, explains why it happens, and shows how to fix it by hand in Excel
          or Google Sheets. Where SpreadsheetFix can fix it for you, the guide says how, and what it won’t catch.
        </p>
        <ul className="mt-12 grid md:grid-cols-2 gap-x-12 border-t border-rule">
          {GUIDES.map((g) => (
            <li key={g.slug} className="border-b border-rule">
              <Link href={`/guides/${g.slug}`} className="group block py-6">
                <h2 className="text-lg font-semibold group-hover:text-accent">{g.h1}</h2>
                <p className="mt-1.5 text-ink-body leading-relaxed">{g.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
