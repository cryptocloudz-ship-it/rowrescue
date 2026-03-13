import type { Row, CleanResult, CellChange, QuarantinedRow } from "@/types/sheet";
import type { RuleOptions, ValidateEmailOptions } from "@/types/rules";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const changes: CellChange[] = [];
  const quarantined: QuarantinedRow[] = [];
  const now = Date.now();

  const opts = options as ValidateEmailOptions;
  const emailColumns = opts.columns ?? detectEmailColumns(rows);

  const cleanRows: Row[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let hasInvalid = false;

    for (const col of emailColumns) {
      const value = row[col];
      if (typeof value !== "string" || !value.trim()) continue;

      if (!EMAIL_REGEX.test(value.trim())) {
        hasInvalid = true;
        changes.push({
          rowIndex: i,
          column: col,
          originalValue: value,
          newValue: value,
          ruleId: "validateEmail",
          ruleName: "Validate Email",
          changeType: "flagged",
          timestamp: now,
        });
      }
    }

    if (hasInvalid) {
      quarantined.push({
        originalIndex: i,
        row,
        reason: "Invalid email format",
        ruleId: "validateEmail",
      });
    }
    // Always keep the row - quarantine is for review, not deletion
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

function detectEmailColumns(rows: Row[]): string[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  return headers.filter(
    (h) => /email/i.test(h) || /e.?mail/i.test(h)
  );
}
