"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { CONSENT_EVENT } from "./CookieConsent";

/** Loads Google Analytics only after the visitor has accepted cookies. */
export function ConsentedAnalytics({ gaId }: { gaId: string }) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setConsented(localStorage.getItem("rowrescue_cookie_consent") === "accepted");
      } catch {
        setConsented(false);
      }
    };
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  return consented ? <GoogleAnalytics gaId={gaId} /> : null;
}
