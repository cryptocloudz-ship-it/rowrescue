/**
 * Lightweight GA4 event wrapper.
 * Only fires if gtag is loaded (i.e. GA_MEASUREMENT_ID is set and consent given).
 */

type EventParams = Record<string, string | number | boolean>;

function gtag(...args: [string, string, EventParams?]) {
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag("event", args[1], args[2]);
  }
}

// ── Core funnel events ──

export function trackFileUpload(params: {
  file_type: string;
  row_count: number;
  file_size_bytes: number;
}) {
  gtag("event", "file_upload", params);
}

export function trackDemoLoaded() {
  gtag("event", "demo_loaded", {});
}

export function trackCleaningRun(params: {
  rules_enabled: number;
  row_count: number;
  duration_ms: number;
  changes_count: number;
}) {
  gtag("event", "cleaning_run", params);
}

export function trackExport(params: {
  format: string;
  row_count: number;
  is_pro: boolean;
}) {
  gtag("event", "export_completed", params);
}

export function trackCheckoutStarted(params: {
  plan: string;
  billing_period: string;
}) {
  gtag("event", "begin_checkout", params);
}

export function trackUpgradeClicked(params: {
  location: string;
}) {
  gtag("event", "upgrade_clicked", params);
}
