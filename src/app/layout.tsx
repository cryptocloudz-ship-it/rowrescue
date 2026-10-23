import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { UtmCapture } from "@/components/ui/UtmCapture";
import { ConsentedAnalytics } from "@/components/ui/ConsentedAnalytics";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SOCIAL_DESCRIPTION, DEFAULT_OPEN_GRAPH } from "@/config/site";
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
    description: SOCIAL_DESCRIPTION,
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
    // Clerk is added per route (AuthProvider) so static marketing pages don't load it
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
  );
}
