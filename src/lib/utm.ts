"use client";

const UTM_KEY = "rowrescue_utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type UtmParams = Partial<Record<(typeof UTM_PARAMS)[number], string>>;

/**
 * Capture UTM params from the URL on page load.
 * Only overwrites if new UTM params are present (first-touch attribution).
 */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const params: UtmParams = {};
  let hasAny = false;

  for (const key of UTM_PARAMS) {
    const val = url.searchParams.get(key);
    if (val) {
      params[key] = val;
      hasAny = true;
    }
  }

  if (hasAny) {
    try {
      localStorage.setItem(UTM_KEY, JSON.stringify(params));
    } catch {
      // localStorage unavailable
    }
  }
}

/**
 * Retrieve stored UTM params for checkout metadata.
 */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(UTM_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
