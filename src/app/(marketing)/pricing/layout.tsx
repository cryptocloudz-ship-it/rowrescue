import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Clean spreadsheets free up to 5,000 rows. Upgrade to Pro for up to 500,000 rows, all 18 rules, and Excel export.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — SpreadsheetFix",
    description: "Simple, transparent pricing for spreadsheet cleaning. Start free, upgrade when you need more.",
    url: "/pricing",
    images: ["/og-image.png"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
