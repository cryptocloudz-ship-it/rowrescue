/** Canonical site settings. Every absolute URL (canonical, OG, sitemap, JSON-LD) derives from SITE_URL. */
export const SITE_URL = "https://spreadsheetfix.com";
export const SITE_NAME = "SpreadsheetFix";
export const SUPPORT_EMAIL = "support@spreadsheetfix.com";
export const SITE_TITLE = "SpreadsheetFix — Clean Messy CSVs in Seconds";
export const SITE_DESCRIPTION =
  "Remove duplicates, fix formatting, normalize dates, validate emails — all without uploading your data. Privacy-first spreadsheet cleaning, 100% client-side.";

/** Base Open Graph tags. Next replaces (not merges) openGraph per page, so pages spread this in. */
export const DEFAULT_OPEN_GRAPH = {
  title: SITE_TITLE,
  description: "Privacy-first spreadsheet cleaning. 100% client-side data processing.",
  siteName: SITE_NAME,
  type: "website" as const,
  locale: "en",
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} — Clean messy spreadsheets in seconds`,
    },
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
