import type { ParsedSheet, Row } from "@/types/sheet";

interface CsvParseOptions {
  delimiter?: string;
  encoding?: string;
}

export async function parseCSV(
  file: File,
  options: CsvParseOptions = {}
): Promise<ParsedSheet> {
  const Papa = (await import("papaparse")).default;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      delimiter: options.delimiter || "",
      encoding: options.encoding || "UTF-8",
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
      complete(results) {
        const rows = results.data as Row[];
        const headers =
          results.meta.fields?.filter((f) => f.trim() !== "") ?? [];
        const detectedDelimiter = results.meta.delimiter;

        resolve({
          fileName: file.name,
          fileSize: file.size,
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          delimiter: detectedDelimiter,
          encoding: options.encoding || "UTF-8",
        });
      },
      error(error: Error) {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
}
