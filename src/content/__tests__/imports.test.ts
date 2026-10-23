import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { IMPORTS, IMPORT_MAP, BANKS, SOFTWARE, importNeedsPro, importSources, type ImportPage } from "../imports";
import { TOOLS, TOOL_MAP } from "../tools";
import { GUIDES, GUIDE_MAP } from "../guides";
import { RULE_MAP } from "@/lib/engine/rules";
import { reconcile } from "@/lib/engine/reconcile";
import { useSheetStore } from "@/store/sheetStore";
import type { Row } from "@/types/sheet";

// Pair pages must say something specific about this bank and this software, not a template with names swapped.
const MIN_WORDS = 650;

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function copyOf(p: ImportPage): string[] {
  return [
    p.summary,
    ...p.exportNotes,
    ...p.gaps.flatMap((g) => [g.problem, g.fix]),
    ...p.steps,
    ...p.toolFix,
    ...p.limits,
    ...p.faqs.flatMap((f) => [f.q, f.a]),
  ];
}

function parseSample(csv: string): { headers: string[]; rows: Row[] } {
  const result = Papa.parse<Row>(csv, { header: true, skipEmptyLines: "greedy" });
  return { headers: result.meta.fields ?? [], rows: result.data };
}

// Runs a page's "before" sample through the same flow as an upload from the page's embedded uploader.
async function cleanSample(page: ImportPage, isPro: boolean) {
  const store = useSheetStore.getState();
  store.resetAll();
  store.setIsPro(isPro);
  store.setPreset(page.preset);
  await store.importFile(new File([page.before], "sample.csv", { type: "text/csv" }));
  useSheetStore.getState().runCleaning();
  return useSheetStore.getState();
}

describe("import pages", () => {
  it.each(["slug", "name", "metaTitle", "metaDescription", "h1"] as const)("have a unique %s", (field) => {
    const values = IMPORTS.map((p) => p[field].toLowerCase());
    expect(new Set(values).size).toBe(values.length);
  });

  it("don't reuse a tool page's or guide's title, description or heading", () => {
    for (const field of ["metaTitle", "metaDescription", "h1"] as const) {
      const taken = new Set([...TOOLS.map((t) => t[field].toLowerCase()), ...GUIDES.map((g) => g[field].toLowerCase())]);
      for (const p of IMPORTS) expect(taken.has(p[field].toLowerCase()), `${p.slug} ${field}`).toBe(false);
    }
  });

  it("are one page per bank and software pair, with a slug that names both", () => {
    const pairs = IMPORTS.map((p) => `${p.bank}-to-${p.software}`);
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const p of IMPORTS) {
      expect(p.slug).toBe(`${p.bank}-to-${p.software}`);
      const title = p.metaTitle.toLowerCase();
      expect(title, p.slug).toContain(BANKS[p.bank].name.toLowerCase());
      expect(title, p.slug).toContain(SOFTWARE[p.software].name.split(" ")[0].toLowerCase());
    }
  });

  it.each(IMPORTS.map((p) => [p.slug, p] as const))("%s fits search result limits", (_, page) => {
    expect(page.metaTitle.length).toBeLessThanOrEqual(60);
    expect(page.metaDescription.length).toBeLessThanOrEqual(155);
    for (const date of [page.published, page.updated]) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(date).getTime()).toBeLessThanOrEqual(Date.now());
    }
    expect(page.updated >= page.published).toBe(true);
  });

  it.each(IMPORTS.map((p) => [p.slug, p] as const))("%s has the standard page structure and enough copy", (_, page) => {
    expect(page.exportNotes.length).toBeGreaterThanOrEqual(2);
    expect(page.gaps.length).toBeGreaterThanOrEqual(3);
    expect(page.steps.length).toBeGreaterThanOrEqual(4);
    expect(page.toolFix.length).toBeGreaterThanOrEqual(2);
    expect(page.limits.length).toBeGreaterThanOrEqual(2);
    expect(page.faqs.length).toBeGreaterThanOrEqual(3);
    expect(page.faqs.length).toBeLessThanOrEqual(5);
    expect(words(copyOf(page).join(" "))).toBeGreaterThanOrEqual(MIN_WORDS);
  });

  it.each(IMPORTS.map((p) => [p.slug, p] as const))("%s cites its sources and doesn't present the layout as official", (_, page) => {
    const { official, layout } = importSources(page);
    expect(official.length).toBeGreaterThanOrEqual(2);
    // Corroborated: at least two independent sources, one of them parser code on GitHub
    expect(layout.length).toBeGreaterThanOrEqual(2);
    expect(layout.some((s) => s.url.startsWith("https://github.com/"))).toBe(true);
    for (const s of [...official, ...layout]) expect(s.url).toMatch(/^https:\/\//);
    // The sample is the bank's header row, and the copy tells readers to check their own
    expect(page.before.split("\n")[0]).toBe(page.exportHeader);
    expect(page.exportNotes.join(" ")).toMatch(/doesn’t (publish|document)/);
    expect(page.exportNotes.join(" ")).toMatch(/your own (file|export|download|header row)|first row of your/);
  });

  it.each(IMPORTS.map((p) => [p.slug, p] as const))("%s says so when a rule is Pro-only", (_, page) => {
    if (!importNeedsPro(page)) {
      expect(page.afterFree, "afterFree is only for presets with Pro rules").toBeUndefined();
      return;
    }
    expect(page.afterFree, page.slug).toBeDefined();
    expect([...page.toolFix, ...page.faqs.map((f) => f.a)].join(" ")).toMatch(/\bPro\b/);
  });

  it("only link to tools and guides that exist, and include the generic import tools", () => {
    for (const p of IMPORTS) {
      for (const s of p.relatedTools) expect(TOOL_MAP.has(s), `${p.slug} → ${s}`).toBe(true);
      for (const s of p.relatedGuides) expect(GUIDE_MAP.has(s), `${p.slug} → ${s}`).toBe(true);
      expect(p.relatedTools.some((s) => ["clean-bank-statement-csv", "prepare-csv-for-accounting-import"].includes(s))).toBe(true);
      expect(new Set(p.relatedTools).size).toBe(p.relatedTools.length);
      expect(new Set(p.relatedGuides).size).toBe(p.relatedGuides.length);
    }
  });

  it("only preset rules that exist", () => {
    for (const p of IMPORTS) for (const id of p.preset.ruleIds) expect(RULE_MAP.has(id), `${p.slug}: ${id}`).toBe(true);
  });

  it("never repeat a paragraph across import pages, guides and tool pages", () => {
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
    for (const g of GUIDES) {
      for (const block of [g.summary, ...g.cause, ...g.toolFix, ...g.limits, ...g.faqs.map((f) => f.a)]) add(block, `guides/${g.slug}`);
    }
    for (const p of IMPORTS) for (const block of copyOf(p)) add(block, `import/${p.slug}`);
  });

  it("is IMPORT_MAP keyed by slug", () => {
    for (const p of IMPORTS) expect(IMPORT_MAP.get(p.slug)).toBe(p);
  });
});

