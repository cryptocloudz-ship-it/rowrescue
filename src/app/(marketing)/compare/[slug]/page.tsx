import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPARISONS, COMPARISON_MAP } from "@/content/comparisons";
import { TOOL_MAP } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { SITE_NAME } from "@/config/site";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPARISON_MAP.get(slug);
  if (!c) return {};
  const path = `/compare/${c.slug}`;
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url: path, siteName: SITE_NAME, type: "article" },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDescription },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const c = COMPARISON_MAP.get(slug);
  if (!c) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: `vs ${c.competitor}`, path: `/compare/${c.slug}` },
  ];
  const tools = c.tools.map((s) => TOOL_MAP.get(s)).filter((t) => t !== undefined);
  const guides = GUIDES.filter((g) => c.tools.includes(g.tool));
  const others = COMPARISONS.filter((o) => o.slug !== c.slug);

  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <SiteHeader />

      <main id="main-content">
        <section className="max-w-[1200px] mx-auto px-6 pt-14 pb-12">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">{c.h1}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[680px]">{c.intro}</p>
        </section>

        <section className="max-w-[1200px] mx-auto px-6 pb-16">
          <div className="rounded-lg border border-rule overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[15px]">
              <thead className="bg-surface text-left">
                <tr>
                  <th scope="col" className="p-4 font-medium text-ink-muted w-[22%]"><span className="sr-only">Aspect</span></th>
                  <th scope="col" className="p-4 font-semibold">{SITE_NAME}</th>
                  <th scope="col" className="p-4 font-semibold">{c.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.aspect} className="border-t border-rule align-top">
                    <th scope="row" className="p-4 text-left font-medium">{r.aspect}</th>
                    <td className="p-4 text-ink-body leading-relaxed">{r.us}</td>
                    <td className="p-4 text-ink-body leading-relaxed">{r.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-y border-rule bg-surface">
          <div className="max-w-[1200px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">Choose {c.competitor} when</h2>
              <ul className="mt-5 border-t border-rule">
                {c.chooseThem.map((s) => (
                  <li key={s} className="py-3 border-b border-rule text-ink-body leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">Choose {SITE_NAME} when</h2>
              <ul className="mt-5 border-t border-rule">
                {c.chooseUs.map((s) => (
                  <li key={s} className="py-3 border-b border-rule text-ink-body leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="flex-1 min-w-0 max-w-[720px] space-y-14">
            {c.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">{sec.heading}</h2>
                <p className="mt-3 text-ink-body leading-relaxed">{sec.body}</p>
              </section>
            ))}
            <section>
              <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">Questions</h2>
              <div className="mt-6 border-t border-rule">
                {c.faqs.map((f) => (
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
            <nav aria-label="Try a tool">
              <h2 className="text-[13px] font-medium text-ink-muted">Try it on your file</h2>
              <ul className="mt-3 border-t border-rule">
                {tools.map((t) => (
                  <li key={t.slug} className="border-b border-rule">
                    <Link href={`/${t.slug}`} className="group block py-4">
                      <span className="font-semibold group-hover:text-accent">{t.name}</span>
                      <span className="block mt-1 text-sm leading-relaxed text-ink-muted">{t.metaDescription}</span>
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
                      <Link href={`/guides/${g.slug}`} className="block py-4 font-semibold hover:text-accent">{g.h1}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <nav aria-label="Other comparisons">
              <h2 className="text-[13px] font-medium text-ink-muted">Other comparisons</h2>
              <ul className="mt-3 border-t border-rule">
                {others.map((o) => (
                  <li key={o.slug} className="border-b border-rule">
                    <Link href={`/compare/${o.slug}`} className="block py-4 font-semibold hover:text-accent">
                      {SITE_NAME} vs {o.competitor}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
