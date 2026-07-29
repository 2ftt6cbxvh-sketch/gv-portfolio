// Decorative film-strip layer for Editor mode. Renders duplicated label sets
// so a CSS transform can loop seamlessly; actual movement is driven by
// useFilmReelScroll (GSAP ScrollTrigger, scrub-based) — no per-frame JS math.
export default function FilmReel({ id, labels, className = "" }) {
  const row = [...labels, ...labels, ...labels];
  return (
    <div className={`film-reel ${className}`} id={id} aria-hidden="true">
      <div className="film-reel__track">
        {row.map((label, i) => (
          <span className="film-reel__frame" key={`${label}-${i}`}>
            <span className="film-reel__sep" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
