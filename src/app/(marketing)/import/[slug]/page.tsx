import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IMPORTS, IMPORT_MAP, BANKS, SOFTWARE, importNeedsPro, importSources, type Source } from "@/content/imports";
import { TOOL_MAP } from "@/content/tools";
import { GUIDE_MAP } from "@/content/guides";
import { SITE_NAME, absoluteUrl } from "@/config/site";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolLauncher } from "@/components/tools/ToolLauncher";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { FREE_MAX_ROWS } from "@/config/plans";

export const dynamicParams = false;

export function generateStaticParams() {
  return IMPORTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = IMPORT_MAP.get(slug);
  if (!page) return {};
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: `/import/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/import/${page.slug}`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: page.published,
      modifiedTime: page.updated,
    },
    twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription },
  };
}

// Same format as the totals check in the app (TotalsCheck is a client module, so not imported here)
function formatTotal(value: number) {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

const h2 = "text-[28px] leading-tight font-semibold tracking-[-0.015em]";
const link = "text-accent hover:text-accent-strong underline underline-offset-2";

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {sources.map((s) => (
        <li key={s.url} className="text-[15px] leading-relaxed">
          <a href={s.url} className={link} rel="noopener">{s.label}</a>
        </li>
      ))}
    </ul>
  );
}

