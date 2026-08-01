"use client";
import { useMemo, useState } from "react";

const LUTS = [
  { id: "normal", label: "🎬 REC.709", filter: "none", desc: "Standard Color Profile" },
  { id: "teal-orange", label: "🌆 TEAL & ORANGE", filter: "contrast(1.15) saturate(1.3) hue-rotate(-10deg)", desc: "Blockbuster Hollywood Grade" },
  { id: "cyber-neon", label: "🌙 CYBER NEON", filter: "contrast(1.25) saturate(1.6) hue-rotate(140deg)", desc: "Anamorphic Cyberpunk Glow" },
  { id: "vintage", label: "🎥 VINTAGE 35MM", filter: "sepia(0.3) contrast(1.1) saturate(0.9) brightness(0.95)", desc: "Analog Kodachrome Grain" },
  { id: "noir", label: "⚫ NOIR MONOCHROME", filter: "grayscale(1) contrast(1.4) brightness(0.9)", desc: "High-Contrast Dramatic Mono" },
];

export default function EditorVideoReel({ metadata = {}, accent = "#a56ce8" }) {
  const [activeLUT, setActiveLUT] = useState("normal");
  const activeFilter = useMemo(() => LUTS.find((l) => l.id === activeLUT)?.filter || "none", [activeLUT]);

  const config = useMemo(() => {
    const defaults = {
      url: "",
      title: "Creative Showreel 2026",
      desc: "Selected edits from 8 national BTech fests, live production sets, and stage direction.",
    };

    if (typeof metadata === "string" && metadata.trim() !== "") {
      try {
        return { ...defaults, ...JSON.parse(metadata) };
      } catch (e) {
        return defaults;
      }
    } else if (typeof metadata === "object" && metadata !== null) {
      return { ...defaults, ...metadata };
    }
    return defaults;
  }, [metadata]);

  const videoEmbedUrl = useMemo(() => {
    const raw = (config.url || "").trim();
    if (!raw) return null;

    if (raw.includes("youtube.com/embed/")) {
      const embedPart = raw.split("youtube.com/embed/")[1];
      const videoId = embedPart.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (raw.includes("youtu.be/")) {
      const afterSlash = raw.split("youtu.be/")[1];
      const videoId = afterSlash.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (raw.includes("youtube.com/watch")) {
      try {
        const url = new URL(raw);
        const videoId = url.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {
        const match = raw.match(/[?&]v=([^&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    if (raw.includes("vimeo.com/")) {
      const parts = raw.split("vimeo.com/");
      const videoId = parts[1].split(/[?&/]/)[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return raw;
  }, [config.url]);

  if (!videoEmbedUrl) return null;

  return (
    <section className="section wrap video-reel-section">
      <div className="section-head">
        <h3 className="section-head__title">Showreel &amp; 4K Color Grading Studio</h3>
        <span className="section-head__num">/ FEATURED</span>
      </div>

      <div
        className="video-reel-card"
        style={{
          background: "#0a0612",
          border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
          borderRadius: 14,
          padding: 16,
          boxShadow: `0 16px 40px color-mix(in oklab, ${accent} 15%, transparent)`,
        }}
      >
        {/* Unified Top Header Bar with Live 4K LUT Color Grading Switches */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div>
              <span className="label-mono" style={{ color: accent, fontSize: "0.72rem" }}>
                PLAYBACK MONITOR // LIVE 4K LUT MATRIX
              </span>
              <h4 style={{ margin: "2px 0 0 0", fontSize: "1.05rem", color: "#fff", fontWeight: 600 }}>
                {config.title}
              </h4>
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
              Grade Video Real-time
            </span>
          </div>

          {/* LUT Switcher Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LUTS.map((lut) => {
              const isActive = activeLUT === lut.id;
              return (
                <button
                  key={lut.id}
                  onClick={() => setActiveLUT(lut.id)}
                  style={{
                    padding: "6px 12px",
                    background: isActive ? `color-mix(in oklab, ${accent} 25%, transparent)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? accent : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 16,
                    color: isActive ? accent : "rgba(255,255,255,0.75)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.74rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {lut.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Player Frame with Live Filter Matrix */}
        <div
          className="video-reel-frame"
          style={{
            filter: activeFilter,
            transition: "filter 0.4s ease-in-out",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <iframe
            key={videoEmbedUrl}
            src={videoEmbedUrl}
            title={config.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-reel-iframe"
          />
        </div>

        {config.desc && (
          <div className="video-reel-footer" style={{ marginTop: 12 }}>
            <p className="video-reel-desc" style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8 }}>
              {config.desc}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
