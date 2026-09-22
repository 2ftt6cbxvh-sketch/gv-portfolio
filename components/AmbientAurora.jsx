"use client";
import { useEffect, useRef, useMemo } from "react";

/**
 * AmbientAurora (v8.0.0)
 * Luxury Apple & Linear-inspired atmospheric aurora backdrop.
 * - Deep, multi-layered organic color orbs (Violet, Cyan, Mint, Champagne)
 * - Gentle mouse-reactive parallax drift with smooth damping
 * - Delicate micro-stardust speckles (0.8px - 1.2px, soft twinkle, zero spiderweb lines)
 * - Quadrant Secret Admin Tap Trigger (1 -> 2 -> 3 -> 4 -> 1 -> 3)
 */
export default function AmbientAurora({ accentColor = "#00f0ff", metadata }) {
  const canvasRef = useRef(null);

  const config = useMemo(() => {
    const defaults = {
      sequenceStr: "1,2,3,4,1,3",
      maxAttempts: 3,
      lockdownSec: 90,
      accentColor: "#00f0ff",
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    let tappedSequence = [];
    let ripples = [];
    let lastTapTimestamp = 0;

    // Handle mouse movement for subtle aurora drift
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Micro-stardust particles (minimal, peaceful, no connecting lines)
    const particleCount = width < 768 ? 28 : 55;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 0.9 + 0.5,
        alpha: Math.random() * 0.25 + 0.08,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.018 + 0.008,
        isAccent: Math.random() > 0.6,
      });
    }

    // Quadrant tap sequence detection
    const handlePointerAction = (clientX, clientY) => {
      const now = Date.now();
      if (now - lastTapTimestamp < 250) return;
      lastTapTimestamp = now;

      // Determine quadrant (1: Top-Left, 2: Top-Right, 3: Bottom-Left, 4: Bottom-Right)
      let quadrant = 1;
      const isRight = clientX > width / 2;
      const isBottom = clientY > height / 2;
      if (!isRight && !isBottom) quadrant = 1;
      if (isRight && !isBottom) quadrant = 2;
      if (!isRight && isBottom) quadrant = 3;
      if (isRight && isBottom) quadrant = 4;

      let seqInput = config.sequenceStr;
      if (!seqInput || seqInput.includes("1,3,4,2,1,4")) {
        seqInput = "1,2,3,4,1,3";
      }

      const targetSeq = seqInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 4);

      if (targetSeq.length === 0) return;

      const nextIndex = tappedSequence.length;

      if (targetSeq[nextIndex] === quadrant) {
        tappedSequence.push(quadrant);

        // Soft starlight ripple at tap
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 10,
          maxRadius: 120,
          alpha: 0.6,
          color: "rgba(0, 240, 255, ",
        });

        // Full sequence match!
        if (tappedSequence.length === targetSeq.length) {
          // Large celestial burst
          ripples.push({
            x: width / 2,
            y: height / 2,
            radius: 20,
            maxRadius: Math.max(width, height) * 0.6,
            alpha: 0.9,
            color: "rgba(176, 114, 255, ",
          });

          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("openAdminSecretGateway"));
            }
            tappedSequence = [];
          }, 450);
        }
      } else {
        // Mismatch
        tappedSequence = [];
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 10,
          maxRadius: 80,
          alpha: 0.5,
          color: "rgba(255, 60, 90, ",
        });
      }
    };

    const handleWindowClick = (e) => {
      // Ignore clicks on buttons, inputs, links, or mode cards
      if (e.target.closest("button, a, input, textarea, .portal, [role='button'], nav")) return;
      handlePointerAction(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        if (t.target.closest("button, a, input, textarea, .portal, [role='button'], nav")) return;
        handlePointerAction(t.clientX, t.clientY);
      }
    };

    window.addEventListener("click", handleWindowClick);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    let time = 0;

    const draw = () => {
      time += 0.008;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Check if user is inside a mode (editor/analyst/developer)
      const stageMode = document.getElementById("stage")?.getAttribute("data-mode");
      const isModeActive = !!(stageMode && stageMode.trim() !== "");

      // If in a sub-mode, reduce aurora intensity to let the mode's own canvas shine
      const opacityMultiplier = isModeActive ? 0.35 : 1.0;

      // 1. Render Atmospheric Aurora Orbs
      // Orb 1: Deep Violet / Indigo (Top Left shifting)
      const orb1X = width * 0.25 + Math.sin(time * 0.6) * 80 + (mouse.x - width / 2) * 0.06;
      const orb1Y = height * 0.28 + Math.cos(time * 0.5) * 60 + (mouse.y - height / 2) * 0.06;
      const orb1R = Math.max(width, height) * 0.45;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, orb1R);
      grad1.addColorStop(0, `rgba(110, 58, 255, ${0.18 * opacityMultiplier})`);
      grad1.addColorStop(0.5, `rgba(75, 30, 200, ${0.08 * opacityMultiplier})`);
      grad1.addColorStop(1, "rgba(75, 30, 200, 0)");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, orb1R, 0, Math.PI * 2);
      ctx.fill();

      // Orb 2: Electric Cyan / Sky (Top Right shifting)
      const orb2X = width * 0.75 + Math.cos(time * 0.7) * 90 + (mouse.x - width / 2) * 0.08;
      const orb2Y = height * 0.32 + Math.sin(time * 0.8) * 70 + (mouse.y - height / 2) * 0.08;
      const orb2R = Math.max(width, height) * 0.42;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, orb2R);
      grad2.addColorStop(0, `rgba(0, 220, 255, ${0.14 * opacityMultiplier})`);
      grad2.addColorStop(0.5, `rgba(0, 180, 230, ${0.06 * opacityMultiplier})`);
      grad2.addColorStop(1, "rgba(0, 180, 230, 0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, orb2R, 0, Math.PI * 2);
      ctx.fill();

      // Orb 3: Emerald Mint / Teal (Bottom Center breathing)
      const orb3X = width * 0.5 + Math.sin(time * 0.5 + 1.5) * 110 + (mouse.x - width / 2) * 0.05;
      const orb3Y = height * 0.72 + Math.cos(time * 0.6 + 1.0) * 80 + (mouse.y - height / 2) * 0.05;
      const orb3R = Math.max(width, height) * 0.48;
      const grad3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, orb3R);
      grad3.addColorStop(0, `rgba(57, 255, 136, ${0.09 * opacityMultiplier})`);
      grad3.addColorStop(0.5, `rgba(20, 180, 120, ${0.04 * opacityMultiplier})`);
      grad3.addColorStop(1, "rgba(20, 180, 120, 0)");
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(orb3X, orb3Y, orb3R, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render Micro-stardust
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinklePhase)) * opacityMultiplier;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isAccent
          ? `rgba(0, 240, 255, ${currentAlpha * 0.9})`
          : `rgba(240, 240, 255, ${currentAlpha})`;
        ctx.fill();
      }

      // 3. Render Quadrant Interaction Ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 3.5;
        rip.alpha *= 0.94;

        if (rip.alpha <= 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${rip.color}${rip.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `${rip.color}${rip.alpha * 0.8})`;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(animFrameId);
    };
  }, [config, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className="ambient-aurora"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
