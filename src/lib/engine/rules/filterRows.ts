import type { Row, CleanResult, CellChange, CellValue } from "@/types/sheet";
import type { RuleOptions, FilterRowsOptions, FilterOperator } from "@/types/rules";
import { parseAmount } from "../amounts";

/** Conditions the cleaner offers. Text comparisons ignore case and surrounding spaces. */
export const FILTER_OPERATORS: { value: FilterOperator; label: string; needsValue: boolean }[] = [
  { value: "equals", label: "equals", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "empty", label: "is empty", needsValue: false },
  { value: "gt", label: "is greater than", needsValue: true },
  { value: "lt", label: "is less than", needsValue: true },
];

function isBlank(value: CellValue | undefined): boolean {
  return value === null || value === undefined || String(value).trim() === "";
}

/** Whether a cell meets the condition. Number comparisons read amounts like "€1,234.56" or "(50.00)". */
export function matchesCondition(value: CellValue | undefined, operator: FilterOperator, target = ""): boolean {
  const text = isBlank(value) ? "" : String(value).trim().toLowerCase();
  const wanted = target.trim().toLowerCase();
  switch (operator) {
    case "equals":
      return text === wanted;
    case "contains":
      return wanted !== "" && text.includes(wanted);
    case "empty":
      return text === "";
    case "gt":
    case "lt": {
      const a = parseAmount(value);
      const b = parseAmount(target);
      if (a === null || b === null) return false;
      return operator === "gt" ? a > b : a < b;
    }
  }
}

/**
 * Keep or remove rows by a condition on one column. Every removed row is logged cell by cell, like Remove Empty Rows,
 * so it shows in the change log and the totals check.
 */
export function filterRows(rows: Row[], options: RuleOptions = {}): CleanResult {
  const opts = options as FilterRowsOptions;
  const operator = FILTER_OPERATORS.find((o) => o.value === opts.operator);
  const column = opts.column;
  if (!column || !operator || (operator.needsValue && (opts.value ?? "").trim() === "")) {
    return { rows: [...rows], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };
  }

  const keepMatches = (opts.mode ?? "remove") === "keep";
  const changes: CellChange[] = [];
  const kept: Row[] = [];
  const now = Date.now();
  let removed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const matches = matchesCondition(row[column], operator.value, opts.value);
    if (matches === keepMatches) {
      kept.push(row);
      continue;
    }
    removed++;
    for (const col of Object.keys(row)) {
      changes.push({
        rowIndex: i,
        column: col,
        originalValue: row[col],
        newValue: null,
        ruleId: "filterRows",
        ruleName: "Filter Rows",
        changeType: "removed",
        timestamp: now,
      });
    }
  }

  return {
    rows: kept,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: removed,
      cellsChanged: changes.length,
      rowsRemoved: removed,
      rowsQuarantined: 0,
    },
  };
}
