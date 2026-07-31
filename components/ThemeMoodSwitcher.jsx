"use client";

import { useState, useEffect } from "react";

const MOODS = [
  { id: "oled", label: "🌙 OLED", defaultAccent: "#00f0ff" },
  { id: "cyberpunk", label: "⚡ CYBERPUNK", defaultAccent: "#39ff88" },
  { id: "cinema", label: "🎬 CINEMA", defaultAccent: "#a56ce8" },
];

export default function ThemeMoodSwitcher({ metadata, enabled = true }) {
  const [activeMood, setActiveMood] = useState("oled");

  let oledAccent = "#00f0ff";
  let cyberpunkAccent = "#39ff88";
  let cinemaAccent = "#a56ce8";

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.defaultMood) {
        // Only set default mood once on initial load
      }
      if (parsed.oledAccent) oledAccent = parsed.oledAccent;
      if (parsed.cyberpunkAccent) cyberpunkAccent = parsed.cyberpunkAccent;
      if (parsed.cinemaAccent) cinemaAccent = parsed.cinemaAccent;
    } catch (e) {}
  }

  const applyMood = (moodId) => {
    setActiveMood(moodId);
    const stage = document.getElementById("stage");
    if (!stage) return;

    let accent = oledAccent;
    if (moodId === "cyberpunk") accent = cyberpunkAccent;
    if (moodId === "cinema") accent = cinemaAccent;

    stage.style.setProperty("--color-accent", accent);
    stage.style.setProperty("--landing-logo-color", accent);
    stage.style.setProperty("--landing-spark-color", accent);
    stage.setAttribute("data-theme-mood", moodId);
  };

  useEffect(() => {
    if (metadata) {
      try {
        const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        if (parsed.defaultMood) applyMood(parsed.defaultMood);
      } catch (e) {}
    }
  }, [metadata]);

  if (enabled === false) return null;

  return (
    <div
      className="theme-mood-switcher"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 20,
        padding: "3px 4px",
        gap: 4,
        fontFamily: "var(--font-mono)",
        fontSize: "0.72rem",
        zIndex: 100,
      }}
    >
      {MOODS.map((mood) => {
        let accent = oledAccent;
        if (mood.id === "cyberpunk") accent = cyberpunkAccent;
        if (mood.id === "cinema") accent = cinemaAccent;

        const isActive = activeMood === mood.id;

        return (
          <button
            key={mood.id}
            onClick={() => applyMood(mood.id)}
            style={{
              background: isActive ? `color-mix(in oklab, ${accent} 22%, transparent)` : "transparent",
              border: isActive ? `1px solid ${accent}` : "1px solid transparent",
              color: isActive ? accent : "rgba(255, 255, 255, 0.6)",
              borderRadius: 16,
              padding: "3px 9px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.18s ease-in-out",
            }}
          >
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
