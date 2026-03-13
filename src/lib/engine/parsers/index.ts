import type { ParsedSheet } from "@/types/sheet";
import { parseCSV } from "./csvParser";
import { parseXLSX } from "./xlsxParser";

const CSV_EXTENSIONS = [".csv", ".tsv", ".txt"];
const XLSX_EXTENSIONS = [".xlsx", ".xls"];

export async function parseFile(file: File): Promise<ParsedSheet> {
  const ext = getExtension(file.name);

  if (CSV_EXTENSIONS.includes(ext)) {
    return parseCSV(file);
  }

  if (XLSX_EXTENSIONS.includes(ext)) {
    return parseXLSX(file);
  }

  throw new Error(
    `Unsupported file type: ${ext}. Supported: CSV, TSV, XLSX.`
  );
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export { parseCSV } from "./csvParser";
export { parseXLSX } from "./xlsxParser";
