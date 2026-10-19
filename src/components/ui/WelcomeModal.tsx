"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { loadDemoData } = useSheetStore();

  useEffect(() => {
    // Visitors arriving from a tool page already have a file loaded; don't interrupt them
    if (useSheetStore.getState().stage !== "idle") return;
    const hasSeenWelcome = localStorage.getItem("rowrescue_welcome_seen");
    if (!hasSeenWelcome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      localStorage.setItem("rowrescue_welcome_seen", "true");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 font-ui">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-md rounded-[10px] border border-rule-strong bg-paper shadow-frame p-7 relative"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-md text-ink-muted hover:bg-surface hover:text-ink"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 id="welcome-title" className="text-[24px] leading-tight font-semibold tracking-[-0.01em] pr-8">
          How the cleaner works
        </h2>
        <ol className="mt-5 border-t border-rule text-[15px]">
          <li className="flex gap-4 py-3 border-b border-rule">
            <span className="font-data text-sm text-accent w-4 shrink-0 pt-0.5">1</span>
            <span className="text-ink-body">Choose a CSV or Excel file. It is read in your browser and never uploaded.</span>
          </li>
          <li className="flex gap-4 py-3 border-b border-rule">
            <span className="font-data text-sm text-accent w-4 shrink-0 pt-0.5">2</span>
            <span className="text-ink-body">Review the issues found and pick which rules to apply.</span>
          </li>
          <li className="flex gap-4 py-3 border-b border-rule">
            <span className="font-data text-sm text-accent w-4 shrink-0 pt-0.5">3</span>
            <span className="text-ink-body">Preview every change, then download the cleaned copy and its change log.</span>
          </li>
        </ol>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              loadDemoData();
            }}
            className="min-h-11 px-4 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted"
          >
            Use sample data
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="min-h-11 px-4 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-strong"
          >
            Choose my own file
          </button>
        </div>
      </div>
    </div>
  );
}
