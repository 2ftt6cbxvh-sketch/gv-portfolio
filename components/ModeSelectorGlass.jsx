"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";

// Elegant Frosted Glass Cues for the 3 Polymath Universes
function GlassEditorCue({ accent = "#b072ff" }) {
  return (
    <svg className="glass-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      {/* 16mm Frosted Film Perforations */}
      <rect x="2" y="6" width="196" height="36" rx="6" stroke={accent} strokeWidth="1" strokeOpacity="0.4" fill="rgba(176, 114, 255, 0.04)" />
      {[10, 28, 46, 64, 82, 100, 118, 136, 154, 172].map((x) => (
        <rect key={x} x={x} y="2" width="9" height="6" rx="1.5" fill={accent} fillOpacity="0.45" />
      ))}
      {[10, 28, 46, 64, 82, 100, 118, 136, 154, 172].map((x) => (
        <rect key={x} x={x} y="40" width="9" height="6" rx="1.5" fill={accent} fillOpacity="0.45" />
      ))}
      {/* Minimal Play Arrow */}
      <polygon points="78,16 78,32 94,24" fill={accent} fillOpacity="0.85" />
      {/* Sound & Color Waveform */}
      <path
        d="M106 24 L114 16 L120 30 L126 20 L132 26 L138 18 L144 28 L150 22 L156 24 L168 24"
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
    </svg>
  );
}

function GlassAnalystCue({ accent = "#00f0ff" }) {
  return (
    <svg className="glass-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      {/* Coordinate Grid */}
      {[14, 26, 38].map((y) => (
        <line key={y} x1="4" y1={y} x2="196" y2={y} stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 3" />
      ))}
      {/* Latent Manifold Gradient Curve */}
      <path
        d="M6 38 Q 45 34, 75 22 T 140 16 T 194 8"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.95"
      />
      {/* Synapse Nodes */}
      {[[6, 38], [45, 30], [75, 22], [110, 18], [140, 16], [170, 12], [194, 8]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="rgba(10, 14, 22, 0.8)" stroke={accent} strokeWidth="1.5" />
          <circle cx={x} cy={y} r="1.8" fill={accent} />
        </g>
      ))}
    </svg>
  );
}

function GlassDeveloperCue({ accent = "#39ff88" }) {
  return (
    <svg className="glass-cue-svg" viewBox="0 0 200 48" fill="none" aria-hidden="true">
      {/* Terminal Brackets */}
      <path d="M48 14 L24 24 L48 34" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M152 14 L176 24 L152 34" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      {/* Divider Slash */}
      <line x1="88" y1="36" x2="112" y2="12" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      {/* High-FPS Telemetry Pulse */}
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

  // Status pill metadata
  let statusPillData = {};
  if (statusPillFlag?.metadata) {
    try {
      statusPillData = typeof statusPillFlag.metadata === "string" ? JSON.parse(statusPillFlag.metadata) : statusPillFlag.metadata;
    } catch (e) {}
  }

  // Kinetic headline metadata
  let kineticRoles = null;
  if (kineticFlag?.metadata) {
    try {
      const parsed = typeof kineticFlag.metadata === "string" ? JSON.parse(kineticFlag.metadata) : kineticFlag.metadata;
      if (parsed.roles) kineticRoles = parsed.roles;
    } catch (e) {
      kineticRoles = kineticFlag.metadata;
    }
  }

  // Constellation metadata
  let constellationAccent = "#ffd700";
  if (constellationFlag?.metadata) {
    try {
      const parsed = typeof constellationFlag.metadata === "string" ? JSON.parse(constellationFlag.metadata) : constellationFlag.metadata;
      if (parsed.accent) constellationAccent = parsed.accent;
    } catch (e) {}
  }

  // 3D Glass Surface Tilt & Prismatic Glare Tracking
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
          portal.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(10px)`;
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
        targetRotX = (-(posY - centerY) / centerY) * 7;
        targetRotY = ((posX - centerX) / centerX) * 7;
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
        targetRotX = (-(posY - centerY) / centerY) * 10;
        targetRotY = ((posX - centerX) / centerX) * 10;
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
    <main className="selector glass-selector" id="selector" ref={selectorRef} style={{ position: "relative" }}>
      {/* VPN Security Policy Warning Modal */}
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />

      {/* Interactive Constellation Background */}
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
      )}

      {/* Clean Glassmorphic Hero Header */}
      <div className="selector__intro glass-hero-container reveal" style={{ position: "relative", zIndex: 2 }}>
        {/* Floating Frosted Status Capsule */}
        {statusPillFlag?.enabled !== false && (
          <div className="glass-status-wrapper">
            <LandingStatusPill status={statusPillData.status} location={statusPillData.location} />
          </div>
        )}

        <h1 className="glass-title">
          <span className="glass-title-main">Three Disciplines.</span>
          <span className="glass-title-accent">One Line of Work.</span>
        </h1>

        {/* Dynamic Kinetic Headline */}
        {kineticFlag?.enabled !== false && (
          <div className="glass-kinetic-wrapper">
            <KineticHeadline roles={kineticRoles} />
          </div>
        )}
      </div>

      {/* 3 Floating Prismatic Glass Slabs */}
      <div className="portals glass-portals-deck" role="list" ref={portalsRef} style={{ position: "relative", zIndex: 2, border: "none" }}>
        {modes.map((mode, idx) => (
          <article
            className="portal glass-slab"
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
            {/* Prismatic specular glare & edge refraction layers */}
            <div className="glass-slab-specular" aria-hidden="true" />
            <div className="glass-slab-rim-glow" aria-hidden="true" />

            <div className="glass-slab-header">
              <div className="glass-slab-header-left">
                <span className="glass-slab-index">0{idx + 1}</span>
                <span className="glass-slab-tag">{mode.id.toUpperCase()}</span>
              </div>
              <kbd className="glass-card-kbd" title={`Press ${idx + 1} to enter`}>
                {idx + 1}
              </kbd>
            </div>

            <div className="glass-slab-body">
              <h2 className="glass-slab-name">{mode.name}</h2>
              <p className="glass-slab-desc">{mode.desc}</p>
              
              <div className="glass-slab-cue" aria-hidden="true">
                {mode.id === "editor" && <GlassEditorCue accent={mode.accent} />}
                {mode.id === "analyst" && <GlassAnalystCue accent={mode.accent} />}
                {mode.id === "developer" && <GlassDeveloperCue accent={mode.accent} />}
              </div>
            </div>

            <div className="glass-slab-footer">
              <span className="glass-slab-cta">
                <span className="glass-slab-arrow" aria-hidden="true">→</span>
                <span>Enter Universe</span>
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Floating Glass Footer */}
      <footer className="selector__footer glass-footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="glass-footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge glass-version-badge">{SITE_VERSION}</span>
        <span className="glass-footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
