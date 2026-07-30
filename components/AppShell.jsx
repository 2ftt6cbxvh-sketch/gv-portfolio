"use client";

import { useRef } from "react";
import GVLogo from "./GVLogo";
import ModeSelector from "./ModeSelector";
import DeveloperMode from "./DeveloperMode";
import EditorMode from "./EditorMode";
import AnalystMode from "./AnalystMode";
import CursorGlow from "./CursorGlow";
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

  useSiteMotion({
    stageRef, introRef, selectorRef, navRef, navModeLabelRef, navBackRef,
    introLogoEngineRef, navLogoEngineRef,
  });

  const modeById = Object.fromEntries(data.modes.map((m) => [m.id, m]));

  // Theme accent colors are admin-managed (Theme tokens page) and stored in
  // the DB. Rendered as a CSS override per [data-mode] so the whole existing
  // token system (--color-accent / --color-accent-hover, used throughout
  // style.css) picks up live values with zero CSS file changes.
  const themeCss = data.modes
    .map((m) => (m.accent ? `[data-mode="${m.id}"]{--color-accent:${m.accent};--color-accent-hover:color-mix(in oklab, ${m.accent} 75%, white);}` : ""))
    .join("\n");

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

      <ModeSelector selectorRef={selectorRef} person={data.person} modes={data.modes} />

      {modeById.editor && <EditorMode data={modeById.editor} />}
      {modeById.analyst && <AnalystMode data={modeById.analyst} />}
      {modeById.developer && <DeveloperMode data={modeById.developer} />}
    </div>
  );
}
