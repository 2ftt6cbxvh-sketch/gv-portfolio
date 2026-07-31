"use client";

import { useState } from "react";

const LUTS = [
  { id: "normal", label: "🎬 REC.709", filter: "none", desc: "Standard Color Profile" },
  { id: "teal-orange", label: "🌆 TEAL & ORANGE", filter: "contrast(1.15) saturate(1.3) hue-rotate(-10deg)", desc: "Blockbuster Hollywood Grade" },
  { id: "cyber-neon", label: "🌙 CYBER NEON", filter: "contrast(1.25) saturate(1.6) hue-rotate(140deg)", desc: "Anamorphic Cyberpunk Glow" },
  { id: "vintage", label: "🎥 VINTAGE 35MM", filter: "sepia(0.3) contrast(1.1) saturate(0.9) brightness(0.95)", desc: "Analog Kodachrome Grain" },
  { id: "noir", label: "⚫ NOIR MONOCHROME", filter: "grayscale(1) contrast(1.4) brightness(0.9)", desc: "High-Contrast Dramatic Mono" },
];

export default function EditorLUTMatrix({ onSelectLUT, accent = "#a56ce8" }) {
  const [activeLUT, setActiveLUT] = useState("normal");

  const handleSelect = (lut) => {
    setActiveLUT(lut.id);
    if (onSelectLUT) onSelectLUT(lut.filter);
  };

  return (
    <div
      className="editor-lut-card"
      style={{
        background: "#0d0814",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "16px 20px",
        margin: "20px 0",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            CINEMATIC COLOR GRADING // 4K LUT MATRIX
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.05rem" }}>Live Video LUT Switcher</h4>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            background: `color-mix(in oklab, ${accent} 15%, transparent)`,
            color: accent,
            padding: "3px 10px",
            borderRadius: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          Click LUT to Grade Showreel Video
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {LUTS.map((lut) => {
          const isActive = activeLUT === lut.id;
          return (
            <button
              key={lut.id}
              onClick={() => handleSelect(lut)}
              style={{
                flex: "1 1 auto",
                minWidth: 130,
                textAlign: "center",
                padding: "8px 12px",
                background: isActive ? `color-mix(in oklab, ${accent} 25%, transparent)` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isActive ? accent : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                color: isActive ? accent : "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.76rem",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 16px color-mix(in oklab, ${accent} 35%, transparent)` : "none",
              }}
            >
              {lut.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
