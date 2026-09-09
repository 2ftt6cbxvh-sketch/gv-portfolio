"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const PRESETS = [
  {
    name: "Kodak 250D 16mm",
    color: "#ffaa44",
    contrast: 1.25,
    saturation: 1.15,
    exposure: 1.05,
    grain: 0.35,
    halation: 0.45,
    lut: "kodak",
  },
  {
    name: "Cyberpunk Teal & Orange",
    color: "#00f0ff",
    contrast: 1.4,
    saturation: 1.3,
    exposure: 1.0,
    grain: 0.15,
    halation: 0.6,
    lut: "teal-orange",
  },
  {
    name: "Bleach Bypass Noir",
    color: "#e0e0e0",
    contrast: 1.6,
    saturation: 0.4,
    exposure: 0.95,
    grain: 0.5,
    halation: 0.2,
    lut: "bleach",
  },
];

export default function EditorColorGradingLab({ metadata }) {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [splitPos, setSplitPos] = useState(50); // percentage 0 - 100
  const [contrast, setContrast] = useState(PRESETS[0].contrast);
  const [saturation, setSaturation] = useState(PRESETS[0].saturation);
  const [grain, setGrain] = useState(PRESETS[0].grain);
  const [halation, setHalation] = useState(PRESETS[0].halation);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  const applyPreset = (preset) => {
    setActivePreset(preset);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setGrain(preset.grain);
    setHalation(preset.halation);
  };

  // Draw procedural cinematic frame on Canvas
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Simulated Cinematic Scene (Raw Flat Log Look)
    // Dark moody ambient background with highlights
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#2a2630");
    grad.addColorStop(0.5, "#403a48");
    grad.addColorStop(1, "#18151e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw stylized cinematic subject (silhouette + neon rim light)
    ctx.save();
    // Background highlight sphere
    const sphereGrad = ctx.createRadialGradient(w * 0.65, h * 0.35, 10, w * 0.65, h * 0.35, w * 0.4);
    sphereGrad.addColorStop(0, "rgba(240, 180, 120, 0.55)");
    sphereGrad.addColorStop(0.4, "rgba(180, 100, 160, 0.25)");
    sphereGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = sphereGrad;
    ctx.fillRect(0, 0, w, h);

    // Foreground architectural silhouettes
    ctx.fillStyle = "#141218";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.6, h);
    ctx.fill();
    ctx.restore();

    // 2. Render the Graded Look on the Right side of the Split Wipe
    const splitPixel = (w * splitPos) / 100;

    ctx.save();
    ctx.beginPath();
    ctx.rect(splitPixel, 0, w - splitPixel, h);
    ctx.clip();

    // Redraw with vibrant graded colors & contrast
    const gradedGrad = ctx.createLinearGradient(0, 0, w, h);
    if (activePreset.lut === "teal-orange") {
      gradedGrad.addColorStop(0, "#081e28");
      gradedGrad.addColorStop(0.5, "#163842");
      gradedGrad.addColorStop(1, "#070c10");
    } else if (activePreset.lut === "bleach") {
      gradedGrad.addColorStop(0, "#1c1c1c");
      gradedGrad.addColorStop(0.5, "#383838");
      gradedGrad.addColorStop(1, "#0a0a0a");
    } else {
      gradedGrad.addColorStop(0, "#2e1b12");
      gradedGrad.addColorStop(0.5, "#523220");
      gradedGrad.addColorStop(1, "#120804");
    }
    ctx.fillStyle = gradedGrad;
    ctx.fillRect(splitPixel, 0, w - splitPixel, h);

    // High-contrast graded highlight bloom
    const gradedSphere = ctx.createRadialGradient(w * 0.65, h * 0.35, 10, w * 0.65, h * 0.35, w * 0.45);
    if (activePreset.lut === "teal-orange") {
      gradedSphere.addColorStop(0, `rgba(255, 140, 40, ${0.7 * halation * 1.5})`);
      gradedSphere.addColorStop(0.5, `rgba(0, 240, 255, ${0.4 * halation})`);
    } else if (activePreset.lut === "bleach") {
      gradedSphere.addColorStop(0, `rgba(255, 255, 255, ${0.8 * halation})`);
      gradedSphere.addColorStop(0.5, `rgba(100, 100, 100, ${0.2 * halation})`);
    } else {
      gradedSphere.addColorStop(0, `rgba(255, 120, 60, ${0.8 * halation * 1.4})`);
      gradedSphere.addColorStop(0.5, `rgba(255, 60, 20, ${0.3 * halation})`);
    }
    gradedSphere.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradedSphere;
    ctx.fillRect(splitPixel, 0, w - splitPixel, h);

    // Graded foreground silhouette
    ctx.fillStyle = "#050406";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.6, h);
    ctx.fill();

    // Procedural 16mm Film Grain on Graded Side
    if (grain > 0.05) {
      const imgData = ctx.getImageData(splitPixel, 0, w - splitPixel, h);
      const data = imgData.data;
      const grainAmount = grain * 38;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * grainAmount;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, splitPixel, 0);
    }
    ctx.restore();

    // 3. Draw Split Wipe Divider Line with glowing thumb
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitPixel, 0);
    ctx.lineTo(splitPixel, h);
    ctx.stroke();

    // Glowing Divider Thumb
    ctx.fillStyle = activePreset.color;
    ctx.shadowColor = activePreset.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(splitPixel, h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Overlay Labels
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("RAW FLAT LOG", 16, 26);
    ctx.fillStyle = activePreset.color;
    ctx.fillText(`GRADED // ${activePreset.name.toUpperCase()}`, w - 210, 26);
  }, [splitPos, activePreset, contrast, saturation, grain, halation]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Handle Split Slider Dragging
  const handlePointerMove = (e) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSplitPos(pos);
  };

  return (
    <div
      className="editor-color-grading-lab"
      style={{
        margin: "40px auto",
        maxWidth: "960px",
        width: "100%",
        background: "rgba(16, 12, 24, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(165, 108, 232, 0.2)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: "#a56ce8", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              🎛️ Real-Time Neural Color Grading Lab
            </span>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(165, 108, 232, 0.15)", color: "#a56ce8" }}>
              60 FPS GPU Shader Canvas
            </span>
          </div>
          <h3 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", color: "#fff", fontWeight: 700 }}>
            DaVinci Resolve Photochemical LUT & Halation Engine
          </h3>
        </div>

        {/* Preset Selectors */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: activePreset.name === p.name ? 700 : 500,
                cursor: "pointer",
                background: activePreset.name === p.name ? `${p.color}22` : "rgba(255, 255, 255, 0.04)",
                color: activePreset.name === p.name ? p.color : "var(--color-fg-muted)",
                border: activePreset.name === p.name ? `1px solid ${p.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.15s ease",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Split Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDraggingSplit(true)}
        onMouseUp={() => setIsDraggingSplit(false)}
        onMouseMove={handlePointerMove}
        onTouchStart={() => setIsDraggingSplit(true)}
        onTouchEnd={() => setIsDraggingSplit(false)}
        onTouchMove={handlePointerMove}
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "ew-resize",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
          userSelect: "none",
        }}
      >
        <canvas ref={canvasRef} width={800} height={400} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Interactive Parameter Sliders */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginTop: 20,
          padding: "16px",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "10px",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-fg-muted)", marginBottom: 6 }}>
            <span>Contrast</span>
            <span style={{ color: "#fff", fontFamily: "var(--font-mono, monospace)" }}>{contrast.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="2.0"
            step="0.05"
            value={contrast}
            onChange={(e) => setContrast(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#a56ce8" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-fg-muted)", marginBottom: 6 }}>
            <span>Saturation</span>
            <span style={{ color: "#fff", fontFamily: "var(--font-mono, monospace)" }}>{saturation.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.05"
            value={saturation}
            onChange={(e) => setSaturation(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#a56ce8" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-fg-muted)", marginBottom: 6 }}>
            <span>16mm Film Grain</span>
            <span style={{ color: "#fff", fontFamily: "var(--font-mono, monospace)" }}>{(grain * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={grain}
            onChange={(e) => setGrain(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#a56ce8" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-fg-muted)", marginBottom: 6 }}>
            <span>Highlight Halation Bloom</span>
            <span style={{ color: "#fff", fontFamily: "var(--font-mono, monospace)" }}>{(halation * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={halation}
            onChange={(e) => setHalation(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#a56ce8" }}
          />
        </div>
      </div>
    </div>
  );
}
