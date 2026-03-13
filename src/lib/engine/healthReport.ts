/**
 * Health Report Generator
 *
 * Scans parsed sheet data and identifies data quality issues
 * BEFORE any cleaning rules are applied.
 */

import type { Row, HealthIssue, HealthReport, Severity } from "@/types/sheet";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export function generateHealthReport(
  rows: Row[],
  headers: string[]
): HealthReport {
  const issues: HealthIssue[] = [];

  if (rows.length === 0) {
    return { issues, totalIssues: 0, highCount: 0, mediumCount: 0, lowCount: 0, scannedAt: Date.now() };
  }

  checkDuplicateRows(rows, issues);
  checkEmptyRows(rows, issues);
  checkEmptyColumns(rows, headers, issues);
  checkInconsistentHeaders(headers, issues);
  checkDateInconsistencies(rows, headers, issues);
  checkNumberFormats(rows, headers, issues);
  checkInvalidEmails(rows, headers, issues);
  checkInvalidPhones(rows, headers, issues);

  const highCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumCount = issues.filter((i) => i.severity === "MEDIUM").length;
  const lowCount = issues.filter((i) => i.severity === "LOW").length;

  return {
    issues,
    totalIssues: issues.length,
    highCount,
    mediumCount,
    lowCount,
    scannedAt: Date.now(),
  };
}

function checkDuplicateRows(rows: Row[], issues: HealthIssue[]) {
  const seen = new Map<string, number>();
  let dupeCount = 0;
  const examples: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const key = JSON.stringify(rows[i]);
    const firstSeen = seen.get(key);
    if (firstSeen !== undefined) {
      dupeCount++;
      if (examples.length < 3) {
        examples.push(`Row ${i + 1} is a duplicate of row ${firstSeen + 1}`);
      }
    } else {
      seen.set(key, i);
    }
  }

  if (dupeCount > 0) {
    pushIssue(issues, {
      type: "duplicate_rows",
      severity: dupeCount > rows.length * 0.1 ? "HIGH" : "MEDIUM",
      title: "Duplicate Rows",
      description: `Found ${dupeCount} duplicate row${dupeCount > 1 ? "s" : ""}.`,
      count: dupeCount,
      examples,
    });
  }
}

function checkEmptyRows(rows: Row[], issues: HealthIssue[]) {
  let count = 0;
  const examples: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const isEmpty = Object.values(rows[i]).every(
      (v) => v === null || v === undefined || String(v).trim() === ""
    );
    if (isEmpty) {
      count++;
      if (examples.length < 3) examples.push(`Row ${i + 1}`);
    }
  }

  if (count > 0) {
    pushIssue(issues, {
      type: "empty_rows",
      severity: "LOW",
      title: "Empty Rows",
      description: `Found ${count} completely empty row${count > 1 ? "s" : ""}.`,
      count,
      examples,
    });
  }
}

function checkEmptyColumns(rows: Row[], headers: string[], issues: HealthIssue[]) {
  const emptyCols: string[] = [];

  for (const header of headers) {
    const allEmpty = rows.every((row) => {
      const v = row[header];
      return v === null || v === undefined || String(v).trim() === "";
    });
    if (allEmpty) emptyCols.push(header);
  }

  if (emptyCols.length > 0) {
    pushIssue(issues, {
      type: "empty_columns",
      severity: "LOW",
      title: "Empty Columns",
      description: `${emptyCols.length} column${emptyCols.length > 1 ? "s have" : " has"} no data.`,
      count: emptyCols.length,
      examples: emptyCols.slice(0, 5),
      affectedColumns: emptyCols,
    });
  }
}

function checkInconsistentHeaders(headers: string[], issues: HealthIssue[]) {
  // Group headers by normalized form
  const normalized = new Map<string, string[]>();
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[\s_\-]+/g, "").replace(/s$/, "");
    const existing = normalized.get(norm) ?? [];
    existing.push(h);
    normalized.set(norm, existing);
  }

  const inconsistent = [...normalized.entries()].filter(([, variants]) => variants.length > 1);

  if (inconsistent.length > 0) {
    pushIssue(issues, {
      type: "inconsistent_headers",
      severity: "MEDIUM",
      title: "Inconsistent Headers",
      description: "Some column headers appear to be duplicates with different formatting.",
      count: inconsistent.length,
      examples: inconsistent.slice(0, 3).map(([, v]) => v.join(" vs ")),
      affectedColumns: inconsistent.flatMap(([, v]) => v),
    });
  }
}

