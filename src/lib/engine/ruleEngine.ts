/**
 * Rule Engine Orchestrator
 *
 * Applies a sequence of cleaning rules to parsed sheet data.
 * Each rule is a pure function: (rows, options) => CleanResult
 * Rules run sequentially — output of one feeds into the next.
 * Individual rule failures are isolated and skipped.
 */

import type { Row, CleanResult, CellChange, QuarantinedRow } from "@/types/sheet";
import type { RuleConfig } from "@/types/rules";
import { RULE_MAP } from "./rules";

export interface RuleSnapshot {
  ruleId: string;
  rowsBefore: Row[];
  rowsAfter: Row[];
  changes: CellChange[];
  quarantined: QuarantinedRow[];
}

export interface EngineResult {
  originalRows: Row[];
  cleanedRows: Row[];
  allChanges: CellChange[];
  allQuarantined: QuarantinedRow[];
  ruleResults: Map<string, CleanResult>;
  snapshots: RuleSnapshot[];
  errors: { ruleId: string; error: string }[];
  stats: {
    totalRowsAffected: number;
    totalCellsChanged: number;
    totalRowsRemoved: number;
    totalRowsQuarantined: number;
    rulesApplied: number;
    rulesFailed: number;
  };
}

export function runEngine(
  rows: Row[],
  ruleConfigs: RuleConfig[]
): EngineResult {
  const originalRows = rows;
  let currentRows = [...rows];
  const allChanges: CellChange[] = [];
  const allQuarantined: QuarantinedRow[] = [];
  const ruleResults = new Map<string, CleanResult>();
  const snapshots: RuleSnapshot[] = [];
  const errors: { ruleId: string; error: string }[] = [];

  const enabledRules = ruleConfigs.filter((rc) => rc.enabled);

  for (const config of enabledRules) {
    const ruleDef = RULE_MAP.get(config.ruleId);
    if (!ruleDef) continue;

    const rowsBefore = currentRows;

    try {
      const result = ruleDef.execute(currentRows, config.options);
      currentRows = result.rows;
      allChanges.push(...result.changes);
      allQuarantined.push(...result.quarantined);
      ruleResults.set(config.ruleId, result);

      snapshots.push({
        ruleId: config.ruleId,
        rowsBefore,
        rowsAfter: result.rows,
        changes: result.changes,
        quarantined: result.quarantined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push({ ruleId: config.ruleId, error: message });
      // Skip this rule, continue with currentRows unchanged
    }
  }

  return {
    originalRows,
    cleanedRows: currentRows,
    allChanges,
    allQuarantined,
    ruleResults,
    snapshots,
    errors,
    stats: {
      totalRowsAffected: new Set(allChanges.map((c) => c.rowIndex)).size,
      totalCellsChanged: allChanges.length,
      totalRowsRemoved: originalRows.length - currentRows.length + allQuarantined.length,
      totalRowsQuarantined: allQuarantined.length,
      rulesApplied: enabledRules.length - errors.length,
      rulesFailed: errors.length,
    },
  };
}

/**
 * Recompute engine result after undoing a specific rule.
 * Disables the rule and re-runs the full pipeline.
 */
export function undoRule(
  originalRows: Row[],
  ruleConfigs: RuleConfig[],
  ruleIdToUndo: string
): EngineResult {
  const updatedConfigs = ruleConfigs.map((rc) =>
    rc.ruleId === ruleIdToUndo ? { ...rc, enabled: false } : rc
  );
  return runEngine(originalRows, updatedConfigs);
}
