import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, NormalizeDateOptions } from "@/types/rules";

// Common date patterns to detect and parse
const DATE_PATTERNS: { regex: RegExp; parse: (m: RegExpMatchArray) => Date | null }[] = [
  // YYYY-MM-DD
  { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, parse: (m) => safeDate(+m[1], +m[2], +m[3]) },
  // Month DD, YYYY
  { regex: /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/, parse: (m) => parseMonthName(m[1], +m[2], +m[3]) },
  // DD Month YYYY
  { regex: /^(\d{1,2})\s+(\w+)\s+(\d{4})$/, parse: (m) => parseMonthName(m[2], +m[1], +m[3]) },
];

// NN/NN/YYYY, NN-NN-YYYY, NN.NN.YYYY — day/month order is ambiguous and resolved per column
const NUMERIC_DATE = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

type DateOrder = "DMY" | "MDY";

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function safeDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function parseMonthName(name: string, day: number, year: number): Date | null {
  const month = MONTHS[name.toLowerCase()];
  if (!month) return null;
  return safeDate(year, month, day);
}

/**
 * Infer day/month order for a column: a first part above 12 proves day-first,
 * a second part above 12 proves month-first. With no evidence, fall back to `fallback`.
 */
export function detectDateOrder(values: unknown[], fallback: DateOrder = "DMY"): DateOrder {
  let dayFirst = false;
  let monthFirst = false;
  for (const value of values) {
    if (typeof value !== "string") continue;
    const m = value.trim().match(NUMERIC_DATE);
    if (!m) continue;
    if (+m[1] > 12) dayFirst = true;
    if (+m[2] > 12) monthFirst = true;
  }
  if (dayFirst && !monthFirst) return "DMY";
  if (monthFirst && !dayFirst) return "MDY";
  return fallback;
}

function tryParseDate(value: string, order: DateOrder = "DMY"): Date | null {
  const trimmed = value.trim();
  const numeric = trimmed.match(NUMERIC_DATE);
  if (numeric) {
    const [a, b, year] = [+numeric[1], +numeric[2], +numeric[3]];
    // Prefer the column's order, but accept the other when the preferred one is impossible (e.g. 01/15/2024 in a DMY column)
    return order === "DMY"
      ? safeDate(year, b, a) ?? safeDate(year, a, b)
      : safeDate(year, a, b) ?? safeDate(year, b, a);
  }
  for (const pattern of DATE_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const d = pattern.parse(match);
      if (d) return d;
    }
  }
  // Fallback: try native Date parsing
  const native = new Date(trimmed);
  if (!isNaN(native.getTime()) && trimmed.length >= 6) return native;
  return null;
}

function formatDate(d: Date, format: string): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", yyyy)
    .replace("MM", mm)
    .replace("DD", dd);
}

export function normalizeDate(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = { targetFormat: "YYYY-MM-DD", ...options } as NormalizeDateOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;
  const requestedOrder = opts.dateOrder ?? "auto";

  const columnOrder = new Map<string, DateOrder>();
  const orderFor = (column: string): DateOrder => {
    if (requestedOrder !== "auto") return requestedOrder;
    let order = columnOrder.get(column);
    if (!order) {
      order = detectDateOrder(rows.map((r) => r[column]));
      columnOrder.set(column, order);
    }
    return order;
  };

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;
      const parsed = tryParseDate(value, orderFor(key));
      if (parsed) {
        const formatted = formatDate(parsed, opts.targetFormat);
        if (formatted !== value) {
          newRow[key] = formatted;
          changes.push({
            rowIndex,
            column: key,
            originalValue: value,
            newValue: formatted,
            ruleId: "normalizeDate",
            ruleName: "Normalize Dates",
            changeType: "changed",
            timestamp: now,
          });
        }
      }
    }
    return newRow;
  });

  return {
    rows: newRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: new Set(changes.map((c) => c.rowIndex)).size,
      cellsChanged: changes.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
