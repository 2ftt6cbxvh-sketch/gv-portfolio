"use client";

/**
 * Analyst Mode Real-Time Cyber Data Ticker Ribbon.
 * Renders an infinitely scrolling ticker stream of live analytics metrics and research topics.
 */
export default function AnalystDataTicker() {
  const items = [
    "⚡ LIVE DATA STREAM",
    "📊 15+ DATASETS PROCESSED",
    "🧠 99.4% AI MODEL ACCURACY",
    "🔬 MRI BRAIN TUMOR CLASSIFICATION",
    "🎓 LIVERPOOL MSc RESEARCH",
    "📈 PYTHON / PYTORCH / SQL / POWER BI",
  ];

  return (
    <div
      className="analyst-data-ticker"
      aria-hidden="true"
      style={{
        width: "100%",
        overflow: "hidden",
        background: "rgba(51,199,176,0.06)",
        borderTop: "1px solid rgba(51,199,176,0.2)",
        borderBottom: "1px solid rgba(51,199,176,0.2)",
        padding: "6px 0",
        marginBottom: 24,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        fontSize: "0.76rem",
        color: "#33c7b0",
        letterSpacing: "0.08em",
      }}
    >
      <div
        className="ticker-track"
        style={{
          display: "inline-flex",
          gap: 32,
          animation: "tickerScroll 24s linear infinite",
        }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>{item}</span>
            <span style={{ opacity: 0.3 }}>//</span>
          </span>
        ))}
      </div>
    </div>
  );
}
