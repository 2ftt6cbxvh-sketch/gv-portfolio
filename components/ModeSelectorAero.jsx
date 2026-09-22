"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";

// Windows Fluent / Mica Acrylic - sharp structural OS panels
function FluEditorCue({ accent = "#b072ff" }) {
  return (
    <svg className="flu-cue-svg" viewBox="0 0 200 44" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="198" height="36" rx="3" stroke={accent} strokeWidth="1" strokeOpacity="0.55" fill="rgba(176,114,255,0.04)" />
      {[6,22,38,54,70,86,102,118,134,150,166].map((x) => (
        <rect key={x} x={x} y="0" width="8" height="5" rx="1" fill={accent} fillOpacity="0.5" />
      ))}
      {[6,22,38,54,70,86,102,118,134,150,166].map((x) => (
        <rect key={x+"b"} x={x} y="39" width="8" height="5" rx="1" fill={accent} fillOpacity="0.5" />
      ))}
      <polygon points="74,15 74,29 88,22" fill={accent} fillOpacity="0.9" />
      <path d="M102 22 L110 15 L116 28 L122 17 L128 23 L134 16 L140 25 L146 19 L154 22" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.95" />
    </svg>
  );
}

function FluAnalystCue({ accent = "#33c7b0" }) {
  return (
    <svg className="flu-cue-svg" viewBox="0 0 200 44" fill="none" aria-hidden="true">
      <path d="M2 36 L36 24 L68 28 L100 12 L132 18 L166 6 L198 2" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {[[2,36],[36,24],[68,28],[100,12],[132,18],[166,6],[198,2]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={accent} />
      ))}
      {[10,20,30].map((y) => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke={accent} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="3 3" />
      ))}
    </svg>
  );
}

function FluDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="flu-cue-svg" viewBox="0 0 180 44" fill="none" aria-hidden="true">
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
          if (data.isVpn) setVpnState({ isOpen: true, ip: data.ip || "Active Proxy IP" });
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

  let statusPillData = {};
  if (statusPillFlag?.metadata) {
    try { statusPillData = typeof statusPillFlag.metadata === "string" ? JSON.parse(statusPillFlag.metadata) : statusPillFlag.metadata; } catch (e) {}
  }
  let kineticRoles = null;
  if (kineticFlag?.metadata) {
    try {
      const parsed = typeof kineticFlag.metadata === "string" ? JSON.parse(kineticFlag.metadata) : kineticFlag.metadata;
      if (parsed.roles) kineticRoles = parsed.roles;
    } catch (e) { kineticRoles = kineticFlag.metadata; }
  }
  let constellationAccent = "#ffd700";
  if (constellationFlag?.metadata) {
    try {
      const parsed = typeof constellationFlag.metadata === "string" ? JSON.parse(constellationFlag.metadata) : constellationFlag.metadata;
      if (parsed.accent) constellationAccent = parsed.accent;
    } catch (e) {}
  }

  // Fluent Reveal: mouse proximity lights up panel border
  useEffect(() => {
    const deck = portalsRef.current;
    if (!deck) return;
    const panels = deck.querySelectorAll(".portal");
    const handleMouseMove = (e) => {
      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panel.style.setProperty("--reveal-x", `${x}px`);
        panel.style.setProperty("--reveal-y", `${y}px`);
        panel.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
        panel.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
      });
    };
    deck.addEventListener("mousemove", handleMouseMove);
    return () => deck.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (hotkeyFlag?.enabled === false) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (["1","2","3"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        portalsRef.current?.querySelectorAll(".portal")?.[idx]?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeyFlag]);

  return (
    <main className="selector flu-selector is-visible" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}
      {/* Mica noise texture overlay */}
      <div className="flu-mica-overlay" aria-hidden="true" />
      <div className="selector__intro flu-hero reveal" style={{ position: "relative", zIndex: 2 }}>
        {statusPillFlag?.enabled !== false && (
          <div className="flu-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}
        <div className="flu-identity-bar">
          <span className="flu-badge-dot" aria-hidden="true" />
          <span className="flu-identity-name">{person.name}</span>
          <span className="flu-identity-sep" aria-hidden="true">/</span>
          <span className="flu-identity-initials">{person.initials}</span>
        </div>
        <h1 className="flu-title">
          <span className="flu-title-primary">Three Disciplines.</span>
          <span className="flu-title-accent">One Line of Work.</span>
        </h1>
        {kineticFlag?.enabled !== false && (
          <div className="flu-kinetic-wrapper"><KineticHeadline roles={kineticRoles} /></div>
        )}
        {hotkeyFlag?.enabled !== false && (
          <div className="flu-hotkeys">
            {["1","2","3"].map((k,i) => (
              <span key={k} className="flu-hotkey-group">
                <kbd className="flu-kbd">{k}</kbd>
                <span className="flu-kbd-label">{["Editor","Analyst","Dev"][i]}</span>
                {i < 2 && <span className="flu-kbd-sep" aria-hidden="true">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="portals flu-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2, border: "none" }}>
        {modes.map((mode, idx) => (
          <article
            className="portal flu-panel"
            data-target={mode.id}
            data-mode-id={mode.id}
            data-mode={mode.id}
            role="listitem"
            tabIndex={0}
            style={{ "--portal-accent": mode.accent, "--portal-delay": `${idx * 0.12}s` }}
            key={mode.id}
            onMouseEnter={() => {
              selectorRef.current?.style.setProperty("--hover-accent", mode.accent);
              selectorRef.current?.classList.add("has-hover-glow");
            }}
            onMouseLeave={() => selectorRef.current?.classList.remove("has-hover-glow")}
          >
            {/* Fluent Reveal border */}
            <div className="flu-reveal-border" aria-hidden="true" />
            {/* Acrylic noise */}
            <div className="flu-acrylic-noise" aria-hidden="true" />
            {/* Window chrome titlebar */}
            <div className="flu-titlebar" aria-hidden="true">
              <span className="flu-chrome-dot flu-chrome-dot--close" />
              <span className="flu-chrome-dot flu-chrome-dot--min" />
              <span className="flu-chrome-dot flu-chrome-dot--max" />
              <span className="flu-titlebar-label">{mode.id}.exe</span>
            </div>
            <div className="flu-panel-header">
              <div className="flu-panel-header-left">
                <span className="flu-panel-idx">0{idx + 1}</span>
                <span className="flu-panel-tag">{mode.id.toUpperCase()}</span>
              </div>
              <kbd className="flu-card-kbd" title={`Press ${idx + 1}`}>{idx + 1}</kbd>
            </div>
            <div className="flu-panel-body">
              <h2 className="flu-panel-name">{mode.name}</h2>
              <p className="flu-panel-desc">{mode.desc}</p>
              <div className="flu-panel-cue" aria-hidden="true">
                {mode.id === "editor" && <FluEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <FluAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <FluDeveloperCue accent={mode.accent} />}
              </div>
            </div>
            <div className="flu-panel-footer">
              <span className="flu-panel-action">
                <span className="flu-panel-arrow" aria-hidden="true">→</span>
                <span>Launch Mode</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <footer className="selector__footer flu-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="flu-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge flu-version-badge">{SITE_VERSION}</span>
        <span className="flu-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
