import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — RowRescue",
  description:
    "Simple, transparent pricing. Clean spreadsheets free up to 5,000 rows. Upgrade to Pro for unlimited rows, 17+ rules, and Excel export.",
  openGraph: {
    title: "Pricing — RowRescue",
    description: "Simple, transparent pricing for spreadsheet cleaning. Start free, upgrade when you need more.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
