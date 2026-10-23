"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_OPTIONS } from "@/components/auth/clerkOptions";
import { EntitlementsSync } from "./EntitlementsSync";

/** Lazy-loaded by SignedInEntitlements: Clerk refreshes the session token, then EntitlementsSync reads the plan. */
export function ClerkEntitlements() {
  return (
    <ClerkProvider {...CLERK_OPTIONS}>
      <EntitlementsSync />
    </ClerkProvider>
  );
}
