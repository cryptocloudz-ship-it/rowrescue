import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, GUIDE_MAP } from "@/content/guides";
import { TOOL_MAP } from "@/content/tools";
import { SITE_NAME, absoluteUrl } from "@/config/site";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDE_MAP.get(slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  return {
    title: { absolute: g.metaTitle },
    description: g.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: g.metaTitle,
      description: g.metaDescription,
      url: path,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: g.published,
      modifiedTime: g.updated,
    },
    twitter: { card: "summary_large_image", title: g.metaTitle, description: g.metaDescription },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = GUIDE_MAP.get(slug);
  if (!g) notFound();

  const path = `/guides/${g.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: g.title, path },
  ];
  const tool = TOOL_MAP.get(g.tool);
  const others = GUIDES.filter((o) => o.slug !== g.slug);

  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.metaDescription,
            datePublished: g.published,
            dateModified: g.updated,
            mainEntityOfPage: absoluteUrl(path),
            image: absoluteUrl("/og-image.png"),
            author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
            publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/apple-icon.png") } },
          },
        ]}
      />
      <SiteHeader />

      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-20">
        <article className="flex-1 min-w-0 max-w-[720px]">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="text-[34px] sm:text-[42px] leading-[1.1] font-semibold tracking-[-0.025em]">{g.title}</h1>
          <p className="mt-4 text-sm text-ink-muted">
            Updated <time dateTime={g.updated}>{formatDate(g.updated)}</time>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink-body border-l-2 border-accent pl-4">{g.summary}</p>
          <div className="mt-12 space-y-12">
            {g.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">{sec.heading}</h2>
                {sec.paragraphs.map((p, i) => (
                  <p key={i} className="mt-3 text-ink-body leading-relaxed">{p}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <aside className="lg:w-[320px] shrink-0 space-y-10 lg:pt-12">
          {tool && (
            <div className="rounded-lg border border-rule p-6">
              <h2 className="font-semibold">{tool.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-body">{tool.metaDescription}</p>
              <Link
                href={`/${tool.slug}`}
                className="mt-5 inline-flex items-center min-h-11 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-strong transition-colors"
              >
                Open the tool
              </Link>
            </div>
          )}
          <nav aria-label="More guides">
            <h2 className="text-[13px] font-medium text-ink-muted">More guides</h2>
            <ul className="mt-3 border-t border-rule">
              {others.map((o) => (
                <li key={o.slug} className="border-b border-rule">
                  <Link href={`/guides/${o.slug}`} className="block py-4 font-semibold hover:text-accent">{o.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
