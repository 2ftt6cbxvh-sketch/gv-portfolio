"use client";

import { useEffect, useRef, useState } from "react";

const ICONS = ["⚛️ React", "🐍 Python", "🧠 PyTorch", "🐘 PostgreSQL", "☁️ AWS", "🐳 Docker", "⚡ Next.js"];

export default function DeveloperPhysicsMatrix({ accent = "#39ff88" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [interactiveMode, setInteractiveMode] = useState("attract");

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = container.clientWidth || 600);
    let height = (canvas.height = 240);

    const handleResize = () => {
      if (container) {
        width = canvas.width = container.clientWidth || 600;
        height = canvas.height = 240;
      }
    };

    window.addEventListener("resize", handleResize);

    // Floating Tech Badge Objects with 2D velocities
    const techNodes = ICONS.map((label, i) => ({
      label,
      x: 40 + (i * (width - 80)) / ICONS.length,
      y: 40 + Math.random() * (height - 80),
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
      radius: 36,
    }));

    // Particle Swarm
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      radius: Math.random() * 2.5 + 1.5,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isTouching = false;

    const updateCursor = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
      isTouching = true;
    };

    const handleMouseMove = (e) => updateCursor(e.clientX, e.clientY);
    const handleMouseLeave = () => { isTouching = false; };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) updateCursor(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchMove, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Grid background
      ctx.strokeStyle = "rgba(57, 255, 136, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Cursor Gravity Field Indicator
      if (isTouching) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 50, 0, Math.PI * 2);
        ctx.strokeStyle = `color-mix(in oklab, ${accent} 40%, transparent)`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Render Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 5 || p.x > width - 5) p.vx *= -1;
        if (p.y < 5 || p.y > height - 5) p.vy *= -1;

        if (isTouching) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 1) {
            const force = (120 - dist) / 120;
            p.vx += (dx / dist) * force * 0.4;
            p.vy += (dy / dist) * force * 0.4;
          }
        }

        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 4. Render Bouncing 2D Tech Nodes
      techNodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 45 || node.x > width - 45) node.vx *= -1;
        if (node.y < 25 || node.y > height - 25) node.vy *= -1;

        // Interaction with Cursor
        if (isTouching) {
          const dx = mouseX - node.x;
          const dy = mouseY - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 1) {
            const force = (100 - dist) / 100;
            node.vx -= (dx / dist) * force * 0.6;
            node.vy -= (dy / dist) * force * 0.6;
          }
        }

        // Speed dampening
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Keep minimum floating movement speed
        if (Math.abs(node.vx) < 0.2) node.vx += (Math.random() - 0.5) * 0.5;
        if (Math.abs(node.vy) < 0.2) node.vy += (Math.random() - 0.5) * 0.5;

        // Draw glowing tech badge
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.fillStyle = "rgba(5, 13, 8, 0.9)";
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.roundRect(-42, -14, 84, 28, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "11px var(--font-mono), monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, 0, 0);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleMouseLeave);
    };
  }, [accent]);

  return (
    <div
      ref={containerRef}
      className="developer-physics-card"
      style={{
        background: "#050d08",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        margin: "24px 0",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            2D GRAVITY PHYSICS MATRIX // BOUNCING TECH BADGES
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Interactive Particle &amp; Badge Sandbox</h4>
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
          Drag Finger or Cursor to Push Badges &amp; Attract Particles
        </span>
      </div>

      {/* Interactive Physics Canvas */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", background: "#020604", touchAction: "none" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: 240, display: "block" }} />
      </div>
    </div>
  );
}
