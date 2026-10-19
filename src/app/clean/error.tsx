"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function CleanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-paper border border-rule rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-700 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-ink">
          Something went wrong
        </h2>
        <p className="text-ink-muted text-sm mt-2 font-medium">
          {error.message || "An unexpected error occurred."}
        </p>
        <p className="text-xs text-ink-muted mt-2">
          Don&apos;t worry — your data was never uploaded. It stays in your browser.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-strong text-sm font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
