// Shared layout for social share images (see DESIGN.md). Rendered by next/og, so every
// element with several children needs display: flex, and only inline styles work.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const INK = "#0e1525";
const BODY = "#3a4354";
const MUTED = "#5f6878";
const RULE = "#e4e7ec";
const SURFACE = "#f7f8fa";
const ACCENT = "#1f3d99";

// next/og can't read woff2, so the card ships its own static Plex TTFs.
// Both share routes are static, so these are read once at build time.
export async function ogFonts() {
  const dir = join(process.cwd(), "src/lib/og/fonts");
  const [regular, semibold] = await Promise.all([
    readFile(join(dir, "IBMPlexSans-Regular.ttf")),
    readFile(join(dir, "IBMPlexSans-SemiBold.ttf")),
  ]);
  return [
    { name: "IBM Plex Sans", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "IBM Plex Sans", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

export function OgCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "IBM Plex Sans",
        backgroundColor: "#ffffff",
        borderBottom: `12px solid ${ACCENT}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
          <path d="M16 11.3V3.8H3v11h9.5" stroke={ACCENT} strokeWidth="1.8" />
          <rect x="13.5" y="12.3" width="5" height="5" fill={ACCENT} />
        </svg>
        <span style={{ fontSize: "32px", fontWeight: 600, color: INK }}>SpreadsheetFix</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "68px", fontWeight: 600, color: INK, lineHeight: 1.08, letterSpacing: "-2px", maxWidth: "980px" }}>
          {title}
        </div>
        <div style={{ fontSize: "28px", color: BODY, marginTop: "28px", maxWidth: "900px", lineHeight: 1.4 }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px", fontSize: "22px", color: MUTED }}>
        {["Processed in your browser", "Nothing uploaded", "No account needed"].map((item) => (
          <div
            key={item}
            style={{ display: "flex", padding: "10px 18px", border: `1px solid ${RULE}`, borderRadius: "8px", backgroundColor: SURFACE }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
