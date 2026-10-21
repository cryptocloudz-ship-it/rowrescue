import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "Spreadsheet Cleaning Guides",
  description:
    "Practical guides to the problems that break CSV and Excel files: changed dates, garbled characters, duplicates that won't go away, and choosing between CSV and XLSX.",
  alternates: { canonical: "/guides" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Spreadsheet Cleaning Guides | SpreadsheetFix", url: "/guides" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Guides</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Why CSV and Excel files go wrong, and how to fix them, with or without SpreadsheetFix.
        </p>
        <ul className="mt-12 border-t border-rule max-w-[820px]">
          {GUIDES.map((g) => (
            <li key={g.slug} className="border-b border-rule">
              <Link href={`/guides/${g.slug}`} className="group block py-6">
                <h2 className="text-lg font-semibold group-hover:text-accent">{g.title}</h2>
                <p className="mt-1.5 text-ink-body leading-relaxed">{g.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
