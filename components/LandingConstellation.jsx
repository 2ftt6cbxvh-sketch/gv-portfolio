"use client";
import { useEffect, useRef } from "react";

/**
 * Interactive Particle Constellation Canvas with Cursor Spark Trail AND
 * Secret 3-Star Constellation Admin Gateway Unlock.
 */
export default function LandingConstellation({ accentColor = "#00f0ff" }) {
  const canvasRef = useRef(null);

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

    // Mouse coordinates
    const mouse = { x: -1000, y: -1000 };
    const sparks = [];
    const tappedSecretStars = [];

    // 3 Secret Constellation Stars for Admin Pattern Unlock
    const secretStars = [
      { id: 1, x: width * 0.18, y: height * 0.22, radius: 4 },
      { id: 2, x: width * 0.82, y: height * 0.28, radius: 4 },
      { id: 3, x: width * 0.50, y: height * 0.82, radius: 4 },
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
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if user clicked near one of the secret stars
      secretStars.forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40 && !tappedSecretStars.includes(star.id)) {
          tappedSecretStars.push(star.id);

          // If all 3 stars are connected in triangle pattern
          if (tappedSecretStars.length === 3) {
            setTimeout(() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("openAdminSecretGateway"));
              }
              tappedSecretStars.length = 0; // Reset pattern
            }, 400);
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

    // Create background constellation particles
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

      // 1. Render cursor spark trail
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

      // 2. Draw normal constellation particles & lines
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

      // 3. Render 3 Secret Star Nodes & Gold Laser Triangle Lines
      secretStars.forEach((star) => {
        const isTapped = tappedSecretStars.includes(star.id);
        ctx.beginPath();
        ctx.arc(star.x, star.y, isTapped ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isTapped ? "#ffd700" : accentColor;
        ctx.globalAlpha = isTapped ? 1.0 : 0.6;
        ctx.shadowColor = isTapped ? "#ffd700" : accentColor;
        ctx.shadowBlur = isTapped ? 18 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Gold Laser Lines connecting tapped stars
      if (tappedSecretStars.length > 1) {
        ctx.beginPath();
        const firstStar = secretStars.find((s) => s.id === tappedSecretStars[0]);
        ctx.moveTo(firstStar.x, firstStar.y);

        for (let k = 1; k < tappedSecretStars.length; k++) {
          const nextStar = secretStars.find((s) => s.id === tappedSecretStars[k]);
          ctx.lineTo(nextStar.x, nextStar.y);
        }

        if (tappedSecretStars.length === 3) {
          ctx.closePath();
        }

        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [accentColor]);

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
