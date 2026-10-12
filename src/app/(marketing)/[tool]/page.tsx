import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { TOOLS, TOOL_MAP } from "@/content/tools";
import { SITE_NAME, absoluteUrl } from "@/config/site";
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

  return (
    <div className="min-h-screen bg-background-dark font-display text-slate-100 relative overflow-x-hidden">
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
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[420px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <SiteHeader />

      <main id="main-content">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-primary">Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-400">{tool.name}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{tool.h1}</h1>
          <p className="text-lg text-slate-400 mt-5 leading-relaxed">{tool.intro}</p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-primary font-semibold">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Free up to 5,000 rows · No sign-up · Nothing uploaded
          </p>
        </section>

        <section aria-label={`${tool.name} tool`} className="px-4 pb-16">
          {tool.kind === "merge" ? <MergeTool /> : <ToolLauncher preset={tool.preset!} />}
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Before and after</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <figure className="glass-panel rounded-2xl border border-rose-500/20 p-5">
              <figcaption className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4" aria-hidden="true" /> Before
              </figcaption>
              <pre className="font-mono text-xs sm:text-sm text-slate-400 whitespace-pre overflow-x-auto leading-relaxed">{tool.before}</pre>
            </figure>
            <figure className="glass-panel rounded-2xl border border-primary/30 p-5">
              <figcaption className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> After RowRescue
              </figcaption>
              <pre className="font-mono text-xs sm:text-sm text-primary/90 whitespace-pre overflow-x-auto leading-relaxed">{tool.after}</pre>
            </figure>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <ol className="space-y-4">
            {tool.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 size-8 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <p className="text-slate-300 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16 space-y-10">
          {tool.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-2xl font-bold mb-3">{s.heading}</h2>
              <p className="text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
          <div className="divide-y divide-primary/10 glass-panel rounded-2xl border border-primary/10">
            {tool.faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer font-bold text-slate-200 list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-primary group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-slate-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="glass-panel rounded-2xl border border-primary/30 p-8 text-center">
            <h2 className="text-2xl font-bold">Cleaning bigger files every week?</h2>
            <p className="text-slate-400 mt-3">
              Pro cleans up to 500,000 rows per file, unlocks all 18 rules, exports to Excel and removes the watermark.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold hover:brightness-110 neon-glow"
            >
              See Pro pricing <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-24">
          <h2 className="text-xl font-bold mb-6">Related tools</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="glass-panel rounded-xl border border-primary/10 hover:border-primary/40 p-5 transition-colors"
              >
                <div className="font-bold text-primary">{r.name}</div>
                <p className="text-sm text-slate-400 mt-2">{r.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
