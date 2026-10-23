import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Only the canonical production domain should be indexed. Preview builds are blocked here; production's
  // *.vercel.app aliases get an X-Robots-Tag noindex header from next.config.ts instead.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/billing",
        "/files",
        "/automations",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
