import { describe, it, expect } from "vitest";
import { trimWhitespace } from "../trimWhitespace";
import { removeEmptyRows } from "../removeEmptyRows";
import { removeEmptyColumns } from "../removeEmptyColumns";
import { deduplicateRows } from "../deduplicateRows";
import { normalizeHeaders } from "../normalizeHeaders";
import { validateEmail } from "../validateEmail";
import { stripHtml } from "../stripHtml";
import { normalizeDate } from "../normalizeDate";
import { normalizeNumbers } from "../normalizeNumbers";
import { normalizePhone } from "../normalizePhone";
import { normalizeEmail } from "../normalizeEmail";
import { normalizeCase } from "../normalizeCase";
import { validatePhone } from "../validatePhone";
import { validateRequired } from "../validateRequired";
import { validateRange } from "../validateRange";
import { renameColumns } from "../renameColumns";
import { reorderColumns } from "../reorderColumns";

// ─── trimWhitespace ──────────────────────────────────────────────────────────

describe("trimWhitespace", () => {
  it("trims leading/trailing whitespace", () => {
    const rows = [{ name: "  Alice  ", age: "30" }];
    const result = trimWhitespace(rows);
    expect(result.rows[0].name).toBe("Alice");
    expect(result.stats.cellsChanged).toBe(1);
  });

  it("collapses internal whitespace", () => {
    const rows = [{ name: "John   Doe" }];
    const result = trimWhitespace(rows);
    expect(result.rows[0].name).toBe("John Doe");
  });

  it("only targets specified columns", () => {
    const rows = [{ name: "  Alice  ", city: "  NYC  " }];
    const result = trimWhitespace(rows, { columns: ["name"] });
    expect(result.rows[0].name).toBe("Alice");
    expect(result.rows[0].city).toBe("  NYC  ");
  });

  it("skips non-string values", () => {
    const rows = [{ name: "Alice", count: 42 }];
    const result = trimWhitespace(rows);
    expect(result.rows[0].count).toBe(42);
    expect(result.stats.cellsChanged).toBe(0);
  });

  it("returns empty changes for already clean data", () => {
    const rows = [{ name: "Alice" }];
    const result = trimWhitespace(rows);
    expect(result.changes).toHaveLength(0);
  });
});

// ─── removeEmptyRows ─────────────────────────────────────────────────────────

describe("removeEmptyRows", () => {
  it("removes rows where all values are empty", () => {
    const rows = [
      { name: "Alice", age: "30" },
      { name: "", age: "" },
      { name: "Bob", age: "25" },
    ];
    const result = removeEmptyRows(rows);
    expect(result.rows).toHaveLength(2);
    expect(result.stats.rowsRemoved).toBe(1);
  });

  it("removes rows with null/undefined values", () => {
    const rows = [
      { name: null, age: undefined },
      { name: "Alice", age: "30" },
    ];
    const result = removeEmptyRows(rows);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe("Alice");
  });

  it("keeps rows with at least one non-empty value", () => {
    const rows = [{ name: "", age: "30" }];
    const result = removeEmptyRows(rows);
    expect(result.rows).toHaveLength(1);
  });

  it("handles empty input", () => {
    const result = removeEmptyRows([]);
    expect(result.rows).toHaveLength(0);
    expect(result.stats.rowsRemoved).toBe(0);
  });

  it("treats whitespace-only as empty", () => {
    const rows = [{ name: "   ", age: "  " }];
    const result = removeEmptyRows(rows);
    expect(result.rows).toHaveLength(0);
    expect(result.stats.rowsRemoved).toBe(1);
  });
});

// ─── removeEmptyColumns ──────────────────────────────────────────────────────

