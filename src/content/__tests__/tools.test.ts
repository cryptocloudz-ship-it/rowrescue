import { describe, it, expect, beforeEach } from "vitest";
import Papa from "papaparse";
import { useSheetStore } from "@/store/sheetStore";
import { TOOLS } from "../tools";

// Every "Before and after" on a tool page must be what the tool's preset really produces for a free user.
function parseSample(csv: string) {
  const body = csv
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trimEnd();
  const { data } = Papa.parse<string[]>(body, { skipEmptyLines: false });
  return data;
}

const cleaners = TOOLS.filter((t) => t.kind === "cleaner");

describe.each(cleaners.map((t) => [t.slug, t] as const))("%s before/after", (_slug, tool) => {
  beforeEach(() => useSheetStore.getState().resetAll());

  it("matches the engine output", async () => {
    const store = useSheetStore.getState();
    store.setIsPro(false);
    store.setPreset(tool.preset!);
    await store.importFile(new File([tool.before], "sample.csv", { type: "text/csv" }));
    useSheetStore.getState().runCleaning();
    const state = useSheetStore.getState();
    expect(state.error).toBeNull();

    const [headers, ...rows] = parseSample(tool.after);
    const actualHeaders = state.cleanedRows.length ? Object.keys(state.cleanedRows[0]) : [];
    expect(actualHeaders).toEqual(headers);
    expect(state.cleanedRows.map((r) => headers.map((h) => String(r[h] ?? "")))).toEqual(rows);
  });
});
