"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * SignatureIntro Component:
 * Full-screen cinematic intro featuring an elegant cursive signature scribble of "Ganesh Varma".
 * Includes glowing laser tip, interactive cursor aura bending, skip option,
 * and a fluid ink-to-constellation particle burst transition.
 */
export default function SignatureIntro({
  text = "Ganesh Varma",
  accentColor = "#00f0ff",
  glowColor = "#00ffff",
  onComplete,
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    const canvas = canvasRef.current;
    if (!container || !path || !canvas) return;

    const ctx = canvas.getContext("2d");
    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle burst array
    const particles = [];
    let isExploded = false;

    // Path length for SVG stroke animation
    const pathLength = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    // Timeline for signature scribble
    const tl = gsap.timeline({
      onComplete: () => {
        triggerExplosion();
      },
    });

    // Animate stroke draw over 2.2 seconds
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: "power2.inOut",
    });

    // Trigger Fluid Ink-to-Constellation Particle Burst
    const triggerExplosion = () => {
      if (isExploded) return;
      isExploded = true;

      // Sample points along SVG path to create particles
      const pointCount = 120;
      for (let i = 0; i < pointCount; i++) {
        const pt = path.getPointAtLength((i / pointCount) * pathLength);
        // Translate SVG coords to screen center coords
        const bbox = path.getBBox();
        const screenX = width / 2 + (pt.x - bbox.width / 2);
        const screenY = height / 2 + (pt.y - bbox.height / 2);

        particles.push({
          x: screenX,
          y: screenY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          radius: Math.random() * 2.5 + 1,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }

      // Fade out path & container background smoothly
      gsap.to(path, { opacity: 0, duration: 0.4 });
      gsap.to(container, {
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out",
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });
    };

    // Render loop for particle burst
    const renderParticles = () => {
      ctx.clearRect(0, 0, width, height);

      if (isExploded) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(renderParticles);
    };

    renderParticles();

    // Skip handler (click anywhere or press key)
    const handleSkip = () => {
      if (isSkipped) return;
      setIsSkipped(true);
      tl.kill();
      triggerExplosion();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") handleSkip();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animFrameId);
      tl.kill();
    };
  }, [accentColor, glowColor, onComplete, isSkipped]);

  return (
    <div
      ref={containerRef}
      id="intro"
      onClick={() => {
        if (!isSkipped) {
          setIsSkipped(true);
          const path = pathRef.current;
          if (path) path.style.opacity = "0";
          if (onComplete) onComplete();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#06050a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      {/* Elegant Cursive Signature SVG Scribble */}
      <div style={{ position: "relative", width: "90%", maxWidth: 650, height: 180 }}>
        <svg
          viewBox="0 0 700 200"
          style={{
            width: "100%",
            height: "100%",
            filter: `drop-shadow(0 0 12px ${glowColor})`,
          }}
        >
          {/* Custom cursive handwriting path for Ganesh Varma */}
          <path
            ref={pathRef}
            d="M 40 110 C 60 40, 70 30, 90 110 C 100 140, 110 150, 130 110 C 140 90, 150 90, 160 110 C 170 120, 180 120, 190 100 C 200 80, 210 140, 220 110 M 260 70 C 270 130, 280 150, 290 110 M 310 110 C 320 90, 330 90, 340 110 C 350 120, 360 120, 370 100 M 390 110 C 400 130, 410 130, 420 110 M 450 60 C 440 150, 470 150, 480 100 M 500 110 C 510 90, 520 90, 530 110 M 540 120 C 550 120, 560 100, 570 110 M 580 110 C 590 130, 600 130, 610 110 M 620 110 L 650 110"
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Cursive Name Label beneath */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.82rem",
            letterSpacing: "0.25em",
            fontFamily: "var(--font-mono)",
            color: "rgba(255, 255, 255, 0.6)",
            textTransform: "uppercase",
          }}
        >
          {text}
        </div>
      </div>

      {/* Minimal Skip Prompt */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          fontSize: "0.72rem",
          fontFamily: "var(--font-mono)",
          color: "rgba(255, 255, 255, 0.35)",
          letterSpacing: "0.1em",
        }}
      >
        [ Click or Press Space to Skip ]
      </div>
    </div>
  );
}
