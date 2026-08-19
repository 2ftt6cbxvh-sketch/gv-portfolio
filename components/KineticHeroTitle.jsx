"use client";

/**
 * Ultra-smooth Apple-grade word-by-word kinetic title reveal.
 * Uses GPU-accelerated CSS mask-transforms with inline stagger delays.
 * 100% reliable, zero layout thrashing, perfectly compatible with mode switching.
 */
export default function KineticHeroTitle({ prefix = "", accent = "", suffix = "", className = "", isScript = false }) {
  const prefixWords = prefix.trim() ? prefix.trim().split(/\s+/) : [];
  const accentWords = accent.trim() ? accent.trim().split(/\s+/) : [];
  const suffixWords = suffix.trim() ? suffix.trim().split(/\s+/) : [];

  let wordIndex = 0;

  return (
    <h2 className={`hero-mode__title ${className}`} style={{ overflow: "visible" }}>
      {prefixWords.map((word, idx) => {
        const delay = (wordIndex++ * 0.05).toFixed(3);
        return (
          <span key={`p-${idx}`} className="k-word-mask">
            <span className="k-word-inner" style={{ animationDelay: `${delay}s` }}>
              {word}
            </span>
          </span>
        );
      })}

      {accentWords.length > 0 && (
        <span className={`accent ${isScript ? "accent--script" : ""}`} style={{ display: "inline" }}>
          {accentWords.map((word, idx) => {
            const delay = (wordIndex++ * 0.05).toFixed(3);
            return (
              <span key={`a-${idx}`} className="k-word-mask">
                <span className="k-word-inner" style={{ animationDelay: `${delay}s` }}>
                  {word}
                </span>
              </span>
            );
          })}
        </span>
      )}

      {suffixWords.map((word, idx) => {
        const delay = (wordIndex++ * 0.05).toFixed(3);
        return (
          <span key={`s-${idx}`} className="k-word-mask">
            <span className="k-word-inner" style={{ animationDelay: `${delay}s` }}>
              {word}
            </span>
          </span>
        );
      })}
    </h2>
  );
}
