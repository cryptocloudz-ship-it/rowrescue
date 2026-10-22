import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { GUIDES, GUIDE_MAP, guideNeedsPro, type GuidePage } from "../guides";
import { TOOLS, TOOL_MAP } from "../tools";
import { RULE_MAP } from "@/lib/engine/rules";
import { reconcile } from "@/lib/engine/reconcile";
import { useSheetStore } from "@/store/sheetStore";
import type { Row } from "@/types/sheet";
import { GUIDE_REDIRECTS } from "@/config/redirects";

// Guides compete with long-form answers, so they need real substance, not a tool page with a new title.
const MIN_WORDS = 700;

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function copyOf(g: GuidePage): string[] {
  return [
    g.summary,
    ...g.cause,
    ...g.manualFix.flatMap((m) => [m.heading, ...m.steps, m.note ?? ""]),
    ...g.toolFix,
    ...g.limits,
    ...g.faqs.flatMap((f) => [f.q, f.a]),
  ];
}

function parseSample(csv: string): { headers: string[]; rows: Row[] } {
  const result = Papa.parse<Row>(csv, { header: true, skipEmptyLines: "greedy" });
  return { headers: result.meta.fields ?? [], rows: result.data };
}

// Runs a guide's "before" sample through the same flow as an upload from the guide's embedded tool.
async function cleanSample(guide: GuidePage, isPro: boolean) {
  const store = useSheetStore.getState();
  store.resetAll();
  store.setIsPro(isPro);
  store.setPreset(guide.preset);
  await store.importFile(new File([guide.before], "sample.csv", { type: "text/csv" }));
  useSheetStore.getState().runCleaning();
  return useSheetStore.getState();
}

describe("guides", () => {
  it.each(["slug", "name", "metaTitle", "metaDescription", "h1"] as const)("have a unique %s", (field) => {
    const values = GUIDES.map((g) => g[field].toLowerCase());
    expect(new Set(values).size).toBe(values.length);
  });

  it("don't reuse a tool page's title, description or heading", () => {
    for (const field of ["metaTitle", "metaDescription", "h1"] as const) {
      const toolValues = new Set(TOOLS.map((t) => t[field].toLowerCase()));
      for (const g of GUIDES) expect(toolValues.has(g[field].toLowerCase()), `${g.slug} ${field}`).toBe(false);
    }
  });

  it.each(GUIDES.map((g) => [g.slug, g] as const))("%s fits search result limits", (_, guide) => {
    expect(guide.metaTitle.length).toBeLessThanOrEqual(60);
    expect(guide.metaDescription.length).toBeLessThanOrEqual(155);
    expect(guide.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const date of [guide.published, guide.updated]) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(date).getTime()).toBeLessThanOrEqual(Date.now());
    }
    expect(guide.updated >= guide.published).toBe(true);
  });

  it.each(GUIDES.map((g) => [g.slug, g] as const))("%s has the standard page structure", (_, guide) => {
    expect(guide.cause.length).toBeGreaterThanOrEqual(2);
    expect(guide.manualFix.length).toBeGreaterThanOrEqual(2);
    for (const m of guide.manualFix) expect(m.steps.length, m.heading).toBeGreaterThanOrEqual(2);
    expect(guide.toolFix.length).toBeGreaterThanOrEqual(2);
    expect(guide.limits.length).toBeGreaterThanOrEqual(2);
    expect(guide.faqs.length).toBeGreaterThanOrEqual(3);
    expect(guide.faqs.length).toBeLessThanOrEqual(5);
  });

  it.each(GUIDES.map((g) => [g.slug, g] as const))("%s has enough copy", (_, guide) => {
    expect(words(copyOf(guide).join(" "))).toBeGreaterThanOrEqual(MIN_WORDS);
  });

  it.each(GUIDES.map((g) => [g.slug, g] as const))("%s says so when its rule is Pro-only", (_, guide) => {
    if (!guideNeedsPro(guide)) return;
    expect([...guide.toolFix, ...guide.faqs.map((f) => f.a)].join(" ")).toMatch(/\bPro\b/);
  });

  it("only link to tools and guides that exist", () => {
    for (const g of GUIDES) {
      expect(TOOL_MAP.has(g.tool), `${g.slug} → ${g.tool}`).toBe(true);
      expect(g.relatedTools).toContain(g.tool);
      for (const s of g.relatedTools) expect(TOOL_MAP.has(s), `${g.slug} → ${s}`).toBe(true);
      for (const s of g.relatedGuides) expect(GUIDE_MAP.has(s), `${g.slug} → ${s}`).toBe(true);
      expect(g.relatedGuides).not.toContain(g.slug);
      expect(new Set(g.relatedTools).size).toBe(g.relatedTools.length);
      expect(new Set(g.relatedGuides).size).toBe(g.relatedGuides.length);
    }
  });

  it("are linked from their tool page, and tool pages only link to guides that exist", () => {
    for (const g of GUIDES) expect(TOOL_MAP.get(g.tool)!.guides ?? [], g.slug).toContain(g.slug);
    for (const t of TOOLS) for (const s of t.guides ?? []) expect(GUIDE_MAP.has(s), `${t.slug} → ${s}`).toBe(true);
  });

  it("every guide is linked from another guide", () => {
    const linked = new Set(GUIDES.flatMap((g) => g.relatedGuides));
    for (const g of GUIDES) expect(linked.has(g.slug), `${g.slug} has no incoming guide links`).toBe(true);
  });

  it("redirect retired slugs to guides that exist", () => {
    for (const [from, to] of Object.entries(GUIDE_REDIRECTS)) {
      expect(GUIDE_MAP.has(from), `${from} is still a live guide`).toBe(false);
      expect(GUIDE_MAP.has(to), `${from} → ${to}`).toBe(true);
    }
  });

  it("only preset rules that exist", () => {
    for (const g of GUIDES) {
      expect(g.preset.ruleIds.length, g.slug).toBeGreaterThan(0);
      for (const id of g.preset.ruleIds) expect(RULE_MAP.has(id), `${g.slug}: ${id}`).toBe(true);
    }
  });

  it("never repeat a paragraph across guides and tool pages", () => {
    const seen = new Map<string, string>();
    const add = (block: string, where: string) => {
      const key = block.toLowerCase().replace(/\s+/g, " ").trim();
      // Short boilerplate like the free-plan row limit is allowed to repeat.
      if (words(key) < 20) return;
      expect(seen.get(key), `"${block.slice(0, 60)}…" on ${where} repeats ${seen.get(key)}`).toBeUndefined();
      seen.set(key, where);
    };
    for (const t of TOOLS) {
      for (const block of [t.intro, ...t.sections.map((s) => s.body), ...t.faqs.map((f) => f.a)]) add(block, t.slug);
    }
    for (const g of GUIDES) for (const block of copyOf(g)) add(block, `guides/${g.slug}`);
  });
});

