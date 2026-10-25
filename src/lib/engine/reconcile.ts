/**
 * Totals check: proves that cleaning didn't change the numbers in a file.
 *
 * For every amount column it adds up the values before cleaning, the rows each rule removed or
 * set aside for review, and the values after cleaning, then checks that
 *   before − removed − set aside = after
 * to the cent. Any difference means a value itself changed, and the check says by how much.
 */

import type { Row } from "@/types/sheet";
import type { RuleSnapshot } from "./ruleEngine";
import { RULE_MAP } from "./rules";
import { readAmount } from "./amounts";

const AMOUNT_HEADER =
  /amount|total|price|cost|value|debit|credit|balance|\bnet\b|gross|\btax\b|\bvat\b|fee|paid|payment|revenue|sales|qty|quantity|\bsum\b|subtotal|charge|refund|invoice.?amt/i;

export interface RemovedTotal {
  ruleId: string;
  ruleName: string;
  /** "removed" rows are dropped (duplicates, empty rows); "set aside" rows go to the review file. */
  kind: "removed" | "set aside";
  rows: number;
  total: number;
}

export interface ColumnTotals {
  /** Column name in the original file. */
  column: string;
  /** Column name in the cleaned file, if a rule renamed it. */
  cleanedColumn: string;
  before: number;
  removed: RemovedTotal[];
  after: number;
  /** after − (before − removed): zero when the books balance. */
  difference: number;
  balanced: boolean;
  /** Decimal places to print totals with. */
  decimals: number;
  /** Non-empty cells that couldn't be read as numbers, before and after cleaning. */
  unreadable: { before: number; after: number };
}

export interface Reconciliation {
  rowsBefore: number;
  rowsAfter: number;
  columns: ColumnTotals[];
  /** True when every amount column balances. */
  balanced: boolean;
  /** False when the engine's steps couldn't be traced row by row, so per-rule totals are unknown. */
  traceable: boolean;
}

/** Columns that hold money or quantities: a money-like header, or values that read as amounts. */
export function detectAmountColumns(rows: Row[], headers: string[]): string[] {
  const sample = rows.slice(0, 500);
  return headers.filter((h) => {
    const values = sample.map((r) => r[h]).filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
    if (values.length === 0) return false;
    const read = values.map(readAmount);
    const readable = read.filter(Boolean).length;
    if (AMOUNT_HEADER.test(h)) return readable / values.length >= 0.6;
    // No money-like header: require values that are clearly amounts, not IDs or years
    const moneyLike = values.filter((v) => typeof v === "string" && /[$€£¥₹]|\d[.,]\d{2}\)?-?$/.test(v.trim())).length;
    return readable / values.length >= 0.9 && moneyLike / values.length >= 0.5;
  });
}

