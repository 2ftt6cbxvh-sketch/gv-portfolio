"use client";
import { useEffect, useRef, useState, useMemo } from "react";

/**
 * 4-Star Multi-Stroke Harry Potter Spell Rune Constellation Canvas
 * Features:
 * - 4 Floating Secret Stars in Bounded Safe Outer Zones (Star 1, 2, 3, 4)
 * - Multi-Stroke Sequence Verification (Default: 1 -> 3 -> 4 -> 2 -> 1 -> 4)
 * - 3-Strike Failed Attempts Counter
 * - 30-Second Silent Security Lockdown
 * - Full Admin Panel Customization
 */
export default function LandingConstellation({ accentColor = "#00f0ff", metadata }) {
  const canvasRef = useRef(null);

  // Parse Config from Admin Panel
  const config = useMemo(() => {
    const defaults = {
      sequenceStr: "1,3,4,2,1,4",
      maxAttempts: 3,
      lockdownSec: 30,
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

  const targetSequence = useMemo(() => {
    return config.sequenceStr
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 4);
  }, [config.sequenceStr]);

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

    // 4 Secret Constellation Stars in Outer Safe Floating Zones
    const secretStars = [
      // Star 1: Top-Left Zone
      { id: 1, x: Math.random() * (width * 0.25) + 40, y: Math.random() * (height * 0.28) + 60, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: 4.5, minX: 30, maxX: width * 0.32, minY: 50, maxY: height * 0.38 },
      // Star 2: Top-Right Zone
      { id: 2, x: Math.random() * (width * 0.25) + width * 0.68, y: Math.random() * (height * 0.28) + 60, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: 4.5, minX: width * 0.68, maxX: width - 30, minY: 50, maxY: height * 0.38 },
      // Star 3: Bottom-Left Zone
      { id: 3, x: Math.random() * (width * 0.25) + 40, y: Math.random() * (height * 0.2) + height * 0.72, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: 4.5, minX: 30, maxX: width * 0.4, minY: height * 0.72, maxY: height - 40 },
      // Star 4: Bottom-Right Zone
      { id: 4, x: Math.random() * (width * 0.25) + width * 0.68, y: Math.random() * (height * 0.2) + height * 0.72, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: 4.5, minX: width * 0.6, maxX: width - 30, minY: height * 0.72, maxY: height - 40 },
    ];

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

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

    const handleClick = (e) => {
      if (isLockedDown) return; // Silent Security Lockdown blocks all pattern triggers

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      secretStars.forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 70) {
          const nextIndex = tappedSequence.length;

          // Check if clicked star matches the next step in target sequence
          if (targetSequence[nextIndex] === star.id) {
            tappedSequence.push(star.id);

            // Spawn Lumos Wand Sparkles
            for (let m = 0; m < 25; m++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 4 + 2;
              magicSpells.push({
                x: star.x,
                y: star.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.015,
                size: Math.random() * 4 + 2,
                color: config.accentColor || "#ffd700",
              });
            }

            // Full Sequence Match!
            if (tappedSequence.length === targetSequence.length) {
              secretStars.forEach((s) => {
                for (let m = 0; m < 35; m++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 6 + 3;
                  magicSpells.push({
                    x: s.x,
                    y: s.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.3,
                    decay: 0.015,
                    size: Math.random() * 5 + 2,
                    color: config.accentColor || "#ffd700",
                  });
                }
              });

              setTimeout(() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("openAdminSecretGateway"));
                }
                tappedSequence = [];
                failedAttempts = 0;
              }, 600);
            }
          } else {
            // Sequence Break / Mismatch!
            failedAttempts += 1;
            isSpellFracture = true;
            setTimeout(() => { isSpellFracture = false; }, 400);

            tappedSequence = []; // Reset current sequence attempt

            // 3-Strike Security Lockdown
            if (failedAttempts >= (config.maxAttempts || 3)) {
              isLockedDown = true;
              lockdownTimer = setTimeout(() => {
                isLockedDown = false;
                failedAttempts = 0;
              }, (config.lockdownSec || 30) * 1000);
            }
          }
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    document.addEventListener("mouseleave", handleMouseLeave);

    const particleCount = Math.min(Math.floor((width * height) / 14000), 55);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.5 + 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Harry Potter Magic Wand Spell Particles
      for (let i = magicSpells.length - 1; i >= 0; i--) {
        const ms = magicSpells[i];
        ms.x += ms.vx;
        ms.y += ms.vy;
        ms.life -= ms.decay;

        if (ms.life <= 0) {
          magicSpells.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ms.x, ms.y, ms.size * ms.life, 0, Math.PI * 2);
        ctx.fillStyle = ms.color;
        ctx.globalAlpha = ms.life;
        ctx.shadowColor = ms.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      // 2. Render cursor spark trail
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = s.life * 0.85;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Update & render normal constellation particles + CONNECT TO CURSOR!
      const allNodes = [...particles, ...secretStars];

      secretStars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < star.minX || star.x > star.maxX) star.vx *= -1;
        if (star.y < star.minY || star.y > star.maxY) star.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Connect particles & stars to cursor
      allNodes.forEach((node) => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 170) {
          const lineAlpha = (1 - dist / 170) * 0.45;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = lineAlpha;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      });

      // 4. Render 4 Secret Stars
      secretStars.forEach((star) => {
        const isTapped = tappedSequence.includes(star.id);
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, isTapped ? 7 : star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isTapped ? config.accentColor || "#ffd700" : accentColor;
        ctx.shadowColor = isTapped ? config.accentColor || "#ffd700" : accentColor;
        ctx.shadowBlur = isTapped ? 24 : 8;
        ctx.globalAlpha = isTapped ? 1.0 : 0.75;
        ctx.fill();
        ctx.restore();
      });

      // Draw multi-stroke spell rune laser line sequence
      if (tappedSequence.length > 1) {
        ctx.save();
        ctx.beginPath();
        const startStar = secretStars.find((s) => s.id === tappedSequence[0]);
        if (startStar) {
          ctx.moveTo(startStar.x, startStar.y);
          for (let k = 1; k < tappedSequence.length; k++) {
            const nextStar = secretStars.find((s) => s.id === tappedSequence[k]);
            if (nextStar) ctx.lineTo(nextStar.x, nextStar.y);
          }
        }
        ctx.strokeStyle = isSpellFracture ? "#ff4b4b" : config.accentColor || "#ffd700";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = isSpellFracture ? "#ff4b4b" : config.accentColor || "#ffd700";
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      if (lockdownTimer) clearTimeout(lockdownTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [accentColor, config, targetSequence]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 0,
      }}
    />
  );
}
