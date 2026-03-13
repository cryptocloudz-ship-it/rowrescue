import type { Row } from "@/types/sheet";

export async function exportToXLSX(rows: Row[], headers: string[]): Promise<Uint8Array> {
  const XLSX = await import("xlsx");

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}
