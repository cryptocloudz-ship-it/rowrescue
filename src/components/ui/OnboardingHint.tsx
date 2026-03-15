"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";

interface OnboardingHintProps {
  id: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

function getSeenHints(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("rowrescue_hints_seen");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markHintSeen(id: string) {
  const seen = getSeenHints();
  seen.add(id);
  localStorage.setItem("rowrescue_hints_seen", JSON.stringify([...seen]));
}

export function OnboardingHint({ id, children, position = "top" }: OnboardingHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay show slightly so it feels natural
    const timer = setTimeout(() => {
      if (!getSeenHints().has(id)) {
        setVisible(true);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  function dismiss() {
    setVisible(false);
    markHintSeen(id);
  }

  if (!visible) return null;

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-500 glass-panel border border-primary/30 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(13,242,223,0.1)] relative ${
        position === "bottom" ? "mt-4" : "mb-4"
      }`}
      role="status"
    >
      <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
        <Lightbulb className="w-4 h-4 text-primary" />
      </div>
      <p className="text-sm font-medium text-slate-300 flex-1 leading-relaxed">
        {children}
      </p>
      <button
        onClick={dismiss}
        className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
        aria-label="Dismiss hint"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Reset all hints (for testing) */
export function resetOnboardingHints() {
  localStorage.removeItem("rowrescue_hints_seen");
}
