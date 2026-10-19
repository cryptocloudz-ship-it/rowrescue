import { ImageResponse } from "next/og";
import { TOOLS, TOOL_MAP } from "@/content/tools";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpreadsheetFix free CSV tool";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = TOOL_MAP.get(slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0B0F19",
          backgroundImage: "radial-gradient(ellipse at top, rgba(13,242,223,0.18), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#0df2df",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 800,
              color: "#0B0F19",
            }}
          >
            SF
          </div>
          <span style={{ fontSize: "30px", fontWeight: 800, color: "#0df2df" }}>SpreadsheetFix</span>
        </div>
        <div style={{ fontSize: "68px", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1, letterSpacing: "-1px" }}>
          {tool?.h1 ?? "Clean messy CSVs in seconds"}
        </div>
        <div style={{ fontSize: "28px", color: "#94a3b8", marginTop: "28px" }}>
          Free · Runs in your browser · Your data is never uploaded
        </div>
      </div>
    ),
    size
  );
}
