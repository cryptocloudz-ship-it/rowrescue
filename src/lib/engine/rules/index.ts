import type { RuleDefinition } from "@/types/rules";
import { normalizeHeaders } from "./normalizeHeaders";
import { renameColumns } from "./renameColumns";
import { removeEmptyColumns } from "./removeEmptyColumns";
import { reorderColumns } from "./reorderColumns";
import { removeColumns } from "./removeColumns";
import { deduplicateRows } from "./deduplicateRows";
import { removeEmptyRows } from "./removeEmptyRows";
import { trimWhitespace } from "./trimWhitespace";
import { fixEncoding } from "./fixEncoding";
import { stripHtml } from "./stripHtml";
import { normalizeDate } from "./normalizeDate";
import { normalizeNumbers } from "./normalizeNumbers";
import { normalizePhone } from "./normalizePhone";
import { normalizeEmail } from "./normalizeEmail";
import { normalizeCase } from "./normalizeCase";
import { validateEmail } from "./validateEmail";
import { validatePhone } from "./validatePhone";
import { validateRequired } from "./validateRequired";
import { validateRange } from "./validateRange";

export const ALL_RULES: RuleDefinition[] = [
  // Column management
  {
    id: "normalizeHeaders",
    name: "Normalize Headers",
    description: "Trim, lowercase, and convert spaces to underscores in column headers.",
    category: "column_management",
    isPro: false,
    execute: normalizeHeaders,
  },
  {
    id: "renameColumns",
    name: "Rename Columns",
    description: "Rename columns using a custom alias map.",
    category: "column_management",
    isPro: true,
    execute: renameColumns,
  },
  {
    id: "removeEmptyColumns",
    name: "Remove Empty Columns",
    description: "Remove columns where every cell is empty.",
    category: "column_management",
    isPro: false,
    execute: removeEmptyColumns,
  },
  {
    id: "removeColumns",
    name: "Delete Columns",
    description: "Delete the columns you choose, even ones that have data.",
    category: "column_management",
    isPro: true,
    execute: removeColumns,
  },
  {
    id: "reorderColumns",
    name: "Reorder Columns",
    description: "Reorder columns to a specified arrangement.",
    category: "column_management",
    isPro: true,
    execute: reorderColumns,
  },

  // Row cleaning
  {
    id: "deduplicateRows",
    name: "Remove Duplicates",
    description: "Remove duplicate rows (exact match or by key columns).",
    category: "row_cleaning",
    isPro: false,
    execute: deduplicateRows,
    supportsColumnTargeting: true,
  },
  {
    id: "removeEmptyRows",
    name: "Remove Empty Rows",
    description: "Remove rows where every cell is empty.",
    category: "row_cleaning",
    isPro: false,
    execute: removeEmptyRows,
  },
  {
    id: "trimWhitespace",
    name: "Trim Whitespace",
    description: "Trim leading/trailing whitespace and collapse internal spaces.",
    category: "row_cleaning",
    isPro: false,
    execute: trimWhitespace,
    supportsColumnTargeting: true,
  },
  {
    id: "fixEncoding",
    name: "Fix Encoding",
    description: "Repair garbled characters such as \"CafÃ©\" → \"Café\" caused by opening UTF-8 files as Windows-1252.",
    category: "row_cleaning",
    isPro: false,
    execute: fixEncoding,
    supportsColumnTargeting: true,
  },
  {
    id: "stripHtml",
    name: "Strip HTML",
    description: "Remove HTML tags from cell values.",
    category: "row_cleaning",
    isPro: true,
    execute: stripHtml,
    supportsColumnTargeting: true,
  },

  // Data standardisation
  {
    id: "normalizeDate",
    name: "Normalize Dates",
    description: "Detect and convert dates to a consistent format (e.g. YYYY-MM-DD).",
    category: "data_standardisation",
    isPro: false,
    execute: normalizeDate,
    supportsColumnTargeting: true,
  },
  {
    id: "normalizeNumbers",
    name: "Normalize Numbers",
    description: "Remove currency symbols and fix decimal separators.",
    category: "data_standardisation",
    isPro: true,
    execute: normalizeNumbers,
    supportsColumnTargeting: true,
  },
  {
    id: "normalizePhone",
    name: "Normalize Phone",
    description: "Strip phone numbers to E.164 or local format.",
    category: "data_standardisation",
    isPro: true,
    execute: normalizePhone,
    supportsColumnTargeting: true,
  },
  {
    id: "normalizeEmail",
    name: "Normalize Email",
    description: "Lowercase and trim email addresses.",
    category: "data_standardisation",
    isPro: false,
    execute: normalizeEmail,
    supportsColumnTargeting: true,
  },
  {
    id: "normalizeCase",
    name: "Normalize Case",
    description: "Convert text to UPPER, lower, or Title case per column.",
    category: "data_standardisation",
    isPro: true,
    execute: normalizeCase,
    supportsColumnTargeting: true,
  },

  // Validation
  {
    id: "validateEmail",
    name: "Validate Email",
    description: "Flag rows with invalid email addresses.",
    category: "validation",
    isPro: false,
    execute: validateEmail,
    supportsColumnTargeting: true,
  },
  {
    id: "validatePhone",
    name: "Validate Phone",
    description: "Flag rows with invalid phone number formats.",
    category: "validation",
    isPro: true,
    execute: validatePhone,
    supportsColumnTargeting: true,
  },
  {
    id: "validateRequired",
    name: "Validate Required",
    description: "Flag rows with blank values in required columns.",
    category: "validation",
    isPro: true,
    execute: validateRequired,
    supportsColumnTargeting: true,
  },
  {
    id: "validateRange",
    name: "Validate Range",
    description: "Flag rows with numeric values outside a specified range.",
    category: "validation",
    isPro: true,
    execute: validateRange,
  },
];

export const RULE_MAP = new Map(ALL_RULES.map((r) => [r.id, r]));

/**
 * Execution order, independent of how rules are listed in the UI: transform values first,
 * then drop empty rows and duplicates (so "a@b.com " and "A@b.com" match), then validate.
 * Column deletion runs after validation, so duplicates and checks still see the whole row, and header renames
 * run last because column pickers store the file's original header names.
 */
const ROW_REMOVAL = ["removeEmptyRows", "deduplicateRows"];
const HEADER_RENAMES = ["normalizeHeaders", "renameColumns", "reorderColumns"];

export function executionRank(ruleId: string): number {
  if (ruleId === "removeColumns") return 2.5;
  if (HEADER_RENAMES.includes(ruleId)) return 3 + HEADER_RENAMES.indexOf(ruleId) / 10;
  if (RULE_MAP.get(ruleId)?.category === "validation") return 2;
  if (ROW_REMOVAL.includes(ruleId)) return 1 + ROW_REMOVAL.indexOf(ruleId) / 10;
  return 0;
}

export {
  normalizeHeaders,
  renameColumns,
  removeEmptyColumns,
  removeColumns,
  reorderColumns,
  deduplicateRows,
  removeEmptyRows,
  trimWhitespace,
  fixEncoding,
  stripHtml,
  normalizeDate,
  normalizeNumbers,
  normalizePhone,
  normalizeEmail,
  normalizeCase,
  validateEmail,
  validatePhone,
  validateRequired,
  validateRange,
};
