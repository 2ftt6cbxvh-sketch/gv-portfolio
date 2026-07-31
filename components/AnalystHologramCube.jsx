"use client";

import { useState, useRef } from "react";

export default function AnalystHologramCube({ metadata, accent = "#33c7b0" }) {
  const [rotX, setRotX] = useState(-15);
  const [rotY, setRotY] = useState(25);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  let faces = [
    { id: "front", title: "15+ DATASETS", sub: "Processed & Modeled", icon: "📊", transform: "translateZ(100px)" },
    { id: "back", title: "99.4% ACCURACY", sub: "ML Classification", icon: "🧠", transform: "rotateY(180deg) translateZ(100px)" },
    { id: "right", title: "PYTORCH & ML", sub: "Deep Neural Nets", icon: "🔬", transform: "rotateY(90deg) translateZ(100px)" },
    { id: "left", title: "SQL & PIPELINES", sub: "Big Data Processing", icon: "⚡", transform: "rotateY(-90deg) translateZ(100px)" },
    { id: "top", title: "LIVERPOOL MSc", sub: "AI & Data Science", icon: "🎓", transform: "rotateX(90deg) translateZ(100px)" },
    { id: "bottom", title: "POWER BI DASHBOARDS", sub: "Live Analytics", icon: "📈", transform: "rotateX(-90deg) translateZ(100px)" },
  ];

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.cubeFaces && Array.isArray(parsed.cubeFaces) && parsed.cubeFaces.length === 6) {
        faces = faces.map((f, i) => ({
          ...f,
          title: parsed.cubeFaces[i].title || f.title,
          sub: parsed.cubeFaces[i].sub || f.sub,
          icon: parsed.cubeFaces[i].icon || f.icon,
        }));
      }
    } catch (e) {}
  }

  // Mouse Handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + deltaX * 0.7);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.7)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Mobile Touch Handlers
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !e.touches || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - lastPos.current.x;
    const deltaY = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotY((prev) => prev + deltaX * 0.8);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.8)));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="hologram-cube-card"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: "#080f0d",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
        margin: "24px 0",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            3D DATA MATRIX // HOLOGRAM CUBE
          </span>
          <h4 style={{ margin: "4px 0 0 0", fontSize: "1.1rem" }}>Interactive Data Hologram</h4>
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
          Drag Mouse or Finger to Spin 360°
        </span>
      </div>

      <div
        style={{
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1000,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging.current ? "none" : "transform 0.1s ease-out",
          }}
        >
          {faces.map((face) => (
            <div
              key={face.id}
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                background: `color-mix(in oklab, ${accent} 12%, rgba(8,15,13,0.92))`,
                border: `1.5px solid ${accent}`,
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
                boxShadow: `0 0 20px color-mix(in oklab, ${accent} 30%, transparent)`,
                transform: face.transform,
                backfaceVisibility: "visible",
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 6 }}>{face.icon}</span>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: accent, textAlign: "center" }}>
                {face.title}
              </div>
              <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 4, textAlign: "center" }}>
                {face.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