export function reconcile(
  originalRows: Row[],
  cleanedRows: Row[],
  snapshots: RuleSnapshot[],
  headers: string[]
): Reconciliation {
  // A column the user chose to delete has no total after cleaning, and that's not a change in the numbers
  const deleted = new Set(
    snapshots.filter((snap) => snap.ruleId === "removeColumns").flatMap((snap) => snap.changes.map((c) => c.column))
  );
  const amountColumns = detectAmountColumns(originalRows, headers).filter((c) => !deleted.has(c));

  // Rows each rule dropped, found by identity: removal rules pass kept rows through unchanged
  let traceable = true;
  const dropped: { ruleId: string; kind: RemovedTotal["kind"]; rows: Row[] }[] = [];
  for (const snap of snapshots) {
    if (snap.rowsAfter.length >= snap.rowsBefore.length) continue;
    const kept = new Set(snap.rowsAfter);
    const gone = snap.rowsBefore.filter((r) => !kept.has(r));
    if (gone.length !== snap.rowsBefore.length - snap.rowsAfter.length) traceable = false;
    const kind = RULE_MAP.get(snap.ruleId)?.category === "validation" || snap.quarantined.length > 0 ? "set aside" : "removed";
    dropped.push({ ruleId: snap.ruleId, kind, rows: gone });
  }

  const columns = amountColumns.map((column) => {
    // Follow the column through any header renames so dropped rows are read under the right key
    const nameAt = columnNamesThroughSteps(column, snapshots);
    const cleanedColumn = nameAt[nameAt.length - 1] ?? column;

    const before = sumColumn(originalRows, column);
    const after = sumColumn(cleanedRows, cleanedColumn);
    const steps = dropped.map((d) => {
      const stepIndex = snapshots.findIndex((snap) => snap.ruleId === d.ruleId);
      return { d, sum: sumColumn(d.rows, nameAt[stepIndex] ?? column) };
    });
    const scale = Math.max(before.decimals, after.decimals, ...steps.map((s) => s.sum.decimals));
    const removed: RemovedTotal[] = steps.map(({ d, sum }) => ({
      ruleId: d.ruleId,
      ruleName: RULE_MAP.get(d.ruleId)?.name ?? d.ruleId,
      kind: d.kind,
      rows: d.rows.length,
      total: sum.total,
    }));

    const removedExact = steps.reduce((acc, { sum }) => acc + rescale(sum.exact, scale), BigInt(0));
    const diffExact = rescale(after.exact, scale) - (rescale(before.exact, scale) - removedExact);

    return {
      column,
      cleanedColumn,
      before: before.total,
      removed,
      after: after.total,
      difference: toNumber(diffExact, scale),
      balanced: diffExact === BigInt(0),
      decimals: Math.min(scale, 6),
      unreadable: { before: before.unreadable, after: after.unreadable },
    } satisfies ColumnTotals;
  });

  return {
    rowsBefore: originalRows.length,
    rowsAfter: cleanedRows.length,
    columns,
    balanced: columns.every((c) => c.balanced),
    traceable,
  };
}

// ── Exact arithmetic ────────────────────────────────────────────────
// Sums are kept as integers scaled by 10^decimals so large files can't drift by a cent.

interface Exact {
  units: bigint;
  scale: number;
}

function rescale(x: Exact, scale: number): bigint {
  return x.scale === scale ? x.units : x.units * BigInt(10) ** BigInt(scale - x.scale);
}

function toNumber(units: bigint, scale: number): number {
  return Number(units) / 10 ** scale;
}

function sumColumn(rows: Row[], column: string) {
  const amounts: { units: bigint; decimals: number }[] = [];
  let unreadable = 0;
  let decimals = 0;
  for (const row of rows) {
    const raw = row[column];
    if (raw === null || raw === undefined || String(raw).trim() === "") continue;
    const a = readAmount(raw);
    if (!a) {
      unreadable++;
      continue;
    }
    const d = Math.min(a.decimals, 6);
    decimals = Math.max(decimals, d);
    amounts.push({ units: BigInt(Math.round(a.value * 10 ** d)), decimals: d });
  }
  let units = BigInt(0);
  for (const a of amounts) units += a.units * BigInt(10) ** BigInt(decimals - a.decimals);
  const exact: Exact = { units, scale: decimals };
  return { exact, total: toNumber(units, decimals), decimals, unreadable };
}

/** The column's name after each step (index i = name in that step's output rows). */
function columnNamesThroughSteps(column: string, snapshots: RuleSnapshot[]): string[] {
  const names: string[] = [];
  let current: string | null = column;
  for (const snap of snapshots) {
    if (current !== null) {
      const keysBefore = Object.keys(snap.rowsBefore[0] ?? {});
      const keysAfter = Object.keys(snap.rowsAfter[0] ?? {});
      if (keysAfter.length > 0 && !keysAfter.includes(current)) {
        // A header rule renamed columns in place: same position, new name
        const i = keysBefore.indexOf(current);
        current = keysBefore.length === keysAfter.length && i !== -1 ? keysAfter[i] : null;
      }
    }
    names.push(current ?? column);
  }
  return names;
}
