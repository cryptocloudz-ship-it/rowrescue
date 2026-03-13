import type { RuleDefinition } from "@/types/rules";
import { normalizeHeaders } from "./normalizeHeaders";
import { renameColumns } from "./renameColumns";
import { removeEmptyColumns } from "./removeEmptyColumns";
import { reorderColumns } from "./reorderColumns";
import { deduplicateRows } from "./deduplicateRows";
import { removeEmptyRows } from "./removeEmptyRows";
import { trimWhitespace } from "./trimWhitespace";
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
    isPro: true,
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
    isPro: true,
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
    isPro: true,
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

export {
  normalizeHeaders,
  renameColumns,
  removeEmptyColumns,
  reorderColumns,
  deduplicateRows,
  removeEmptyRows,
  trimWhitespace,
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
