"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSheetStore } from "@/store/sheetStore";
import { getPlanLimits } from "@/config/plans";

/** Pulls the signed-in user's plan (their own, or their team's) from /api/entitlements into the sheet store so paid limits apply client-side. */
export function EntitlementsSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const setEntitlements = useSheetStore((s) => s.setEntitlements);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setEntitlements(null);
      return;
    }
    let cancelled = false;
    fetch("/api/entitlements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          // Limits come from the shared plan config: JSON turns the API's Infinity limits into null
          setEntitlements({ signedIn: true, plan: data.plan, limits: getPlanLimits(data.plan), team: data.team ?? null });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setEntitlements]);

  return null;
}
