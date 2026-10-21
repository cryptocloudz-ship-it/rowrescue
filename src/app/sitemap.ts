import type { MetadataRoute } from "next";
import { TOOLS, toolUpdated } from "@/content/tools";
import { absoluteUrl } from "@/config/site";

// Dates of the last real content change, so lastModified stays stable across builds.
// Bump the matching date when you change a page's copy. Google ignores changefreq and priority.
const UPDATED = {
  home: "2026-10-20",
  tools: "2026-10-20",
  pricing: "2026-10-19",
  legal: "2026-10-19",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: UPDATED.home },
    { url: absoluteUrl("/tools"), lastModified: UPDATED.tools },
    ...TOOLS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified: toolUpdated(t) })),
    { url: absoluteUrl("/pricing"), lastModified: UPDATED.pricing },
    { url: absoluteUrl("/legal/terms-of-service"), lastModified: UPDATED.legal },
    { url: absoluteUrl("/legal/privacy-policy"), lastModified: UPDATED.legal },
    { url: absoluteUrl("/legal/cookie-policy"), lastModified: UPDATED.legal },
  ];
}
