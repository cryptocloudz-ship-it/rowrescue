import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RowRescue — Clean Messy CSVs in Seconds",
  description:
    "Remove duplicates, fix formatting, normalize dates, validate emails — all without uploading your data. Privacy-first spreadsheet cleaning, 100% client-side.",
  keywords: [
    "clean CSV online",
    "remove duplicates from CSV",
    "normalize spreadsheet data",
    "fix messy CSV",
    "deduplicate excel online",
  ],
  openGraph: {
    title: "RowRescue — Clean Messy CSVs in Seconds",
    description: "Privacy-first spreadsheet cleaning. 100% client-side data processing.",
    url: "https://rowrescue.app",
    siteName: "RowRescue",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RowRescue — Clean Messy CSVs in Seconds",
    description: "Privacy-first spreadsheet cleaning. 100% client-side data processing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
