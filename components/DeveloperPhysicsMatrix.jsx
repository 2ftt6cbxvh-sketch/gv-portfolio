"use client";

import { useEffect, useRef, useState } from "react";

const ICONS = ["⚛️ React", "🐍 Python", "🧠 PyTorch", "🐘 PostgreSQL", "☁️ AWS", "🐳 Docker", "⚡ Next.js"];

export default function DeveloperPhysicsMatrix({ accent = "#39ff88" }) {
  const canvasRef = useRef(null);
  const [activeIcon, setActiveIcon] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = 200);

    // Particle object pool
    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 2,
    }));

    let mouseX = -100;
    let mouseY = -100;
    let isMouseDown = false;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    };

    const handleMouseDown = () => { isMouseDown = true; };
    const handleMouseUp = () => { isMouseDown = false; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchstart", handleMouseDown, { passive: true });
    canvas.addEventListener("touchend", handleMouseUp, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background grid lines
      ctx.strokeStyle = "rgba(57, 255, 136, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Update & render particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction/repulsion gravity physics
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const force = (100 - dist) / 100;
          if (isMouseDown) {
            p.vx += (dx / dist) * force * 0.8;
            p.vy += (dy / dist) * force * 0.8;
          } else {
            p.vx -= (dx / dist) * force * 0.4;
            p.vy -= (dy / dist) * force * 0.4;
          }
        }

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [accent]);

  return (
    <div
      className="developer-physics-card"
      style={{
        background: "#050d08",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        margin: "24px 0",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            2D GRAVITY PHYSICS MATRIX // PARTICLE CANVAS
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Interactive Particle Gravity Sandbox</h4>
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
          Drag Mouse or Finger to Repel / Click to Attract
        </span>
      </div>

      {/* Physics Canvas */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#020604" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: 200, display: "block" }} />
      </div>

      {/* Tech Stack Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {ICONS.map((ic, i) => (
          <button
            key={ic}
            onClick={() => setActiveIcon(i)}
            style={{
              padding: "6px 12px",
              background: activeIcon === i ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeIcon === i ? accent : "rgba(255,255,255,0.12)"}`,
              borderRadius: 16,
              color: activeIcon === i ? accent : "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.76rem",
              transition: "all 0.2s ease",
            }}
          >
            {ic}
          </button>
        ))}
      </div>
    </div>
  );
}
