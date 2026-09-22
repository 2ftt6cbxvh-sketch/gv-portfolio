"use client";
import AmbientAurora from "./AmbientAurora";

/**
 * LandingConstellation (v8.0.0)
 * Refactored to seamlessly render AmbientAurora:
 * - Subtle Apple / Linear style atmospheric aurora
 * - Zero flashy yellow stars or distracting spiderweb lines
 * - Full quadrant secret admin gateway support (1 -> 2 -> 3 -> 4 -> 1 -> 3)
 * - 100% backward-compatible with existing feature flags
 */
export default function LandingConstellation({ accentColor = "#00f0ff", metadata }) {
  return <AmbientAurora accentColor={accentColor} metadata={metadata} />;
}
