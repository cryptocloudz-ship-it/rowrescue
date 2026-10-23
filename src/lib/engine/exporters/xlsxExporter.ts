import type { Row } from "@/types/sheet";

interface XlsxExportOptions {
  includeHeaders?: boolean;
}

export async function exportToXLSX(rows: Row[], headers: string[], options: XlsxExportOptions = {}): Promise<Uint8Array> {
  const { includeHeaders = true } = options;
  const XLSX = await import("xlsx");

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers, skipHeader: !includeHeaders });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}
