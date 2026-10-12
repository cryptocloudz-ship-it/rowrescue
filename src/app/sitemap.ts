import type { MetadataRoute } from "next";
import { TOOLS } from "@/content/tools";
import { absoluteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tools"), changeFrequency: "weekly", priority: 0.9 },
    ...TOOLS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: absoluteUrl("/pricing"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/legal/terms-of-service"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/legal/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/legal/cookie-policy"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