const runs = IMPORTS.flatMap((p) => [[p.slug, "free", false] as const, [p.slug, "pro", true] as const]);

describe.each(runs)("%s sample (%s)", (slug, _plan, isPro) => {
  it("produces exactly the 'after' it shows", async () => {
    const page = IMPORT_MAP.get(slug)!;
    const state = await cleanSample(page, isPro);
    expect(state.error).toBeNull();
    expect(state.engineErrors).toEqual([]);
    const csv = !isPro && importNeedsPro(page) ? page.afterFree! : page.after;
    const expected = parseSample(csv);
    expect(Object.keys(state.cleanedRows[0] ?? {})).toEqual(expected.headers);
    expect(state.cleanedRows).toEqual(expected.rows);
  });

  it("switches on every preset rule the plan allows", async () => {
    const page = IMPORT_MAP.get(slug)!;
    await cleanSample(page, isPro);
    const enabled = useSheetStore.getState().ruleConfigs.filter((r) => r.enabled).map((r) => r.ruleId);
    const allowed = page.preset.ruleIds.filter((id) => isPro || !RULE_MAP.get(id)!.isPro);
    expect(enabled).toEqual(expect.arrayContaining(allowed));
  });

  it("balances its totals, matching the totals the page states", async () => {
    const page = IMPORT_MAP.get(slug)!;
    const state = await cleanSample(page, isPro);
    const result = reconcile(state.parsedSheet!.rows, state.engineResult!.cleanedRows, state.engineResult!.snapshots, state.parsedSheet!.headers);
    expect(result.balanced).toBe(true);
    if (page.totals) {
      const col = result.columns.find((c) => c.column === page.totals!.column)!;
      const removed = col.removed.reduce((sum, r) => sum + r.total, 0);
      expect([col.before, removed, col.after]).toEqual([page.totals.before, page.totals.removed, page.totals.after]);
    }
  });
});
