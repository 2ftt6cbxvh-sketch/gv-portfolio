"use client";

import { useRef } from "react";
import GVLogo from "./GVLogo";
import ModeSelector from "./ModeSelector";
import DeveloperMode from "./DeveloperMode";
import PlaceholderMode from "./PlaceholderMode";
import { useSiteMotion } from "./useSiteMotion";

export default function AppShell() {
  const stageRef = useRef(null);
  const introRef = useRef(null);
  const selectorRef = useRef(null);
  const navRef = useRef(null);
  const navModeLabelRef = useRef(null);
  const navBackRef = useRef(null);
  const introLogoEngineRef = useRef(null);
  const navLogoEngineRef = useRef(null);

  useSiteMotion({
    stageRef, introRef, selectorRef, navRef, navModeLabelRef, navBackRef,
    introLogoEngineRef, navLogoEngineRef,
  });

  return (
    <div id="stage" data-mode="" ref={stageRef}>
      <div className="noise-veil" aria-hidden="true" />

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
        <button className="nav__back" id="nav-back" ref={navBackRef} style={{ display: "none" }}>
          ← All modes
        </button>
      </nav>

      <div
        id="intro"
        ref={introRef}
        style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "#06050a" }}
      >
        <GVLogo id="intro-logo" size={140} engineRef={introLogoEngineRef} opts={{ ambient: false }} aria-label="GV logo animating in" />
      </div>

      <ModeSelector selectorRef={selectorRef} />

      <DeveloperMode />
      <PlaceholderMode id="mode-editor" theme="editor" />
      <PlaceholderMode id="mode-analyst" theme="analyst" />
    </div>
  );
}
