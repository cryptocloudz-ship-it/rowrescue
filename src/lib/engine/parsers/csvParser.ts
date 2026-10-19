import type { ParsedSheet, Row } from "@/types/sheet";

interface CsvParseOptions {
  delimiter?: string;
  encoding?: string;
}

/**
 * Decode raw bytes, honouring a BOM if present and falling back to Windows-1252
 * (what Excel on Windows writes) when the bytes are not valid UTF-8.
 */
export function decodeCsvBytes(bytes: Uint8Array, forced?: string): { text: string; encoding: string } {
  if (forced) return { text: new TextDecoder(forced).decode(bytes), encoding: forced };
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { text: new TextDecoder("utf-8").decode(bytes.subarray(3)), encoding: "UTF-8 (BOM)" };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: new TextDecoder("utf-16le").decode(bytes.subarray(2)), encoding: "UTF-16LE" };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { text: new TextDecoder("utf-16be").decode(bytes.subarray(2)), encoding: "UTF-16BE" };
  }
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), encoding: "UTF-8" };
  } catch {
    return { text: new TextDecoder("windows-1252").decode(bytes), encoding: "Windows-1252" };
  }
}

export async function parseCSV(
  file: File,
  options: CsvParseOptions = {}
): Promise<ParsedSheet> {
  const Papa = (await import("papaparse")).default;

  const { text, encoding } = decodeCsvBytes(
    new Uint8Array(await file.arrayBuffer()),
    options.encoding
  );

  return new Promise((resolve, reject) => {
    Papa.parse<Row>(text, {
      header: true,
      skipEmptyLines: "greedy",
      delimiter: options.delimiter || "",
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
          encoding,
        });
      },
      error(error: Error) {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
}
