"use client";

import { useEffect, useState, useMemo } from "react";

const DEFAULT_ROLES = [
  "🚀 Computational Intelligence Researcher",
  "🎬 Cinematic Video Editor & Director",
  "📊 Data & Business Intelligence Analyst",
  "💻 Full-Stack Software Engineer",
  "🎨 Interactive UI/UX Designer",
  "🤖 AI System Security Researcher",
];

export default function KineticHeadline({ roles }) {
  const roleList = useMemo(() => {
    if (Array.isArray(roles) && roles.length > 0) return roles;
    if (typeof roles === "string" && roles.trim() !== "") {
      const parsed = roles.split(",").map((r) => r.trim()).filter((r) => r.length > 0);
      if (parsed.length > 0) return parsed;
    }
    return DEFAULT_ROLES;
  }, [roles]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (roleList.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % roleList.length);
        setIsFading(false);
      }, 400); // 400ms fade-out duration
    }, 2800); // Rotate every 2.8 seconds

    return () => clearInterval(interval);
  }, [roleList]);

  const currentRole = roleList[currentIndex] || roleList[0];

  return (
    <div
      className="kinetic-headline"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 28,
        margin: "8px 0",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.95)",
          letterSpacing: "0.04em",
          opacity: isFading ? 0 : 1,
          transform: isFading ? "translateY(-6px)" : "translateY(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          textShadow: "0 0 16px rgba(0, 240, 255, 0.25)",
          display: "inline-block",
        }}
      >
        {currentRole}
      </span>
    </div>
  );
}
