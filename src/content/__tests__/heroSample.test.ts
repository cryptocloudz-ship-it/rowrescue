import { describe, it, expect, beforeEach } from "vitest";
import { useSheetStore } from "@/store/sheetStore";
import { proOnlyIssueCount } from "@/lib/engine/issueRules";
import { HERO_ROWS, HERO_COLUMNS, HERO_FIXES, HERO_FILE_NAME, cellAfter, heroCsv } from "../heroSample";

// Runs the homepage hero example through the same flow as a real upload on /clean.
async function cleanHeroFile(isPro: boolean) {
  const store = useSheetStore.getState();
  store.resetAll();
  store.setIsPro(isPro);
  await store.importFile(new File([heroCsv()], HERO_FILE_NAME, { type: "text/csv" }));
  useSheetStore.getState().runCleaning();
  return useSheetStore.getState();
}

describe.each([
  ["free", false],
  ["pro", true],
] as const)("homepage hero example (%s)", (plan, isPro) => {
  beforeEach(() => useSheetStore.getState().resetAll());

  it("produces exactly the cleaned rows the hero shows", async () => {
    const state = await cleanHeroFile(isPro);
    expect(state.error).toBeNull();
    const expected = HERO_ROWS.filter((r) => !r.duplicate).map((row) =>
      Object.fromEntries(HERO_COLUMNS.map((c) => [c, cellAfter(row[c], isPro)]))
    );
    expect(state.cleanedRows).toEqual(expected);
  });

  it("reports the number of fixes the hero states", async () => {
    const state = await cleanHeroFile(isPro);
    const changed = state.allChanges.filter((c) => c.changeType === "changed").length;
    const removed = state.parsedSheet!.rowCount - state.cleanedRows.length;
    expect(changed + removed + state.allQuarantined.length).toBe(HERO_FIXES[plan]);
  });

  it("tells free users how many more fixes Pro would make", async () => {
    const state = await cleanHeroFile(isPro);
    expect(proOnlyIssueCount(state.healthReport!)).toBe(HERO_FIXES.pro - HERO_FIXES.free);
  });

  it("switches on every rule it needs without the user touching anything", async () => {
    await useSheetStore.getState().importFile(new File([heroCsv()], HERO_FILE_NAME, { type: "text/csv" }));
    const enabled = useSheetStore.getState().ruleConfigs.filter((r) => r.enabled).map((r) => r.ruleId);
    expect(enabled).toEqual(expect.arrayContaining(["trimWhitespace", "normalizeDate", "deduplicateRows"]));
    expect(enabled.includes("normalizeNumbers")).toBe(isPro);
  });
});
