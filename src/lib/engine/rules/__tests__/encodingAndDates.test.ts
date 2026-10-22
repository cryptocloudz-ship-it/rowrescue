import { describe, it, expect } from "vitest";
import { fixEncoding, repairMojibake } from "../fixEncoding";
import { normalizeDate, detectDateOrder } from "../normalizeDate";
import { decodeCsvBytes } from "../../parsers/csvParser";
import { generateHealthReport } from "../../healthReport";

describe("fixEncoding", () => {
  it("repairs UTF-8 text misread as Windows-1252", () => {
    expect(repairMojibake("CafÃ©")).toBe("Café");
    expect(repairMojibake("Ã–sterreich")).toBe("Österreich");
    expect(repairMojibake("donâ€™t")).toBe("don’t");
    expect(repairMojibake("â‚¬100")).toBe("€100");
  });

  it("repairs double-encoded text", () => {
    const result = fixEncoding([{ city: "MÃƒÂ¼nchen" }]);
    expect(result.rows[0].city).toBe("München");
  });

  it("leaves correct text alone", () => {
    for (const ok of ["Café", "naïve", "Zürich", "plain ascii", "Â", "€100"]) {
      expect(repairMojibake(ok)).toBeNull();
    }
    const result = fixEncoding([{ a: "Café", b: 3 }]);
    expect(result.stats.cellsChanged).toBe(0);
  });

  it("is detected by the health report", () => {
    const report = generateHealthReport([{ name: "JosÃ©" }, { name: "Ann" }], ["name"]);
    expect(report.issues.find((i) => i.type === "encoding_issues")?.count).toBe(1);
  });
});

describe("decodeCsvBytes", () => {
  it("decodes UTF-8, strips BOM, and falls back to Windows-1252", () => {
    const utf8 = new TextEncoder().encode("name\nCafé");
    expect(decodeCsvBytes(utf8)).toEqual({ text: "name\nCafé", encoding: "UTF-8" });
    expect(decodeCsvBytes(new Uint8Array([0xef, 0xbb, 0xbf, ...utf8])).text).toBe("name\nCafé");
    // "Café" as Windows-1252 bytes: é = 0xE9 (invalid as UTF-8)
    const cp1252 = new Uint8Array([0x43, 0x61, 0x66, 0xe9]);
    expect(decodeCsvBytes(cp1252)).toEqual({ text: "Café", encoding: "Windows-1252" });
  });
});

describe("normalizeDate date order", () => {
  it("infers month-first columns", () => {
    expect(detectDateOrder(["03/04/2024", "12/25/2024"])).toBe("MDY");
    const result = normalizeDate([{ d: "03/04/2024" }, { d: "12/25/2024" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-03-04", "2024-12-25"]);
  });

  it("infers day-first columns", () => {
    const result = normalizeDate([{ d: "03/04/2024" }, { d: "25/12/2024" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-04-03", "2024-12-25"]);
  });

  it("detects order per column independently", () => {
    const result = normalizeDate([
      { us: "03/04/2024", eu: "03.04.2024" },
      { us: "12/31/2024", eu: "31.12.2024" },
    ]);
    expect(result.rows[0]).toEqual({ us: "2024-03-04", eu: "2024-04-03" });
  });

  it("reads two-digit years in a day-first column day-first", () => {
    expect(detectDateOrder(["03/04/24", "25/12/24"])).toBe("DMY");
    const result = normalizeDate([{ d: "03/04/24" }, { d: "25/12/24" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-04-03", "2024-12-25"]);
  });

  it("reads two-digit years in a month-first column month-first", () => {
    expect(detectDateOrder(["03/04/24", "12/25/24"])).toBe("MDY");
    const result = normalizeDate([{ d: "03-04-24" }, { d: "12-25-24" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-03-04", "2024-12-25"]);
  });

  it("reads two-digit years day-first when the column has no evidence", () => {
    const result = normalizeDate([{ d: "03.04.24" }, { d: "05.06.24" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-04-03", "2024-06-05"]);
  });

  it("puts two-digit years 00-29 in the 2000s and 30-99 in the 1900s", () => {
    const result = normalizeDate([{ d: "15/01/29" }, { d: "15/01/30" }, { d: "15/01/99" }, { d: "15/01/00" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2029-01-15", "1930-01-15", "1999-01-15", "2000-01-15"]);
  });

  it("uses two-digit-year dates as order evidence for four-digit ones", () => {
    const result = normalizeDate([{ d: "03/04/2024" }, { d: "25/12/24" }]);
    expect(result.rows.map((r) => r.d)).toEqual(["2024-04-03", "2024-12-25"]);
  });

  it("honours an explicit order", () => {
    const result = normalizeDate([{ d: "03/04/2024" }], { targetFormat: "YYYY-MM-DD", dateOrder: "MDY" });
    expect(result.rows[0].d).toBe("2024-03-04");
  });
});
