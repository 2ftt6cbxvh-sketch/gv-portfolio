"use client";
import { useEffect, useRef, useMemo } from "react";

/**
 * 4-Star Multi-Stroke Harry Potter Spell Rune Constellation Canvas
 * Features:
 * - 4 MOVING Secret Stars in Bounded Outer Safe Zones (NEVER behind mode cards!)
 * - Multi-Stroke Sequence Verification (Default: 1 -> 2 -> 3 -> 4 -> 1 -> 3)
 * - Single Closest Star Tap Precision (No multi-star trigger on single tap!)
 * - Dynamic Server Metadata Sequence Parsing
 * - 3-Strike Security Lockdown Modal with Indian IT Act Law
 */
export default function LandingConstellation({ accentColor = "#00f0ff", metadata }) {
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

    // 4 MOVING Secret Stars in Outer Safe Floating Zones (NEVER behind mode cards!)
    const bottomMinY = Math.max(height - 140, height * 0.78);
    const bottomMaxY = height - 35;

    const secretStars = [
      // Star 1: Far Top-Left Zone
      { id: 1, x: Math.random() * (width * 0.22) + 30, y: Math.random() * (height * 0.25) + 50, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, radius: 5.0, minX: 30, maxX: width * 0.28, minY: 50, maxY: height * 0.35 },
      // Star 2: Far Top-Right Zone
      { id: 2, x: Math.random() * (width * 0.22) + width * 0.72, y: Math.random() * (height * 0.25) + 50, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, radius: 5.0, minX: width * 0.72, maxX: width - 30, minY: 50, maxY: height * 0.35 },
      // Star 3: Far Bottom-Left Zone
      { id: 3, x: Math.random() * (width * 0.22) + 30, y: Math.random() * (bottomMaxY - bottomMinY) + bottomMinY, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, radius: 5.0, minX: 30, maxX: width * 0.3, minY: bottomMinY, maxY: bottomMaxY },
      // Star 4: Far Bottom-Right Zone
      { id: 4, x: Math.random() * (width * 0.22) + width * 0.72, y: Math.random() * (bottomMaxY - bottomMinY) + bottomMinY, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, radius: 5.0, minX: width * 0.7, maxX: width - 30, minY: bottomMinY, maxY: bottomMaxY },
    ];

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

      const isMobile = width < 768;
      const touchRadius = isMobile ? 90 : 70;

      // Parse current target sequence dynamically
      const targetSeq = (config.sequenceStr || "1,2,3,4,1,3")
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 4);

      if (targetSeq.length === 0) return;

      // Find the SINGLE closest star to click coordinates
      let closestStar = null;
      let minDistance = Infinity;

      secretStars.forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < touchRadius && dist < minDistance) {
          minDistance = dist;
          closestStar = star;
        }
      });

      // If no star was tapped, ignore click
      if (!closestStar) return;

      const nextIndex = tappedSequence.length;

      // Check if tapped star matches the expected sequence step
      if (targetSeq[nextIndex] === closestStar.id) {
        tappedSequence.push(closestStar.id);

        // Burst magic spell particles on correct star tap
        for (let m = 0; m < 35; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          magicSpells.push({
            x: closestStar.x,
            y: closestStar.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.025 + 0.015,
            size: Math.random() * 4.5 + 2,
            color: config.accentColor || "#ffd700",
          });
        }

        // Check if full sequence completed!
        if (tappedSequence.length === targetSeq.length) {
          secretStars.forEach((s) => {
            for (let m = 0; m < 45; m++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 8 + 3;
              magicSpells.push({
                x: s.x,
                y: s.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.3,
                decay: 0.015,
                size: Math.random() * 6 + 2,
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
          }, 450);
        }
      } else {
        // Sequence mismatch! Reset sequence & trigger alert
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

    // Animation Render Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Secret Stars
      secretStars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x <= star.minX || star.x >= star.maxX) star.vx *= -1;
        if (star.y <= star.minY || star.y >= star.maxY) star.vy *= -1;

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSpellFracture ? "#ff003c" : (config.accentColor || "#ffd700");
        ctx.shadowColor = isSpellFracture ? "#ff003c" : (config.accentColor || "#ffd700");
        ctx.shadowBlur = 18;
        ctx.fill();

        // Render Star ID Label
        ctx.font = "700 11px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(String(star.id), star.x, star.y - 10);
        ctx.restore();
      });

      // Render Spells & Sparks
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
        ctx.shadowBlur = 12;
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
        ctx.globalAlpha = s.life * 0.7;
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
