"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";

// Apple Liquid Glass - morphing blob cues
function LiquidEditorCue({ accent = "#b072ff" }) {
  return (
    <svg className="lq-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lqEditorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="2" y="5" width="196" height="38" rx="12" stroke="url(#lqEditorGrad)" strokeWidth="1.2" fill="rgba(176,114,255,0.06)" />
      {[12,32,52,72,92,112,132,152,172].map((x) => (
        <rect key={x} x={x} y="1" width="10" height="6" rx="3" fill="url(#lqEditorGrad)" fillOpacity="0.6" />
      ))}
      {[12,32,52,72,92,112,132,152,172].map((x) => (
        <rect key={x+"b"} x={x} y="41" width="10" height="6" rx="3" fill="url(#lqEditorGrad)" fillOpacity="0.6" />
      ))}
      <polygon points="76,16 76,32 94,24" fill={accent} fillOpacity="0.95" />
      <path d="M106 24 C112 14, 118 34, 124 20 C130 28, 136 16, 142 26 C148 20, 154 24, 168 24"
        stroke="url(#lqEditorGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function LiquidAnalystCue({ accent = "#00f0ff" }) {
  return (
    <svg className="lq-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lqAnalystGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="60%" stopColor="#39ff88" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {[14,26,38].map((y) => (
        <line key={y} x1="4" y1={y} x2="196" y2={y} stroke="rgba(0,240,255,0.18)" strokeWidth="0.8" strokeDasharray="4 4" />
      ))}
      <path d="M6 38 C40 36, 65 18, 95 24 C125 30, 155 12, 194 8"
        stroke="url(#lqAnalystGrad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {[[6,38],[52,28],[95,24],[130,26],[165,14],[194,8]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="rgba(6,10,18,0.85)" stroke="#00f0ff" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="2" fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}

function LiquidDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="lq-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lqDevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>
      </defs>
      <path d="M46 13 L20 24 L46 35" stroke="url(#lqDevGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M154 13 L180 24 L154 35" stroke="url(#lqDevGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="88" y1="36" x2="112" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <rect x="124" y="18" width="4.5" height="14" rx="2" fill={accent} className="dev-cursor" />
    </svg>
  );
}

export default function ModeSelectorLiquid({ selectorRef, person, modes, features = {} }) {
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

  // Tilt + mouse tracking — only active while hovered (hover-only morph)
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
        s.targetRotX = (-(posY - rect.height / 2) / (rect.height / 2)) * 8;
        s.targetRotY = ((posX - rect.width / 2) / (rect.width / 2)) * 8;
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
        s.targetRotX = (-(posY - rect.height / 2) / (rect.height / 2)) * 12;
        s.targetRotY = ((posX - rect.width / 2) / (rect.width / 2)) * 12;
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
          portal.style.transform = `perspective(1200px) rotateX(${s.currentRotX.toFixed(2)}deg) rotateY(${s.currentRotY.toFixed(2)}deg) translateZ(14px)`;
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
    <main className="selector lq-selector is-visible" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}
      {/* Pure CSS animated orb background — no canvas */}
      <div className="lq-bg-orbs" aria-hidden="true">
        <div className="lq-orb lq-orb--a" />
        <div className="lq-orb lq-orb--b" />
        <div className="lq-orb lq-orb--c" />
      </div>
      <div className="selector__intro lq-hero reveal" style={{ position: "relative", zIndex: 2 }}>
        {statusPillFlag?.enabled !== false && (
          <div className="lq-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}
        <h1 className="lq-title">
          <span className="lq-title-top">Three Disciplines.</span>
          <span className="lq-title-gradient">One Line of Work.</span>
        </h1>
        {kineticFlag?.enabled !== false && (
          <div className="lq-kinetic-wrapper"><KineticHeadline roles={kineticRoles} /></div>
        )}
        {hotkeyFlag?.enabled !== false && (
          <div className="lq-hotkey-bar">
            {["1","2","3"].map((k,i) => (
              <span key={k} className="lq-hotkey-group">
                <kbd className="lq-kbd">{k}</kbd>
                <span className="lq-kbd-label">{["Editor","Analyst","Dev"][i]}</span>
                {i < 2 && <span className="lq-kbd-sep" aria-hidden="true">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="portals lq-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2, border: "none" }}>
        {modes.map((mode, idx) => (
          <article
            className="portal lq-blob-card"
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
            <div className="lq-blob-specular" aria-hidden="true" />
            <div className="lq-blob-chromatic" aria-hidden="true" />
            <div className="lq-blob-lens" aria-hidden="true" />
            <div className="lq-blob-iridescent" aria-hidden="true" />
            <div className="lq-blob-header">
              <div className="lq-blob-header-left">
                <span className="lq-blob-idx">0{idx + 1}</span>
                <span className="lq-blob-badge">{mode.id.toUpperCase()}</span>
              </div>
              <kbd className="lq-card-kbd" title={`Press ${idx + 1}`}>{idx + 1}</kbd>
            </div>
            <div className="lq-blob-body">
              <h2 className="lq-blob-name">{mode.name}</h2>
              <p className="lq-blob-desc">{mode.desc}</p>
              <div className="lq-blob-cue" aria-hidden="true">
                {mode.id === "editor" && <LiquidEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <LiquidAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <LiquidDeveloperCue accent={mode.accent} />}
              </div>
            </div>
            <div className="lq-blob-footer">
              <span className="lq-blob-cta">
                <span className="lq-blob-arrow" aria-hidden="true">→</span>
                <span>Enter Universe</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <footer className="selector__footer lq-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="lq-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge lq-version-badge">{SITE_VERSION}</span>
        <span className="lq-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
