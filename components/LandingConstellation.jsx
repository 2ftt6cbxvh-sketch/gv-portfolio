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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
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

    // 1. 75 Ambient Constellation Particles (Mix of Warm Champagne Gold & Cyan Stars)
    const particleCount = width < 768 ? 40 : 70;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const isGold = Math.random() > 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        radius: Math.random() * 1.2 + 0.6,
        alpha: Math.random() * 0.35 + 0.15,
        isGold,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // 2. 4 Floating Big Yellow Magic Stars in Screen Corners (Safe Viewport Bounds)
    const updateCornerBounds = () => {
      const safeMarginX = Math.min(width * 0.22, 240);
      const safeMarginY = Math.min(height * 0.25, 220);
      return {
        1: { id: 1, x: Math.random() * (safeMarginX - 50) + 50, y: Math.random() * (safeMarginY - 60) + 60, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, minX: 45, maxX: safeMarginX + 30, minY: 55, maxY: safeMarginY + 20 },
        2: { id: 2, x: width - safeMarginX + Math.random() * (safeMarginX - 60), y: Math.random() * (safeMarginY - 60) + 60, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, minX: width - safeMarginX - 30, maxX: width - 45, minY: 55, maxY: safeMarginY + 20 },
        3: { id: 3, x: Math.random() * (safeMarginX - 50) + 50, y: height - safeMarginY + Math.random() * (safeMarginY - 60), vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, minX: 45, maxX: safeMarginX + 30, minY: height - safeMarginY - 20, maxY: height - 55 },
        4: { id: 4, x: width - safeMarginX + Math.random() * (safeMarginX - 60), y: height - safeMarginY + Math.random() * (safeMarginY - 60), vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, minX: width - safeMarginX - 30, maxX: width - 45, minY: height - safeMarginY - 20, maxY: height - 55 },
      };
    };

    const secretStarsMap = updateCornerBounds();

    // Spawn delicate sparks on mouse movement
    const updatePointerPos = (clientX, clientY) => {
      mouse.x = clientX;
      mouse.y = clientY;

      // Spawn soft trailing stardust sparks around mouse (Warm Champagne Gold, Soft Pearl, Ethereal Cyan)
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.3;
        const color = Math.random() > 0.35 ? "rgba(240, 220, 145, 0.75)" : (Math.random() > 0.5 ? "rgba(255, 248, 210, 0.8)" : "rgba(110, 230, 245, 0.65)");
        sparks.push({
          x: mouse.x + (Math.random() - 0.5) * 4,
          y: mouse.y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 0.4,
          life: 0.85,
          decay: Math.random() * 0.04 + 0.025,
          size: Math.random() * 1.6 + 0.8,
          color,
        });
      }
    };

    const handleMouseMove = (e) => updatePointerPos(e.clientX, e.clientY);

    // Process Tap on Big Yellow Stars
    const processTapAtCoordinates = (clickX, clickY) => {
      if (isLockedDown) return;

      const now = Date.now();
      if (now - lastTapTimestamp < 250) return; // Prevent double-triggering
      lastTapTimestamp = now;

      // Hit Testing (44px Radius directly around the big glowing star center)
      let tappedStarId = 0;
      Object.values(secretStarsMap).forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 44) {
          tappedStarId = star.id;
        }
      });

      // Ignore tap if not on a star
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
        animLineProgress = 0; // Trigger animated golden rune drawing

        const starObj = secretStarsMap[tappedStarId];
        const spawnX = starObj ? starObj.x : clickX;
        const spawnY = starObj ? starObj.y : clickY;

        // Soft Champagne Spell Burst on Tapped Star
        for (let m = 0; m < 30; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5.5 + 1.8;
          magicSpells.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.85,
            decay: Math.random() * 0.03 + 0.02,
            size: Math.random() * 3.2 + 1.2,
            color: Math.random() > 0.3 ? "rgba(242, 222, 148, 0.8)" : "rgba(255, 248, 215, 0.85)",
          });
        }

        // Full sequence completed! Trigger Admin Secret Gateway
        if (tappedSequence.length === targetSeq.length) {
          for (let m = 0; m < 60; m++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            magicSpells.push({
              x: width / 2,
              y: height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.2,
              decay: 0.015,
              size: Math.random() * 4.5 + 2,
              color: "rgba(242, 222, 148, 0.85)",
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
        // Sequence mismatch! Red fracture lines
        failedAttempts += 1;
        isSpellFracture = true;
        fractureSequence = [...tappedSequence, tappedStarId];

        const starObj = secretStarsMap[tappedStarId];
        const spawnX = starObj ? starObj.x : clickX;
        const spawnY = starObj ? starObj.y : clickY;

        for (let m = 0; m < 45; m++) {
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

    const handleWindowClick = (e) => {
      processTapAtCoordinates(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerPos(touch.clientX, touch.clientY);
        processTapAtCoordinates(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("click", handleWindowClick, { passive: true });

    // Helper: Draw Minimal, Lighter Starlight Celestial Star
    const drawBigYellowStar = (starX, starY, starId, isRed) => {
      const starColor = isRed ? "rgba(255, 70, 90, 0.85)" : "rgba(242, 222, 148, 0.8)";
      const glowColor = isRed ? "rgba(255, 50, 70, 0.45)" : "rgba(240, 215, 120, 0.4)";
      // Gentle, calm breathing pulse (no rapid flashing)
      const pulse = Math.sin(pulseTime * 0.9 + starId) * 0.6;
      const baseRadius = 5.2 + pulse;
      // Very gentle, imperceptible drift instead of fast spinning
      const rotationAngle = pulseTime * 0.05 + starId;

      ctx.save();
      ctx.translate(starX, starY);

      // 1. Subtle, Soft Ambient Luminescence Halo
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = isRed ? "rgba(255, 60, 90, 0.06)" : "rgba(242, 222, 148, 0.05)";
      ctx.fill();

      // 2. Refined, Minimal 4-Point Slender Starlight Flare Rays
      ctx.save();
      ctx.rotate(rotationAngle);
      const rayLen = baseRadius * 2.4;
      const rayWidth = baseRadius * 0.28;

      ctx.beginPath();
      // Vertical slender ray
      ctx.moveTo(0, -rayLen);
      ctx.lineTo(rayWidth, 0);
      ctx.lineTo(0, rayLen);
      ctx.lineTo(-rayWidth, 0);
      ctx.closePath();
      // Horizontal slender ray
      ctx.moveTo(-rayLen, 0);
      ctx.lineTo(0, rayWidth);
      ctx.lineTo(rayLen, 0);
      ctx.lineTo(0, -rayWidth);
      ctx.closePath();

      ctx.fillStyle = starColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // 3. Delicate Center Core
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Soft Warm Center Point
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isRed ? "rgba(255, 220, 220, 0.9)" : "rgba(255, 252, 235, 0.85)";
      ctx.fill();

      ctx.restore();
    };

    // Render Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      pulseTime += 0.035;
      if (animLineProgress < 1.0) animLineProgress += 0.08;

      // Check if user is currently inside a mode view (e.g. Editor, Developer, Analyst)
      const stageMode = document.getElementById("stage")?.getAttribute("data-mode");
      if (stageMode && stageMode.trim() !== "") {
        animFrameId = requestAnimationFrame(draw);
        return;
      }

      // 1. Draw Ambient Constellation Particles & Vector Lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Soft, gentle twinkle factor
        const twinkle = Math.sin(pulseTime * 1.4 + p.twinklePhase) * 0.15;
        const currentAlpha = Math.max(0.1, Math.min(0.65, p.alpha + twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.isGold) {
          ctx.fillStyle = `rgba(240, 220, 145, ${currentAlpha * 0.75})`;
          ctx.shadowColor = "rgba(240, 220, 145, 0.3)";
          ctx.shadowBlur = 3;
        } else {
          ctx.fillStyle = `rgba(0, 220, 240, ${currentAlpha * 0.65})`;
          ctx.shadowColor = "rgba(0, 220, 240, 0.2)";
          ctx.shadowBlur = 2;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vector connection lines to nearby particles (d < 160px)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const lineAlpha = (1 - dist / 160) * 0.14;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            if (p.isGold || p2.isGold) {
              ctx.strokeStyle = `rgba(240, 220, 145, ${lineAlpha * 0.65})`;
            } else {
              ctx.strokeStyle = `rgba(0, 220, 240, ${lineAlpha * 0.7})`;
            }
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Vector connection lines to mouse cursor (mdist < 180px)
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180) {
          const mlineAlpha = (1 - mdist / 180) * 0.28;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = p.isGold ? `rgba(240, 220, 145, ${mlineAlpha})` : `rgba(0, 220, 240, ${mlineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // 2. Update Floating Motion for 4 Magic Stars
      Object.values(secretStarsMap).forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x <= star.minX || star.x >= star.maxX) star.vx *= -1;
        if (star.y <= star.minY || star.y >= star.maxY) star.vy *= -1;
      });

      // 3. Draw Connecting Golden Rune Lines Between Tapped Stars
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
              const currentX = prevStar.x + (nextStar.x - prevStar.x) * Math.min(1.0, animLineProgress);
              const currentY = prevStar.y + (nextStar.y - prevStar.y) * Math.min(1.0, animLineProgress);
              ctx.lineTo(currentX, currentY);
            } else {
              ctx.lineTo(nextStar.x, nextStar.y);
            }
          }
        }

        const lineColor = isSpellFracture ? "#ff003c" : "rgba(242, 222, 148, 0.85)";
        ctx.strokeStyle = lineColor;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = isSpellFracture ? 20 : 10;
        ctx.lineWidth = isSpellFracture ? 2.8 : 1.8;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render 4 Big Yellow Glowing Stars
      Object.values(secretStarsMap).forEach((star) => {
        drawBigYellowStar(star.x, star.y, star.id, isSpellFracture);
      });

      // 5. Render Magic Fireworks Spells
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

      // 6. Render Magical Mouse Sparks
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
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = s.life * 0.85;
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
      window.removeEventListener("click", handleWindowClick);
      cancelAnimationFrame(animFrameId);
      if (lockdownTimer) clearTimeout(lockdownTimer);
    };
  }, [config, accentColor]);

  return (
    <canvas
      ref={canvasRef}
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
