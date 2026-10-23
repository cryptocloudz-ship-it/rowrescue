"use client";

import dynamic from "next/dynamic";
import { useSessionHint } from "@/components/auth/clientAuth";

// Clerk plus EntitlementsSync, loaded only for visitors with a session cookie
const ClerkEntitlements = dynamic(() => import("./ClerkEntitlements").then((m) => m.ClerkEntitlements), { ssr: false });

/**
 * EntitlementsSync for pages without the root Clerk provider (tool and guide pages). Signed-out visitors, who get the
 * Free limits anyway, never download Clerk; signed-in ones load it so their plan's row limit applies to the upload.
 */
export function SignedInEntitlements() {
  const signedIn = useSessionHint();
  return signedIn ? <ClerkEntitlements /> : null;
}
