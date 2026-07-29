"use client";

import { useEffect, useRef } from "react";
import GVLogoEngine from "./gv-logo-engine";

/**
 * Thin React wrapper around the framework-agnostic GVLogoEngine.
 * Exposes the engine instance via `engineRef` so parent components
 * (e.g. the mode selector / app shell) can call playIntro() or
 * playModeTransition() imperatively during transitions.
 */
export default function GVLogo({ size = 40, opts = {}, engineRef, className = "", ...rest }) {
  const elRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;
    const engine = new GVLogoEngine(elRef.current, opts);
    if (engineRef) engineRef.current = engine;
    return () => {
      engine.destroy();
      if (engineRef) engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elRef}
      className={`gv-logo-wrap ${className}`}
      style={{ "--logo-size": `${size}px` }}
      {...rest}
    />
  );
}
