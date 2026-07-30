"use client";

/**
 * Analyst Mode Real-Time Cyber Data Ticker Ribbon.
 * Renders an infinitely scrolling ticker stream of live analytics metrics and research topics.
 * Fully customizable via Admin Panel.
 */
export default function AnalystDataTicker({ metadata, enabled = true, accent = "#33c7b0" }) {
  if (enabled === false) return null;

  const defaultItems = [
    "⚡ LIVE DATA STREAM",
    "📊 15+ DATASETS PROCESSED",
    "🧠 99.4% AI MODEL ACCURACY",
    "🔬 MRI BRAIN TUMOR CLASSIFICATION",
    "🎓 LIVERPOOL MSc RESEARCH",
    "📈 PYTHON / PYTORCH / SQL / POWER BI",
  ];

  let items = defaultItems;
  let tickerAccent = accent;
  let speedSec = 24;

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
        items = parsed.items;
      } else if (parsed.itemsStr) {
        items = parsed.itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (parsed.accentColor) tickerAccent = parsed.accentColor;
      if (parsed.speedSec) speedSec = parseInt(parsed.speedSec, 10) || 24;
    } catch (e) {
      if (typeof metadata === "string" && metadata.includes(",")) {
        items = metadata.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  return (
    <div
      className="analyst-data-ticker"
      aria-hidden="true"
      style={{
        width: "100%",
        overflow: "hidden",
        background: `color-mix(in oklab, ${tickerAccent} 8%, transparent)`,
        borderTop: `1px solid color-mix(in oklab, ${tickerAccent} 25%, transparent)`,
        borderBottom: `1px solid color-mix(in oklab, ${tickerAccent} 25%, transparent)`,
        padding: "7px 0",
        marginBottom: 24,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        fontSize: "0.76rem",
        color: tickerAccent,
        letterSpacing: "0.08em",
      }}
    >
      <div
        className="ticker-track"
        style={{
          display: "inline-flex",
          gap: 32,
          animation: `tickerScroll ${speedSec}s linear infinite`,
        }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span>{item}</span>
            <span style={{ opacity: 0.35 }}>//</span>
          </span>
        ))}
      </div>
    </div>
  );
}