describe("removeEmptyColumns", () => {
  it("removes columns where all values are empty", () => {
    const rows = [
      { name: "Alice", notes: "", age: "30" },
      { name: "Bob", notes: "", age: "25" },
    ];
    const result = removeEmptyColumns(rows);
    expect(result.rows[0]).not.toHaveProperty("notes");
    expect(result.rows[0]).toHaveProperty("name");
  });

  it("keeps columns with at least one value", () => {
    const rows = [
      { name: "Alice", notes: "" },
      { name: "Bob", notes: "hello" },
    ];
    const result = removeEmptyColumns(rows);
    expect(result.rows[0]).toHaveProperty("notes");
  });

  it("handles empty input", () => {
    const result = removeEmptyColumns([]);
    expect(result.rows).toHaveLength(0);
  });

  it("returns unchanged data when no columns are empty", () => {
    const rows = [{ name: "Alice", age: "30" }];
    const result = removeEmptyColumns(rows);
    expect(result.changes).toHaveLength(0);
  });
});

// ─── deduplicateRows ─────────────────────────────────────────────────────────

describe("deduplicateRows", () => {
  it("removes exact duplicate rows", () => {
    const rows = [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
      { name: "Alice", age: "30" },
    ];
    const result = deduplicateRows(rows);
    expect(result.rows).toHaveLength(2);
    expect(result.stats.rowsRemoved).toBe(1);
  });

  it("deduplicates by key columns", () => {
    const rows = [
      { name: "Alice", age: "30" },
      { name: "Alice", age: "31" },
    ];
    const result = deduplicateRows(rows, {
      mode: "by_columns",
      keyColumns: ["name"],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].age).toBe("30"); // keeps first occurrence
  });

  it("keeps all rows when no duplicates", () => {
    const rows = [
      { name: "Alice" },
      { name: "Bob" },
    ];
    const result = deduplicateRows(rows);
    expect(result.rows).toHaveLength(2);
    expect(result.stats.rowsRemoved).toBe(0);
  });

  it("handles empty input", () => {
    const result = deduplicateRows([]);
    expect(result.rows).toHaveLength(0);
  });
});

// ─── normalizeHeaders ────────────────────────────────────────────────────────

describe("normalizeHeaders", () => {
  it("converts headers to lowercase_underscore by default", () => {
    const rows = [{ "First Name": "Alice", "Last Name": "Smith" }];
    const result = normalizeHeaders(rows);
    expect(result.rows[0]).toHaveProperty("first_name");
    expect(result.rows[0]).toHaveProperty("last_name");
  });

  it("converts headers to camelCase", () => {
    const rows = [{ "First Name": "Alice" }];
    const result = normalizeHeaders(rows, { style: "camelCase" });
    expect(result.rows[0]).toHaveProperty("firstName");
  });

  it("converts headers to lowercase-dash", () => {
    const rows = [{ "First Name": "Alice" }];
    const result = normalizeHeaders(rows, { style: "lowercase_dash" });
    expect(result.rows[0]).toHaveProperty("first-name");
  });

  it("handles empty input", () => {
    const result = normalizeHeaders([]);
    expect(result.rows).toHaveLength(0);
  });

  it("does not change already-normalized headers", () => {
    const rows = [{ first_name: "Alice" }];
    const result = normalizeHeaders(rows);
    expect(result.changes).toHaveLength(0);
  });
});

// ─── validateEmail ───────────────────────────────────────────────────────────

describe("validateEmail", () => {
  it("flags invalid email addresses", () => {
    const rows = [
      { email: "valid@example.com" },
      { email: "not-an-email" },
    ];
    const result = validateEmail(rows);
    expect(result.quarantined).toHaveLength(1);
    expect(result.quarantined[0].originalIndex).toBe(1);
  });

  it("does not flag valid emails", () => {
    const rows = [{ email: "user@domain.co.uk" }];
    const result = validateEmail(rows);
    expect(result.quarantined).toHaveLength(0);
  });

  it("auto-detects email columns", () => {
    const rows = [{ email_address: "bad", name: "Alice" }];
    const result = validateEmail(rows);
    expect(result.quarantined).toHaveLength(1);
  });

  it("uses specified columns", () => {
    const rows = [{ contact: "not-email", email: "valid@test.com" }];
    const result = validateEmail(rows, { columns: ["contact"] });
    expect(result.quarantined).toHaveLength(1);
  });

  it("keeps all rows (quarantine is for review, not deletion)", () => {
    const rows = [{ email: "bad" }];
    const result = validateEmail(rows);
    expect(result.rows).toHaveLength(1);
    expect(result.stats.rowsRemoved).toBe(0);
  });
});

