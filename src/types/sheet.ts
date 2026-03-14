/** Core data types for RowRescue's client-side processing engine */

export type CellValue = string | number | boolean | null;

export type Row = Record<string, CellValue>;

export interface ParsedSheet {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: Row[];
  rowCount: number;
  columnCount: number;
  delimiter?: string;
  encoding?: string;
}

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface HealthIssue {
  id: string;
  type:
    | "duplicate_rows"
    | "empty_rows"
    | "empty_columns"
    | "inconsistent_headers"
    | "date_inconsistency"
    | "number_format"
    | "invalid_email"
    | "invalid_phone";
  severity: Severity;
  title: string;
  description: string;
  count: number;
  examples: string[];
  affectedColumns?: string[];
}

export interface HealthReport {
  issues: HealthIssue[];
  totalIssues: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scannedAt: number;
}

export type CellChangeType = "changed" | "removed" | "flagged";

export interface CellChange {
  rowIndex: number;
  column: string;
  originalValue: CellValue;
  newValue: CellValue;
  ruleId: string;
  ruleName: string;
  changeType: CellChangeType;
  timestamp: number;
}

export interface CleanResult {
  rows: Row[];
  changes: CellChange[];
  quarantined: QuarantinedRow[];
  stats: {
    rowsAffected: number;
    cellsChanged: number;
    rowsRemoved: number;
    rowsQuarantined: number;
  };
}

export interface QuarantinedRow {
  originalIndex: number;
  row: Row;
  reason: string;
  ruleId: string;
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "txt";
  delimiter: "," | ";" | "\t" | "|";
  includeHeaders: boolean;
  encoding: "utf-8";
}

export type ProcessingStage =
  | "idle"
  | "parsing"
  | "health-check"
  | "configuring"
  | "cleaning"
  | "previewing"
  | "exporting";
