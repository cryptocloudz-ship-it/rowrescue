"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onUndo?: () => void;
  onExport?: () => void;
  onBack?: () => void;
  onRun?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      // Don't fire shortcuts when typing in inputs
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+Z → Undo (back to rules)
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Ctrl/Cmd+Shift+E → Export
      if (mod && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      // Ctrl/Cmd+Enter → Run cleaning
      if (mod && e.key === "Enter") {
        e.preventDefault();
        handlers.onRun?.();
        return;
      }

      // Escape → Back
      if (e.key === "Escape") {
        e.preventDefault();
        handlers.onBack?.();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
