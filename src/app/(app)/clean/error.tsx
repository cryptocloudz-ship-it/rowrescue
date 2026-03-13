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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {error.message || "An unexpected error occurred."}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Don&apos;t worry — your data was never uploaded. It stays in your browser.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
