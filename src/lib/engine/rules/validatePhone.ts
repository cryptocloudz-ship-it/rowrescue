import type { Row, CleanResult, CellChange, QuarantinedRow } from "@/types/sheet";
import type { RuleOptions, ValidatePhoneOptions } from "@/types/rules";

const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export function validatePhone(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const changes: CellChange[] = [];
  const quarantined: QuarantinedRow[] = [];
  const now = Date.now();

  const opts = options as ValidatePhoneOptions;
  const phoneColumns = opts.columns ?? detectPhoneColumns(rows);
  const cleanRows: Row[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let hasInvalid = false;

    for (const col of phoneColumns) {
      const value = row[col];
      if (typeof value !== "string" || !value.trim()) continue;

      if (!PHONE_REGEX.test(value.trim())) {
        hasInvalid = true;
        changes.push({
          rowIndex: i,
          column: col,
          originalValue: value,
          newValue: value,
          ruleId: "validatePhone",
          ruleName: "Validate Phone",
          changeType: "flagged",
          timestamp: now,
        });
      }
    }

    if (hasInvalid) {
      quarantined.push({
        originalIndex: i,
        row,
        reason: "Invalid phone format",
        ruleId: "validatePhone",
      });
    }
    cleanRows.push(row);
  }

  return {
    rows: cleanRows,
    changes,
    quarantined,
    stats: {
      rowsAffected: quarantined.length,
      cellsChanged: changes.length,
      rowsRemoved: 0,
      rowsQuarantined: quarantined.length,
    },
  };
}

function detectPhoneColumns(rows: Row[]): string[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).filter(
    (h) => /phone|tel|mobile|cell|fax/i.test(h)
  );
}
