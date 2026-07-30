"use client";

import { useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * TextScramble Component:
 * On mouse enter, rapidly scrambles text characters like a cyber decoder
 * before settling cleanly back to original text.
 */
export default function TextScramble({ text, className = "", style = {} }) {
  const safeText = text || "";
  const [displayText, setDisplayText] = useState(safeText);
  const isScramblingRef = useRef(false);

  if (!safeText) return null;

  const handleMouseEnter = () => {
    if (isScramblingRef.current || !safeText) return;
    isScramblingRef.current = true;

    let iteration = 0;
    const maxIterations = safeText.length;

    const interval = setInterval(() => {
      setDisplayText(
        safeText
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return safeText[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(safeText);
        isScramblingRef.current = false;
      }

      iteration += 1 / 2;
    }, 25);
  };

  return (
    <span
      className={`text-scramble ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{ cursor: "pointer", display: "inline-block", ...style }}
    >
      {displayText}
    </span>
  );
}
