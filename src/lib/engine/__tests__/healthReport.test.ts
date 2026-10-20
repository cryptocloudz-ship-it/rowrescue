import { describe, it, expect } from "vitest";
import { generateHealthReport } from "../healthReport";
import { trimWhitespace } from "../rules/trimWhitespace";

describe("health report: stray spaces", () => {
  const rows = [
    { vendor: "Acme Supplies  ", ref: "INV-1" },
    { vendor: "  Northwind", ref: "INV-2" },
    { vendor: "Blue  Pine", ref: "INV-3\t" },
    { vendor: "Harbor Freight", ref: "INV-4" },
  ];

  it("counts leading, trailing, repeated and tab whitespace", () => {
    const issue = generateHealthReport(rows, ["vendor", "ref"]).issues.find((i) => i.type === "stray_whitespace");
    expect(issue?.count).toBe(4);
    expect(issue?.affectedColumns).toEqual(["vendor", "ref"]);
  });

  it("flags exactly the cells Trim Whitespace changes", () => {
    const issue = generateHealthReport(rows, ["vendor", "ref"]).issues.find((i) => i.type === "stray_whitespace");
    expect(issue?.count).toBe(trimWhitespace(rows).changes.length);
  });

  it("is silent on clean text and non-string cells", () => {
    const report = generateHealthReport([{ a: "Acme Supplies", b: 42 }, { a: "Ben", b: null }], ["a", "b"]);
    expect(report.issues.find((i) => i.type === "stray_whitespace")).toBeUndefined();
  });
});

describe("health report: counts are in cells", () => {
  it("counts the dates Normalize Dates would change, not the columns", () => {
    const rows = [{ date: "03/09/2026" }, { date: "2026-09-04" }, { date: "5 Sep 2026" }, { date: "2026-09-08" }];
    const issue = generateHealthReport(rows, ["date"]).issues.find((i) => i.type === "date_inconsistency");
    expect(issue?.count).toBe(2);
    expect(issue?.description).toBe("2 dates in 1 column use a different format from the rest.");
  });

  it("counts the amounts Normalize Numbers would change, not the columns", () => {
    const rows = [{ amount: "€1.250,00" }, { amount: "312.00" }, { amount: "$450.00" }];
    const issue = generateHealthReport(rows, ["amount"]).issues.find((i) => i.type === "number_format");
    expect(issue?.count).toBe(2);
  });
});
