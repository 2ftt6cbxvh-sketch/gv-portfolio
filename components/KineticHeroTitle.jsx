"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Ultra-smooth Apple-grade word-by-word kinetic title reveal.
 * Pre-renders words in JSX with hardware-accelerated clipping masks to eliminate layout thrashing.
 */
export default function KineticHeroTitle({ prefix = "", accent = "", suffix = "", className = "", isScript = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll(".k-word-inner");
    if (!words.length) return;

    // Reset and animate with silky smooth cubic-bezier physics
    gsap.killTweensOf(words);
    gsap.set(words, {
      y: "115%",
      opacity: 0,
      filter: "blur(5px)",
      willChange: "transform, opacity, filter",
      force3D: true,
    });

    const tween = gsap.to(words, {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.15,
      ease: "power3.out",
      stagger: 0.055,
      delay: 0.1,
      clearProps: "willChange,filter",
    });

    return () => {
      tween.kill();
    };
  }, [prefix, accent, suffix]);

  const prefixWords = prefix.trim() ? prefix.trim().split(/\s+/) : [];
  const accentWords = accent.trim() ? accent.trim().split(/\s+/) : [];
  const suffixWords = suffix.trim() ? suffix.trim().split(/\s+/) : [];

  return (
    <h2 className={`hero-mode__title ${className}`} ref={containerRef} style={{ overflow: "visible" }}>
      {prefixWords.map((word, idx) => (
        <span key={`p-${idx}`} className="k-word-mask" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.04em", marginRight: "0.26em" }}>
          <span className="k-word-inner" style={{ display: "inline-block", transform: "translate3d(0, 115%, 0)", opacity: 0 }}>
            {word}
          </span>
        </span>
      ))}

      {accentWords.length > 0 && (
        <span className={`accent ${isScript ? "accent--script" : ""}`} style={{ display: "inline" }}>
          {accentWords.map((word, idx) => (
            <span key={`a-${idx}`} className="k-word-mask" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.04em", marginRight: "0.26em" }}>
              <span className="k-word-inner" style={{ display: "inline-block", transform: "translate3d(0, 115%, 0)", opacity: 0 }}>
                {word}
              </span>
            </span>
          ))}
        </span>
      )}

      {suffixWords.map((word, idx) => (
        <span key={`s-${idx}`} className="k-word-mask" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.04em", marginRight: "0.26em" }}>
          <span className="k-word-inner" style={{ display: "inline-block", transform: "translate3d(0, 115%, 0)", opacity: 0 }}>
            {word}
          </span>
        </span>
      ))}
    </h2>
  );
}
