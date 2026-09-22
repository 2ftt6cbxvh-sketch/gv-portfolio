"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";
import RecruiterLens from "./RecruiterLens";

// High-Contrast Structural Frosted Aero Cues
function AeroEditorCue({ accent = "#a56ce8" }) {
  return (
    <svg className="aero-cue-svg" viewBox="0 0 180 44" fill="none" aria-hidden="true">
      <rect x="0" y="4" width="180" height="36" rx="4" stroke={accent} strokeWidth="1.2" strokeOpacity="0.6" fill="rgba(165, 108, 232, 0.04)" />
      {[6, 22, 38, 54, 70, 86, 102, 118, 134, 150, 166].map((x) => (
        <rect key={x} x={x} y="0" width="8" height="5" rx="1" fill={accent} fillOpacity="0.5" />
      ))}
      {[6, 22, 38, 54, 70, 86, 102, 118, 134, 150, 166].map((x) => (
        <rect key={x} x={x} y="39" width="8" height="5" rx="1" fill={accent} fillOpacity="0.5" />
      ))}
      <polygon points="74,15 74,29 88,22" fill={accent} fillOpacity="0.9" />
      <path d="M102 22 L110 15 L116 28 L122 17 L128 23 L134 16 L140 25 L146 19 L154 22" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.95" />
    </svg>
  );
}

function AeroAnalystCue({ accent = "#33c7b0" }) {
  return (
    <svg className="aero-cue-svg" viewBox="0 0 200 44" fill="none" aria-hidden="true">
      <path d="M2 36 L36 24 L68 28 L100 12 L132 18 L166 6 L198 2" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {[[2, 36], [36, 24], [68, 28], [100, 12], [132, 18], [166, 6], [198, 2]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={accent} />
      ))}
      {[10, 20, 30].map((y) => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke={accent} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="3 3" />
      ))}
    </svg>
  );
}

function AeroDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="aero-cue-svg" viewBox="0 0 180 44" fill="none" aria-hidden="true">
      <path d="M50 10 L28 22 L50 34" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M130 10 L152 22 L130 34" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="80" y1="34" x2="100" y2="10" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
      <rect x="108" y="14" width="3.5" height="16" rx="1" fill={accent} className="dev-cursor" />
    </svg>
  );
}

export default function ModeSelectorAero({ selectorRef, person, modes, features = {} }) {
  const portalsRef = useRef(null);
  const [vpnState, setVpnState] = useState({ isOpen: false, ip: "" });

  useEffect(() => {
    async function checkVpnOnLoad() {
      try {
        const res = await fetch("/api/public/check-vpn");
        if (res.ok) {
          const data = await res.json();
          if (data.isVpn) {
            setVpnState({ isOpen: true, ip: data.ip || "Active Proxy IP" });
          }
        }
      } catch (e) {}
    }
    checkVpnOnLoad();
  }, []);

  const flags = features.flags || {};
  const constellationFlag = flags.constellation_bg;
  const statusPillFlag = flags.status_pill;
  const kineticFlag = flags.kinetic_headline;
  const hotkeyFlag = flags.hotkey_hints;
  const recruiterLensFlag = flags.recruiter_lens;

  let statusPillData = {};
  if (statusPillFlag?.metadata) {
    try {
      statusPillData = typeof statusPillFlag.metadata === "string" ? JSON.parse(statusPillFlag.metadata) : statusPillFlag.metadata;
    } catch (e) {}
  }

  let kineticRoles = null;
  if (kineticFlag?.metadata) {
    try {
      const parsed = typeof kineticFlag.metadata === "string" ? JSON.parse(kineticFlag.metadata) : kineticFlag.metadata;
      if (parsed.roles) kineticRoles = parsed.roles;
    } catch (e) {
      kineticRoles = kineticFlag.metadata;
    }
  }

  let constellationAccent = "#ffd700";
  if (constellationFlag?.metadata) {
    try {
      const parsed = typeof constellationFlag.metadata === "string" ? JSON.parse(constellationFlag.metadata) : constellationFlag.metadata;
      if (parsed.accent) constellationAccent = parsed.accent;
    } catch (e) {}
  }

  // Keyboard shortcut listener (1, 2, 3)
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
    <main className="selector aero-selector" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />

      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}

      {/* Structural OS Chrome Hero Container */}
      <div className="selector__intro aero-hero-container reveal" style={{ opacity: 0, position: "relative", zIndex: 2 }}>
        {statusPillFlag?.enabled !== false && (
          <div className="aero-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}

        <div className="aero-identity-bar">
          <span className="aero-badge-dot" />
          <span className="aero-identity-name">{person.name}</span>
          <span className="aero-identity-sep">/</span>
          <span className="aero-identity-initials">{person.initials}</span>
        </div>

        <h1 className="aero-title">
          <span className="aero-title-primary">Three Disciplines.</span>
          <span className="aero-title-accent">One Line of Work.</span>
        </h1>

        {kineticFlag?.enabled !== false && (
          <div className="aero-kinetic-wrapper">
            <KineticHeadline roles={kineticRoles} />
          </div>
        )}

        <p className="aero-subtitle">
          Engineered system chrome providing direct structural navigation across creative direction, machine learning, and systems architecture.
        </p>

        {hotkeyFlag?.enabled !== false && (
          <div className="aero-hotkeys">
            <span>Press</span>
            <kbd className="aero-kbd">1</kbd>
            <span className="aero-kbd-txt">Editor</span>
            <span className="aero-kbd-sep">•</span>
            <kbd className="aero-kbd">2</kbd>
            <span className="aero-kbd-txt">Analyst</span>
            <span className="aero-kbd-sep">•</span>
            <kbd className="aero-kbd">3</kbd>
            <span className="aero-kbd-txt">Developer</span>
          </div>
        )}
      </div>

      {/* 3 Structural Frosted Aero Panels */}
      <div className="portals aero-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2 }}>
        {modes.map((mode, idx) => (
          <article
            className="portal aero-panel"
            data-target={mode.id}
            data-mode-id={mode.id}
            data-mode={mode.id}
            role="listitem"
            tabIndex={0}
            style={{
              opacity: 0,
              "--portal-accent": mode.accent,
              "--portal-delay": `${idx * 0.12}s`,
            }}
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
            <div className="aero-panel-header">
              <span className="aero-panel-idx">0{idx + 1}</span>
              <span className="aero-panel-tag">{mode.id.toUpperCase()}</span>
            </div>

            <div className="aero-panel-body">
              <h2 className="aero-panel-name">{mode.name}</h2>
              <p className="aero-panel-desc">{mode.desc}</p>
              
              <div className="aero-panel-cue" aria-hidden="true">
                {mode.id === "editor" && <AeroEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <AeroAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <AeroDeveloperCue accent={mode.accent} />}
              </div>
            </div>

            <div className="aero-panel-footer">
              <span className="aero-panel-action">
                <span className="aero-panel-arrow" aria-hidden="true">→</span>
                <span>Enter Mode</span>
              </span>
              <span className="aero-panel-line" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      {recruiterLensFlag?.enabled !== false && (
        <RecruiterLens metadata={recruiterLensFlag?.metadata} />
      )}

      <footer className="selector__footer aero-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="aero-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge aero-version-badge">{SITE_VERSION}</span>
        <span className="aero-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
