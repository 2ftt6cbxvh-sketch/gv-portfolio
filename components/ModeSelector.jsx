"use client";
import { useEffect, useRef } from "react";
import { SITE_VERSION } from "@/lib/version";

// Per-mode animated SVG cues shown inside each portal card
function EditorCue({ accent }) {
  return (
    <svg className="portal__cue-svg portal__cue-svg--editor" viewBox="0 0 180 44" fill="none" aria-hidden="true">
      {/* Film frame perforations */}
      <rect x="0" y="4" width="180" height="36" rx="3" stroke={accent || "#a56ce8"} strokeWidth="1.2" strokeOpacity="0.5" />
      <rect x="6" y="0" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      <rect x="22" y="0" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      <rect x="38" y="0" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      <rect x="6" y="38" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      <rect x="22" y="38" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      <rect x="38" y="38" width="8" height="6" rx="1.5" fill={accent || "#a56ce8"} fillOpacity="0.5" />
      {/* Play icon */}
      <polygon points="70,14 70,30 88,22" fill={accent || "#a56ce8"} fillOpacity="0.7" />
      {/* Waveform */}
      <path d="M100 22 L108 14 L114 28 L120 18 L126 24 L132 16 L138 26 L144 20 L150 22 L158 22"
        stroke={accent || "#a56ce8"} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

function AnalystCue({ accent }) {
  return (
    <svg className="portal__cue-svg portal__cue-svg--analyst" viewBox="0 0 200 44" fill="none" aria-hidden="true">
      <path className="analyst-cue-line" d="M2 36 L36 24 L68 28 L100 12 L132 18 L166 6 L198 2"
        stroke={accent || "#33c7b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {[[2,36],[36,24],[68,28],[100,12],[132,18],[166,6],[198,2]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={accent || "#33c7b0"} fillOpacity="0.9" />
      ))}
      {/* Grid lines */}
      {[10, 20, 30].map(y => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke={accent || "#33c7b0"} strokeWidth="0.4" strokeOpacity="0.2" />
      ))}
    </svg>
  );
}

function DeveloperCue({ accent }) {
  return (
    <svg className="portal__cue-svg portal__cue-svg--developer" viewBox="0 0 180 44" fill="none" aria-hidden="true">
      {/* Code brackets */}
      <path d="M50 10 L28 22 L50 34" stroke={accent || "#39ff88"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" />
      <path d="M130 10 L152 22 L130 34" stroke={accent || "#39ff88"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" />
      {/* Slash */}
      <line x1="80" y1="34" x2="100" y2="10" stroke={accent || "#39ff88"} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Cursor blink effect (CSS animated) */}
      <rect className="dev-cursor" x="108" y="14" width="3" height="16" rx="1" fill={accent || "#39ff88"} fillOpacity="0.9" />
    </svg>
  );
}

function PortalCue({ modeId, accent }) {
  if (modeId === "editor") return <EditorCue accent={accent} />;
  if (modeId === "analyst") return <AnalystCue accent={accent} />;
  if (modeId === "developer") return <DeveloperCue accent={accent} />;
  return null;
}

// Floating particle field rendered behind the portals
function ParticleField() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (i * 37.3 + 10) % 100,
    y: (i * 53.7 + 5) % 100,
    size: 1 + (i % 3),
    delay: (i * 0.4) % 6,
    dur: 4 + (i % 4),
  }));
  return (
    <div className="selector-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="selector-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ModeSelector({ selectorRef, person, modes }) {
  const portalsRef = useRef(null);

  // Cursor-follow radial glow per portal
  useEffect(() => {
    const portals = portalsRef.current?.querySelectorAll(".portal");
    if (!portals) return;

    const handlers = [];
    portals.forEach((portal) => {
      const move = (e) => {
        const rect = portal.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        portal.style.setProperty("--mouse-x", `${x}%`);
        portal.style.setProperty("--mouse-y", `${y}%`);
      };
      portal.addEventListener("mousemove", move);
      handlers.push({ portal, move });
    });

    return () => {
      handlers.forEach(({ portal, move }) => portal.removeEventListener("mousemove", move));
    };
  }, []);

  return (
    <main className="selector" id="selector" ref={selectorRef}>
      <ParticleField />

      <div className="selector__intro reveal" style={{ opacity: 0 }}>
        <span className="label-mono selector__eyebrow">{person.name} / {person.initials}</span>
        <h1 className="selector__title">
          <span className="selector__title-line">Three disciplines.</span>
          <span className="selector__title-line selector__title-line--accent">One line of work.</span>
        </h1>
        <p className="selector__sub">Choose how you&apos;d like to explore — each mode is a distinct world, built from the same person.</p>
        <div className="selector__divider" aria-hidden="true" />
      </div>

      <div className="portals" role="list" ref={portalsRef}>
        {modes.map((mode, idx) => (
          <article
            className="portal"
            data-target={mode.id}
            data-mode-id={mode.id}
            role="listitem"
            tabIndex={0}
            style={{ opacity: 0, "--portal-accent": mode.accent, "--portal-delay": `${idx * 0.12}s` }}
            key={mode.id}
            onMouseEnter={(e) => {
              if (selectorRef.current) {
                selectorRef.current.style.setProperty("--hover-accent", mode.accent);
                selectorRef.current.classList.add("has-hover-glow");
              }
            }}
            onMouseLeave={(e) => {
              if (selectorRef.current) {
                selectorRef.current.classList.remove("has-hover-glow");
              }
            }}
          >
            {/* Cursor-follow glow layer */}
            <div className="portal__cursor-glow" aria-hidden="true" />
            <div className="portal__tint" />

            <div className="portal__top">
              <span className="portal__index">{mode.index}</span>
              <span className="portal__mode-tag">{mode.id}</span>
            </div>

            <div className="portal__body">
              <h2 className="portal__name">{mode.name}</h2>
              <p className="portal__desc">{mode.desc}</p>
              <div className="portal__cue" aria-hidden="true">
                <PortalCue modeId={mode.id} accent={mode.accent} />
              </div>
            </div>

            <div className="portal__footer">
              <span className="portal__enter">
                <span className="portal__enter-arrow" aria-hidden="true">→</span>
                Enter mode
              </span>
              <span className="portal__enter-bar" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      <footer className="selector__footer">
        <span className="selector__footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge">{SITE_VERSION}</span>
        <span className="selector__footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