function checkDateInconsistencies(rows: Row[], headers: string[], issues: HealthIssue[]) {
  const dateColumns = headers.filter((h) => /date|time|created|updated|born|dob/i.test(h));
  if (dateColumns.length === 0) return;

  let inconsistentCount = 0;
  const examples: string[] = [];

  for (const col of dateColumns) {
    const formats = new Set<string>();
    for (const row of rows.slice(0, 100)) {
      const val = String(row[col] ?? "").trim();
      if (!val) continue;
      if (/^\d{4}-\d{2}-\d{2}/.test(val)) formats.add("YYYY-MM-DD");
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(val)) formats.add("DD/MM/YYYY");
      else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(val)) formats.add("DD-MM-YYYY");
      else if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(val)) formats.add("DD.MM.YYYY");
      else if (/^[A-Za-z]/.test(val)) formats.add("Text");
    }
    if (formats.size > 1) {
      inconsistentCount++;
      if (examples.length < 3) {
        examples.push(`"${col}" has mixed formats: ${[...formats].join(", ")}`);
      }
    }
  }

  if (inconsistentCount > 0) {
    pushIssue(issues, {
      type: "date_inconsistency",
      severity: "HIGH",
      title: "Date Format Inconsistencies",
      description: `${inconsistentCount} date column${inconsistentCount > 1 ? "s have" : " has"} mixed formats.`,
      count: inconsistentCount,
      examples,
      affectedColumns: dateColumns,
    });
  }
}

function checkNumberFormats(rows: Row[], headers: string[], issues: HealthIssue[]) {
  const numColumns = headers.filter((h) =>
    /price|amount|total|cost|qty|quantity|rate|salary|revenue|tax/i.test(h)
  );
  if (numColumns.length === 0) return;

  let issueCount = 0;
  const examples: string[] = [];

  for (const col of numColumns) {
    let hasCurrency = false;
    let hasCommaDecimal = false;
    let hasDotDecimal = false;

    for (const row of rows.slice(0, 100)) {
      const val = String(row[col] ?? "").trim();
      if (/[$€£¥₹]/.test(val)) hasCurrency = true;
      if (/\d,\d{1,2}$/.test(val)) hasCommaDecimal = true;
      if (/\d\.\d{1,2}$/.test(val)) hasDotDecimal = true;
    }

    if ((hasCurrency || (hasCommaDecimal && hasDotDecimal))) {
      issueCount++;
      if (examples.length < 3) {
        const reasons = [];
        if (hasCurrency) reasons.push("currency symbols");
        if (hasCommaDecimal && hasDotDecimal) reasons.push("mixed decimal separators");
        examples.push(`"${col}": ${reasons.join(", ")}`);
      }
    }
  }

  if (issueCount > 0) {
    pushIssue(issues, {
      type: "number_format",
      severity: "MEDIUM",
      title: "Number Format Issues",
      description: `${issueCount} column${issueCount > 1 ? "s have" : " has"} number formatting issues.`,
      count: issueCount,
      examples,
      affectedColumns: numColumns,
    });
  }
}

function checkInvalidEmails(rows: Row[], headers: string[], issues: HealthIssue[]) {
  const emailColumns = headers.filter((h) => /email|e.?mail/i.test(h));
  if (emailColumns.length === 0) return;

  let invalidCount = 0;
  const examples: string[] = [];

  for (const col of emailColumns) {
    for (let i = 0; i < rows.length; i++) {
      const val = String(rows[i][col] ?? "").trim();
      if (val && !EMAIL_REGEX.test(val)) {
        invalidCount++;
        if (examples.length < 3) {
          examples.push(`Row ${i + 1} in "${col}" has invalid format`);
        }
      }
    }
  }

  if (invalidCount > 0) {
    pushIssue(issues, {
      type: "invalid_email",
      severity: "HIGH",
      title: "Invalid Emails",
      description: `Found ${invalidCount} invalid email address${invalidCount > 1 ? "es" : ""}.`,
      count: invalidCount,
      examples,
      affectedColumns: emailColumns,
    });
  }
}

function checkInvalidPhones(rows: Row[], headers: string[], issues: HealthIssue[]) {
  const phoneColumns = headers.filter((h) => /phone|tel|mobile|cell/i.test(h));
  if (phoneColumns.length === 0) return;

  let invalidCount = 0;
  const examples: string[] = [];

  for (const col of phoneColumns) {
    for (let i = 0; i < rows.length; i++) {
      const val = String(rows[i][col] ?? "").trim();
      if (val && !PHONE_REGEX.test(val)) {
        invalidCount++;
        if (examples.length < 3) {
          examples.push(`Row ${i + 1} in "${col}" has invalid format`);
        }
      }
    }
  }

  if (invalidCount > 0) {
    pushIssue(issues, {
      type: "invalid_phone",
      severity: "MEDIUM",
      title: "Invalid Phone Numbers",
      description: `Found ${invalidCount} invalid phone number${invalidCount > 1 ? "s" : ""}.`,
      count: invalidCount,
      examples,
      affectedColumns: phoneColumns,
    });
  }
}

function pushIssue(
  issues: HealthIssue[],
  issue: Omit<HealthIssue, "id">
) {
  issues.push({
    ...issue,
    id: `${issue.type}_${issues.length}`,
  });
}

// Utility to get severity color
export function severityColor(severity: Severity): string {
  switch (severity) {
    case "HIGH": return "text-red-600";
    case "MEDIUM": return "text-amber-600";
    case "LOW": return "text-blue-500";
  }
}

export function severityBg(severity: Severity): string {
  switch (severity) {
    case "HIGH": return "bg-red-50 border-red-200";
    case "MEDIUM": return "bg-amber-50 border-amber-200";
    case "LOW": return "bg-blue-50 border-blue-200";
  }
}
