import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, TOOL_MAP, toolNeedsPro } from "@/content/tools";
import { HUBS, hubMembers, hubPath } from "@/content/hubs";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";
import { FREE_MAX_ROWS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Free CSV Cleaning Tools",
  description:
    "Free, private CSV tools to remove duplicates, fix dates and encoding, validate emails, trim spaces and merge files. Runs in your browser, no upload.",
  alternates: { canonical: "/tools" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Free CSV Cleaning Tools | SpreadsheetFix", url: "/tools" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
];

// Each tool is listed once, under the hub it belongs to (its listing that isn't cross-listed)
function primaryTools(hub: (typeof HUBS)[number]) {
  return hubMembers(hub)
    .filter((m) => m.type === "tool" && !("crossListed" in m && m.crossListed))
    .map((m) => TOOL_MAP.get(m.slug))
    .filter((t) => t !== undefined);
}

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: TOOLS.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.name,
              url: absoluteUrl(`/${t.slug}`),
            })),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Free CSV cleaning tools</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[640px]">
          Each tool runs in your browser, so you can clean a CSV or Excel file without uploading it: the contents never
          reach our servers, which keeps client and bank data GDPR-friendly. Most are free for files up to {FREE_MAX_ROWS} rows;
          the ones marked Pro use rules from the Pro plan.
        </p>
        <nav aria-label="Tool groups" className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          {HUBS.map((h) => (
            <a key={h.slug} href={`#${h.slug}`} className="text-accent hover:text-accent-strong">{h.name}</a>
          ))}
        </nav>
        {HUBS.map((hub) => (
          <section key={hub.slug} id={hub.slug} className="mt-14 scroll-mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">
                <Link href={hubPath(hub)} className="hover:text-accent">{hub.name}</Link>
              </h2>
              <Link href={hubPath(hub)} className="text-sm font-medium text-accent hover:text-accent-strong">
                {hub.name}: where to start and related guides
              </Link>
            </div>
            <ul className="mt-6 grid md:grid-cols-2 gap-x-12 border-t border-rule">
              {primaryTools(hub).map((t) => (
                <li key={t.slug} className="border-b border-rule">
                  <Link href={`/${t.slug}`} className="group block py-6">
                    <h3 className="text-lg font-semibold group-hover:text-accent">
                      {t.name}
                      {toolNeedsPro(t) && (
                        <span className="ml-2 align-middle text-xs font-medium text-ink-muted border border-rule rounded px-1.5 py-0.5">Pro</span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-ink-body leading-relaxed">{t.metaDescription}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
