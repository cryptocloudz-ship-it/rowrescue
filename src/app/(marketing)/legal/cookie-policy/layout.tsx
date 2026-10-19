import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Which cookies SpreadsheetFix uses and how to control them.",
  alternates: { canonical: "/legal/cookie-policy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