// ─── stripHtml ───────────────────────────────────────────────────────────────

describe("stripHtml", () => {
  it("removes HTML tags from values", () => {
    const rows = [{ bio: "<p>Hello <b>world</b></p>" }];
    const result = stripHtml(rows);
    expect(result.rows[0].bio).toBe("Hello world");
  });

  it("handles self-closing tags", () => {
    const rows = [{ content: "line1<br/>line2" }];
    const result = stripHtml(rows);
    expect(result.rows[0].content).toBe("line1line2");
  });

  it("targets specific columns only", () => {
    const rows = [{ bio: "<b>bold</b>", code: "<div>keep</div>" }];
    const result = stripHtml(rows, { columns: ["bio"] });
    expect(result.rows[0].bio).toBe("bold");
    expect(result.rows[0].code).toBe("<div>keep</div>");
  });

  it("skips non-string values", () => {
    const rows = [{ count: 42 }];
    const result = stripHtml(rows);
    expect(result.rows[0].count).toBe(42);
    expect(result.stats.cellsChanged).toBe(0);
  });

  it("no changes for clean text", () => {
    const rows = [{ name: "Alice" }];
    const result = stripHtml(rows);
    expect(result.changes).toHaveLength(0);
  });
});

// ─── normalizeDate ───────────────────────────────────────────────────────────

describe("normalizeDate", () => {
  it("normalizes DD/MM/YYYY to YYYY-MM-DD", () => {
    const rows = [{ date: "25/12/2023" }];
    const result = normalizeDate(rows, { columns: ["date"] });
    expect(result.rows[0].date).toBe("2023-12-25");
  });

  it("normalizes Month DD, YYYY", () => {
    const rows = [{ date: "January 15, 2023" }];
    const result = normalizeDate(rows, { columns: ["date"] });
    expect(result.rows[0].date).toBe("2023-01-15");
  });

  it("normalizes DD.MM.YYYY", () => {
    const rows = [{ date: "15.06.2023" }];
    const result = normalizeDate(rows, { columns: ["date"] });
    expect(result.rows[0].date).toBe("2023-06-15");
  });

  it("supports custom target format", () => {
    const rows = [{ date: "2023-01-15" }];
    const result = normalizeDate(rows, {
      columns: ["date"],
      targetFormat: "DD/MM/YYYY",
    });
    expect(result.rows[0].date).toBe("15/01/2023");
  });

  it("skips non-date values", () => {
    const rows = [{ name: "Alice", date: "hello" }];
    const result = normalizeDate(rows, { columns: ["date"] });
    expect(result.rows[0].date).toBe("hello");
    expect(result.changes).toHaveLength(0);
  });

  it("leaves already-formatted dates unchanged", () => {
    const rows = [{ date: "2023-01-15" }];
    const result = normalizeDate(rows, { columns: ["date"] });
    expect(result.changes).toHaveLength(0);
  });
});

// ─── normalizeNumbers ────────────────────────────────────────────────────────

