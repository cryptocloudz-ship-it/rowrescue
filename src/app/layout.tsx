import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { UtmCapture } from "@/components/ui/UtmCapture";
import { ConsentedAnalytics } from "@/components/ui/ConsentedAnalytics";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, DEFAULT_OPEN_GRAPH } from "@/config/site";
import "./globals.css";

// Self-hosted by next/font, so the CSP needs no Google Fonts allowance (see DESIGN.md)
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: DEFAULT_OPEN_GRAPH,
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "Privacy-first spreadsheet cleaning. 100% client-side data processing.",
    images: ["/og-image.png"],
  },
};

// Vercel has this stored as NEXT_PUBLIC_GA_ID; accept either name
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      // No usage telemetry to Clerk; it would also need a CSP exception
      telemetry={false}
      appearance={{
        variables: { colorPrimary: "#1f3d99", colorText: "#0e1525", fontFamily: "var(--font-plex-sans), system-ui, sans-serif", borderRadius: "6px" },
        // Email sign-in only: Google is enabled in Clerk production but has no OAuth credentials yet.
        // Remove these two lines once custom Google credentials are added in Clerk.
        elements: { socialButtonsRoot: { display: "none" }, dividerRow: { display: "none" } },
      }}
    >
      <html lang="en">
        <body
          className={`${plexSans.variable} ${plexMono.variable} antialiased`}
        >
          {children}
          <UtmCapture />
          <CookieConsent />
        </body>
        {gaId && <ConsentedAnalytics gaId={gaId} />}
      </html>
    </ClerkProvider>
  );
}
