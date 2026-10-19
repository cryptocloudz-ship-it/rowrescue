import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { UtmCapture } from "@/components/ui/UtmCapture";
import { ConsentedAnalytics } from "@/components/ui/ConsentedAnalytics";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, DEFAULT_OPEN_GRAPH } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Self-hosted by next/font, so the CSP needs no Google Fonts allowance
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// New design system fonts (see DESIGN.md)
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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
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
