import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_OPTIONS } from "./clerkOptions";

/**
 * Clerk for the routes that use it: /clean, /pricing (checkout), sign-in/up and the signed-in app.
 * It isn't in the root layout, so static marketing pages don't download Clerk's SDK or clerk-js.
 * Those pages read the signed-in hint from a cookie instead (see clientAuth.ts).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider {...CLERK_OPTIONS}>{children}</ClerkProvider>;
}
