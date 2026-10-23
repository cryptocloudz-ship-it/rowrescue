import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, GUIDE_MAP, guideNeedsPro } from "@/content/guides";
import { TOOL_MAP } from "@/content/tools";
import { COMPARISONS } from "@/content/comparisons";
import { hubForGuide, hubNameInline, hubPath } from "@/content/hubs";
import { SITE_NAME, absoluteUrl } from "@/config/site";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolLauncher } from "@/components/tools/ToolLauncher";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { FREE_MAX_ROWS } from "@/config/plans";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_MAP.get(slug);
  if (!guide) return {};
  return {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `/guides/${guide.slug}`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
    twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription },
  };
}

// Same format as the totals check in the app (TotalsCheck is a client module, so not imported here)
function formatTotal(value: number) {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDE_MAP.get(slug);
  if (!guide) notFound();

  const url = absoluteUrl(`/guides/${guide.slug}`);
  const tool = TOOL_MAP.get(guide.tool)!;
  const relatedTools = guide.relatedTools.map((s) => TOOL_MAP.get(s)).filter((t) => t !== undefined);
  const relatedGuides = guide.relatedGuides.map((s) => GUIDE_MAP.get(s)).filter((g) => g !== undefined);
  const needsPro = guideNeedsPro(guide);
  const comparisons = COMPARISONS.filter((c) => c.tools.includes(guide.tool));
  const orgId = absoluteUrl("/#organization");
  const hub = hubForGuide(guide.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.name, path: `/guides/${guide.slug}` },
  ];

  return (
    <div className="min-h-screen bg-paper font-ui text-ink relative overflow-x-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.h1,
            description: guide.metaDescription,
            url,
            mainEntityOfPage: url,
            datePublished: guide.published,
            dateModified: guide.updated,
            // The per-guide OG image path carries a build hash, so use the stable site image
            image: absoluteUrl("/og-image.png"),
            // Inline name and url: the full Organization node only lives on the homepage
            author: { "@type": "Organization", "@id": orgId, name: SITE_NAME, url: absoluteUrl("/") },
            publisher: { "@type": "Organization", "@id": orgId, name: SITE_NAME, url: absoluteUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <SiteHeader />

      <main id="main-content">
        <section className="max-w-[1200px] mx-auto px-6 pt-14 pb-10">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">{guide.h1}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[680px]">{guide.summary}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-ink-muted">Updated</dt><dd className="mt-0.5 font-medium"><time dateTime={guide.updated}>{formatDate(guide.updated)}</time></dd></div>
            <div><dt className="text-ink-muted">Applies to</dt><dd className="mt-0.5 font-medium">Excel, Google Sheets, CSV</dd></div>
            <div><dt className="text-ink-muted">SpreadsheetFix rule</dt><dd className="mt-0.5 font-medium">{needsPro ? "Pro" : `Free up to ${FREE_MAX_ROWS} rows`}</dd></div>
          </dl>
        </section>

        <div className="max-w-[1200px] mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
          <article className="flex-1 min-w-0 max-w-[720px] space-y-14">
            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Why this happens</h2>
              <div className="mt-4 space-y-4">
                {guide.cause.map((p) => (
                  <p key={p} className="text-ink-body leading-relaxed">{p}</p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Fix it by hand</h2>
              <div className="mt-6 space-y-10">
                {guide.manualFix.map((m) => (
                  <div key={m.heading}>
                    <h3 className="text-[20px] leading-tight font-semibold tracking-[-0.01em]">{m.heading}</h3>
                    <ol className="mt-4 border-t border-rule">
                      {m.steps.map((step, i) => (
                        <li key={i} className="flex gap-5 py-4 border-b border-rule">
                          <span className="font-data text-sm text-accent pt-0.5 w-5 shrink-0">{i + 1}</span>
                          <p className="text-ink-body leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                    {m.note && <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{m.note}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="tool-fix">
              <h2 id="tool-fix" className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Fix it with SpreadsheetFix</h2>
              <div className="mt-4 space-y-4">
                {guide.toolFix.map((p) => (
                  <p key={p} className="text-ink-body leading-relaxed">{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <ToolLauncher preset={guide.preset} />
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                The same cleaner is on the <Link href={`/${tool.slug}`} className="text-accent hover:text-accent-strong underline underline-offset-2">{tool.name}</Link> page.
              </p>
            </section>

            <section>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">Before and after</h2>
              <div className="mt-6 grid gap-4">
                <figure className="m-0 rounded-lg border border-rule bg-surface p-5">
                  <figcaption className="text-[13px] font-medium text-ink-muted mb-3">Before</figcaption>
                  <pre className="font-data text-xs sm:text-sm text-ink-body whitespace-pre overflow-x-auto leading-relaxed">{guide.before}</pre>
                </figure>
                <figure className="m-0 rounded-lg border border-rule bg-paper p-5">
                  <figcaption className="text-[13px] font-medium text-accent mb-3">After</figcaption>
                  <pre className="font-data text-xs sm:text-sm text-accent whitespace-pre overflow-x-auto leading-relaxed">{guide.after}</pre>
                  {guide.afterNote && <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{guide.afterNote}</p>}
                  {guide.totals && (
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                      Totals check, {guide.totals.column}:{" "}
                      <span className="font-data tabular-nums text-ink-body">
                        {formatTotal(guide.totals.before)} − {formatTotal(guide.totals.removed)} removed = {formatTotal(guide.totals.after)}
                      </span>
                    </p>
                  )}
                </figure>
              </div>
            </section>

            <section>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">What it won’t catch</h2>
              <ul className="mt-4 border-t border-rule">
                {guide.limits.map((l) => (
                  <li key={l} className="py-4 border-b border-rule text-ink-body leading-relaxed">{l}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Questions</h2>
              <div className="mt-6 border-t border-rule">
                {guide.faqs.map((f) => (
                  <details key={f.q} className="group border-b border-rule">
                    <summary className="cursor-pointer list-none flex justify-between gap-4 py-4 font-semibold">
                      {f.q}
                      <span className="text-ink-muted group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                    </summary>
                    <p className="pb-4 -mt-1 text-ink-body leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="lg:w-[320px] shrink-0 space-y-10">
            <nav aria-label="Related tools">
              <h2 className="text-[13px] font-medium text-ink-muted">Related tools</h2>
              <ul className="mt-3 border-t border-rule">
                {relatedTools.map((r) => (
                  <li key={r.slug} className="border-b border-rule">
                    <Link href={`/${r.slug}`} className="group block py-4">
                      <span className="font-semibold group-hover:text-accent">{r.name}</span>
                      <span className="block mt-1 text-sm leading-relaxed text-ink-muted">{r.metaDescription}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Related guides">
              <h2 className="text-[13px] font-medium text-ink-muted">Related guides</h2>
              <ul className="mt-3 border-t border-rule">
                {relatedGuides.map((g) => (
                  <li key={g.slug} className="border-b border-rule">
                    <Link href={`/guides/${g.slug}`} className="group block py-4">
                      <span className="font-semibold group-hover:text-accent">{g.h1}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {hub && (
              <nav aria-label="Tool group">
                <h2 className="text-[13px] font-medium text-ink-muted">More tools</h2>
                <Link href={hubPath(hub)} className="mt-3 block border-y border-rule py-4 font-semibold hover:text-accent">
                  All tools for {hubNameInline(hub)}
                </Link>
              </nav>
            )}
            {comparisons.length > 0 && (
              <nav aria-label="Comparisons">
                <h2 className="text-[13px] font-medium text-ink-muted">Compare</h2>
                <ul className="mt-3 border-t border-rule">
                  {comparisons.map((c) => (
                    <li key={c.slug} className="border-b border-rule">
                      <Link href={`/compare/${c.slug}`} className="block py-4 font-semibold hover:text-accent">
                        {SITE_NAME} vs {c.competitor}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
