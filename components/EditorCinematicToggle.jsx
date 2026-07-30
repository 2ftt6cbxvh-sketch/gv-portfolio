"use client";
import { useState, useEffect } from "react";

/**
 * Cinematic Anamorphic Letterbox Viewfinder Overlay for Editor Mode.
 * Slides down 2.39:1 aspect ratio film bars, dims background ambient light,
 * and adds a cinematic director's cut feel to the Editor mode portfolio.
 */
export default function EditorCinematicToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      document.body.classList.add("is-cinematic-mode");
    } else {
      document.body.classList.remove("is-cinematic-mode");
    }
    return () => {
      document.body.classList.remove("is-cinematic-mode");
    };
  }, [active]);

  return (
    <>
      <button
        className={`cinematic-toggle-btn ${active ? "is-active" : ""}`}
        onClick={() => setActive(!active)}
        aria-label="Toggle Cinematic Anamorphic View"
      >
        <span className="cinematic-toggle-icon">🎬</span>
        <span>{active ? "Exit Director's Cut" : "Director's Cut (2.39:1)"}</span>
      </button>

      {/* Anamorphic Letterbox Bars Overlay */}
      <div className={`cinematic-bars ${active ? "is-active" : ""}`} aria-hidden="true">
        <div className="cinematic-bar cinematic-bar--top">
          <div className="cinematic-rec-status">
            <span className="cinematic-rec-dot" />
            <span className="cinematic-rec-text">REC [2.39:1 ANAMORPHIC]</span>
          </div>
          <span className="cinematic-timecode">00:04:12:18</span>
        </div>
        <div className="cinematic-bar cinematic-bar--bottom">
          <span className="cinematic-cam-info">CAM A // 24FPS // 35MM ISO 800</span>
          <span className="cinematic-grid-tag">RULE OF THIRDS</span>
        </div>
      </div>
    </>
  );
}
