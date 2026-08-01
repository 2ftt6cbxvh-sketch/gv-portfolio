"use client";
import { useEffect, useRef } from "react";

/**
 * Interactive Particle Constellation Canvas with Cursor Line Connections + Spark Trail
 * AND Moving 3-Star Constellation Admin Gateway Unlock + Harry Potter Wand Spell Animation.
 *
 * Secret Stars floating motion is bounded to outer screen zones so stars NEVER
 * drift behind the central mode selector cards!
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

    const mouse = { x: -1000, y: -1000 };
    const sparks = [];
    const magicSpells = [];
    const tappedSecretStars = [];

    // 3 Secret Constellation Stars with Bounded Safe Floating Zones (Outside Central Mode Cards)
    const secretStars = [
      // Star 1: Top-Left Zone
      {
        id: 1,
        x: Math.random() * (width * 0.25) + 40,
        y: Math.random() * (height * 0.28) + 60,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4.5,
        minX: 30,
        maxX: width * 0.32,
        minY: 50,
        maxY: height * 0.38,
      },
      // Star 2: Top-Right Zone
      {
        id: 2,
        x: Math.random() * (width * 0.25) + width * 0.68,
        y: Math.random() * (height * 0.28) + 60,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4.5,
        minX: width * 0.68,
        maxX: width - 30,
        minY: 50,
        maxY: height * 0.38,
      },
      // Star 3: Bottom Zone (Below Mode Cards)
      {
        id: 3,
        x: Math.random() * (width * 0.4) + width * 0.3,
        y: Math.random() * (height * 0.18) + height * 0.76,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4.5,
        minX: width * 0.2,
        maxX: width * 0.8,
        minY: height * 0.74,
        maxY: height - 40,
      },
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

      secretStars.forEach((star) => {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 70 && !tappedSecretStars.includes(star.id)) {
          tappedSecretStars.push(star.id);

          // Harry Potter Golden Wand Spell Burst
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
              color: "#ffd700",
            });
          }

          if (tappedSecretStars.length === 3) {
            secretStars.forEach((s) => {
              for (let m = 0; m < 30; m++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 3;
                magicSpells.push({
                  x: s.x,
                  y: s.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1.2,
                  decay: 0.015,
                  size: Math.random() * 5 + 2,
                  color: "#ffd700",
                });
              }
            });

            setTimeout(() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("openAdminSecretGateway"));
              }
              tappedSecretStars.length = 0;
            }, 700);
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

      // Update positions of secret stars within their Bounded Safe Zones
      secretStars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        // Bounce physics inside dedicated safe floating zone (never behind mode cards!)
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

      // CONNECT ALL PARTICLES & SECRET STARS TO CURSOR!
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

      // 4. Render Secret Moving Stars
      secretStars.forEach((star) => {
        const isTapped = tappedSecretStars.includes(star.id);
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, isTapped ? 7 : star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isTapped ? "#ffd700" : accentColor;
        ctx.shadowColor = isTapped ? "#ffd700" : accentColor;
        ctx.shadowBlur = isTapped ? 24 : 8;
        ctx.globalAlpha = isTapped ? 1.0 : 0.75;
        ctx.fill();
        ctx.restore();
      });

      // Connect tapped moving stars with gold laser line
      if (tappedSecretStars.length > 1) {
        ctx.save();
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
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#ffd700";
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
