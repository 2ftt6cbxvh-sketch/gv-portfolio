"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";

function GlassEditorCue({ accent = "#b072ff" }) {
  return (
    <svg className="sg-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sgEditorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="196" height="36" rx="8" stroke="url(#sgEditorGrad)" strokeWidth="1" fill="rgba(176,114,255,0.05)" />
      {[10,30,50,70,90,110,130,150,170].map((x) => (
        <rect key={x} x={x} y="1" width="10" height="6" rx="2" fill={accent} fillOpacity="0.55" />
      ))}
      {[10,30,50,70,90,110,130,150,170].map((x) => (
        <rect key={x+"b"} x={x} y="41" width="10" height="6" rx="2" fill={accent} fillOpacity="0.55" />
      ))}
      <polygon points="76,16 76,32 94,24" fill={accent} fillOpacity="0.95" />
      <path d="M106 24 C112 14, 118 34, 124 20 C130 28, 136 16, 142 26 C148 20, 154 24, 168 24"
        stroke="url(#sgEditorGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function GlassAnalystCue({ accent = "#00f0ff" }) {
  return (
    <svg className="sg-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sgAnalystGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="60%" stopColor="#39ff88" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {[14,26,38].map((y) => (
        <line key={y} x1="4" y1={y} x2="196" y2={y} stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 3" />
      ))}
      <path d="M6 38 Q 45 34, 75 22 T 140 16 T 194 8" stroke="url(#sgAnalystGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.95" />
      {[[6,38],[45,30],[75,22],[110,18],[140,16],[170,12],[194,8]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4.5" fill="rgba(10,14,22,0.9)" stroke={accent} strokeWidth="1.5" />
          <circle cx={x} cy={y} r="1.8" fill={accent} />
        </g>
      ))}
    </svg>
  );
}

function GlassDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="sg-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sgDevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>
      </defs>
      <path d="M48 14 L24 24 L48 34" stroke="url(#sgDevGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M152 14 L176 24 L152 34" stroke="url(#sgDevGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="88" y1="36" x2="112" y2="12" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      <rect x="122" y="18" width="4" height="13" rx="1" fill={accent} fillOpacity="0.95" className="dev-cursor" />
    </svg>
  );
}

