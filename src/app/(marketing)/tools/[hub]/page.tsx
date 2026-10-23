import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HUBS, HUB_MAP, hubMembers, hubPath, resolveHubMember } from "@/content/hubs";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { SITE_NAME, absoluteUrl, DEFAULT_OPEN_GRAPH } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return HUBS.map((h) => ({ hub: h.slug }));
}

type Props = { params: Promise<{ hub: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = HUB_MAP.get(slug);
  if (!hub) return {};
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: { canonical: hubPath(hub) },
    openGraph: { ...DEFAULT_OPEN_GRAPH, title: `${hub.metaTitle} | ${SITE_NAME}`, description: hub.metaDescription, url: hubPath(hub) },
  };
}

export default async function HubPage({ params }: Props) {
  const { hub: slug } = await params;
  const hub = HUB_MAP.get(slug);
  if (!hub) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: hub.name, path: hubPath(hub) },
  ];
  const members = hubMembers(hub)
    .map(resolveHubMember)
    .filter((m) => m !== undefined);
  const others = HUBS.filter((h) => h.slug !== hub.slug);

  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: hub.h1,
            description: hub.metaDescription,
            url: absoluteUrl(hubPath(hub)),
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
            publisher: { "@id": absoluteUrl("/#organization") },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: members.map((m, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: m.name,
                url: absoluteUrl(m.href),
              })),
            },
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">{hub.h1}</h1>
        <div className="mt-5 max-w-[680px] space-y-4">
          {hub.intro.map((p) => (
            <p key={p.slice(0, 40)} className="text-lg leading-relaxed text-ink-body">{p}</p>
          ))}
        </div>

        <section className="mt-12 max-w-[720px]">
          <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.01em]">The order that works</h2>
          <ol className="mt-5 border-t border-rule">
            {hub.workflow.map((step, i) => (
              <li key={i} className="flex gap-5 py-4 border-b border-rule">
                <span className="font-data text-sm text-accent pt-0.5 w-5 shrink-0">{i + 1}</span>
                <p className="text-ink-body leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {hub.sections.map((section) => (
          <section key={section.heading} className="mt-14">
            <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">{section.heading}</h2>
            <p className="mt-2 text-ink-body leading-relaxed max-w-[680px]">{section.body}</p>
            <ul className="mt-6 grid md:grid-cols-2 gap-x-12 border-t border-rule">
              {section.members
                .map(resolveHubMember)
                .filter((m) => m !== undefined)
                .map((m) => (
                  <li key={m.href} className="border-b border-rule">
                    <Link href={m.href} className="group block py-5">
                      <h3 className="font-semibold group-hover:text-accent">
                        {m.name}
                        {m.pro && (
                          <span className="ml-2 align-middle text-xs font-medium text-ink-muted border border-rule rounded px-1.5 py-0.5">Pro</span>
                        )}
                      </h3>
                      <p className="mt-1.5 text-ink-body leading-relaxed">{m.note}</p>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <nav aria-label="Other tool groups" className="mt-16 rounded-lg border border-rule p-6">
          <h2 className="font-semibold">Other tool groups</h2>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {others.map((h) => (
              <li key={h.slug}>
                <Link href={hubPath(h)} className="text-accent hover:text-accent-strong">{h.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/tools" className="text-accent hover:text-accent-strong">All tools</Link>
            </li>
          </ul>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
