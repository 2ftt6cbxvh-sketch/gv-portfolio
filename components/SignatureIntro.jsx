"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * SignatureIntro Component (v5.1.1):
 * Authentic cursive handwriting signature intro of "Ganesh Varma".
 * Uses a fine gel pen stroke (1.5px), smooth single-pass pen drawing,
 * no extra text below, and a buttery-smooth particle dispersion transition.
 */
export default function SignatureIntro({
  accentColor = "#00f0ff",
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

    const pathLength = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    const particles = [];
    let isExploding = false;

    // Single smooth pen drawing timeline (2.0s duration)
    const tl = gsap.timeline({
      onComplete: () => {
        startFluidTransition();
      },
    });

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.0,
      ease: "power1.inOut",
    });

    const startFluidTransition = () => {
      if (isExploding) return;
      isExploding = true;

      // Sample 160 points along the signature path for fine ink particles
      const count = 160;
      const svgBox = path.ownerSVGElement.getBoundingClientRect();
      const pathBox = path.getBBox();

      for (let i = 0; i < count; i++) {
        const pt = path.getPointAtLength((i / count) * pathLength);
        // Convert SVG point to absolute screen coordinates
        const screenX = svgBox.left + (pt.x / 800) * svgBox.width;
        const screenY = svgBox.top + (pt.y / 240) * svgBox.height;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.2 + 0.5;

        particles.push({
          x: screenX,
          y: screenY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          radius: Math.random() * 1.5 + 0.8,
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.012,
        });
      }

      // Smoothly fade out signature path and overlay backdrop
      gsap.to(path, { opacity: 0, duration: 0.6, ease: "power2.out" });
      gsap.to(container, {
        opacity: 0,
        duration: 1.0,
        delay: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });
    };

    // Render loop for particle dispersion
    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      if (isExploding) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98; // Smooth friction deceleration
          p.vy *= 0.98;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    // Skip handler
    const handleSkip = () => {
      if (isSkipped) return;
      setIsSkipped(true);
      tl.kill();
      startFluidTransition();
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
  }, [accentColor, onComplete, isSkipped]);

  return (
    <div
      ref={containerRef}
      id="intro"
      onClick={() => {
        if (!isSkipped) {
          setIsSkipped(true);
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

      {/* Cursive Handwriting Signature SVG — "Ganesh Varma" */}
      <div style={{ position: "relative", width: "85%", maxWidth: 620, height: 180 }}>
        <svg
          viewBox="0 0 800 240"
          style={{
            width: "100%",
            height: "100%",
            filter: `drop-shadow(0 0 4px ${accentColor})`,
          }}
        >
          {/* Detailed cursive handwriting path for "Ganesh Varma" */}
          <path
            ref={pathRef}
            d="M 50 140 C 30 80, 70 30, 110 50 C 130 60, 140 100, 110 130 C 80 160, 60 170, 90 170 C 120 170, 140 120, 150 110 C 160 100, 170 120, 175 130 C 185 140, 195 100, 205 110 C 215 120, 220 130, 230 110 C 240 90, 245 120, 255 130 C 265 140, 270 100, 280 110 M 300 80 L 305 150 C 305 175, 290 185, 280 175 C 270 165, 290 140, 320 120 C 330 110, 340 120, 350 130 M 370 100 L 375 160 M 420 50 L 460 150 C 470 175, 480 175, 490 140 L 510 60 M 530 110 C 540 90, 550 120, 560 130 C 570 140, 575 105, 585 110 C 595 115, 600 130, 610 110 M 620 90 L 625 150 C 625 170, 615 175, 610 165 C 605 155, 620 135, 640 120 M 655 110 C 665 95, 675 120, 685 130 C 695 140, 705 110, 720 130"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Minimal Skip Prompt */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: "0.72rem",
          fontFamily: "var(--font-mono)",
          color: "rgba(255, 255, 255, 0.3)",
          letterSpacing: "0.1em",
        }}
      >
        [ Click or Press Space to Skip ]
      </div>
    </div>
  );
}
