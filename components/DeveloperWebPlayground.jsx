"use client";

import { useState } from "react";

export default function DeveloperWebPlayground({ accent = "#39ff88" }) {
  const [isNeonGlow, setIsNeonGlow] = useState(true);
  const [isGlassmorphism, setIsGlassmorphism] = useState(true);
  const [isSpeedTest, setIsSpeedTest] = useState(false);

  const toggleSpeedTest = () => {
    setIsSpeedTest(true);
    setTimeout(() => setIsSpeedTest(false), 800);
  };

  return (
    <div
      className="developer-web-playground-card"
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
            LIVE UI TRANSFORMER // CODE PLAYGROUND
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Interactive Web UI Transformer</h4>
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
          Toggle Switches to Transform UI Live
        </span>
      </div>

      {/* Control Switches */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setIsNeonGlow(!isNeonGlow)}
          style={{
            padding: "8px 14px",
            background: isNeonGlow ? `color-mix(in oklab, ${accent} 25%, transparent)` : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${isNeonGlow ? accent : "rgba(255,255,255,0.12)"}`,
            borderRadius: 20,
            color: isNeonGlow ? accent : "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            transition: "all 0.2s ease",
          }}
        >
          {isNeonGlow ? "⚡ NEON GLOW: ON" : "⚪ NEON GLOW: OFF"}
        </button>

        <button
          onClick={() => setIsGlassmorphism(!isGlassmorphism)}
          style={{
            padding: "8px 14px",
            background: isGlassmorphism ? `color-mix(in oklab, ${accent} 25%, transparent)` : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${isGlassmorphism ? accent : "rgba(255,255,255,0.12)"}`,
            borderRadius: 20,
            color: isGlassmorphism ? accent : "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            transition: "all 0.2s ease",
          }}
        >
          {isGlassmorphism ? "🔮 GLASSMORPHISM: ON" : "⬛ GLASSMORPHISM: OFF"}
        </button>

        <button
          onClick={toggleSpeedTest}
          style={{
            padding: "8px 14px",
            background: isSpeedTest ? accent : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${isSpeedTest ? accent : "rgba(255,255,255,0.12)"}`,
            borderRadius: 20,
            color: isSpeedTest ? "#050d08" : "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
        >
          {isSpeedTest ? "🚀 BENCHMARKING..." : "⚡ RUN LATENCY TEST"}
        </button>
      </div>

      {/* Live Transformed Mini Portfolio Card */}
      <div
        style={{
          background: isGlassmorphism ? "rgba(10, 25, 18, 0.75)" : "#020604",
          backdropFilter: isGlassmorphism ? "blur(12px)" : "none",
          border: `1.5px solid ${isNeonGlow ? accent : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          padding: 20,
          boxShadow: isNeonGlow ? `0 0 25px color-mix(in oklab, ${accent} 40%, transparent)` : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: accent }}>LIVE PREVIEW CARD</span>
            <h4 style={{ margin: "2px 0 0 0", fontSize: "1.05rem", color: "#fff" }}>Full-Stack AI Architecture</h4>
          </div>
          <span style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", background: `color-mix(in oklab, ${accent} 20%, transparent)`, color: accent, padding: "3px 10px", borderRadius: 10 }}>
            {isSpeedTest ? "⚡ 0.04ms (EDGE)" : "STATUS: 100% RESPONSIVE"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
          This miniature UI card instantly re-renders as you toggle styles, showing how CSS tokens and component states update dynamically.
        </p>
      </div>
    </div>
  );
}
