import type { NextConfig } from "next";
import { GUIDE_REDIRECTS } from "./src/config/redirects";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Google crawled /home (never a real route); send it to the homepage instead of a 404
      { source: "/home", destination: "/", permanent: true },
      ...Object.entries(GUIDE_REDIRECTS).map(([from, to]) => ({
        source: `/guides/${from}`,
        destination: `/guides/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      // The production build is also served on *.vercel.app aliases, where robots.txt allows crawling
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.spreadsheetfix.com https://cdn.protect.clerk.com https://challenges.cloudflare.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.clerk.com https://www.googletagmanager.com",
              "font-src 'self'",
              "worker-src 'self' blob:",
              "connect-src 'self' https://api.stripe.com https://*.clerk.accounts.dev https://clerk.spreadsheetfix.com https://*.protect.clerk.com https://*.protect.clerk.com:* https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://clerk.spreadsheetfix.com https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