export default function ModeSelectorGlass({ selectorRef, person, modes, features = {} }) {
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

  useEffect(() => {
    const portals = portalsRef.current?.querySelectorAll(".portal");
    if (!portals) return;
    let animId = null;
    const state = new Map();

    portals.forEach((portal) => {
      state.set(portal, { targetRotX: 0, targetRotY: 0, currentRotX: 0, currentRotY: 0, active: false });
      const s = state.get(portal);
      const move = (e) => {
        const rect = portal.getBoundingClientRect();
        const posX = e.clientX - rect.left;
        const posY = e.clientY - rect.top;
        s.active = true;
        portal.dataset.isHovered = "true";
        s.targetRotX = (-(posY - rect.height / 2) / (rect.height / 2)) * 7;
        s.targetRotY = ((posX - rect.width / 2) / (rect.width / 2)) * 7;
        portal.style.setProperty("--mouse-x", `${(posX / rect.width) * 100}%`);
        portal.style.setProperty("--mouse-y", `${(posY / rect.height) * 100}%`);
      };
      const leave = () => {
        s.active = false;
        portal.dataset.isHovered = "false";
        s.targetRotX = 0; s.targetRotY = 0;
        portal.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      };
      const touchMove = (e) => {
        if (!e.touches?.length) return;
        const touch = e.touches[0];
        const rect = portal.getBoundingClientRect();
        const posX = touch.clientX - rect.left;
        const posY = touch.clientY - rect.top;
        s.active = true;
        portal.dataset.isHovered = "true";
        s.targetRotX = (-(posY - rect.height / 2) / (rect.height / 2)) * 10;
        s.targetRotY = ((posX - rect.width / 2) / (rect.width / 2)) * 10;
        portal.style.setProperty("--mouse-x", `${(posX / rect.width) * 100}%`);
        portal.style.setProperty("--mouse-y", `${(posY / rect.height) * 100}%`);
      };
      const touchEnd = () => {
        s.active = false;
        portal.dataset.isHovered = "false";
        s.targetRotX = 0; s.targetRotY = 0;
        portal.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      };
      portal.addEventListener("mousemove", move);
      portal.addEventListener("mouseleave", leave);
      portal.addEventListener("touchmove", touchMove, { passive: true });
      portal.addEventListener("touchend", touchEnd, { passive: true });
    });

    const loop = () => {
      portals.forEach((portal) => {
        const s = state.get(portal);
        if (s.active) {
          s.currentRotX += (s.targetRotX - s.currentRotX) * 0.12;
          s.currentRotY += (s.targetRotY - s.currentRotY) * 0.12;
          portal.style.transform = `perspective(1200px) rotateX(${s.currentRotX.toFixed(2)}deg) rotateY(${s.currentRotY.toFixed(2)}deg) translateZ(10px)`;
        }
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => { if (animId) cancelAnimationFrame(animId); };
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
    <main className="selector sg-selector is-visible" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}
      <div className="sg-depth-field" aria-hidden="true">
        <div className="sg-orb sg-orb--primary" />
        <div className="sg-orb sg-orb--secondary" />
        <div className="sg-orb sg-orb--tertiary" />
      </div>
      <div className="selector__intro sg-hero reveal" style={{ position: "relative", zIndex: 2 }}>
        {statusPillFlag?.enabled !== false && (
          <div className="sg-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}
        <div className="sg-identity-row">
          <span className="sg-identity-name">{person.name}</span>
          <span className="sg-identity-divider" aria-hidden="true">·</span>
          <span className="sg-identity-initials">{person.initials}</span>
        </div>
        <h1 className="sg-title">
          <span className="sg-title-primary">Three Disciplines.</span>
          <span className="sg-title-accent">One Line of Work.</span>
        </h1>
        {kineticFlag?.enabled !== false && (
          <div className="sg-kinetic-wrapper"><KineticHeadline roles={kineticRoles} /></div>
        )}
        {hotkeyFlag?.enabled !== false && (
          <div className="sg-hotkeys">
            {["1","2","3"].map((k,i) => (
              <span key={k} className="sg-hotkey-group">
                <kbd className="sg-kbd">{k}</kbd>
                <span className="sg-kbd-label">{["Editor","Analyst","Dev"][i]}</span>
                {i < 2 && <span className="sg-kbd-dot" aria-hidden="true">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="portals sg-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2, border: "none" }}>
        {modes.map((mode, idx) => (
          <article
            className="portal sg-card"
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
            <div className="sg-card-specular" aria-hidden="true" />
            <div className="sg-card-rim" aria-hidden="true" />
            <div className="sg-card-caustic" aria-hidden="true" />
            <div className="sg-card-inner-glow" aria-hidden="true" />
            <div className="sg-card-header">
              <div className="sg-card-header-left">
                <span className="sg-card-idx">0{idx + 1}</span>
                <span className="sg-card-tag">{mode.id.toUpperCase()}</span>
              </div>
              <kbd className="sg-card-kbd" title={`Press ${idx + 1}`}>{idx + 1}</kbd>
            </div>
            <div className="sg-card-body">
              <h2 className="sg-card-name">{mode.name}</h2>
              <p className="sg-card-desc">{mode.desc}</p>
              <div className="sg-card-cue" aria-hidden="true">
                {mode.id === "editor" && <GlassEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <GlassAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <GlassDeveloperCue accent={mode.accent} />}
              </div>
            </div>
            <div className="sg-card-footer">
              <span className="sg-card-cta">
                <span className="sg-card-arrow" aria-hidden="true">→</span>
                <span>Enter Universe</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <footer className="selector__footer sg-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="sg-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge sg-version-badge">{SITE_VERSION}</span>
        <span className="sg-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
