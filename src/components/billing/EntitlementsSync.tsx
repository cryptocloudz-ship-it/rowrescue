"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSheetStore } from "@/store/sheetStore";

/** Pulls the signed-in user's plan from /api/entitlements into the sheet store so paid limits apply client-side. */
export function EntitlementsSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const setIsPro = useSheetStore((s) => s.setIsPro);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setIsPro(false);
      return;
    }
    let cancelled = false;
    fetch("/api/entitlements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setIsPro(data.plan !== "free");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setIsPro]);

  return null;
}
