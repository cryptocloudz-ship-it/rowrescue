import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_RULES } from "@/lib/engine/rules";
import { TOOLS, TOOL_MAP, toolNeedsPro } from "@/content/tools";
import { GUIDE_MAP } from "@/content/guides";
import { SITE_NAME, absoluteUrl } from "@/config/site";
import { PLANS } from "@/config/plans";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolLauncher } from "@/components/tools/ToolLauncher";
import { MergeTool } from "@/components/tools/MergeTool";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = TOOL_MAP.get(slug);
  if (!tool) return {};
  return {
    title: { absolute: tool.metaTitle },
    description: tool.metaDescription,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `/${tool.slug}`,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: tool.metaTitle, description: tool.metaDescription },
  };
}

export default async function ToolPage({ params }: Props) {
  const { tool: slug } = await params;
  const tool = TOOL_MAP.get(slug);
  if (!tool) notFound();

  const url = absoluteUrl(`/${tool.slug}`);
  const related = tool.related.map((s) => TOOL_MAP.get(s)).filter((t) => t !== undefined);
  const needsPro = toolNeedsPro(tool);
  const guides = (tool.guides ?? []).map((s) => GUIDE_MAP.get(s)).filter((g) => g !== undefined);

  return (
    <div className="min-h-screen bg-paper font-ui text-ink relative overflow-x-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `${SITE_NAME} — ${tool.name}`,
            url,
            description: tool.metaDescription,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any (web browser)",
            // The per-tool OG image path carries a build hash (opengraph-image-<hash>), so use the stable site image
            image: absoluteUrl("/og-image.png"),
            // Pro-only pages advertise the Pro price, not a free offer the rule isn't part of
            offers: needsPro
              ? {
                  "@type": "Offer",
                  name: PLANS.pro.name,
                  price: String((PLANS.pro.priceMonthly ?? 0) / 100),
                  priceCurrency: "EUR",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: String((PLANS.pro.priceMonthly ?? 0) / 100),
                    priceCurrency: "EUR",
                    billingDuration: "P1M",
                  },
                }
              : { "@type": "Offer", name: PLANS.free.name, price: "0", priceCurrency: "EUR" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tool.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
              { "@type": "ListItem", position: 3, name: tool.name, item: url },
            ],
          },
        ]}
      />
      <SiteHeader />

      <main id="main-content">
        <section className="max-w-[1200px] mx-auto px-6 pt-14 pb-10">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted mb-6">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/tools" className="hover:text-ink">Tools</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-current="page">{tool.name}</span>
          </nav>
          <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">{tool.h1}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[680px]">{tool.intro}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {needsPro ? (
              <div><dt className="text-ink-muted">Plan</dt><dd className="mt-0.5 font-medium">Pro rule</dd></div>
            ) : (
              <div><dt className="text-ink-muted">Free up to</dt><dd className="mt-0.5 font-medium">5,000 rows</dd></div>
            )}
            <div><dt className="text-ink-muted">Account</dt><dd className="mt-0.5 font-medium">Not required</dd></div>
            <div><dt className="text-ink-muted">Upload</dt><dd className="mt-0.5 font-medium">None</dd></div>
          </dl>
        </section>

        <section aria-label={`${tool.name} tool`} className="max-w-[1200px] mx-auto px-6 pb-16">
          {tool.kind === "merge" ? <MergeTool /> : <ToolLauncher preset={tool.preset!} />}
        </section>

        <section className="border-t border-rule bg-surface">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Before and after</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <figure className="m-0 rounded-lg border border-rule bg-paper p-5">
                <figcaption className="text-[13px] font-medium text-ink-muted mb-3">Before</figcaption>
                <pre className="font-data text-xs sm:text-sm text-ink-body whitespace-pre overflow-x-auto leading-relaxed">{tool.before}</pre>
              </figure>
              <figure className="m-0 rounded-lg border border-rule bg-paper p-5">
                <figcaption className="text-[13px] font-medium text-accent mb-3">
                  {tool.afterView === "flagged" ? "Flagged for review" : "After"}
                </figcaption>
                <pre className="font-data text-xs sm:text-sm text-accent whitespace-pre overflow-x-auto leading-relaxed">{tool.after}</pre>
                {tool.afterNote && <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{tool.afterNote}</p>}
              </figure>
            </div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="flex-1 min-w-0 max-w-[720px] space-y-14">
            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">How it works</h2>
              <ol className="mt-6 border-t border-rule">
                {tool.steps.map((step, i) => (
                  <li key={i} className="flex gap-5 py-4 border-b border-rule">
                    <span className="font-data text-sm text-accent pt-0.5 w-5 shrink-0">{i + 1}</span>
                    <p className="text-ink-body leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {tool.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">{sec.heading}</h2>
                <p className="mt-3 text-ink-body leading-relaxed">{sec.body}</p>
              </section>
            ))}

            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Questions</h2>
              <div className="mt-6 border-t border-rule">
                {tool.faqs.map((f) => (
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
          </div>

          <aside className="lg:w-[320px] shrink-0 space-y-10">
            <div className="rounded-lg border border-rule p-6">
              <h2 className="font-semibold">Larger files</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-body">
                Pro cleans up to 500,000 rows per file, adds all {ALL_RULES.length} rules and Excel export, and removes
                the watermark.
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex items-center min-h-11 px-4 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted transition-colors"
              >
                See pricing
              </Link>
            </div>
            <nav aria-label="Related tools">
              <h2 className="text-[13px] font-medium text-ink-muted">Related tools</h2>
              <ul className="mt-3 border-t border-rule">
                {related.map((r) => (
                  <li key={r.slug} className="border-b border-rule">
                    <Link href={`/${r.slug}`} className="group block py-4">
                      <span className="font-semibold group-hover:text-accent">{r.name}</span>
                      <span className="block mt-1 text-sm leading-relaxed text-ink-muted">{r.metaDescription}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {guides.length > 0 && (
              <nav aria-label="Guides">
                <h2 className="text-[13px] font-medium text-ink-muted">Guides</h2>
                <ul className="mt-3 border-t border-rule">
                  {guides.map((g) => (
                    <li key={g.slug} className="border-b border-rule">
                      <Link href={`/guides/${g.slug}`} className="group block py-4">
                        <span className="font-semibold group-hover:text-accent">{g.h1}</span>
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
