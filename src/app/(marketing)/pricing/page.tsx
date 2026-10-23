import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingContent } from "./PricingContent";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui">
      <SiteHeader />
      <PricingContent />
      <SiteFooter />
    </div>
  );
}
