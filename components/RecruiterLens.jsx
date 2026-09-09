"use client";

import { useState } from "react";

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

export default function RecruiterLens({ metadata, onWarpMode }) {
  let personas = DEFAULT_PERSONAS;
  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (Array.isArray(parsed.personas) && parsed.personas.length > 0) {
        personas = parsed.personas;
      }
    } catch (e) {}
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState(personas[0]?.id || "ai");
  const current = personas.find((p) => p.id === activePersonaId) || personas[0];

  const handleWarp = () => {
    if (!current?.targetMode) return;
    if (typeof onWarpMode === "function") {
      onWarpMode(current.targetMode);
    } else {
      // Trigger native click on portal card
      const portal = document.querySelector(`.portal[data-mode="${current.targetMode}"]`);
      if (portal) portal.click();
    }
  };

  // Minimized Trigger Pill State
  if (!isExpanded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "14px auto 8px auto", position: "relative", zIndex: 10 }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 18px",
            borderRadius: "30px",
            background: "rgba(18, 16, 26, 0.8)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#ffffff",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = current.accent;
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = `0 4px 24px ${current.accent}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.35)";
          }}
          title="Click to open recruiter lens"
        >
          <span style={{ fontSize: "0.9rem" }}>🎯</span>
          <span style={{ fontWeight: 600, letterSpacing: "0.04em" }}>RECRUITER LENS</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: current.accent, fontSize: "0.75rem" }}>
            {current.title}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--color-fg-muted)",
              padding: "2px 8px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              marginLeft: 4,
            }}
          >
            ▼ Open
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="recruiter-lens"
      style={{
        margin: "16px auto 20px auto",
        maxWidth: "840px",
        width: "92%",
        background: "rgba(18, 16, 26, 0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${current.accent}44`,
        borderRadius: "16px",
        padding: "18px 22px",
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${current.accent}22`,
        position: "relative",
        zIndex: 10,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            🎯 Adaptive Recruiter Lens:
          </span>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.06)", color: current.accent, border: `1px solid ${current.accent}44` }}>
            {current.badge}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "14px",
            padding: "4px 10px",
            color: "var(--color-fg-muted)",
            fontSize: "0.72rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-mono, monospace)",
          }}
          title="Minimize Recruiter Lens"
        >
          <span>▴</span>
          <span>Minimize</span>
        </button>
      </div>

      {/* Persona Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {personas.map((p) => {
          const isActive = p.id === activePersonaId;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersonaId(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: isActive ? `${p.accent}22` : "rgba(255, 255, 255, 0.03)",
                color: isActive ? p.accent : "var(--color-fg-muted)",
                border: isActive ? `1px solid ${p.accent}` : "1px solid rgba(255, 255, 255, 0.06)",
                boxShadow: isActive ? `0 0 16px ${p.accent}33` : "none",
              }}
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Narrative Pitch */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.85)" }}>
          {current.pitch}
        </p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {current.metrics?.map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px 12px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              borderLeft: `2px solid ${current.accent}`,
            }}
          >
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: current.accent, fontFamily: "var(--font-mono, monospace)" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-fg-muted)", marginTop: 2 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Instant Action CTA */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleWarp}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: "8px",
            background: current.accent,
            color: "#05050a",
            fontWeight: 700,
            fontSize: "0.82rem",
            border: "none",
            cursor: "pointer",
            boxShadow: `0 4px 18px ${current.accent}55`,
            transition: "transform 0.15s ease, filter 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <span>Warp to {current.title} Universe</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