describe("normalizeNumbers", () => {
  it("removes currency symbols", () => {
    const rows = [{ price: "$1,234.56" }];
    const result = normalizeNumbers(rows);
    expect(result.rows[0].price).toBe("1234.56");
  });

  it("handles European format (dot thousands, comma decimal)", () => {
    const rows = [{ price: "1.234,56" }];
    const result = normalizeNumbers(rows);
    expect(result.rows[0].price).toBe("1234.56");
  });

  it("handles US thousands (comma separator)", () => {
    const rows = [{ amount: "1,000,000" }];
    const result = normalizeNumbers(rows);
    expect(result.rows[0].amount).toBe("1000000");
  });

  it("preserves non-numeric strings", () => {
    const rows = [{ name: "Alice" }];
    const result = normalizeNumbers(rows);
    expect(result.rows[0].name).toBe("Alice");
    expect(result.changes).toHaveLength(0);
  });

  it("targets specific columns", () => {
    const rows = [{ price: "$10", code: "$ABC" }];
    const result = normalizeNumbers(rows, { columns: ["price"] });
    expect(result.rows[0].price).toBe("10");
    expect(result.rows[0].code).toBe("$ABC");
  });

  it("handles euro symbol", () => {
    const rows = [{ price: "€99" }];
    const result = normalizeNumbers(rows);
    expect(result.rows[0].price).toBe("99");
  });
});

// ─── normalizePhone ──────────────────────────────────────────────────────────

describe("normalizePhone", () => {
  it("normalizes to E.164 format by default", () => {
    const rows = [{ phone: "(555) 123-4567" }];
    const result = normalizePhone(rows);
    expect(result.rows[0].phone).toBe("+15551234567");
  });

  it("preserves leading + for international numbers", () => {
    const rows = [{ phone: "+44 20 7946 0958" }];
    const result = normalizePhone(rows);
    expect(result.rows[0].phone).toBe("+442079460958");
  });

  it("handles 00 prefix as international", () => {
    const rows = [{ phone: "0044 20 7946 0958" }];
    const result = normalizePhone(rows);
    expect(result.rows[0].phone).toBe("+442079460958");
  });

  it("skips values too short for phone numbers", () => {
    const rows = [{ phone: "123" }];
    const result = normalizePhone(rows);
    expect(result.rows[0].phone).toBe("123");
    expect(result.changes).toHaveLength(0);
  });

  it("targets specific columns", () => {
    const rows = [{ phone: "(555) 123-4567", fax: "(555) 999-8888" }];
    const result = normalizePhone(rows, { columns: ["phone"] });
    expect(result.rows[0].phone).toBe("+15551234567");
    expect(result.rows[0].fax).toBe("(555) 999-8888");
  });
});

// ─── normalizeEmail ──────────────────────────────────────────────────────────

describe("normalizeEmail", () => {
  it("lowercases email addresses", () => {
    const rows = [{ email: "Alice@Example.COM" }];
    const result = normalizeEmail(rows);
    expect(result.rows[0].email).toBe("alice@example.com");
  });

  it("trims whitespace from emails", () => {
    const rows = [{ email: "  user@test.com  " }];
    const result = normalizeEmail(rows);
    expect(result.rows[0].email).toBe("user@test.com");
  });

  it("skips invalid emails (no @ sign)", () => {
    const rows = [{ email: "not-an-email" }];
    const result = normalizeEmail(rows);
    // normalizeEmail skips strings that don't pass EMAIL_REGEX
    expect(result.changes).toHaveLength(0);
  });

  it("no changes for already normalized emails", () => {
    const rows = [{ email: "user@test.com" }];
    const result = normalizeEmail(rows);
    expect(result.changes).toHaveLength(0);
  });

  it("targets specific columns", () => {
    const rows = [{ email: "A@B.COM", backup: "C@D.COM" }];
    const result = normalizeEmail(rows, { columns: ["email"] });
    expect(result.rows[0].email).toBe("a@b.com");
    expect(result.rows[0].backup).toBe("C@D.COM");
  });
});

// ─── normalizeCase ───────────────────────────────────────────────────────────

