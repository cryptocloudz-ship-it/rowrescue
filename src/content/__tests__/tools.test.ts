import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { TOOLS, TOOL_MAP, toolNeedsPro } from "../tools";
import { RULE_MAP } from "@/lib/engine/rules";
import { useSheetStore } from "@/store/sheetStore";
import type { Row } from "@/types/sheet";

const MIN_WORDS = 240;

/**
 * Column picks a visitor makes on /clean before running. Rules like Validate Required
 * do nothing until columns are chosen, so the sample only holds once these are applied.
 */
const COLUMN_PICKS: Record<string, Record<string, string[]>> = {
  "find-missing-values-csv": { validateRequired: ["email", "amount"] },
};

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function parseSample(csv: string): { headers: string[]; rows: Row[] } {
  const result = Papa.parse<Row>(csv, { header: true, skipEmptyLines: "greedy" });
  return { headers: result.meta.fields ?? [], rows: result.data };
}

// Runs a page's "before" sample through the same flow as an upload from that page.
async function cleanSample(slug: string, isPro: boolean) {
  const tool = TOOL_MAP.get(slug)!;
  const store = useSheetStore.getState();
  store.resetAll();
  store.setIsPro(isPro);
  store.setPreset(tool.preset!);
  await store.importFile(new File([tool.before], "sample.csv", { type: "text/csv" }));
  for (const [ruleId, columns] of Object.entries(COLUMN_PICKS[slug] ?? {})) {
    useSheetStore.getState().updateRuleOptions(ruleId, { columns });
  }
  useSheetStore.getState().runCleaning();
  return useSheetStore.getState();
}

describe("tool pages", () => {
  it.each(["slug", "name", "metaTitle", "metaDescription", "h1"] as const)("have a unique %s", (field) => {
    const values = TOOLS.map((t) => t[field].toLowerCase());
    expect(new Set(values).size).toBe(values.length);
  });

  it.each(TOOLS.map((t) => [t.slug, t] as const))("%s fits search result limits", (_, tool) => {
    expect(tool.metaTitle.length).toBeLessThanOrEqual(60);
    expect(tool.metaDescription.length).toBeLessThanOrEqual(155);
    expect(tool.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(TOOLS.map((t) => [t.slug, t] as const))("%s has the standard page structure", (_, tool) => {
    expect(tool.steps).toHaveLength(3);
    expect(tool.sections.length).toBeGreaterThanOrEqual(2);
    expect(tool.sections.length).toBeLessThanOrEqual(4);
    expect(tool.faqs.length).toBeGreaterThanOrEqual(3);
    expect(tool.faqs.length).toBeLessThanOrEqual(5);
    expect(tool.related).toHaveLength(3);
    expect(new Set(tool.related).size).toBe(3);
    expect(tool.related).not.toContain(tool.slug);
  });

  it.each(TOOLS.map((t) => [t.slug, t] as const))("%s has enough copy", (_, tool) => {
    const copy = [tool.intro, ...tool.sections.map((s) => s.body), ...tool.faqs.flatMap((f) => [f.q, f.a])];
    expect(words(copy.join(" "))).toBeGreaterThanOrEqual(MIN_WORDS);
  });

  it("only link to pages that exist, and every page is linked from another", () => {
    const linked = new Set(TOOLS.flatMap((t) => t.related));
    for (const tool of TOOLS) {
      for (const slug of tool.related) expect(TOOL_MAP.has(slug), `${tool.slug} → ${slug}`).toBe(true);
      expect(linked.has(tool.slug), `${tool.slug} has no incoming links`).toBe(true);
    }
  });

  it("only preset rules that exist", () => {
    for (const tool of TOOLS) {
      if (tool.kind === "merge") continue;
      expect(tool.preset?.ruleIds.length, tool.slug).toBeGreaterThan(0);
      for (const id of tool.preset!.ruleIds) expect(RULE_MAP.has(id), `${tool.slug}: ${id}`).toBe(true);
    }
  });

  it("never repeat a section, FAQ answer or intro across pages", () => {
    const seen = new Map<string, string>();
    for (const tool of TOOLS) {
      const blocks = [tool.intro, ...tool.sections.flatMap((s) => [s.heading, s.body]), ...tool.faqs.map((f) => f.a)];
      for (const block of blocks) {
        const key = block.toLowerCase().replace(/\s+/g, " ").trim();
        // Short boilerplate like the free-plan row limit is allowed to repeat.
        if (words(key) < 25) continue;
        expect(seen.get(key), `"${block.slice(0, 60)}…" repeats on ${tool.slug}`).toBeUndefined();
        seen.set(key, tool.slug);
      }
    }
  });

  it("say so when the main rule is Pro-only", () => {
    for (const tool of TOOLS.filter(toolNeedsPro)) {
      const copy = [tool.intro, ...tool.sections.map((s) => s.body), ...tool.faqs.map((f) => f.a)].join(" ");
      expect(copy, tool.slug).toMatch(/\bPro\b/);
    }
  });
});

const cleaners = TOOLS.filter((t) => t.kind === "cleaner");
const runs = cleaners.flatMap((t) =>
  toolNeedsPro(t) ? [[t.slug, "pro", true] as const] : [[t.slug, "free", false] as const, [t.slug, "pro", true] as const]
);

describe.each(runs)("%s sample (%s)", (slug, _plan, isPro) => {
  it("produces exactly the 'after' it shows", async () => {
    const tool = TOOL_MAP.get(slug)!;
    const state = await cleanSample(slug, isPro);
    expect(state.error).toBeNull();
    expect(state.engineErrors).toEqual([]);

    const expected = parseSample(tool.after);
    if (tool.afterView === "flagged") {
      const flagged = state.allQuarantined.map((q) => ({ ...q.row, reason: q.reason }));
      expect(flagged).toEqual(expected.rows);
    } else {
      expect(Object.keys(state.cleanedRows[0] ?? {})).toEqual(expected.headers);
      expect(state.cleanedRows).toEqual(expected.rows);
    }
  });

  it("switches on every preset rule the plan allows", async () => {
    const tool = TOOL_MAP.get(slug)!;
    await cleanSample(slug, isPro);
    const enabled = useSheetStore.getState().ruleConfigs.filter((r) => r.enabled).map((r) => r.ruleId);
    expect(enabled).toEqual(expect.arrayContaining(tool.preset!.ruleIds));
  });
});
