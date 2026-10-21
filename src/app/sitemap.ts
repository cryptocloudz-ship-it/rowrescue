import type { MetadataRoute } from "next";
import { TOOLS } from "@/content/tools";
import { COMPARISONS } from "@/content/comparisons";
import { GUIDES } from "@/content/guides";
import { absoluteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tools"), changeFrequency: "weekly", priority: 0.9 },
    ...TOOLS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: absoluteUrl("/compare"), changeFrequency: "monthly", priority: 0.6 },
    ...COMPARISONS.map((c) => ({ url: absoluteUrl(`/compare/${c.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: absoluteUrl("/guides"), changeFrequency: "weekly", priority: 0.6 },
    ...GUIDES.map((g) => ({
      url: absoluteUrl(`/guides/${g.slug}`),
      lastModified: g.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/pricing"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/security"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/legal/terms-of-service"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/legal/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/legal/cookie-policy"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
