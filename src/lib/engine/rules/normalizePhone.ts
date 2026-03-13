import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, NormalizePhoneOptions } from "@/types/rules";

export function normalizePhone(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = { format: "e164" as const, defaultCountryCode: "+1", ...options } as NormalizePhoneOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;

      const trimmed = value.trim();
      if (!trimmed) continue;

      // Strip everything except digits and leading +
      const digitsOnly = trimmed.replace(/[^\d+]/g, "");
      if (digitsOnly.length < 7) continue; // Too short for a phone number

      let normalized: string;

      if (opts.format === "e164") {
        if (digitsOnly.startsWith("+")) {
          normalized = digitsOnly;
        } else if (digitsOnly.startsWith("00")) {
          normalized = "+" + digitsOnly.slice(2);
        } else {
          normalized = (opts.defaultCountryCode || "+1") + digitsOnly.replace(/^0+/, "");
        }
      } else {
        // Local format - just clean up
        normalized = digitsOnly.replace(/^(\+\d{1,3})/, "0");
      }

      if (normalized !== trimmed) {
        newRow[key] = normalized;
        changes.push({
          rowIndex,
          column: key,
          originalValue: value,
          newValue: normalized,
          ruleId: "normalizePhone",
          ruleName: "Normalize Phone",
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
