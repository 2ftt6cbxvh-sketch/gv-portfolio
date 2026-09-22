"use client";

import { useState, useEffect } from "react";

const MOODS = [
  { id: "dark", label: "🌙 Dark" },
  { id: "light", label: "☀️ Light" },
];

export default function ThemeMoodSwitcher({ metadata, enabled = true }) {
  const [activeMood, setActiveMood] = useState("dark");

  const applyMood = (moodId) => {
    // Suppress CSS transitions temporarily across DOM to prevent multi-layer GPU repaint lag
    const css = document.createElement("style");
    css.appendChild(
      document.createTextNode(
        `*, *::before, *::after { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; -ms-transition: none !important; transition: none !important; }`
      )
    );
    document.head.appendChild(css);

    setActiveMood(moodId);
    try {
      localStorage.setItem("gv_theme_mode", moodId);
    } catch (e) {}

    const stage = document.getElementById("stage");
    if (stage) {
      if (moodId === "light") {
        stage.setAttribute("data-theme-mood", "light");
        document.documentElement.setAttribute("data-theme-mood", "light");
      } else {
        stage.removeAttribute("data-theme-mood");
        document.documentElement.removeAttribute("data-theme-mood");
      }
    }

    try {
      window.dispatchEvent(new CustomEvent("themeMoodChanged", { detail: { mood: moodId } }));
    } catch (e) {}

    // Force layout flush and remove transition override style
    window.getComputedStyle(css).opacity;
    requestAnimationFrame(() => {
      if (document.head.contains(css)) {
        document.head.removeChild(css);
      }
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gv_theme_mode");
      if (saved && ["dark", "light"].includes(saved)) {
        applyMood(saved);
        return;
      }
    } catch (e) {}

    if (metadata) {
      try {
        const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        if (parsed.defaultMood === "light") {
          applyMood("light");
          return;
        }
      } catch (e) {}
    }
    applyMood("dark");
  }, [metadata]);

  if (enabled === false) return null;

  return (
    <div
      className="theme-mood-switcher"
      role="radiogroup"
      aria-label="Theme mode switcher"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 24,
        padding: "3px 4px",
        gap: 3,
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "0.72rem",
        zIndex: 100,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
      }}
    >
      {MOODS.map((mood) => {
        const isActive = activeMood === mood.id;

        return (
          <button
            key={mood.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => applyMood(mood.id)}
            style={{
              background: isActive
                ? (mood.id === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.16)")
                : "transparent",
              border: isActive
                ? (mood.id === "light" ? "1px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.28)")
                : "1px solid transparent",
              color: isActive
                ? (mood.id === "light" ? "#0f172a" : "#ffffff")
                : "rgba(255, 255, 255, 0.65)",
              borderRadius: 20,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.72rem",
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: isActive ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "none",
            }}
          >
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
