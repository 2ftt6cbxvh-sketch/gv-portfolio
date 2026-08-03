"use client";
import { useEffect, useRef, useMemo } from "react";

/**
 * Harry Potter Spell Rune Constellation Canvas (v6.6.0)
 * Features:
 * - 4 Randomly Floating Glowing Magic Stars (Golden Yellow #ffd700, smooth vector motion physics)
 * - Layered Behind Mode Cards & Text (zIndex: 1)
 * - Real-Time Animated Golden Rune Lines (#ffd700) connecting stars as you draw the spell
 * - Vivid Red Line & Fracture Glow (#ff003c) when a wrong pattern/star is clicked!
 * - 65 Floating Ambient Constellation Particles connected by real-time vector lines (d < 160px)
 * - 250ms Touch Debouncing to eliminate duplicate synthetic click/touchstart collisions on Mobile/Trackpads
 * - 100% Reliable Quadrant Tap Detection: Top-Left (1), Top-Right (2), Bottom-Left (3), Bottom-Right (4)
 * - Default 6-Stroke Spell Sequence: 1 -> 2 -> 3 -> 4 -> 1 -> 3 (Top-Left -> Top-Right -> Bottom-Left -> Bottom-Right -> Top-Left -> Bottom-Left)
 */
export default function LandingConstellation({ accentColor = "#ffd700", metadata }) {
  const canvasRef = useRef(null);

  const config = useMemo(() => {
    const defaults = {
      sequenceStr: "1,2,3,4,1,3",
      maxAttempts: 3,
      lockdownSec: 90,
      accentColor: "#ffd700",
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
    let fractureSequence = [];
    let pulseTime = 0;
    let lastTapTimestamp = 0;

    // Line Animation State (Smooth Lerp Interpolation)
    let animLineProgress = 0;
    let linePoints = [];

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

    // 2. 4 Randomly Floating Secret Magic Stars in Outer Safe Floating Zones
    const bottomMinY = Math.max(height - 150, height * 0.76);
    const bottomMaxY = height - 40;

    const secretStarsMap = {
      1: { id: 1, x: Math.random() * (width * 0.22) + 40, y: Math.random() * (height * 0.25) + 60, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, minX: 35, maxX: width * 0.3, minY: 50, maxY: height * 0.38 },
      2: { id: 2, x: Math.random() * (width * 0.22) + width * 0.7, y: Math.random() * (height * 0.25) + 60, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, minX: width * 0.7, maxX: width - 35, minY: 50, maxY: height * 0.38 },
      3: { id: 3, x: Math.random() * (width * 0.22) + 40, y: Math.random() * (bottomMaxY - bottomMinY) + bottomMinY, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, minX: 35, maxX: width * 0.32, minY: bottomMinY, maxY: bottomMaxY },
      4: { id: 4, x: Math.random() * (width * 0.22) + width * 0.7, y: Math.random() * (bottomMaxY - bottomMinY) + bottomMinY, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, minX: width * 0.68, maxX: width - 35, minY: bottomMinY, maxY: bottomMaxY },
    };

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

      // Precise Star Hit Testing (38px Touch Radius directly around floating magic star center)
      let tappedStarId = 0;
      Object.values(secretStarsMap).forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 38) {
          tappedStarId = star.id;
        }
      });

      // Ignore tap completely if tap was NOT directly on a magic star!
      if (tappedStarId === 0) return;

      // Dynamic sequence check (Default: 1,2,3,4,1,3)
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

      // Check step match
      if (targetSeq[nextIndex] === tappedStarId) {
        tappedSequence.push(tappedStarId);
        animLineProgress = 0; // Trigger line drawing animation!

        const starObj = secretStarsMap[tappedStarId];
        const spawnX = starObj ? starObj.x : clickX;
        const spawnY = starObj ? starObj.y : clickY;

        // Golden Spell Burst Fireworks on Tapped Star Location
        for (let m = 0; m < 45; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 7 + 2.5;
          magicSpells.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.025 + 0.015,
            size: Math.random() * 5 + 2.5,
            color: "#ffd700",
          });
        }

        // Full sequence completed!
        if (tappedSequence.length === targetSeq.length) {
          for (let m = 0; m < 85; m++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 11 + 4;
            magicSpells.push({
              x: width / 2,
              y: height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.5,
              decay: 0.01,
              size: Math.random() * 7.5 + 3,
              color: "#ffd700",
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
        // Sequence mismatch! Store red fracture lines
        failedAttempts += 1;
        isSpellFracture = true;
        fractureSequence = [...tappedSequence, tappedStarId];

        const starObj = secretStarsMap[tappedStarId];
        const spawnX = starObj ? starObj.x : clickX;
        const spawnY = starObj ? starObj.y : clickY;

        // Red spell fracture burst particles
        for (let m = 0; m < 40; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 7 + 2;
          magicSpells.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.03,
            size: Math.random() * 5 + 2,
            color: "#ff003c",
          });
        }

        setTimeout(() => {
          isSpellFracture = false;
          fractureSequence = [];
        }, 550);

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
      if (animLineProgress < 1.0) animLineProgress += 0.08;

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

      // 2. Update Randomly Floating Secret Magic Stars Velocity Motion
      Object.values(secretStarsMap).forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x <= star.minX || star.x >= star.maxX) star.vx *= -1;
        if (star.y <= star.minY || star.y >= star.maxY) star.vy *= -1;
      });

      // 3. Draw Animated Connecting Magic Spell Rune Lines Between Tapped Stars!
      const activeLineSeq = isSpellFracture ? fractureSequence : tappedSequence;

      if (activeLineSeq.length > 1) {
        ctx.save();
        ctx.beginPath();

        const startStar = secretStarsMap[activeLineSeq[0]];
        if (startStar) ctx.moveTo(startStar.x, startStar.y);

        for (let k = 1; k < activeLineSeq.length; k++) {
          const prevStar = secretStarsMap[activeLineSeq[k - 1]];
          const nextStar = secretStarsMap[activeLineSeq[k]];

          if (prevStar && nextStar) {
            if (k === activeLineSeq.length - 1 && animLineProgress < 1.0) {
              // Smooth animated drawing lerp for the latest line segment!
              const currentX = prevStar.x + (nextStar.x - prevStar.x) * Math.min(1.0, animLineProgress);
              const currentY = prevStar.y + (nextStar.y - prevStar.y) * Math.min(1.0, animLineProgress);
              ctx.lineTo(currentX, currentY);
            } else {
              ctx.lineTo(nextStar.x, nextStar.y);
            }
          }
        }

        // Golden Yellow (#ffd700) when drawing correctly, Vivid Red (#ff003c) on wrong pattern mismatch!
        const lineColor = isSpellFracture ? "#ff003c" : "#ffd700";
        ctx.strokeStyle = lineColor;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = isSpellFracture ? 26 : 20;
        ctx.lineWidth = isSpellFracture ? 3.8 : 2.8;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw 4 Randomly Floating Magic Secret Stars (Golden Yellow #ffd700, Pulsing Aura, Original Style)
      Object.values(secretStarsMap).forEach((star) => {
        const starColor = isSpellFracture ? "#ff003c" : "#ffd700";
        const pulseRadius = 8.5 + Math.sin(pulseTime * 2 + star.id) * 2.5;

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, pulseRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isSpellFracture ? "rgba(255, 0, 60, 0.5)" : "rgba(255, 215, 0, 0.4)";
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

      // 5. Render Magic Spells & Cursor Sparks
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
