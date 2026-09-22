"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";
import RecruiterLens from "./RecruiterLens";

// Liquid Glass Refractive Optical Cues
function LiquidEditorCue({ accent = "#b072ff" }) {
  return (
    <svg className="liquid-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="liquidEditorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* 16mm Refractive Optical Lens Frame */}
      <rect x="2" y="5" width="196" height="38" rx="8" stroke="url(#liquidEditorGrad)" strokeWidth="1.2" fill="rgba(176, 114, 255, 0.06)" />
      {[12, 32, 52, 72, 92, 112, 132, 152, 172].map((x) => (
        <rect key={x} x={x} y="1" width="10" height="6" rx="2" fill="url(#liquidEditorGrad)" fillOpacity="0.6" />
      ))}
      {[12, 32, 52, 72, 92, 112, 132, 152, 172].map((x) => (
        <rect key={x} x={x} y="41" width="10" height="6" rx="2" fill="url(#liquidEditorGrad)" fillOpacity="0.6" />
      ))}
      <polygon points="76,16 76,32 94,24" fill={accent} fillOpacity="0.95" />
      <path
        d="M106 24 C112 14, 118 34, 124 20 C130 28, 136 16, 142 26 C148 20, 154 24, 168 24"
        stroke="url(#liquidEditorGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function LiquidAnalystCue({ accent = "#00f0ff" }) {
  return (
    <svg className="liquid-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="liquidAnalystGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="60%" stopColor="#39ff88" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {[14, 26, 38].map((y) => (
        <line key={y} x1="4" y1={y} x2="196" y2={y} stroke="rgba(0, 240, 255, 0.18)" strokeWidth="0.8" strokeDasharray="4 4" />
      ))}
      {/* High-Dimensional Latent Manifold Curve with Liquid Bloom */}
      <path
        d="M6 38 C40 36, 65 18, 95 24 C125 30, 155 12, 194 8"
        stroke="url(#liquidAnalystGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {[[6, 38], [52, 28], [95, 24], [130, 26], [165, 14], [194, 8]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="rgba(6, 10, 18, 0.85)" stroke="#00f0ff" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="2" fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}

function LiquidDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="liquid-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="liquidDevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#39ff88" />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>
      </defs>
      <path d="M46 13 L20 24 L46 35" stroke="url(#liquidDevGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M154 13 L180 24 L154 35" stroke="url(#liquidDevGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="88" y1="36" x2="112" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <rect x="124" y="18" width="4.5" height="14" rx="1.5" fill="#39ff88" className="dev-cursor" />
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

  // Optical Caustics & 3D Lens Physics (Tracking mouse coordinates for specular lens caustics)
  useEffect(() => {
    const portals = portalsRef.current?.querySelectorAll(".portal");
    if (!portals) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animId;

    const updateLerp = () => {
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      portals.forEach((portal) => {
        if (portal.dataset.isHovered === "true" || portal.dataset.isMobileTilt === "true") {
          portal.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(14px)`;
        }
      });

      animId = requestAnimationFrame(updateLerp);
    };

    animId = requestAnimationFrame(updateLerp);

    const handlers = [];
    portals.forEach((portal) => {
      const move = (e) => {
        const rect = portal.getBoundingClientRect();
        const posX = e.clientX - rect.left;
        const posY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        portal.dataset.isHovered = "true";
        targetRotX = (-(posY - centerY) / centerY) * 8;
        targetRotY = ((posX - centerX) / centerX) * 8;
        portal.style.setProperty("--mouse-x", `${(posX / rect.width) * 100}%`);
        portal.style.setProperty("--mouse-y", `${(posY / rect.height) * 100}%`);
      };

      const leave = () => {
        portal.dataset.isHovered = "false";
        targetRotX = 0;
        targetRotY = 0;
        portal.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      };

      const touchMove = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const rect = portal.getBoundingClientRect();
        const posX = touch.clientX - rect.left;
        const posY = touch.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        portal.dataset.isHovered = "true";
        targetRotX = (-(posY - centerY) / centerY) * 12;
        targetRotY = ((posX - centerX) / centerX) * 12;
        portal.style.setProperty("--mouse-x", `${(posX / rect.width) * 100}%`);
        portal.style.setProperty("--mouse-y", `${(posY / rect.height) * 100}%`);
      };

      const touchEnd = () => {
        portal.dataset.isHovered = "false";
        targetRotX = 0;
        targetRotY = 0;
        portal.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      };

      portal.addEventListener("mousemove", move);
      portal.addEventListener("mouseleave", leave);
      portal.addEventListener("touchmove", touchMove, { passive: true });
      portal.addEventListener("touchend", touchEnd, { passive: true });
      handlers.push({ portal, move, leave, touchMove, touchEnd });
    });

    return () => {
      cancelAnimationFrame(animId);
      handlers.forEach(({ portal, move, leave, touchMove, touchEnd }) => {
        portal.removeEventListener("mousemove", move);
        portal.removeEventListener("mouseleave", leave);
        portal.removeEventListener("touchmove", touchMove);
        portal.removeEventListener("touchend", touchEnd);
      });
    };
  }, []);

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
    <main className="selector liquid-selector" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />

      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}

      {/* Hero Header with Liquid Glass Capsule Styling */}
      <div className="selector__intro liquid-hero-container reveal" style={{ position: "relative", zIndex: 2 }}>
        {statusPillFlag?.enabled !== false && (
          <div className="liquid-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}

        <div className="liquid-identity-capsule">
          <span className="liquid-identity-dot" />
          <span className="liquid-identity-name">{person.name}</span>
          <span className="liquid-identity-slash">/</span>
          <span className="liquid-identity-initials">{person.initials}</span>
        </div>

        <h1 className="liquid-title">
          <span className="liquid-title-top">Three Disciplines.</span>
          <span className="liquid-title-gradient">One Line of Work.</span>
        </h1>

        {kineticFlag?.enabled !== false && (
          <div className="liquid-kinetic-wrapper">
            <KineticHeadline roles={kineticRoles} />
          </div>
        )}

        <p className="liquid-subtitle">
          An adaptive polymath digital universe engineered across film direction, neural machine intelligence, and high-FPS graphics engines.
        </p>

        {hotkeyFlag?.enabled !== false && (
          <div className="liquid-hotkey-bar">
            <span className="liquid-hotkey-hint">Press</span>
            <kbd className="liquid-kbd">1</kbd>
            <span className="liquid-kbd-txt">Editor</span>
            <span className="liquid-kbd-sep">•</span>
            <kbd className="liquid-kbd">2</kbd>
            <span className="liquid-kbd-txt">Analyst</span>
            <span className="liquid-kbd-sep">•</span>
            <kbd className="liquid-kbd">3</kbd>
            <span className="liquid-kbd-txt">Developer</span>
          </div>
        )}
      </div>

      {/* 3 Refractive Liquid Glass Slabs */}
      <div className="portals liquid-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2, border: "none" }}>
        {modes.map((mode, idx) => (
          <article
            className="portal liquid-slab"
            data-target={mode.id}
            data-mode-id={mode.id}
            data-mode={mode.id}
            role="listitem"
            tabIndex={0}
            style={{
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
            {/* Multi-Layer Refraction & Specular Caustic Glare */}
            <div className="liquid-slab-specular" aria-hidden="true" />
            <div className="liquid-slab-chromatic-rim" aria-hidden="true" />
            <div className="liquid-slab-ambient-lens" aria-hidden="true" />

            <div className="liquid-slab-header">
              <span className="liquid-slab-index">0{idx + 1}</span>
              <span className="liquid-slab-mode-badge">{mode.id.toUpperCase()}</span>
            </div>

            <div className="liquid-slab-body">
              <h2 className="liquid-slab-title">{mode.name}</h2>
              <p className="liquid-slab-desc">{mode.desc}</p>
              
              <div className="liquid-slab-cue" aria-hidden="true">
                {mode.id === "editor" && <LiquidEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <LiquidAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <LiquidDeveloperCue accent={mode.accent} />}
              </div>
            </div>

            <div className="liquid-slab-footer">
              <span className="liquid-slab-warp">
                <span className="liquid-slab-arrow" aria-hidden="true">→</span>
                <span>Enter Universe</span>
              </span>
              <span className="liquid-slab-pill-glow" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      {recruiterLensFlag?.enabled !== false && (
        <RecruiterLens metadata={recruiterLensFlag?.metadata} />
      )}

      <footer className="selector__footer liquid-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="liquid-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge liquid-version-badge">{SITE_VERSION}</span>
        <span className="liquid-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
