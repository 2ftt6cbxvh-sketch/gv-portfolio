"use client";
import { useEffect, useRef } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";

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
      <polygon points="70,14 70,30 88,22" fill={accent || "#a56ce8"} fillOpacity="0.8" />
      {/* Waveform */}
      <path d="M100 22 L108 14 L114 28 L120 18 L126 24 L132 16 L138 26 L144 20 L150 22 L158 22"
        stroke={accent || "#a56ce8"} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  );
}

function AnalystCue({ accent }) {
  return (
    <svg className="portal__cue-svg portal__cue-svg--analyst" viewBox="0 0 200 44" fill="none" aria-hidden="true">
      <path className="analyst-cue-line" d="M2 36 L36 24 L68 28 L100 12 L132 18 L166 6 L198 2"
        stroke={accent || "#33c7b0"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {[[2,36],[36,24],[68,28],[100,12],[132,18],[166,6],[198,2]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={accent || "#33c7b0"} fillOpacity="0.9" />
      ))}
      {/* Grid lines */}
      {[10, 20, 30].map(y => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke={accent || "#33c7b0"} strokeWidth="0.4" strokeOpacity="0.25" />
      ))}
    </svg>
  );
}

function DeveloperCue({ accent }) {
  return (
    <svg className="portal__cue-svg portal__cue-svg--developer" viewBox="0 0 180 44" fill="none" aria-hidden="true">
      {/* Code brackets */}
      <path d="M50 10 L28 22 L50 34" stroke={accent || "#39ff88"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M130 10 L152 22 L130 34" stroke={accent || "#39ff88"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      {/* Slash */}
      <line x1="80" y1="34" x2="100" y2="10" stroke={accent || "#39ff88"} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Cursor blink effect (CSS animated) */}
      <rect className="dev-cursor" x="108" y="14" width="3.5" height="16" rx="1" fill={accent || "#39ff88"} fillOpacity="0.95" />
    </svg>
  );
}

function PortalCue({ modeId, accent }) {
  if (modeId === "editor") return <EditorCue accent={accent} />;
  if (modeId === "analyst") return <AnalystCue accent={accent} />;
  if (modeId === "developer") return <DeveloperCue accent={accent} />;
  return null;
}

export default function ModeSelector({ selectorRef, person, modes, features = {} }) {
  const portalsRef = useRef(null);

  const flags = features.flags || {};
  const constellationFlag = flags.constellation_bg;
  const statusPillFlag = flags.status_pill;
  const kineticFlag = flags.kinetic_headline;
  const hotkeyFlag = flags.hotkey_hints;

  // Parse status pill metadata
  let statusPillData = {};
  if (statusPillFlag?.metadata) {
    try {
      statusPillData = typeof statusPillFlag.metadata === "string" ? JSON.parse(statusPillFlag.metadata) : statusPillFlag.metadata;
    } catch (e) {}
  }

  // Parse kinetic headline metadata
  let kineticRoles = null;
  if (kineticFlag?.metadata) {
    try {
      const parsed = typeof kineticFlag.metadata === "string" ? JSON.parse(kineticFlag.metadata) : kineticFlag.metadata;
      if (parsed.roles) kineticRoles = parsed.roles;
    } catch (e) {
      kineticRoles = kineticFlag.metadata;
    }
  }

  // Parse constellation metadata
  let constellationAccent = "#00f0ff";
  if (constellationFlag?.metadata) {
    try {
      const parsed = typeof constellationFlag.metadata === "string" ? JSON.parse(constellationFlag.metadata) : constellationFlag.metadata;
      if (parsed.accent) constellationAccent = parsed.accent;
    } catch (e) {}
  }

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

  // Keyboard shortcut listener: Press 1, 2, 3 to enter mode
  useEffect(() => {
    if (hotkeyFlag?.enabled === false) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (["1", "2", "3"].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        const portals = portalsRef.current?.querySelectorAll(".portal");
        if (portals && portals[index]) {
          portals[index].click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeyFlag]);

  return (
    <main className="selector" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      {/* Interactive Canvas Constellation background (Controlled by Admin toggle) */}
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} />
      )}

      <div className="selector__intro reveal" style={{ opacity: 0, position: "relative", zIndex: 2 }}>
        {/* Status Pill (Controlled by Admin toggle & customizable text) */}
        {statusPillFlag?.enabled !== false && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}

        <span className="label-mono selector__eyebrow">{person.name} / {person.initials}</span>
        
        <h1 className="selector__title">
          <span className="selector__title-line">Three disciplines.</span>
          <span className="selector__title-line selector__title-line--accent">One line of work.</span>
        </h1>

        {/* Dynamic Kinetic Scramble Subheadline (Controlled by Admin toggle & custom roles) */}
        {kineticFlag?.enabled !== false && (
          <div style={{ margin: "12px 0 16px 0", fontSize: "1.05rem", color: "var(--color-fg-muted)" }}>
            <KineticHeadline roles={kineticRoles} />
          </div>
        )}

        <p className="selector__sub">Choose how you&apos;d like to explore — each mode is a distinct world, built from the same person.</p>
        
        {/* Hotkey hint pill (Controlled by Admin toggle) */}
        {hotkeyFlag?.enabled !== false && (
          <div className="hotkey-hint-row" style={{ marginTop: 12, fontSize: "0.78rem", opacity: 0.7, fontFamily: "var(--font-mono)" }}>
            <span>Press <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>1</kbd> Editor &nbsp;•&nbsp; <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>2</kbd> Analyst &nbsp;•&nbsp; <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>3</kbd> Developer</span>
          </div>
        )}

        <div className="selector__divider" aria-hidden="true" />
      </div>

      <div className="portals" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2 }}>
        {modes.map((mode, idx) => (
          <article
            className="portal"
            data-target={mode.id}
            data-mode-id={mode.id}
            role="listitem"
            tabIndex={0}
            style={{ opacity: 0, "--portal-accent": mode.accent, "--portal-delay": `${idx * 0.12}s` }}
            key={mode.id}
            onMouseEnter={() => {
              if (selectorRef.current) {
                selectorRef.current.style.setProperty("--hover-accent", mode.accent);
                selectorRef.current.classList.add("has-hover-glow");
              }
            }}
            onMouseLeave={() => {
              if (selectorRef.current) {
                selectorRef.current.classList.remove("has-hover-glow");
              }
            }}
          >
            {/* Cursor-follow glow layer */}
            <div className="portal__cursor-glow" aria-hidden="true" />
            <div className="portal__tint" />

            <div className="portal__top">
              <span className="portal__index">0{idx + 1}</span>
              <span className="portal__mode-tag">[{idx + 1}] {mode.id}</span>
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

      <footer className="selector__footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="selector__footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge">{SITE_VERSION}</span>
        <span className="selector__footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
