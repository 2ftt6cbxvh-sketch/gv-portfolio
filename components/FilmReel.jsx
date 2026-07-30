// Decorative film-strip layers for Editor mode. Renders triplicated label sets
// so a CSS transform can loop seamlessly; actual movement is driven by
// useFilmReelScroll (GSAP ScrollTrigger, scrub-based) — no per-frame JS math.

// Camera-specific labels injected into certain frames for thematic depth
const CAMERA_LABELS = new Set([0, 4, 8, 12, 16, 20]);

export default function FilmReel({ id, labels, className = "", variant = "text" }) {
  // Triple the labels so the scroll range never reveals an empty gap
  const row = [...labels, ...labels, ...labels];

  return (
    <div className={`film-reel ${className}`} id={id} aria-hidden="true">
      <div className="film-reel__track">
        {row.map((label, i) => (
          <span className="film-reel__frame" key={`${label}-${i}`}>
            {/* Sprocket holes (top + bottom) */}
            <span className="film-reel__sprocket" aria-hidden="true">
              <span className="film-reel__hole" />
              <span className="film-reel__hole" />
            </span>
            {CAMERA_LABELS.has(i % 24) ? (
              /* Camera icon at certain positions */
              <span className="film-reel__cam-icon" aria-hidden="true">
                <svg viewBox="0 0 20 16" fill="none" width="20" height="16">
                  <rect x="0" y="3" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="10" cy="9.5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="7" y="0" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="10" cy="9.5" r="1.2" fill="currentColor" />
                </svg>
              </span>
            ) : null}
            <span className="film-reel__sep" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
