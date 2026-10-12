import type { Metadata } from "next";

// The app itself is thin, client-rendered UI; search traffic is served by the tool pages instead.
export const metadata: Metadata = {
  title: "Clean a Spreadsheet",
  robots: { index: false, follow: true },
};

export default function CleanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
