export const ACCEPTED_TYPES = [
  "text/csv",
  "text/tab-separated-values",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
export const ACCEPTED_EXTENSIONS = [".csv", ".tsv", ".xlsx", ".xls"];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/** Returns an error message for a file we can't accept, or null if it's fine. */
export function validateFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return "Unsupported file type. Please upload CSV, TSV, or XLSX.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum size is 50MB.";
  }
  return null;
}
