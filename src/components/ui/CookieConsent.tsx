"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

export const CONSENT_EVENT = "spreadsheetfix:cookie-consent";

const CONSENT_KEY = "rowrescue_cookie_consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function CookieConsent() {
  // Hidden on the server and until the client confirms no choice has been stored.
  const isVisible = useSyncExternalStore(
    subscribe,
    () => !localStorage.getItem(CONSENT_KEY),
    () => false,
  );

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  // ConsentedAnalytics only loads on "accepted", so the event here just hides the banner.
  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  if (!isVisible) return null;

  // Both choices get equal weight, so declining is as easy as accepting
  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] p-3 sm:p-6 pointer-events-none font-ui"
    >
      <div className="max-w-[880px] mx-auto rounded-lg border border-rule-strong bg-paper shadow-frame px-5 py-4 pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p className="flex-1 min-w-0 text-sm leading-relaxed text-ink-body">
          We use essential cookies to run the site and, if you accept, anonymised analytics. Your files are processed in
          your browser either way.{" "}
          <Link href="/legal/cookie-policy" className="text-accent hover:text-accent-strong underline underline-offset-2">
            Cookie policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 sm:flex-none min-h-10 px-4 rounded-md border border-rule-strong bg-paper text-ink text-sm font-medium hover:border-ink-muted transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 sm:flex-none min-h-10 px-4 rounded-md border border-rule-strong bg-paper text-ink text-sm font-medium hover:border-ink-muted transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
