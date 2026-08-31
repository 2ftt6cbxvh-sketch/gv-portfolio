"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import GVLogo from "./GVLogo";
import ModeSelector from "./ModeSelector";
import DeveloperMode from "./DeveloperMode";
import EditorMode from "./EditorMode";
import AnalystMode from "./AnalystMode";
import CursorGlow from "./CursorGlow";
import SignatureIntro from "./SignatureIntro";
import ThemeMoodSwitcher from "./ThemeMoodSwitcher";
import AdminSecretGatewayModal from "./AdminSecretGatewayModal";
import CyberLockdownModal from "./CyberLockdownModal";
import EmergencyKillswitchOverlay from "./EmergencyKillswitchOverlay";
import MaintenanceOverlay from "./MaintenanceOverlay";
import { useSiteMotion } from "./useSiteMotion";

export default function AppShell({ data }) {
  const stageRef = useRef(null);
  const introRef = useRef(null);
  const selectorRef = useRef(null);
  const navRef = useRef(null);
  const navModeLabelRef = useRef(null);
  const navBackRef = useRef(null);
  const introLogoEngineRef = useRef(null);
  const navLogoEngineRef = useRef(null);
  const [features, setFeatures] = useState({ flags: {}, milestones: [] });
  const [showSignatureIntro, setShowSignatureIntro] = useState(true);
  const [showAdminGateway, setShowAdminGateway] = useState(false);
  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [lockdownSec, setLockdownSec] = useState(30);
  const [isKillswitchActive, setIsKillswitchActive] = useState(false);
  const [maintenanceState, setMaintenanceState] = useState({ active: false, metadata: null });

  const handleIntroComplete = useCallback(() => {
    setShowSignatureIntro(false);
  }, []);

  useEffect(() => {
    const handleOpenGateway = () => setShowAdminGateway(true);
    const handleLockdown = (e) => {
      if (e.detail?.seconds) setLockdownSec(e.detail.seconds);
      setIsLockdownOpen(true);
    };
    window.addEventListener("openAdminSecretGateway", handleOpenGateway);
    window.addEventListener("triggerCyberLockdown", handleLockdown);
    return () => {
      window.removeEventListener("openAdminSecretGateway", handleOpenGateway);
      window.removeEventListener("triggerCyberLockdown", handleLockdown);
    };
  }, []);

  useEffect(() => {
    const checkKillswitch = () => {
      fetch(`/api/public/killswitch-status?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((d) => {
          setIsKillswitchActive(!!d.active);
          if (d.maintenance) {
            setMaintenanceState(d.maintenance);
          }
        })
        .catch(() => {});
    };

    checkKillswitch();
    const interval = setInterval(checkKillswitch, 1500);

    // Add timestamp to prevent browser or CDN from caching stale feature flags
    fetch(`/api/public/features?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.flags) setFeatures(resData);
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  useSiteMotion({
    stageRef, introRef, selectorRef, navRef, navModeLabelRef, navBackRef,
    introLogoEngineRef, navLogoEngineRef,
  });

  const modeById = Object.fromEntries(data.modes.map((m) => [m.id, m]));

  const landingLogoColor  = data.themeTokens?.["landing.logoColor"]  || "#00f0ff";
  const landingSparkColor = data.themeTokens?.["landing.sparkColor"] || "#00ffff";

  const themeCss = `
    :root, [data-mode=""] {
      --landing-logo-color: ${landingLogoColor};
      --landing-spark-color: ${landingSparkColor};
      --logo-color: var(--landing-logo-color);
      --spark-color: var(--landing-spark-color);
    }
  ` + data.modes
    .map((m) => (m.accent ? `[data-mode="${m.id}"]{--color-accent:${m.accent};--color-accent-hover:color-mix(in oklab, ${m.accent} 75%, white);--logo-color:${m.accent};--spark-color:color-mix(in oklab, ${m.accent} 85%, white);}` : ""))
    .join("\n");

  const sigFlag = features.flags?.signature_intro;
  let sigText = "Ganesh Varma";
  let sigAccent = landingLogoColor;
  let sigGlow = landingSparkColor;

  if (sigFlag?.metadata) {
    try {
      const parsed = typeof sigFlag.metadata === "string" ? JSON.parse(sigFlag.metadata) : sigFlag.metadata;
      if (parsed.text) sigText = parsed.text;
      if (parsed.accentColor) sigAccent = parsed.accentColor;
      if (parsed.glowColor) sigGlow = parsed.glowColor;
    } catch (e) {}
  }

  return (
    <div id="stage" data-mode="" ref={stageRef}>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <div className="noise-veil" aria-hidden="true" />
      <CursorGlow />

      <nav className="nav" id="nav" ref={navRef} aria-label="Site">
        <GVLogo
          id="nav-logo"
          size={40}
          engineRef={navLogoEngineRef}
          opts={{ radius: 120, maxOffset: 8 }}
          role="button"
          tabIndex={0}
          aria-label="GV — return to mode select"
        />
        <span className="nav__mode-label" id="nav-mode-label" ref={navModeLabelRef} />
        <div className="nav__right-group">
          <ThemeMoodSwitcher
            metadata={features?.flags?.theme_moods?.metadata}
            enabled={features?.flags?.theme_moods?.enabled !== false}
          />
          <button className="nav__back" id="nav-back" ref={navBackRef} style={{ display: "none" }}>
            ← All modes
          </button>
        </div>
      </nav>

      {/* Signature Scribble Intro Overlay */}
      {showSignatureIntro && sigFlag?.enabled !== false ? (
        <SignatureIntro
          key={sigText}
          text={sigText}
          accentColor={sigAccent}
          glowColor={sigGlow}
          onComplete={handleIntroComplete}
        />
      ) : (
        <div
          id="intro"
          ref={introRef}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "#06050a", pointerEvents: "none", opacity: 0 }}
        />
      )}

      <ModeSelector selectorRef={selectorRef} person={data.person} modes={data.modes} features={features} />

      {modeById.editor && <EditorMode data={modeById.editor} features={features} />}
      {modeById.analyst && <AnalystMode data={modeById.analyst} features={features} />}
      {modeById.developer && <DeveloperMode data={modeById.developer} features={features} />}
      {/* Secret Admin Gateway Modal */}
      <AdminSecretGatewayModal
        isOpen={showAdminGateway}
        onClose={() => setShowAdminGateway(false)}
        metadata={features?.flags?.admin_secret_gateway?.metadata}
      />

      {/* Emergency Cyber Defense Killswitch 503 Overlay */}
      {isKillswitchActive && <EmergencyKillswitchOverlay />}

      {/* Cyber Under Active Maintenance Overlay */}
      {maintenanceState.active && !isKillswitchActive && (
        <MaintenanceOverlay metadata={maintenanceState.metadata} />
      )}

      {/* Cyber Lockdown Statutory Legal Warning Modal */}
      <CyberLockdownModal
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        seconds={lockdownSec}
      />
    </div>
  );
}
