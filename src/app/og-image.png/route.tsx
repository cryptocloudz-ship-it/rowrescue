import { ImageResponse } from "next/og";
import { OgCard, ogFonts } from "@/lib/og/OgCard";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <OgCard
        title="Clean transaction exports before they reach your books."
        subtitle="Dates, amounts, duplicates and spacing, standardised in your browser."
      />
    ),
    { width: 1200, height: 630, fonts: await ogFonts() }
  );
}