export default async function ImportPairPage({ params }: Props) {
  const { slug } = await params;
  const page = IMPORT_MAP.get(slug);
  if (!page) notFound();

  const bank = BANKS[page.bank];
  const software = SOFTWARE[page.software];
  const url = absoluteUrl(`/import/${page.slug}`);
  const needsPro = importNeedsPro(page);
  const sources = importSources(page);
  const relatedTools = page.relatedTools.map((s) => TOOL_MAP.get(s)).filter((t) => t !== undefined);
  const relatedGuides = page.relatedGuides.map((s) => GUIDE_MAP.get(s)).filter((g) => g !== undefined);
  const siblings = IMPORTS.filter((p) => p.slug !== page.slug && (p.bank === page.bank || p.software === page.software));
  const orgId = absoluteUrl("/#organization");
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Import guides", path: "/import" },
    { name: page.name, path: `/import/${page.slug}` },
  ];

  return (
    <div className="min-h-screen bg-paper font-ui text-ink relative overflow-x-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.h1,
            description: page.metaDescription,
            url,
            mainEntityOfPage: url,
            datePublished: page.published,
            dateModified: page.updated,
            image: absoluteUrl("/og-image.png"),
            about: [bank.name, software.name],
            citation: [...sources.official, ...sources.layout].map((s) => s.url),
            author: { "@type": "Organization", "@id": orgId, name: SITE_NAME, url: absoluteUrl("/") },
            publisher: { "@type": "Organization", "@id": orgId, name: SITE_NAME, url: absoluteUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faqs.map((f) => ({
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
          <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">{page.h1}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[680px]">{page.summary}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-ink-muted">Updated</dt><dd className="mt-0.5 font-medium"><time dateTime={page.updated}>{formatDate(page.updated)}</time></dd></div>
            <div><dt className="text-ink-muted">From</dt><dd className="mt-0.5 font-medium">{bank.name} CSV export</dd></div>
            <div><dt className="text-ink-muted">To</dt><dd className="mt-0.5 font-medium">{software.name} bank statement import</dd></div>
            <div><dt className="text-ink-muted">SpreadsheetFix rules</dt><dd className="mt-0.5 font-medium">{needsPro ? `Pro; other rules free up to ${FREE_MAX_ROWS} rows` : `Free up to ${FREE_MAX_ROWS} rows`}</dd></div>
          </dl>
        </section>

        <div className="max-w-[1200px] mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
          <article className="flex-1 min-w-0 max-w-[720px] space-y-14">
            <section>
              <h2 className={h2}>What the {bank.name} export looks like</h2>
              <figure className="mt-5 m-0 rounded-lg border border-rule bg-surface p-5">
                <figcaption className="text-[13px] font-medium text-ink-muted mb-3">Header row, as current exports show it. Check it against your file.</figcaption>
                <pre className="font-data text-xs sm:text-sm text-ink-body whitespace-pre-wrap break-all leading-relaxed">{page.exportHeader}</pre>
              </figure>
              <div className="mt-5 space-y-4">
                {page.exportNotes.map((p) => (
                  <p key={p} className="text-ink-body leading-relaxed">{p}</p>
                ))}
              </div>
              <h3 className="mt-8 text-[20px] leading-tight font-semibold tracking-[-0.01em]">Downloading it</h3>
              <ol className="mt-3 border-t border-rule">
                {bank.exportSteps.map((step, i) => (
                  <li key={step} className="flex gap-5 py-3 border-b border-rule">
                    <span className="font-data text-sm text-accent pt-0.5 w-5 shrink-0">{i + 1}</span>
                    <p className="text-ink-body leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className={h2}>What {software.name} needs</h2>
              <ul className="mt-4 border-t border-rule">
                {software.requirements.map((r) => (
                  <li key={r} className="py-3 border-b border-rule text-ink-body leading-relaxed">{r}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-muted">From {software.name}’s own help pages, listed under Sources below.</p>
            </section>

            <section>
              <h2 className={h2}>Where they don’t match</h2>
              <div className="mt-6 border-t border-rule">
                {page.gaps.map((g) => (
                  <div key={g.problem} className="grid sm:grid-cols-2 gap-x-8 gap-y-1 py-4 border-b border-rule">
                    <p className="text-ink-body leading-relaxed">{g.problem}</p>
                    <p className="text-ink leading-relaxed font-medium">{g.fix}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className={h2}>Step by step</h2>
              <ol className="mt-4 border-t border-rule">
                {page.steps.map((step, i) => (
                  <li key={step} className="flex gap-5 py-4 border-b border-rule">
                    <span className="font-data text-sm text-accent pt-0.5 w-5 shrink-0">{i + 1}</span>
                    <p className="text-ink-body leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="tool-fix">
              <h2 id="tool-fix" className={h2}>What SpreadsheetFix does here</h2>
              <div className="mt-4 space-y-4">
                {page.toolFix.map((p) => (
                  <p key={p} className="text-ink-body leading-relaxed">{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <ToolLauncher preset={page.preset} />
              </div>
            </section>

            <section>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">Before and after</h2>
              <div className="mt-6 grid gap-4">
                <figure className="m-0 rounded-lg border border-rule bg-surface p-5">
                  <figcaption className="text-[13px] font-medium text-ink-muted mb-3">Before: a {bank.name} export</figcaption>
                  <pre className="font-data text-xs sm:text-sm text-ink-body whitespace-pre overflow-x-auto leading-relaxed">{page.before}</pre>
                </figure>
                <figure className="m-0 rounded-lg border border-rule bg-paper p-5">
                  <figcaption className="text-[13px] font-medium text-accent mb-3">After{needsPro ? ", on Pro" : ""}</figcaption>
                  <pre className="font-data text-xs sm:text-sm text-accent whitespace-pre overflow-x-auto leading-relaxed">{page.after}</pre>
                  {page.afterNote && <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{page.afterNote}</p>}
                  {page.totals && (
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                      Totals check, {page.totals.column}:{" "}
                      <span className="font-data tabular-nums text-ink-body">
                        {formatTotal(page.totals.before)} − {formatTotal(page.totals.removed)} removed = {formatTotal(page.totals.after)}
                      </span>
                    </p>
                  )}
                </figure>
                {page.afterFree && (
                  <figure className="m-0 rounded-lg border border-rule bg-paper p-5">
                    <figcaption className="text-[13px] font-medium text-ink-muted mb-3">After, on the free plan</figcaption>
                    <pre className="font-data text-xs sm:text-sm text-ink-body whitespace-pre overflow-x-auto leading-relaxed">{page.afterFree}</pre>
                  </figure>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">What it won’t do</h2>
              <ul className="mt-4 border-t border-rule">
                {page.limits.map((l) => (
                  <li key={l} className="py-4 border-b border-rule text-ink-body leading-relaxed">{l}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={h2}>Questions</h2>
              <div className="mt-6 border-t border-rule">
                {page.faqs.map((f) => (
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

            <section>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">Sources</h2>
              <h3 className="mt-5 text-[15px] font-semibold">{software.name} and {bank.name} help pages</h3>
              <SourceList sources={sources.official} />
              <h3 className="mt-6 text-[15px] font-semibold">The {bank.name} column layout</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                {bank.name} doesn’t publish the columns of its CSV export. The header row on this page is the one these
                independent parsers and guides agree on. Banks change their exports without notice, so treat your own file’s
                first row as the authority.
              </p>
              <SourceList sources={sources.layout} />
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
            {siblings.length > 0 && (
              <nav aria-label="Other imports">
                <h2 className="text-[13px] font-medium text-ink-muted">Other import guides</h2>
                <ul className="mt-3 border-t border-rule">
                  {siblings.map((p) => (
                    <li key={p.slug} className="border-b border-rule">
                      <Link href={`/import/${p.slug}`} className="block py-4 font-semibold hover:text-accent">
                        {BANKS[p.bank].name} to {SOFTWARE[p.software].name}
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
