"use client";
import { useState, useEffect } from "react";

/**
 * Editor Film Grain Texture Overlay Toggle.
 * Allows visitors to toggle a 35mm cinematic film noise grain overlay on/off in Editor mode.
 */
export default function EditorFilmGrainToggle() {
  const [grainActive, setGrainActive] = useState(false);

  useEffect(() => {
    const root = document.getElementById("mode-editor");
    if (!root) return;
    if (grainActive) {
      root.classList.add("has-film-grain");
    } else {
      root.classList.remove("has-film-grain");
    }
  }, [grainActive]);

  return (
    <button
      onClick={() => setGrainActive(!grainActive)}
      className="editor-grain-btn"
      title="Toggle 35mm Film Grain Overlay"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        fontSize: "0.75rem",
        fontFamily: "var(--font-mono)",
        color: grainActive ? "#a56ce8" : "var(--color-fg-muted)",
        background: grainActive ? "rgba(165,108,232,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${grainActive ? "#a56ce8" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 4,
        cursor: "pointer",
        transition: "all 0.25s ease",
      }}
    >
      <span>🎞️ Film Grain:</span>
      <strong>{grainActive ? "ON" : "OFF"}</strong>
    </button>
  );
}