describe("normalizeCase", () => {
  it("converts to lowercase by default", () => {
    const rows = [{ name: "ALICE" }];
    const result = normalizeCase(rows);
    expect(result.rows[0].name).toBe("alice");
  });

  it("converts to uppercase", () => {
    const rows = [{ name: "alice" }];
    const result = normalizeCase(rows, { caseType: "upper" });
    expect(result.rows[0].name).toBe("ALICE");
  });

  it("converts to title case", () => {
    const rows = [{ name: "alice smith" }];
    const result = normalizeCase(rows, { caseType: "title" });
    expect(result.rows[0].name).toBe("Alice Smith");
  });

  it("targets specific columns", () => {
    const rows = [{ name: "ALICE", code: "ABC" }];
    const result = normalizeCase(rows, { columns: ["name"] });
    expect(result.rows[0].name).toBe("alice");
    expect(result.rows[0].code).toBe("ABC");
  });

  it("no changes for already correct case", () => {
    const rows = [{ name: "alice" }];
    const result = normalizeCase(rows);
    expect(result.changes).toHaveLength(0);
  });
});

// ─── validatePhone ───────────────────────────────────────────────────────────

describe("validatePhone", () => {
  it("flags invalid phone numbers", () => {
    const rows = [
      { phone: "+1 555-123-4567" },
      { phone: "abc123" },
    ];
    const result = validatePhone(rows);
    expect(result.quarantined).toHaveLength(1);
    expect(result.quarantined[0].originalIndex).toBe(1);
  });

  it("accepts valid phone formats", () => {
    const rows = [
      { phone: "+1 (555) 123-4567" },
      { phone: "555.123.4567" },
    ];
    const result = validatePhone(rows);
    expect(result.quarantined).toHaveLength(0);
  });

  it("auto-detects phone columns by name", () => {
    const rows = [{ telephone: "abc", name: "Alice" }];
    const result = validatePhone(rows);
    expect(result.quarantined).toHaveLength(1);
  });

  it("keeps all rows (quarantine is non-destructive)", () => {
    const rows = [{ phone: "abc" }];
    const result = validatePhone(rows);
    expect(result.rows).toHaveLength(1);
    expect(result.stats.rowsRemoved).toBe(0);
  });
});

// ─── validateRequired ────────────────────────────────────────────────────────

describe("validateRequired", () => {
  it("flags rows with missing required fields", () => {
    const rows = [
      { name: "Alice", email: "a@b.com" },
      { name: "", email: "c@d.com" },
      { name: "Bob", email: "" },
    ];
    const result = validateRequired(rows, { columns: ["name", "email"] });
    expect(result.quarantined).toHaveLength(2);
  });

  it("flags null and undefined as missing", () => {
    const rows = [{ name: null, email: undefined }];
    const result = validateRequired(rows, { columns: ["name", "email"] });
    expect(result.quarantined).toHaveLength(1);
    expect(result.changes).toHaveLength(2);
  });

  it("returns no flags when all required fields present", () => {
    const rows = [{ name: "Alice", email: "a@b.com" }];
    const result = validateRequired(rows, { columns: ["name", "email"] });
    expect(result.quarantined).toHaveLength(0);
  });

  it("returns early if no columns specified", () => {
    const rows = [{ name: "" }];
    const result = validateRequired(rows);
    expect(result.quarantined).toHaveLength(0);
    expect(result.changes).toHaveLength(0);
  });

  it("includes missing column names in reason", () => {
    const rows = [{ name: "", email: "" }];
    const result = validateRequired(rows, { columns: ["name", "email"] });
    expect(result.quarantined[0].reason).toContain("name");
    expect(result.quarantined[0].reason).toContain("email");
  });
});

// ─── validateRange ───────────────────────────────────────────────────────────

