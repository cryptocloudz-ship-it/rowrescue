import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the signed-in app is protected. Marketing and tool pages must stay public (and indexable),
// so new SEO pages don't need to be registered here.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/billing(.*)",
  "/files(.*)",
  "/automations(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  // Next.js 16 calls this file the proxy (formerly middleware).
  // Clerk only runs where server-side auth is needed. Marketing and tool pages are static and use
  // client-side auth UI, so skipping them keeps TTFB low and avoids auth redirects for crawlers.
  matcher: [
    "/(api|trpc)(.*)",
    "/dashboard(.*)",
    "/billing(.*)",
    "/files(.*)",
    "/automations(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
};
