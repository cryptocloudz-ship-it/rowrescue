/** Shared ClerkProvider props, used by the server provider on auth routes and the lazy one on marketing pages. */
export const CLERK_OPTIONS = {
  // No usage telemetry to Clerk; it would also need a CSP exception
  telemetry: false as const,
  appearance: {
    variables: { colorPrimary: "#1f3d99", colorText: "#0e1525", fontFamily: "var(--font-plex-sans), system-ui, sans-serif", borderRadius: "6px" },
    // Email sign-in only: Google is enabled in Clerk production but has no OAuth credentials yet.
    // Remove these two lines once custom Google credentials are added in Clerk.
    elements: { socialButtonsRoot: { display: "none" }, dividerRow: { display: "none" } },
  },
};
