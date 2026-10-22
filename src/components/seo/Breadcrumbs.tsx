import Link from "next/link";
import { absoluteUrl } from "@/config/site";

export type Crumb = { name: string; path: string };

/** schema.org BreadcrumbList for the same trail the <Breadcrumbs> component shows. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-muted mb-6">
      {crumbs.map((c, i) =>
        i < crumbs.length - 1 ? (
          <span key={c.path}>
            <Link href={c.path} className="hover:text-ink">{c.name}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
          </span>
        ) : (
          <span key={c.path} aria-current="page">{c.name}</span>
        )
      )}
    </nav>
  );
}
