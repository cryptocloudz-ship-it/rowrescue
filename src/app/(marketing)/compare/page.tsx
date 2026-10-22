import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS } from "@/content/comparisons";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "SpreadsheetFix Compared",
  description:
    "How SpreadsheetFix compares with Excel, Google Sheets, OpenRefine and Power Query for cleaning CSV files, and when each one is the better choice.",
  alternates: { canonical: "/compare" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "SpreadsheetFix Compared | SpreadsheetFix", url: "/compare" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Compare", path: "/compare" },
];

export default function CompareIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">How SpreadsheetFix compares</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Each comparison says what the other tool does better, as well as where SpreadsheetFix fits.
        </p>
        <ul className="mt-12 grid md:grid-cols-2 gap-x-12 border-t border-rule">
          {COMPARISONS.map((c) => (
            <li key={c.slug} className="border-b border-rule">
              <Link href={`/compare/${c.slug}`} className="group block py-6">
                <h2 className="text-lg font-semibold group-hover:text-accent">SpreadsheetFix vs {c.competitor}</h2>
                <p className="mt-1.5 text-ink-body leading-relaxed">{c.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
