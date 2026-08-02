"use client";
import { useEffect, useRef, useMemo } from "react";

/**
 * Rich Cinematic WebGL/Canvas Constellation & 4-Quadrant Harry Potter Spell Rune Canvas
 * Features:
 * - 65 Floating Ambient Constellation Particles connected by real-time vector lines (d < 160px)
 * - 4 Glowing Magic Corner Anchor Stars (Cyan/Blue #00f0ff matching background particles)
 * - 250ms Touch Debouncing to eliminate duplicate synthetic click/touchstart collisions on Mobile/Trackpads
 * - 100% Reliable Quadrant Tap Detection: Top-Left (1), Top-Right (2), Bottom-Left (3), Bottom-Right (4)
 * - Default 6-Stroke Spell Sequence: 1 -> 2 -> 3 -> 4 -> 1 -> 3 (Top-Left -> Top-Right -> Bottom-Left -> Bottom-Right -> Top-Left -> Bottom-Left)
 */
export default function LandingConstellation({ accentColor = "#00f0ff", metadata }) {
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
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = { x: -1000, y: -1000 };
    const sparks = [];
    const magicSpells = [];
    let tappedSequence = [];
    let failedAttempts = 0;
    let isLockedDown = false;
    let lockdownTimer = null;
    let isSpellFracture = false;
    let pulseTime = 0;
    let lastTapTimestamp = 0;

    // 1. 65 Ambient Constellation Particles (Background Stars & Vector Lines)
    const particleCount = width < 768 ? 40 : 65;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 1.8 + 1.0,
        alpha: Math.random() * 0.55 + 0.25,
      });
    }

    const updatePointerPos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;

      for (let i = 0; i < 2; i++) {
        sparks.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.4,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.025,
          size: Math.random() * 2.5 + 1,
        });
      }
    };

    const handleMouseMove = (e) => updatePointerPos(e.clientX, e.clientY);

    const processTapAtCoordinates = (clickX, clickY) => {
      if (isLockedDown) return;

      const now = Date.now();
      if (now - lastTapTimestamp < 250) return; // Prevent double-triggering from touchstart + synthetic click!
      lastTapTimestamp = now;

      // Determine Star ID from Screen Quadrants
      // Star 1 = Top-Left, Star 2 = Top-Right, Star 3 = Bottom-Left, Star 4 = Bottom-Right
      const isLeft = clickX < width / 2;
      const isTop = clickY < height / 2;

      let tappedStarId = 0;
      if (isTop && isLeft) tappedStarId = 1;
      else if (isTop && !isLeft) tappedStarId = 2;
      else if (!isTop && isLeft) tappedStarId = 3;
      else tappedStarId = 4;

      // Dynamic sequence check (Default: 1,2,3,4,1,3)
      const targetSeq = (config.sequenceStr || "1,2,3,4,1,3")
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 4);

      if (targetSeq.length === 0) return;

      const nextIndex = tappedSequence.length;

      // Check step match
      if (targetSeq[nextIndex] === tappedStarId) {
        tappedSequence.push(tappedStarId);

        // Spell Burst Fireworks on Tapped Location
        for (let m = 0; m < 40; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          magicSpells.push({
            x: clickX,
            y: clickY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.025 + 0.015,
            size: Math.random() * 4.5 + 2,
            color: config.accentColor || "#00f0ff",
          });
        }

        // Full sequence completed!
        if (tappedSequence.length === targetSeq.length) {
          for (let m = 0; m < 60; m++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 3;
            magicSpells.push({
              x: width / 2,
              y: height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.4,
              decay: 0.012,
              size: Math.random() * 6.5 + 2.5,
              color: config.accentColor || "#00f0ff",
            });
          }

          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("openAdminSecretGateway"));
            }
            tappedSequence = [];
            failedAttempts = 0;
          }, 450);
        }
      } else {
        // Sequence mismatch!
        failedAttempts += 1;
        isSpellFracture = true;
        setTimeout(() => { isSpellFracture = false; }, 450);

        try {
          fetch("/api/public/verify-vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "pattern_mismatch" }),
          });
        } catch (e) {}

        tappedSequence = [];

        if (failedAttempts >= (config.maxAttempts || 3)) {
          isLockedDown = true;
          try {
            fetch("/api/public/verify-vault", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "lockdown_triggered" }),
            });
          } catch (e) {}

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("triggerCyberLockdown", { detail: { seconds: config.lockdownSec || 90 } }));
          }

          lockdownTimer = setTimeout(() => {
            isLockedDown = false;
            failedAttempts = 0;
          }, (config.lockdownSec || 90) * 1000);
        }
      }
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      processTapAtCoordinates(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        updatePointerPos(touch.clientX, touch.clientY);
        processTapAtCoordinates(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("click", handleCanvasClick);

    // Render Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      pulseTime += 0.035;

      // 1. Draw 65 Ambient Constellation Particles & Vector Lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.7})`;
        ctx.fill();

        // Vector connection lines to nearby particles (d < 160px)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const lineAlpha = (1 - dist / 160) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Vector connection to mouse cursor
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 170) {
          const mlineAlpha = (1 - mdist / 170) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${mlineAlpha})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // 2. Draw 4 Corner Anchor Stars (Cyan/Blue #00f0ff, Pulsing Aura, Matches Constellation Style)
      const cornerStars = [
        { id: 1, x: Math.max(60, width * 0.12), y: Math.max(60, height * 0.15) },
        { id: 2, x: Math.min(width - 60, width * 0.88), y: Math.max(60, height * 0.15) },
        { id: 3, x: Math.max(60, width * 0.12), y: Math.min(height - 60, height * 0.85) },
        { id: 4, x: Math.min(width - 60, width * 0.88), y: Math.min(height - 60, height * 0.85) },
      ];

      cornerStars.forEach((star) => {
        const starColor = isSpellFracture ? "#ff003c" : (config.accentColor || "#00f0ff");
        const pulseRadius = 8.5 + Math.sin(pulseTime * 2 + star.id) * 2.5;

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, pulseRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isSpellFracture ? "rgba(255, 0, 60, 0.4)" : "rgba(0, 240, 255, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(star.x, star.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.shadowColor = starColor;
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.restore();
      });

      // 3. Render Magic Spells & Cursor Sparks
      for (let i = magicSpells.length - 1; i >= 0; i--) {
        const p = magicSpells[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          magicSpells.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.restore();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = s.life * 0.75;
        ctx.fill();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animFrameId);
      if (lockdownTimer) clearTimeout(lockdownTimer);
    };
  }, [config, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 1,
      }}
    />
  );
}
