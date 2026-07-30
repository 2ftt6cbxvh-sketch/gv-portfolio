"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * SignatureIntro Component (v5.1.4):
 * Eliminates initial paint flash by setting initial opacity: 0 directly on JSX elements.
 * Guarantees zero initial text flash before signature stroke draw begins.
 */
export default function SignatureIntro({
  text = "Ganesh Varma",
  accentColor = "#00f0ff",
  glowColor = "#00ffff",
  onComplete,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const hasStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const container = containerRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!container || !textEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Calculate length for SVG text stroke animation
    let strokeLength = 1000;
    try {
      strokeLength = textEl.getComputedTextLength() * 3 || 1000;
    } catch (e) {}

    // Initially setup strokeDashoffset while element is still hidden
    gsap.set(textEl, {
      strokeDasharray: strokeLength,
      strokeDashoffset: strokeLength,
      fillOpacity: 0,
      opacity: 1, // Make visible ONLY after strokeDashoffset is prepared!
    });

    const particles = [];
    let isExploding = false;

    // Single smooth pen drawing timeline
    const tl = gsap.timeline({
      onComplete: () => {
        startFluidTransition();
      },
    });

    // 1. Draw pen stroke (1.8s)
    tl.to(textEl, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: "power1.inOut",
    })
    // 2. Fill in ink opacity subtly (0.4s)
    .to(textEl, {
      fillOpacity: 0.85,
      duration: 0.4,
      ease: "power2.out",
    });

    const startFluidTransition = () => {
      if (isExploding) return;
      isExploding = true;

      // Sample 150 particles around screen center
      const count = 150;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 120;
        const speed = Math.random() * 2.5 + 0.6;

        particles.push({
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * (dist * 0.4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          radius: Math.random() * 1.6 + 0.8,
          alpha: 1.0,
          decay: Math.random() * 0.016 + 0.012,
        });
      }

      // Smoothly fade out signature and overlay backdrop
      gsap.to(textEl, { opacity: 0, duration: 0.5, ease: "power2.out" });
      gsap.to(container, {
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          if (onCompleteRef.current) onCompleteRef.current();
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
          p.vx *= 0.98; // Friction deceleration
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
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6;
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
  }, []);

  return (
    <div
      ref={containerRef}
      id="intro"
      onClick={() => {
        if (!isSkipped) {
          setIsSkipped(true);
          if (onCompleteRef.current) onCompleteRef.current();
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
      {/* Import elegant cursive signature font */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .signature-text-path {
          font-family: 'Great Vibes', cursive, sans-serif;
          font-size: 82px;
          letter-spacing: 2px;
        }
      ` }} />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      {/* Cursive Signature SVG — 100% Readable "Ganesh Varma" */}
      <div style={{ position: "relative", width: "90%", maxWidth: 680, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          viewBox="0 0 700 180"
          style={{
            width: "100%",
            height: "100%",
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        >
          <text
            ref={textRef}
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="signature-text-path"
            fill={accentColor}
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0 }} /* INITIALLY INVISIBLE ON PAINT TO PREVENT FLASH */
          >
            {text}
          </text>
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
