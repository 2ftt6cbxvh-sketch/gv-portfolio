"use client";

import { useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * TextScramble Component:
 * On mouse enter, rapidly scrambles text characters like a cyber decoder
 * before settling cleanly back to original text.
 */
export default function TextScramble({ text, className = "", style = {} }) {
  const [displayText, setDisplayText] = useState(text);
  const isScramblingRef = useRef(false);

  const handleMouseEnter = () => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;

    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
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
