import { describe, it, expect } from "vitest";
import { parseAmount, readAmount } from "../amounts";
import { reconcile, detectAmountColumns } from "../reconcile";
import { runEngine, type RuleSnapshot } from "../ruleEngine";
import { ALL_RULES } from "../rules";
import type { RuleConfig } from "@/types/rules";
import type { Row } from "@/types/sheet";

function configs(enabled: Record<string, Record<string, unknown>>): RuleConfig[] {
  return ALL_RULES.map((r) => ({ ruleId: r.id, enabled: r.id in enabled, options: enabled[r.id] ?? {} }));
}

function check(rows: Row[], enabled: Record<string, Record<string, unknown>>) {
  const result = runEngine(rows, configs(enabled));
  return reconcile(rows, result.cleanedRows, result.snapshots, Object.keys(rows[0]));
}

describe("parseAmount", () => {
  it.each([
    ["€1.250,00", 1250],
    ["1,980.50", 1980.5],
    ["$450.00", 450],
    ["(450.00)", -450],
    ["-12", -12],
    ["450.00-", -450],
    ["EUR 99", 99],
    ["99 USD", 99],
    ["1 250,75", 1250.75],
    ["1'250.75", 1250.75],
    ["12,5", 12.5],
    ["1,250", 1250],
    ["1.250.000", 1250000],
    [".5", 0.5],
    ["£-3.10", -3.1],
    [42, 42],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it.each(["", "  ", "2026-09-04", "INV-1042", "(555) 123-4567", "abc", "1.2.3,4,5", "12,34,56", null, undefined, NaN])(
    "rejects %j",
    (raw) => {
      expect(parseAmount(raw)).toBeNull();
    }
  );

  it("reports the decimals as written", () => {
    expect(readAmount("€1.250,00")?.decimals).toBe(2);
    expect(readAmount("1,250")?.decimals).toBe(0);
    expect(readAmount("3.125")?.decimals).toBe(3);
  });
});

describe("detectAmountColumns", () => {
  it("finds money columns by header or by values, and skips IDs, dates and years", () => {
    const rows = [
      { date: "2026-09-03", ref: "1042", year: "2026", Debit: "12", price: "€3,00", note: "x" },
      { date: "2026-09-04", ref: "1043", year: "2025", Debit: "", price: "€4,50", note: "y" },
    ];
    expect(detectAmountColumns(rows, Object.keys(rows[0]))).toEqual(["Debit", "price"]);
  });

  it("detects unlabelled columns that clearly hold money", () => {
    const rows = [{ col3: "$1.00" }, { col3: "$2.50" }, { col3: "3.75" }];
    expect(detectAmountColumns(rows, ["col3"])).toEqual(["col3"]);
  });
});

describe("reconcile", () => {
  const rows = [
    { date: "03/09/2026", vendor: "Acme Supplies  ", amount: "€1.250,00" },
    { date: "2026-09-04", vendor: "Northwind Ltd", amount: "312.00" },
    { date: "5 Sep 2026", vendor: "Harbor Freight Co", amount: "1,980.50" },
    { date: "2026-09-04", vendor: "Northwind Ltd", amount: "312.00" },
    { date: "2026-09-08", vendor: "Blue Pine LLC", amount: "$450.00" },
  ];

  it("balances when cleaning only reformats values and removes a duplicate", () => {
    const r = check(rows, { trimWhitespace: {}, normalizeDate: {}, normalizeNumbers: {}, deduplicateRows: {} });
    expect(r.traceable).toBe(true);
    expect(r.columns).toHaveLength(1);
    const c = r.columns[0];
    expect(c.column).toBe("amount");
    expect(c.before).toBe(4304.5);
    expect(c.removed).toEqual([
      { ruleId: "deduplicateRows", ruleName: "Remove Duplicates", kind: "removed", rows: 1, total: 312 },
    ]);
    expect(c.after).toBe(3992.5);
    expect(c.difference).toBe(0);
    expect(c.balanced).toBe(true);
    expect(c.decimals).toBe(2);
    expect(r.balanced).toBe(true);
  });

  it("leaves a deleted amount column out of the check instead of reporting its total as lost", () => {
    const r = check(rows, { removeColumns: { columns: ["amount"] } });
    expect(r.columns).toHaveLength(0);
    expect(r.balanced).toBe(true);
  });

  it("flags a value that changed during cleaning, with the exact difference", () => {
    const original = [{ amount: "10.00" }, { amount: "20.00" }];
    const changed = [{ amount: "10.00" }, { amount: "20.01" }];
    const snapshot: RuleSnapshot = { ruleId: "normalizeNumbers", rowsBefore: original, rowsAfter: changed, changes: [], quarantined: [] };
    const r = reconcile(original, changed, [snapshot], ["amount"]);
    expect(r.columns[0].balanced).toBe(false);
    expect(r.columns[0].difference).toBeCloseTo(0.01, 10);
    expect(r.balanced).toBe(false);
  });

  it("follows a column through renamed headers", () => {
    const input = [{ "Net Amount": "5.00" }, { "Net Amount": "5.00" }, { "Net Amount": "7.25" }];
    const r = check(input, { normalizeHeaders: { style: "lowercase_underscore" }, deduplicateRows: {} });
    const c = r.columns[0];
    expect(c.column).toBe("Net Amount");
    expect(c.cleanedColumn).toBe("net_amount");
    expect(c.removed[0].total).toBe(5);
    expect(c.after).toBe(12.25);
    expect(c.balanced).toBe(true);
  });

  it("keeps rows flagged for review in the totals, because they stay in the file", () => {
    const input = [
      { email: "ana@acme.io", amount: "100.00" },
      { email: "not-an-email", amount: "40.00" },
      { email: "ben@acme.io", amount: "60.00" },
    ];
    const r = check(input, { validateEmail: {} });
    expect(r.columns[0].removed).toEqual([]);
    expect(r.columns[0].after).toBe(200);
    expect(r.columns[0].balanced).toBe(true);
  });

  it("balances when empty rows are dropped", () => {
    const input = [{ amount: "1.50" }, { amount: "" }, { amount: "2.50" }];
    const r = check(input, { removeEmptyRows: {} });
    expect(r.columns[0].removed).toEqual([
      { ruleId: "removeEmptyRows", ruleName: "Remove Empty Rows", kind: "removed", rows: 1, total: 0 },
    ]);
    expect(r.columns[0].balanced).toBe(true);
  });

  it("keeps totals exact on large files", () => {
    const input = Array.from({ length: 50_000 }, (_, i) => ({ amount: i % 2 ? "0.10" : "0.20" }));
    const r = check(input, { trimWhitespace: {} });
    expect(r.columns[0].before).toBe(7500);
    expect(r.columns[0].balanced).toBe(true);
  });

  it("reports cells it couldn't read instead of guessing", () => {
    const input = [{ amount: "10.00" }, { amount: "10.00" }, { amount: "n/a" }, { amount: "5.00" }];
    const r = check(input, { trimWhitespace: {} });
    expect(r.columns[0].unreadable).toEqual({ before: 1, after: 1 });
    expect(r.columns[0].balanced).toBe(true);
  });

  it("returns no columns when the file has no amounts", () => {
    const r = check([{ name: "Ann", email: "a@b.io" }], { trimWhitespace: {} });
    expect(r.columns).toEqual([]);
    expect(r.balanced).toBe(true);
  });
});

describe("summary report totals", () => {
  it("writes the totals check into the summary", async () => {
    const { exportSummary } = await import("../exporters/summaryExporter");
    const rows = [{ amount: "€1.250,00" }, { amount: "€1.250,00" }, { amount: "€10,00" }];
    const result = runEngine(rows, configs({ deduplicateRows: {} }));
    const text = exportSummary({
      fileName: "x.csv",
      originalRowCount: 3,
      cleanedRowCount: result.cleanedRows.length,
      changes: result.allChanges,
      quarantined: [],
      healthReport: null,
      rulesApplied: ["Remove Duplicates"],
      reconciliation: reconcile(rows, result.cleanedRows, result.snapshots, ["amount"]),
    });
    expect(text).toContain("TOTALS CHECK");
    expect(text).toContain("All amount columns balance");
    expect(text).toContain("Before:  2,510.00");
    expect(text).toContain("− Remove Duplicates (1 row):  1,250.00");
    expect(text).toContain("After:   1,260.00");
  });
});
