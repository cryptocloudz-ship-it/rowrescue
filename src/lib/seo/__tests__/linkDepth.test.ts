import { describe, it, expect, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/config/site";

// Render pages outside Next: Link becomes a plain <a>, and client-only pieces render nothing
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => createElement("a", { href, ...rest }, children),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, prefetch: () => {}, replace: () => {} }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next/font/google", () => ({ IBM_Plex_Sans: () => ({ variable: "" }), IBM_Plex_Mono: () => ({ variable: "" }) }));

type Page = (props: { params: Promise<Record<string, string>> }) => ReactElement | Promise<ReactElement>;

// Which page module renders a path, and with which params
async function pageFor(path: string): Promise<[Page, Record<string, string>]> {
  const fixed: Record<string, () => Promise<{ default: unknown }>> = {
    "/": () => import("@/app/page"),
    "/tools": () => import("@/app/(marketing)/tools/page"),
    "/guides": () => import("@/app/(marketing)/guides/page"),
    "/compare": () => import("@/app/(marketing)/compare/page"),
    "/pricing": () => import("@/app/(marketing)/pricing/page"),
    "/security": () => import("@/app/(marketing)/security/page"),
    "/contact": () => import("@/app/(marketing)/contact/page"),
    "/legal/terms-of-service": () => import("@/app/(marketing)/legal/terms-of-service/page"),
    "/legal/privacy-policy": () => import("@/app/(marketing)/legal/privacy-policy/page"),
    "/legal/cookie-policy": () => import("@/app/(marketing)/legal/cookie-policy/page"),
  };
  if (fixed[path]) return [(await fixed[path]()).default as Page, {}];
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/tools\/([^/]+)$/))) return [(await import("@/app/(marketing)/tools/[hub]/page")).default as Page, { hub: m[1] }];
  if ((m = path.match(/^\/guides\/([^/]+)$/))) return [(await import("@/app/(marketing)/guides/[slug]/page")).default as Page, { slug: m[1] }];
  if ((m = path.match(/^\/compare\/([^/]+)$/))) return [(await import("@/app/(marketing)/compare/[slug]/page")).default as Page, { slug: m[1] }];
  if ((m = path.match(/^\/([^/]+)$/))) return [(await import("@/app/(marketing)/[tool]/page")).default as Page, { tool: m[1] }];
  throw new Error(`no page module for ${path}`);
}

type Anchor = { path: string; text: string };

async function linksOn(path: string): Promise<Anchor[]> {
  const [Page, params] = await pageFor(path);
  const html = renderToStaticMarkup(await Page({ params: Promise.resolve(params) }));
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(([, href, inner]) => ({ href: href.replace(SITE_URL, ""), text: inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }))
    .filter((a) => a.href.startsWith("/"))
    .map((a) => ({ path: a.href.split(/[?#]/)[0] || "/", text: a.text }));
}

const MAX_DEPTH = 3;
const VAGUE = /^(click here|here|read more|learn more|more|link|this page)$/i;

describe("internal linking", () => {
  it(`reaches every sitemap URL within ${MAX_DEPTH} clicks of the homepage, with descriptive anchor text`, async () => {
    const indexable = new Set(sitemap().map((e) => e.url.replace(SITE_URL, "") || "/"));
    const depth = new Map<string, number>([["/", 0]]);
    const queue = ["/"];
    const vague: string[] = [];

    while (queue.length) {
      const path = queue.shift()!;
      const d = depth.get(path)!;
      for (const a of await linksOn(path)) {
        if (VAGUE.test(a.text)) vague.push(`${path} → ${a.path} ("${a.text}")`);
        // Only crawl indexable pages; /clean, /sign-in and the app are noindex
        if (!indexable.has(a.path) || depth.has(a.path)) continue;
        depth.set(a.path, d + 1);
        queue.push(a.path);
      }
    }

    const tooDeep = [...indexable].filter((p) => (depth.get(p) ?? Infinity) > MAX_DEPTH);
    expect(tooDeep, "pages more than 3 clicks from the homepage (or unreachable)").toEqual([]);
    expect(vague, "links with vague anchor text").toEqual([]);
  }, 30_000);

  it("links every hub member from its hub page", async () => {
    const { HUBS, hubMembers, hubPath, resolveHubMember } = await import("@/content/hubs");
    for (const hub of HUBS) {
      const links = new Set((await linksOn(hubPath(hub))).map((a) => a.path));
      for (const m of hubMembers(hub)) expect(links.has(resolveHubMember(m)!.href), `${hub.slug} → ${m.slug}`).toBe(true);
    }
  });
});
