/**
 * Retired guide slugs and the guide that replaced each one. Served as permanent (308) redirects
 * from next.config.ts; guides.test.ts checks that every target exists and no source is still live.
 */
export const GUIDE_REDIRECTS: Record<string, string> = {
  "csv-garbled-characters-excel": "fix-garbled-characters-in-csv",
  "csv-dates-day-month-swapped": "stop-excel-changing-dates-in-csv",
};
