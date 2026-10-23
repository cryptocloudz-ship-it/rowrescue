import { describe, it, expect } from "vitest";
import { runEngine } from "../ruleEngine";
import { ALL_RULES } from "../rules";
import type { RuleConfig } from "@/types/rules";

function configs(enabled: Record<string, Record<string, unknown>>): RuleConfig[] {
  // Same order as the UI/store, so the engine must reorder on its own
  return ALL_RULES.map((r) => ({ ruleId: r.id, enabled: r.id in enabled, options: enabled[r.id] ?? {} }));
}

describe("runEngine execution order", () => {
  it("trims and lowercases before de-duplicating", () => {
    const rows = [{ email: "ana@acme.io" }, { email: " ANA@acme.io " }, { email: "ben@acme.io" }];
    const result = runEngine(rows, configs({ deduplicateRows: {}, trimWhitespace: {}, normalizeEmail: {} }));
    expect(result.cleanedRows).toEqual([{ email: "ana@acme.io" }, { email: "ben@acme.io" }]);
  });

  it("removes rows that become empty after trimming", () => {
    const rows = [{ a: "x" }, { a: "   " }];
    const result = runEngine(rows, configs({ removeEmptyRows: {}, trimWhitespace: {} }));
    expect(result.cleanedRows).toEqual([{ a: "x" }]);
  });

  it("de-duplicates by original column names even when headers are normalized", () => {
    const rows = [
      { Email: "a@x.io", Seen: "mon" },
      { Email: "a@x.io", Seen: "tue" },
      { Email: "b@x.io", Seen: "mon" },
    ];
    const result = runEngine(
      rows,
      configs({ normalizeHeaders: { style: "lowercase_underscore" }, deduplicateRows: { columns: ["Email"] } })
    );
    expect(result.cleanedRows).toEqual([
      { email: "a@x.io", seen: "mon" },
      { email: "b@x.io", seen: "mon" },
    ]);
  });

  it("falls back to whole-row comparison when key columns are missing", () => {
    const rows = [{ a: "1" }, { a: "2" }];
    const result = runEngine(rows, configs({ deduplicateRows: { columns: ["nope"] } }));
    expect(result.cleanedRows).toHaveLength(2);
  });
});

describe("Delete Columns in the pipeline", () => {
  it("deletes columns after de-duplicating, so rows that differ in a deleted column are both kept", () => {
    const rows = [
      { email: "a@x.io", id: "1" },
      { email: "a@x.io", id: "2" },
    ];
    const result = runEngine(rows, configs({ deduplicateRows: {}, removeColumns: { columns: ["id"] } }));
    expect(result.cleanedRows).toEqual([{ email: "a@x.io" }, { email: "a@x.io" }]);
  });

  it("uses the file's original column names when headers are normalized too", () => {
    const rows = [{ "Account No": "123", Amount: "5.00" }];
    const result = runEngine(
      rows,
      configs({ normalizeHeaders: { style: "lowercase_underscore" }, removeColumns: { columns: ["Account No"] } })
    );
    expect(result.cleanedRows).toEqual([{ amount: "5.00" }]);
  });
});
