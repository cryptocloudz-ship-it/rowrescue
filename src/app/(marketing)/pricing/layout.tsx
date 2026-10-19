import type { Metadata } from "next";
import { DEFAULT_OPEN_GRAPH } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Clean spreadsheets free up to 5,000 rows. Upgrade to Pro for up to 500,000 rows, all 18 rules, and Excel export.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: "Pricing — SpreadsheetFix",
    description: "Simple, transparent pricing for spreadsheet cleaning. Start free, upgrade when you need more.",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
