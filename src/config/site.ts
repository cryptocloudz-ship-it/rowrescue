/** Canonical site settings. Every absolute URL (canonical, OG, sitemap, JSON-LD) derives from SITE_URL. */
export const SITE_URL = "https://spreadsheetfix.com";
export const SITE_NAME = "SpreadsheetFix";
export const SITE_TITLE = "SpreadsheetFix — Clean Messy CSVs in Seconds";
export const SITE_DESCRIPTION =
  "Remove duplicates, fix formatting, normalize dates, validate emails — all without uploading your data. Privacy-first spreadsheet cleaning, 100% client-side.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
