import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RowRescue handles your data. Spreadsheet contents are processed in your browser and never uploaded.",
  alternates: { canonical: "/legal/privacy-policy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
