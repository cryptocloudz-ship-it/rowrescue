import { TOOLS, toolNeedsPro } from "@/content/tools";
import { PLANS, FREE_RULES } from "@/config/plans";
import { ALL_RULES } from "@/lib/engine/rules";
import { SITE_NAME, SUPPORT_EMAIL, absoluteUrl } from "@/config/site";

function euro(cents: number | null) {
  return `€${((cents ?? 0) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

function rows(n: number) {
  return n.toLocaleString("en-GB");
}

/** Plain-text site summary for LLMs, following the llms.txt convention (https://llmstxt.org). */
export function buildLlmsTxt(): string {
  const { free, pro, team } = PLANS;
  const tools = TOOLS.map(
    (t) => `- [${t.name}](${absoluteUrl(`/${t.slug}`)})${toolNeedsPro(t) ? " (Pro)" : ""}: ${t.metaDescription}`
  );

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} is a CSV and Excel cleaner for bank and transaction exports. It fixes dates, amounts, duplicates and spacing before the file is imported into accounting software such as QuickBooks or Xero, and a totals check shows that amount columns still add up after cleaning.`,
    "",
    "## Privacy model",
    "",
    "- Files are parsed and cleaned 100% client-side, by JavaScript in the browser tab. File contents are never uploaded to SpreadsheetFix servers.",
    "- The servers store only account details (email, billing) and a daily export count used for plan limits.",
    "- The company is based in the EU and GDPR applies. Anyone can check the no-upload claim in the browser's DevTools Network tab while cleaning a file.",
    "- Every change is shown in a preview before export, and the original file is never modified.",
    "",
    "## Pricing",
    "",
    `- ${free.name}: ${euro(0)}. Up to ${rows(free.limits.maxRows)} rows per file, ${FREE_RULES.length} of ${ALL_RULES.length} rules, CSV export, ${free.limits.maxExportsPerDay} exports a day, watermark on exports. No account needed.`,
    `- ${pro.name}: ${euro(pro.priceMonthly)} per month or ${euro(pro.priceYearly)} a year. Up to ${rows(pro.limits.maxRows)} rows, all ${ALL_RULES.length} rules, CSV and Excel export, change log and PDF report, no watermark.`,
    `- ${team.name}: ${euro(team.priceMonthly)} per seat per month or ${euro(team.priceYearly)} per seat a year. Everything in Pro plus shared presets, an audit log and team billing.`,
    `- Full comparison: ${absoluteUrl("/pricing")}`,
    "",
    "## Tools",
    "",
    ...tools,
    "",
    "## Main pages",
    "",
    `- [Home](${absoluteUrl("/")}): what the cleaner fixes, where your data goes, and the totals check`,
    `- [All tools](${absoluteUrl("/tools")}): single-purpose cleaning tools`,
    `- [Pricing](${absoluteUrl("/pricing")})`,
    "",
    "## Optional",
    "",
    `- [Privacy policy](${absoluteUrl("/legal/privacy-policy")})`,
    `- [Terms of service](${absoluteUrl("/legal/terms-of-service")})`,
    `- Support: ${SUPPORT_EMAIL}`,
    "",
  ].join("\n");
}
