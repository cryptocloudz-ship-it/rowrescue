import { TOOLS } from "@/content/tools";
import { COMPARISONS } from "@/content/comparisons";
import { GUIDES } from "@/content/guides";
import { SITE_NAME, absoluteUrl } from "@/config/site";
import { PLANS } from "@/config/plans";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants and answer engines.
export function GET() {
  const free = PLANS.free.limits.maxRows.toLocaleString("en-GB");
  const pro = PLANS.pro.limits.maxRows.toLocaleString("en-GB");
  const link = (name: string, path: string, note: string) => `- [${name}](${absoluteUrl(path)}): ${note}`;

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> Cleans CSV and Excel files in the browser: removes duplicates, normalises dates, repairs encoding, trims spaces and validates emails. Files are processed locally and never uploaded. Free up to ${free} rows; Pro handles up to ${pro} rows.`,
    "",
    "## Tools",
    ...TOOLS.map((t) => link(t.name, `/${t.slug}`, t.metaDescription)),
    "",
    "## Guides",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`, g.summary)),
    "",
    "## Comparisons",
    ...COMPARISONS.map((c) => link(`${SITE_NAME} vs ${c.competitor}`, `/compare/${c.slug}`, c.metaDescription)),
    "",
    "## Product",
    link("Security", "/security", "How files are processed in the browser and what the server stores"),
    link("Pricing", "/pricing", "Free, Pro and Team plans"),
    link("Contact", "/contact", "Support and billing contact"),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
