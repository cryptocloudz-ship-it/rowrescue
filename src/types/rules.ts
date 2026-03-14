/** Rule type definitions for RowRescue cleaning engine */

import type { Row, CleanResult } from "./sheet";

export type RuleCategory =
  | "column_management"
  | "row_cleaning"
  | "data_standardisation"
  | "validation";

export interface RuleOptions {
  [key: string]: unknown;
}

export interface NormalizeHeadersOptions extends RuleOptions {
  style: "lowercase_underscore" | "lowercase_dash" | "camelCase";
}

export interface RenameColumnsOptions extends RuleOptions {
  aliasMap: Record<string, string>;
}

export interface DeduplicateRowsOptions extends RuleOptions {
  mode: "exact" | "by_columns";
  keyColumns?: string[];
}

export interface NormalizeDateOptions extends RuleOptions {
  targetFormat: string; // e.g. "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"
  columns?: string[];
}

export interface NormalizeNumbersOptions extends RuleOptions {
  decimalSeparator: "." | ",";
  removeCurrency: boolean;
  columns?: string[];
}

export interface NormalizePhoneOptions extends RuleOptions {
  format: "e164" | "local";
  defaultCountryCode?: string;
  columns?: string[];
}

export interface NormalizeCaseOptions extends RuleOptions {
  caseType: "upper" | "lower" | "title";
  columns?: string[];
}

export interface ValidateEmailOptions extends RuleOptions {
  columns?: string[];
}

export interface ValidatePhoneOptions extends RuleOptions {
  columns?: string[];
}

export interface ValidateRequiredOptions extends RuleOptions {
  columns: string[];
}

export interface ValidateRangeOptions extends RuleOptions {
  column: string;
  min?: number;
  max?: number;
}

export interface StripHtmlOptions extends RuleOptions {
  columns?: string[];
}

export interface TrimWhitespaceOptions extends RuleOptions {
  columns?: string[];
}

export type RuleFunction = (rows: Row[], options: RuleOptions) => CleanResult;

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  isPro: boolean;
  execute: RuleFunction;
  supportsColumnTargeting?: boolean;
}

export interface RuleConfig {
  ruleId: string;
  enabled: boolean;
  options: RuleOptions;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  rules: RuleConfig[];
  createdAt: number;
  updatedAt: number;
  isBuiltIn?: boolean;
}
