"use client";
import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import LandingConstellation from "./LandingConstellation";
import KineticHeadline from "./KineticHeadline";
import LandingStatusPill from "./LandingStatusPill";
import VpnBlockModal from "./VpnBlockModal";

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

  // 3D perspective tilt (Desktop Mouse + Mobile Gyroscope with Lerp Smoothing)
  useEffect(() => {
    const portals = portalsRef.current?.querySelectorAll(".portal");
    if (!portals) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animId;

    // Smooth Lerp Loop for physics
    const updateLerp = () => {
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      portals.forEach((portal) => {
        if (portal.dataset.isHovered === "true" || portal.dataset.isMobileTilt === "true") {
          portal.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1.03,1.03,1.03)`;
        }
      });

      animId = requestAnimationFrame(updateLerp);
    };

    animId = requestAnimationFrame(updateLerp);

    // Desktop Mouse Handlers
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
        portal.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      };

      // Touch Drag 3D Tilt for Mobile Screens
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
        portal.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      };

      // Request iOS Gyroscope Permission on touch start if needed
      const touchStart = () => {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission().then((res) => {
            if (res === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            }
          }).catch(() => {});
        }
      };

      portal.addEventListener("mousemove", move);
      portal.addEventListener("mouseleave", leave);
      portal.addEventListener("touchstart", touchStart, { passive: true });
      portal.addEventListener("touchmove", touchMove, { passive: true });
      portal.addEventListener("touchend", touchEnd, { passive: true });
      handlers.push({ portal, move, leave, touchStart, touchMove, touchEnd });
    });

    // Mobile Gyroscope Hardware Orientation Listener
    const handleOrientation = (e) => {
      if (e.beta === null || e.gamma === null) return;
      const gyroRotX = Math.max(-14, Math.min(14, (e.beta - 45) * 0.35));
      const gyroRotY = Math.max(-14, Math.min(14, e.gamma * 0.35));

      targetRotX = gyroRotX;
      targetRotY = gyroRotY;

      portals.forEach((p) => { p.dataset.isMobileTilt = "true"; });
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      cancelAnimationFrame(animId);
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      handlers.forEach(({ portal, move, leave, touchStart, touchMove, touchEnd }) => {
        portal.removeEventListener("mousemove", move);
        portal.removeEventListener("mouseleave", leave);
        portal.removeEventListener("touchstart", touchStart);
        portal.removeEventListener("touchmove", touchMove);
        portal.removeEventListener("touchend", touchEnd);
      });
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
      {/* Full-Screen Flashy VPN Security Policy Warning Modal */}
      <VpnBlockModal isOpen={vpnState.isOpen} ipAddress={vpnState.ip} />

      {/* Interactive Canvas Constellation background (Controlled by Admin toggle) */}
      {constellationFlag?.enabled !== false && (
        <LandingConstellation accentColor={constellationAccent} metadata={features?.flags?.admin_secret_gateway?.metadata} />
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
            {/* Cursor-follow glow & 3D light glare layers */}
            <div className="portal__cursor-glow" aria-hidden="true" />
            <div className="portal__glare" aria-hidden="true" />
            <div className="portal__tint" />

            <div className="portal__top">
              <span className="portal__index">0{idx + 1}</span>
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

      <footer className="selector__footer" style={{ position: "relative", zIndex: 2 }}>
        <span className="selector__footer-brand">{person.name} / {person.initials}</span>
        <span className="version-badge">{SITE_VERSION}</span>
        <span className="selector__footer-copy">© 2026</span>
      </footer>
    </main>
  );
}
