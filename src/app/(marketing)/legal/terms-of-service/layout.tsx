import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of SpreadsheetFix.",
  alternates: { canonical: "/legal/terms-of-service" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
