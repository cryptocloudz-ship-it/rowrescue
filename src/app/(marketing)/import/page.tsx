import type { Metadata } from "next";
import Link from "next/link";
import { IMPORTS, BANKS, SOFTWARE, importNeedsPro } from "@/content/imports";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "Bank CSV to Xero and QuickBooks Import Guides",
  description:
    "Step-by-step guides for importing Revolut, Wise and Monzo CSV exports into Xero and QuickBooks Online: the columns, dates and fees that need fixing.",
  alternates: { canonical: "/import" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Bank CSV to Xero and QuickBooks Import Guides | SpreadsheetFix", url: "/import" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Import guides", path: "/import" },
];

export default function ImportIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: IMPORTS.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.h1,
              url: absoluteUrl(`/import/${p.slug}`),
            })),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Import a bank CSV into your accounting software</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[660px]">
          Each guide takes one bank’s CSV export and one accounting product’s bank statement import, and goes through
          every place they disagree: column layout, date format, fees and balances. The software requirements come from
          the vendors’ own help pages; each guide lists its sources.
        </p>
        <ul className="mt-12 grid md:grid-cols-2 gap-x-12 border-t border-rule">
          {IMPORTS.map((p) => (
            <li key={p.slug} className="border-b border-rule">
              <Link href={`/import/${p.slug}`} className="group block py-6">
                <p className="text-[13px] font-medium text-ink-muted">
                  {BANKS[p.bank].name} → {SOFTWARE[p.software].name}
                  {importNeedsPro(p) ? " · Pro" : ""}
                </p>
                <h2 className="mt-1 text-lg font-semibold group-hover:text-accent">{p.h1}</h2>
                <p className="mt-1.5 text-ink-body leading-relaxed">{p.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-ink-body leading-relaxed max-w-[660px]">
          Bank not listed? The{" "}
          <Link href="/prepare-csv-for-accounting-import" className="text-accent hover:text-accent-strong underline underline-offset-2">accounting import cleaner</Link>{" "}
          and the{" "}
          <Link href="/clean-bank-statement-csv" className="text-accent hover:text-accent-strong underline underline-offset-2">bank statement cleaner</Link>{" "}
          work with any bank’s export.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
