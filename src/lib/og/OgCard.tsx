// Shared layout for social share images (see DESIGN.md). Rendered by next/og, so every
// element with several children needs display: flex, and only inline styles work.

const INK = "#0e1525";
const BODY = "#3a4354";
const MUTED = "#5f6878";
const RULE = "#e4e7ec";
const SURFACE = "#f7f8fa";
const ACCENT = "#1f3d99";

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
        backgroundColor: "#ffffff",
        borderBottom: `12px solid ${ACCENT}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="18" rx="4" stroke={INK} strokeWidth="1.5" />
          <path d="M1 7.5h18M7.5 7.5V19" stroke={INK} strokeWidth="1.5" />
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
