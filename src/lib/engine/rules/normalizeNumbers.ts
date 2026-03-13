import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, NormalizeNumbersOptions } from "@/types/rules";

const CURRENCY_REGEX = /[$€£¥₹₽₩₪]/g;
const THOUSANDS_DOT = /(\d)\.(\d{3}(?:[.,]|$))/g;
const THOUSANDS_COMMA = /(\d),(\d{3}(?:[.,]|$))/g;

export function normalizeNumbers(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = { decimalSeparator: "." as const, removeCurrency: true, ...options } as NormalizeNumbersOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;

      let cleaned = value.trim();
      if (!cleaned) continue;

      // Check if the value looks like a number
      const hasDigits = /\d/.test(cleaned);
      if (!hasDigits) continue;

      const original = cleaned;

      // Remove currency symbols
      if (opts.removeCurrency) {
        cleaned = cleaned.replace(CURRENCY_REGEX, "").trim();
      }

      // Remove whitespace between number parts
      cleaned = cleaned.replace(/(\d)\s+(\d)/g, "$1$2");

      // Handle European format: 1.234,56 → 1234.56
      if (opts.decimalSeparator === ".") {
        // European thousands: dots as thousands separator
        if (THOUSANDS_DOT.test(cleaned) && cleaned.includes(",")) {
          cleaned = cleaned.replace(/\./g, "").replace(",", ".");
        } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
          // US thousands: commas as thousands separator
          cleaned = cleaned.replace(/,/g, "");
        } else if (cleaned.includes(",") && !cleaned.includes(".")) {
          // Single comma, likely decimal
          cleaned = cleaned.replace(",", ".");
        }
      } else {
        // Target is comma decimal
        if (THOUSANDS_COMMA.test(cleaned) && cleaned.includes(".")) {
          cleaned = cleaned.replace(/,/g, "").replace(".", ",");
        } else if (cleaned.includes(".") && !cleaned.includes(",")) {
          cleaned = cleaned.replace(".", ",");
        }
      }

      // Validate it's actually a number now
      const testNum = cleaned.replace(",", ".");
      if (isNaN(Number(testNum))) continue;

      if (cleaned !== original) {
        newRow[key] = cleaned;
        changes.push({
          rowIndex,
          column: key,
          originalValue: value,
          newValue: cleaned,
          ruleId: "normalizeNumbers",
          ruleName: "Normalize Numbers",
          changeType: "changed",
          timestamp: now,
        });
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
