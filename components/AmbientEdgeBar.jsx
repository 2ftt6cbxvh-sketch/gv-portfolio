"use client";
import { useEffect, useState } from "react";

/**
 * Global Dynamic Neon Ambient Energy Edge Bar.
 * Displays a minimal 2px glowing edge accent along the left screen boundary
 * that smoothly shifts color matching the active mode.
 */
export default function AmbientEdgeBar() {
  const [activeMode, setActiveMode] = useState("");

  useEffect(() => {
    const stage = document.getElementById("stage");
    if (!stage) return;

    const observer = new MutationObserver(() => {
      const mode = stage.getAttribute("data-mode") || "";
      setActiveMode(mode);
    });

    observer.observe(stage, { attributes: true, attributeFilter: ["data-mode"] });
    return () => observer.disconnect();
  }, []);

  const modeColors = {
    "": "#00f0ff",
    editor: "#a56ce8",
    analyst: "#33c7b0",
    developer: "#39ff88",
  };

  const currentColor = modeColors[activeMode] || "#00f0ff";

  return (
    <div
      className="ambient-edge-bar"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: "3px",
        zIndex: 9999,
        pointerEvents: "none",
        background: `linear-gradient(180deg, transparent 0%, ${currentColor} 50%, transparent 100%)`,
        boxShadow: `0 0 12px ${currentColor}`,
        transition: "background 0.5s ease, box-shadow 0.5s ease",
      }}
    />
  );
}
