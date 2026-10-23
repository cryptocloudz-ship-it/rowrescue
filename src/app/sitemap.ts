import type { MetadataRoute } from "next";
import { TOOLS, toolUpdated } from "@/content/tools";
import { GUIDES, guidesUpdated } from "@/content/guides";
import { COMPARISONS } from "@/content/comparisons";
import { HUBS, hubPath } from "@/content/hubs";
import { absoluteUrl } from "@/config/site";

// Dates of the last real content change, so lastModified stays stable across builds.
// Bump the matching date when you change a page's copy. Google ignores changefreq and priority.
const UPDATED = {
  home: "2026-10-22",
  tools: "2026-10-22",
  compare: "2026-10-21",
  pricing: "2026-10-19",
  security: "2026-10-21",
  contact: "2026-10-21",
  legal: "2026-10-19",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: UPDATED.home },
    { url: absoluteUrl("/tools"), lastModified: UPDATED.tools },
    ...TOOLS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified: toolUpdated(t) })),
    ...HUBS.map((h) => ({ url: absoluteUrl(hubPath(h)), lastModified: h.updated })),
    { url: absoluteUrl("/guides"), lastModified: guidesUpdated() },
    ...GUIDES.map((g) => ({ url: absoluteUrl(`/guides/${g.slug}`), lastModified: g.updated })),
    { url: absoluteUrl("/compare"), lastModified: UPDATED.compare },
    ...COMPARISONS.map((c) => ({ url: absoluteUrl(`/compare/${c.slug}`), lastModified: UPDATED.compare })),
    { url: absoluteUrl("/pricing"), lastModified: UPDATED.pricing },
    { url: absoluteUrl("/security"), lastModified: UPDATED.security },
    { url: absoluteUrl("/contact"), lastModified: UPDATED.contact },
    { url: absoluteUrl("/legal/terms-of-service"), lastModified: UPDATED.legal },
    { url: absoluteUrl("/legal/privacy-policy"), lastModified: UPDATED.legal },
    { url: absoluteUrl("/legal/cookie-policy"), lastModified: UPDATED.legal },
  ];
}
