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
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel border border-rose-500/20 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <AlertCircle className="w-12 h-12 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-100">
          Something went wrong
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          {error.message || "An unexpected error occurred."}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Don&apos;t worry — your data was never uploaded. It stays in your browser.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-xl hover:brightness-110 text-sm font-bold transition-all neon-glow"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
