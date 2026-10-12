import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "Free CSV Cleaning Tools",
  description:
    "Free, private tools to remove duplicates, fix dates and encoding, validate emails, trim spaces and merge CSV files. Everything runs in your browser.",
  alternates: { canonical: "/tools" },
};

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-background-dark font-display text-slate-100">
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
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-center">Free CSV cleaning tools</h1>
        <p className="text-lg text-slate-400 text-center mt-5 max-w-2xl mx-auto">
          Each tool runs entirely in your browser, so your data is never uploaded. Free for files up to 5,000 rows.
        </p>
        <div className="grid sm:grid-cols-2 gap-5 mt-14">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="glass-panel rounded-2xl border border-primary/10 hover:border-primary/40 p-6 transition-colors"
            >
              <h2 className="text-xl font-bold text-primary">{t.name}</h2>
              <p className="text-slate-400 mt-2 leading-relaxed">{t.metaDescription}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
