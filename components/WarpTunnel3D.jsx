"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

const WarpTunnel3D = forwardRef(function WarpTunnel3D({ accent = "#00f0ff" }, ref) {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const activeColorRef = useRef(accent);

  useImperativeHandle(ref, () => ({
    triggerWarp: (targetColor) => {
      activeColorRef.current = targetColor || accent;
      setIsActive(true);
    },
  }));

  useEffect(() => {
    // Listen for custom global event window.triggerWarpTunnel(color)
    const handleWarpEvent = (e) => {
      const color = e.detail?.color || accent;
      activeColorRef.current = color;
      setIsActive(true);
    };

    window.addEventListener("triggerWarpTunnel", handleWarpEvent);
    return () => window.removeEventListener("triggerWarpTunnel", handleWarpEvent);
  }, [accent]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let startTime = performance.now();
    const duration = 800; // 0.8 seconds

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const centerX = width / 2;
    const centerY = height / 2;

    // 140 3D Hyperspace Light Streak Particles
    const particles = Array.from({ length: 140 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 40 + 5;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * 800 + 10,
        speed: Math.random() * 18 + 12,
        length: Math.random() * 60 + 20,
        color: Math.random() > 0.4 ? activeColorRef.current : "#00f0ff",
      };
    });

    const render = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, width, height);

      // Flash background HUD glow
      const fadeAlpha = progress > 0.7 ? (1 - progress) / 0.3 : progress / 0.7;
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha * 0.85})`;
      ctx.fillRect(0, 0, width, height);

      // Iron Man JARVIS Arc Reactor HUD Center Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.arc(0, 0, progress * (width * 0.6), 0, Math.PI * 2);
      ctx.strokeStyle = activeColorRef.current;
      ctx.lineWidth = 3;
      ctx.shadowColor = activeColorRef.current;
      ctx.shadowBlur = 20;
      ctx.globalAlpha = fadeAlpha * 0.9;
      ctx.stroke();
      ctx.restore();

      // Render 3D Light Streaks
      particles.forEach((p) => {
        // Accelerate Z towards camera
        p.z -= p.speed * (1 + progress * 3);
        if (p.z <= 1) p.z = 800;

        // Project 3D (x, y, z) to 2D Screen
        const k = 400 / p.z;
        const px = p.x * k + centerX;
        const py = p.y * k + centerY;

        const prevK = 400 / (p.z + p.length);
        const prevPx = p.x * prevK + centerX;
        const prevPy = p.y * prevK + centerY;

        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, (1 - p.z / 800) * 4.5);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = fadeAlpha * (1 - p.z / 800);

        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.restore();
      });

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        setIsActive(false);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
});

export default WarpTunnel3D;
