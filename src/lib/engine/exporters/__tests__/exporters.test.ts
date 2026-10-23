import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { exportToCSV } from "../csvExporter";
import { exportToXLSX } from "../xlsxExporter";

const headers = ["date", "amount"];
const rows = [
  { date: "2026-09-01", amount: "10.00" },
  { date: "2026-09-02", amount: "20.00" },
];

async function xlsxRows(includeHeaders?: boolean): Promise<unknown[][]> {
  const bytes = await exportToXLSX(rows, headers, includeHeaders === undefined ? {} : { includeHeaders });
  const wb = XLSX.read(bytes, { type: "array" });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
}

describe("header row on export", () => {
  it("writes the header row in CSV by default and leaves it out when asked", () => {
    expect(exportToCSV(rows, headers)).toBe("date,amount\n2026-09-01,10.00\n2026-09-02,20.00");
    expect(exportToCSV(rows, headers, { includeHeaders: false })).toBe("2026-09-01,10.00\n2026-09-02,20.00");
  });

  it("writes the header row in Excel by default and leaves it out when asked", async () => {
    expect(await xlsxRows()).toEqual([headers, ["2026-09-01", "10.00"], ["2026-09-02", "20.00"]]);
    expect(await xlsxRows(false)).toEqual([["2026-09-01", "10.00"], ["2026-09-02", "20.00"]]);
  });
});
