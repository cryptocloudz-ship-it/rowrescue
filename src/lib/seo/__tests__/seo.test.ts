import { describe, it, expect, vi } from "vitest";
import type { Metadata } from "next";
import sitemap from "@/app/sitemap";
import { buildLlmsTxt } from "@/lib/seo/llmsTxt";
import { TOOLS, toolUpdated } from "@/content/tools";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, absoluteUrl } from "@/config/site";
import { metadata as rootMeta } from "@/app/layout";
import { metadata as homeMeta } from "@/app/page";
import { metadata as toolsMeta } from "@/app/(marketing)/tools/page";
import { metadata as pricingMeta } from "@/app/(marketing)/pricing/layout";
import { metadata as termsMeta } from "@/app/(marketing)/legal/terms-of-service/layout";
import { metadata as privacyMeta } from "@/app/(marketing)/legal/privacy-policy/layout";
import { metadata as cookieMeta } from "@/app/(marketing)/legal/cookie-policy/layout";
import { metadata as cleanMeta } from "@/app/clean/layout";
import { metadata as appMeta } from "@/app/(app)/layout";
import { metadata as authMeta } from "@/app/(auth)/layout";
import { generateMetadata as toolMeta } from "@/app/(marketing)/[tool]/page";

// next/font only works inside the Next compiler; the root layout calls it at import
vi.mock("next/font/google", () => ({ IBM_Plex_Sans: () => ({ variable: "" }), IBM_Plex_Mono: () => ({ variable: "" }) }));

type Page = { path: string; title: string; description: string; canonical: string };

function titleOf(m: Metadata): string {
  const t = m.title ?? rootMeta.title;
  if (typeof t === "string") return `${t} | SpreadsheetFix`; // root template
  if (t && "absolute" in t) return t.absolute;
  if (t && "default" in t) return t.default;
  throw new Error("no title");
}

async function indexablePages(): Promise<Page[]> {
  const fixed: [string, Metadata][] = [
    ["/", homeMeta],
    ["/tools", toolsMeta],
    ["/pricing", pricingMeta],
    ["/legal/terms-of-service", termsMeta],
    ["/legal/privacy-policy", privacyMeta],
    ["/legal/cookie-policy", cookieMeta],
  ];
  const tools = await Promise.all(
    TOOLS.map(async (t) => [`/${t.slug}`, await toolMeta({ params: Promise.resolve({ tool: t.slug }) })] as [string, Metadata])
  );
  return [...fixed, ...tools].map(([path, m]) => ({
    path,
    title: titleOf(m),
    description: String(m.description ?? rootMeta.description),
    canonical: String(m.alternates?.canonical),
  }));
}

describe("on-page SEO", () => {
  it("homepage title and description lead with the keyword and stay within SERP limits", () => {
    expect(SITE_TITLE.startsWith("CSV")).toBe(true);
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("every indexable page has a unique title, description and self canonical", async () => {
    const pages = await indexablePages();
    for (const p of pages) {
      expect(p.canonical, p.path).toBe(p.path);
      expect(p.title.length, p.path).toBeLessThanOrEqual(65);
      expect(p.description.length, p.path).toBeGreaterThan(40);
      expect(p.description.length, p.path).toBeLessThanOrEqual(160);
    }
    for (const key of ["title", "description", "canonical"] as const) {
      const values = pages.map((p) => p[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it("the cleaner, app and auth routes stay noindex", () => {
    for (const m of [cleanMeta, appMeta, authMeta]) {
      expect(m.robots).toMatchObject({ index: false });
    }
  });

  it("the sitemap lists exactly the indexable pages, with fixed dates", async () => {
    const entries = sitemap();
    const pages = await indexablePages();
    expect(entries.map((e) => e.url).sort()).toEqual(pages.map((p) => absoluteUrl(p.path)).sort());
    for (const e of entries) {
      expect(e.url.startsWith(SITE_URL)).toBe(true);
      expect(String(e.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(String(e.lastModified)).getTime()).toBeLessThanOrEqual(Date.now());
    }
    for (const t of TOOLS) {
      expect(entries.find((e) => e.url === absoluteUrl(`/${t.slug}`))?.lastModified).toBe(toolUpdated(t));
    }
  });

  it("llms.txt links every tool page and describes the privacy model", () => {
    const txt = buildLlmsTxt();
    expect(txt.startsWith("# SpreadsheetFix\n")).toBe(true);
    for (const t of TOOLS) expect(txt).toContain(absoluteUrl(`/${t.slug}`));
    expect(txt).toContain("client-side");
    expect(txt).not.toMatch(/undefined|NaN/);
  });
});
