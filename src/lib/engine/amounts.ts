/**
 * Reads a money or quantity cell the way a bookkeeper would, whatever its format:
 * "€1.250,00", "1,980.50", "$450.00", "(450.00)", "-12", "450.00-", "EUR 99", 42.
 * Returns null for anything that isn't clearly a single number (dates, IDs with letters, phones).
 */

const CURRENCY_SYMBOLS = /[$€£¥₹₽₩₪]/g;
const CURRENCY_CODE_LIST = "EUR|USD|GBP|JPY|CHF|CAD|AUD|NZD|SEK|NOK|DKK|PLN|CZK|HUF|INR|CNY|HKD|SGD|ZAR|MXN|BRL";
const CURRENCY_CODES = new RegExp(`^(?:${CURRENCY_CODE_LIST})\\s*|\\s*(?:${CURRENCY_CODE_LIST})$`, "g");

export interface Amount {
  value: number;
  /** Decimal places as written, e.g. 2 for "€1.250,00" (used to print totals at the file's precision). */
  decimals: number;
}

export function parseAmount(value: unknown): number | null {
  return readAmount(value)?.value ?? null;
}

export function readAmount(value: unknown): Amount | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    const text = String(value);
    return { value, decimals: text.includes(".") ? text.split(".")[1].length : 0 };
  }
  if (typeof value !== "string") return null;

  let s = value.trim();
  if (!s) return null;

  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  s = s.replace(CURRENCY_SYMBOLS, "").replace(CURRENCY_CODES, "").trim();
  if (s.startsWith("-")) {
    negative = !negative;
    s = s.slice(1).trim();
  } else if (s.endsWith("-")) {
    negative = !negative;
    s = s.slice(0, -1).trim();
  } else if (s.startsWith("+")) {
    s = s.slice(1).trim();
  }
  s = s.replace(CURRENCY_SYMBOLS, "").replace(/[\s ']/g, "");

  if (!/^\d[\d.,]*$|^[.,]\d+$/.test(s)) return null;

  const normalized = toPlainDecimal(s);
  if (normalized === null) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  const decimals = normalized.includes(".") ? normalized.split(".")[1].length : 0;
  return { value: negative && n !== 0 ? -n : n, decimals };
}

/** Turns "1.250,00" / "1,250.00" / "1,250" / "12,5" into "1250.00" / "1250.00" / "1250" / "12.5". */
function toPlainDecimal(s: string): string | null {
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: whichever comes last is the decimal separator
    const decimal = lastDot > lastComma ? "." : ",";
    const thousands = decimal === "." ? "," : ".";
    const [intPart, frac, ...rest] = s.split(decimal);
    if (rest.length > 0 || !validGrouping(intPart, thousands)) return null;
    return `${intPart.split(thousands).join("")}.${frac}`;
  }

  if (lastComma !== -1) {
    // Only commas: grouped thousands ("1,250", "1,250,000") or a decimal comma ("12,5")
    if (/^\d{1,3}(,\d{3})+$/.test(s)) return s.replace(/,/g, "");
    if (/^\d*,\d+$/.test(s)) return s.replace(",", ".");
    return null;
  }

  if (lastDot !== -1) {
    // Only dots: several dots mean thousands grouping ("1.250.000"); one dot is a decimal point
    if ((s.match(/\./g) ?? []).length > 1) return /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, "") : null;
    return s;
  }

  return s;
}

function validGrouping(intPart: string, sep: string): boolean {
  if (!intPart.includes(sep)) return /^\d+$/.test(intPart);
  return new RegExp(`^\\d{1,3}(\\${sep}\\d{3})+$`).test(intPart);
}