const runs = GUIDES.flatMap((g) =>
  guideNeedsPro(g) ? [[g.slug, "pro", true] as const] : [[g.slug, "free", false] as const, [g.slug, "pro", true] as const]
);

describe.each(runs)("%s sample (%s)", (slug, _plan, isPro) => {
  it("produces exactly the 'after' it shows", async () => {
    const guide = GUIDE_MAP.get(slug)!;
    const state = await cleanSample(guide, isPro);
    expect(state.error).toBeNull();
    expect(state.engineErrors).toEqual([]);
    const expected = parseSample(guide.after);
    expect(Object.keys(state.cleanedRows[0] ?? {})).toEqual(expected.headers);
    expect(state.cleanedRows).toEqual(expected.rows);
  });

  it("switches on every preset rule", async () => {
    const guide = GUIDE_MAP.get(slug)!;
    await cleanSample(guide, isPro);
    const enabled = useSheetStore.getState().ruleConfigs.filter((r) => r.enabled).map((r) => r.ruleId);
    expect(enabled).toEqual(expect.arrayContaining(guide.preset.ruleIds));
  });

  it("balances its totals, matching any totals the page states", async () => {
    const guide = GUIDE_MAP.get(slug)!;
    const state = await cleanSample(guide, isPro);
    const result = reconcile(state.parsedSheet!.rows, state.engineResult!.cleanedRows, state.engineResult!.snapshots, state.parsedSheet!.headers);
    expect(result.balanced).toBe(true);
    if (guide.totals) {
      const col = result.columns.find((c) => c.column === guide.totals!.column)!;
      const removed = col.removed.reduce((sum, r) => sum + r.total, 0);
      expect([col.before, removed, col.after]).toEqual([guide.totals.before, guide.totals.removed, guide.totals.after]);
    }
  });
});
