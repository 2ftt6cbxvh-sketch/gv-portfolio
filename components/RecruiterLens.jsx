"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_PERSONAS = [
  {
    id: "ai",
    title: "AI & Data Scientist",
    icon: "🧠",
    badge: "University of Liverpool MSc",
    accent: "#33c7b0",
    targetMode: "analyst",
    pitch: "Specialized in Deep Learning, Computer Vision & Medical Image Classification. Trained PyTorch models with 99.4% accuracy, t-SNE latent space analysis, and end-to-end data pipelines.",
    metrics: [
      { label: "Top Model Accuracy", value: "99.4%" },
      { label: "Degree Credentials", value: "Liverpool MSc" },
      { label: "Core ML Stack", value: "PyTorch & TF" },
      { label: "Research Focus", value: "Brain MRI & CV" },
    ],
  },
  {
    id: "editor",
    title: "Video Director & Editor",
    icon: "🎬",
    badge: "Creative Director (8 National Fests)",
    accent: "#a56ce8",
    targetMode: "editor",
    pitch: "Directed creative campaigns & aftermovies across 8 national-level fests. Master of rhythm, pacing, DaVinci Resolve color science (LUTs & 16mm halation), and high-pressure event logistics.",
    metrics: [
      { label: "National Fests Led", value: "8 Fests" },
      { label: "Color Science", value: "DaVinci & LUTs" },
      { label: "Editing Timeline", value: "Premiere & FCP" },
      { label: "Cinematic Visuals", value: "4K 60FPS" },
    ],
  },
  {
    id: "developer",
    title: "Systems & Graphics Dev",
    icon: "💻",
    badge: "294 FPS Unity M4 Max",
    accent: "#39ff88",
    targetMode: "developer",
    pitch: "Full-stack architect with deep GPU & systems knowledge. Engineered 3D Game of Life running at 294 FPS with DrawMeshInstanced, real-time WebSockets, Next.js SSR, and PostgreSQL connection pooling.",
    metrics: [
      { label: "Unity Engine FPS", value: "294 FPS" },
      { label: "Systems Architecture", value: "Next.js & SSR" },
      { label: "DB Resilience", value: "PostgreSQL & Prisma" },
      { label: "Low-Level Shaders", value: "GLSL / C#" },
    ],
  },
  {
    id: "founder",
    title: "Full-Stack Founder",
    icon: "🚀",
    badge: "FarmFreshFarmer.com",
    accent: "#ff9900",
    targetMode: "developer",
    pitch: "Built FarmFreshFarmer from zero to production. Engineered full logistics, live PhonePe payments, delivery fee engine, customer subscriptions, and 2-way Telegram customer support in under 3 weeks.",
    metrics: [
      { label: "Platform Built", value: "FarmFreshFarmer" },
      { label: "Payments", value: "PhonePe Live" },
      { label: "Logistics Engine", value: "30-90m ETA" },
      { label: "Execution Speed", value: "Production Ready" },
    ],
  },
];

export default function RecruiterLens({ metadata, onWarpMode, inNav = true }) {
  let personas = DEFAULT_PERSONAS;
  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (Array.isArray(parsed.personas) && parsed.personas.length > 0) {
        personas = parsed.personas;
      }
    } catch (e) {}
  }

  const [isOpen, setIsOpen] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState(personas[0]?.id || "ai");
  const current = personas.find((p) => p.id === activePersonaId) || personas[0];

  // Listen for external open trigger
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openRecruiterLens", handleOpen);
    return () => window.removeEventListener("openRecruiterLens", handleOpen);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleWarp = useCallback(() => {
    if (!current?.targetMode) return;
    const target = current.targetMode;
    setIsOpen(false);

    if (typeof onWarpMode === "function") {
      onWarpMode(target);
    } else {
      const portal =
        document.querySelector(`.portal[data-target="${target}"]`) ||
        document.querySelector(`.portal[data-mode="${target}"]`) ||
        document.querySelector(`.portal[data-mode-id="${target}"]`);
      if (portal) {
        portal.click();
      } else {
        window.dispatchEvent(new CustomEvent("enterUniverseMode", { detail: { mode: target } }));
      }
    }
  }, [current, onWarpMode]);

  return (
    <>
      {/* Sleek Trigger Pill */}
      {inNav && (
        <button
          onClick={() => setIsOpen(true)}
          className="recruiter-lens-pill"
          aria-label="Open Recruiter Lens"
          title="Open Recruiter Lens"
        >
          <span className="recruiter-lens-pill__icon">🎯</span>
          <span className="recruiter-lens-pill__label">Recruiter Lens</span>
        </button>
      )}

      {/* Centered Frosted Glass Modal Overlay */}
      {isOpen && (
        <div
          className="recruiter-lens-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="recruiter-lens-title"
        >
          <div
            className="recruiter-lens-modal"
            style={{
              "--persona-accent": current.accent,
            }}
          >
            {/* Header with Title & Close Button */}
            <div className="recruiter-lens-header">
              <div className="recruiter-lens-header__left">
                <span className="recruiter-lens-header__tag">🎯 Recruiter Lens</span>
                <span className="recruiter-lens-header__badge">{current.badge}</span>
              </div>
              <button
                className="recruiter-lens-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close Recruiter Lens"
              >
                ✕
              </button>
            </div>

            {/* Persona Tabs */}
            <div className="recruiter-lens-tabs" role="tablist">
              {personas.map((p) => {
                const isActive = p.id === activePersonaId;
                return (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePersonaId(p.id)}
                    className={`recruiter-lens-tab ${isActive ? "is-active" : ""}`}
                    style={{
                      "--tab-accent": p.accent,
                    }}
                  >
                    <span className="recruiter-lens-tab__icon">{p.icon}</span>
                    <span className="recruiter-lens-tab__title">{p.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Narrative Pitch */}
            <div className="recruiter-lens-pitch">
              <p>{current.pitch}</p>
            </div>

            {/* Metrics Grid */}
            <div className="recruiter-lens-metrics">
              {current.metrics?.map((m, idx) => (
                <div key={idx} className="recruiter-lens-metric-card">
                  <div className="recruiter-lens-metric-value">{m.value}</div>
                  <div className="recruiter-lens-metric-label">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Modal Footer CTA */}
            <div className="recruiter-lens-footer">
              <button
                className="recruiter-lens-cancel"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
              <button
                onClick={handleWarp}
                className="recruiter-lens-warp-btn"
              >
                <span>Warp to {current.title}</span>
                <span className="recruiter-lens-warp-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
