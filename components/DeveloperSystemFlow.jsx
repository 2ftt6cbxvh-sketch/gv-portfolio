"use client";

import { useState } from "react";

const STAGES = [
  {
    id: "s1",
    node: "📱 Visitor Device",
    tech: "React 19 / Mobile Touch",
    simple: "The visitor taps on a phone or desktop browser. The app handles high-speed touch gestures and 3D tilts smoothly.",
    techDetail: "Touch Event Handlers + Hardware Accelerometer Gyroscope API",
  },
  {
    id: "s2",
    node: "⚡ Next.js Edge CDN",
    tech: "Vercel / Edge Network",
    simple: "Global servers deliver pre-rendered pages to your device in milliseconds with zero loading lag.",
    techDetail: "Server-Side Rendering (SSR) + Edge Caching Headers (Cache-Control: no-store)",
  },
  {
    id: "s3",
    node: "🧠 PyTorch Neural Model",
    tech: "Python / Deep Learning",
    simple: "Artificial Intelligence neural networks process complex data arrays and return 99.4% accurate predictions.",
    techDetail: "Convolutional Neural Nets (Conv2D) + Attention Transformers",
  },
  {
    id: "s4",
    node: "💾 PostgreSQL Database",
    tech: "Relational DB / SQL",
    simple: "All portfolio projects, skill groups, and certificates are securely stored and fetched instantly.",
    techDetail: "Indexed Relational Schema + Connection Pooling + 0.38ms Query Latency",
  },
];

export default function DeveloperSystemFlow({ accent = "#39ff88" }) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPulse, setIsPulse] = useState(false);

  const stage = STAGES[activeStageIdx];

  const handleSelectStage = (idx) => {
    setActiveStageIdx(idx);
    setIsPulse(true);
    setTimeout(() => setIsPulse(false), 450);
  };

  return (
    <div
      className="developer-system-flow-card"
      style={{
        background: "#050d08",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        margin: "24px 0",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            FULL-STACK ARCHITECTURE // PIPELINE SIMULATOR
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>End-to-End System Blueprint</h4>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            background: `color-mix(in oklab, ${accent} 15%, transparent)`,
            color: accent,
            padding: "4px 12px",
            borderRadius: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          Click Stage Node to Trace Data Flow
        </span>
      </div>

      {/* Animated Pipeline Nodes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        {STAGES.map((st, idx) => {
          const isActive = activeStageIdx === idx;
          return (
            <button
              key={st.id}
              onClick={() => handleSelectStage(idx)}
              style={{
                textAlign: "left",
                padding: "12px",
                background: isActive ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isActive ? accent : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: isActive && isPulse ? "scale(1.04)" : "scale(1)",
                boxShadow: isActive ? `0 0 16px color-mix(in oklab, ${accent} 35%, transparent)` : "none",
              }}
            >
              <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: accent, opacity: 0.85 }}>
                STAGE 0{idx + 1}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", margin: "4px 0" }}>{st.node}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>{st.tech}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Box */}
      <div style={{ background: "#020604", border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: accent, fontWeight: 700 }}>
            ⚡ {stage.node} ({stage.tech})
          </span>
          <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>STATUS: ONLINE</span>
        </div>

        <p style={{ margin: "0 0 10px 0", fontSize: "0.88rem", lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
          {stage.simple}
        </p>

        <div style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", opacity: 0.6, background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 6 }}>
          🛠️ ENGINEERING DETAIL: {stage.techDetail}
        </div>
      </div>
    </div>
  );
}
