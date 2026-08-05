"use client";

import { useEffect, useState, useMemo, useRef } from "react";

const DEFAULT_ROLES = [
  "🚀 Computational Intelligence Researcher",
  "🎬 Cinematic Video Editor & Director",
  "📊 Data & Business Intelligence Analyst",
  "💻 Full-Stack Software Engineer",
  "🎨 Interactive UI/UX Designer",
  "🤖 AI System Security Researcher",
];

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/AX019Z#&~?";

export default function KineticHeadline({ roles }) {
  const roleList = useMemo(() => {
    if (Array.isArray(roles) && roles.length > 1) return roles;
    if (typeof roles === "string" && roles.includes(",")) {
      const parsed = roles.split(",").map((r) => r.trim()).filter((r) => r.length > 0);
      if (parsed.length > 1) return parsed;
    }
    return DEFAULT_ROLES;
  }, [roles]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(roleList[0]);
  const [isScrambling, setIsScrambling] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % roleList.length;
        scrambleTo(roleList[nextIndex]);
        return nextIndex;
      });
    }, 3200); // Rotate & scramble every 3.2 seconds

    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [roleList]);

  const scrambleTo = (targetText) => {
    setIsScrambling(true);
    let iteration = 0;
    const totalChars = targetText.length;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      if (currentTime - lastTime > 30) {
        lastTime = currentTime;

        const scrambled = targetText
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            if (char === " " || char.codePointAt(0) > 1000) {
              return char;
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("");

        setDisplayText(scrambled);
        iteration += 1.5;

        if (iteration >= totalChars + 2) {
          setDisplayText(targetText);
          setIsScrambling(false);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div
      className="kinetic-headline"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 32,
        margin: "8px 0",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.88rem, 2.5vw, 1.08rem)",
          fontWeight: 600,
          color: isScrambling ? "#00f0ff" : "rgba(255, 255, 255, 0.95)",
          letterSpacing: "0.04em",
          textShadow: isScrambling ? "0 0 16px #00f0ff, 0 0 30px rgba(0, 240, 255, 0.5)" : "0 0 16px rgba(0, 240, 255, 0.2)",
          transition: "color 0.2s ease, text-shadow 0.2s ease",
          display: "inline-block",
        }}
      >
        {displayText}
      </span>
    </div>
  );
}