describe("validateRange", () => {
  it("flags values below minimum", () => {
    const rows = [{ age: "5" }, { age: "25" }];
    const result = validateRange(rows, { column: "age", min: 18 });
    expect(result.quarantined).toHaveLength(1);
    expect(result.quarantined[0].originalIndex).toBe(0);
  });

  it("flags values above maximum", () => {
    const rows = [{ score: "150" }];
    const result = validateRange(rows, { column: "score", max: 100 });
    expect(result.quarantined).toHaveLength(1);
  });

  it("accepts values within range", () => {
    const rows = [{ age: "25" }, { age: "30" }];
    const result = validateRange(rows, { column: "age", min: 18, max: 65 });
    expect(result.quarantined).toHaveLength(0);
  });

  it("skips non-numeric values", () => {
    const rows = [{ age: "hello" }];
    const result = validateRange(rows, { column: "age", min: 0 });
    expect(result.quarantined).toHaveLength(0);
  });

  it("returns early if no column specified", () => {
    const rows = [{ age: "5" }];
    const result = validateRange(rows);
    expect(result.quarantined).toHaveLength(0);
  });

  it("includes range info in quarantine reason", () => {
    const rows = [{ age: "5" }];
    const result = validateRange(rows, { column: "age", min: 18, max: 65 });
    expect(result.quarantined[0].reason).toContain("5");
    expect(result.quarantined[0].reason).toContain("18");
  });
});

// ─── renameColumns ───────────────────────────────────────────────────────────

describe("renameColumns", () => {
  it("renames columns using alias map", () => {
    const rows = [{ fname: "Alice", lname: "Smith" }];
    const result = renameColumns(rows, {
      aliasMap: { fname: "first_name", lname: "last_name" },
    });
    expect(result.rows[0]).toHaveProperty("first_name", "Alice");
    expect(result.rows[0]).toHaveProperty("last_name", "Smith");
    expect(result.rows[0]).not.toHaveProperty("fname");
  });

  it("keeps columns not in alias map unchanged", () => {
    const rows = [{ name: "Alice", age: "30" }];
    const result = renameColumns(rows, { aliasMap: { name: "full_name" } });
    expect(result.rows[0]).toHaveProperty("full_name", "Alice");
    expect(result.rows[0]).toHaveProperty("age", "30");
  });

  it("uses empty alias map by default", () => {
    const rows = [{ name: "Alice" }];
    const result = renameColumns(rows);
    expect(result.rows[0]).toHaveProperty("name", "Alice");
    expect(result.changes).toHaveLength(0);
  });

  it("records changes for renamed columns", () => {
    const rows = [{ old: "val" }];
    const result = renameColumns(rows, { aliasMap: { old: "new" } });
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].originalValue).toBe("old");
    expect(result.changes[0].newValue).toBe("new");
  });
});

// ─── reorderColumns ──────────────────────────────────────────────────────────

describe("reorderColumns", () => {
  it("reorders columns according to specified order", () => {
    const rows = [{ c: 3, a: 1, b: 2 }];
    const result = reorderColumns(rows, { order: ["a", "b", "c"] });
    const keys = Object.keys(result.rows[0]);
    expect(keys).toEqual(["a", "b", "c"]);
  });

  it("appends unlisted columns at the end", () => {
    const rows = [{ c: 3, a: 1, b: 2, d: 4 }];
    const result = reorderColumns(rows, { order: ["a", "b"] });
    const keys = Object.keys(result.rows[0]);
    expect(keys[0]).toBe("a");
    expect(keys[1]).toBe("b");
    expect(keys).toContain("c");
    expect(keys).toContain("d");
  });

  it("handles empty order (keeps original order)", () => {
    const rows = [{ b: 2, a: 1 }];
    const result = reorderColumns(rows);
    const keys = Object.keys(result.rows[0]);
    expect(keys).toEqual(["b", "a"]);
  });

  it("ignores order columns not present in data", () => {
    const rows = [{ a: 1, b: 2 }];
    const result = reorderColumns(rows, { order: ["z", "a", "b"] });
    const keys = Object.keys(result.rows[0]);
    expect(keys).toEqual(["a", "b"]);
  });
});
