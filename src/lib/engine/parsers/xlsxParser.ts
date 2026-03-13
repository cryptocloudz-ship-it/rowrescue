import type { ParsedSheet, Row } from "@/types/sheet";

export async function parseXLSX(file: File): Promise<ParsedSheet> {
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch (err) {
    throw new Error(
      `Failed to read Excel file: ${err instanceof Error ? err.message : "corrupted or unsupported format"}`
    );
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("No sheets found in workbook");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${firstSheetName}" is empty or unreadable`);
  }

  const jsonData = XLSX.utils.sheet_to_json<Row>(worksheet, {
    defval: "",
    raw: false,
  });

  const headers =
    jsonData.length > 0
      ? Object.keys(jsonData[0]).filter((h) => h.trim() !== "")
      : [];

  return {
    fileName: file.name,
    fileSize: file.size,
    headers,
    rows: jsonData,
    rowCount: jsonData.length,
    columnCount: headers.length,
  };
}
