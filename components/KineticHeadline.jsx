"use client";
import { useState, useEffect } from "react";

const ROLES = [
  "🎬 Video Director & Film Editor",
  "📊 Data Science & AI Architect",
  "💻 Full-Stack Software Engineer",
  "🚀 Computational Intelligence Researcher",
];

const GLITCH_CHARS = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789%#@$&*";

export default function KineticHeadline() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState(ROLES[0]);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScrambling(true);
      const nextIndex = (roleIndex + 1) % ROLES.length;
      const targetText = ROLES[nextIndex];

      let frame = 0;
      const maxFrames = 18;

      const scrambleInterval = setInterval(() => {
        frame++;
        if (frame >= maxFrames) {
          clearInterval(scrambleInterval);
          setDisplayText(targetText);
          setRoleIndex(nextIndex);
          setIsScrambling(false);
        } else {
          // Generate scrambled string with progressive resolution
          const progress = frame / maxFrames;
          const resolvedChars = Math.floor(targetText.length * progress);
          
          let scrambled = targetText.slice(0, resolvedChars);
          for (let i = resolvedChars; i < targetText.length; i++) {
            if (targetText[i] === " ") {
              scrambled += " ";
            } else {
              scrambled += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
          }
          setDisplayText(scrambled);
        }
      }, 40);

    }, 3600);

    return () => clearInterval(interval);
  }, [roleIndex]);

  return (
    <div className="kinetic-headline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="kinetic-headline__text" style={{ fontFamily: "var(--font-mono)", opacity: isScrambling ? 0.85 : 1 }}>
        {displayText}
      </span>
      <span className="kinetic-headline__cursor" style={{ display: "inline-block", width: 8, height: 16, background: "var(--logo-color, #00f0ff)", animation: "blink 1s infinite" }} />
    </div>
  );
}
