/** Canonical site settings. Every absolute URL (canonical, OG, sitemap, JSON-LD) derives from SITE_URL. */
export const SITE_URL = "https://spreadsheetfix.com";
export const SITE_NAME = "SpreadsheetFix";
export const SUPPORT_EMAIL = "support@spreadsheetfix.com";
/** Who runs the service (a sole trader): named on the legal pages as data controller and contracting party. */
export const OPERATOR_NAME = "William Kelly, trading as SpreadsheetFix";
export const OPERATOR_ADDRESS = ["1a Foxfield Saint John", "Raheny", "Dublin 5", "Ireland"];
/** Homepage title: keyword first, brand comes from og:site_name and the WebSite JSON-LD. Keep ≤60 chars. */
export const SITE_TITLE = "CSV Cleaner for Bank & Transaction Exports — Free & Private";
/** Keep ≤160 chars */
export const SITE_DESCRIPTION =
  "Clean CSV and Excel bank exports without uploading them: remove duplicates, fix dates and amounts, then check the totals still match. Free to start.";
/** Shorter line for social cards */
export const SOCIAL_DESCRIPTION = "A CSV and Excel cleaner for bank and transaction exports. Runs in your browser; nothing is uploaded.";
/** Square logo for Organization JSON-LD (served by src/app/logo.png/route.tsx) */
export const LOGO_PATH = "/logo.png";

/** Base Open Graph tags. Next replaces (not merges) openGraph per page, so pages spread this in. */
export const DEFAULT_OPEN_GRAPH = {
  title: SITE_TITLE,
  description: SOCIAL_DESCRIPTION,
  siteName: SITE_NAME,
  type: "website" as const,
  locale: "en",
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} — clean transaction exports before they reach your books`,
    },
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
