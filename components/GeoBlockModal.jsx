"use client";

import { useEffect, useState } from "react";

export default function GeoBlockModal({ isOpen, countryCode, countryName, ipAddress }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("is-geo-blocked");
      return;
    }

    document.body.classList.add("is-geo-blocked");
    const interval = setInterval(() => setPulse((prev) => !prev), 800);

    return () => {
      document.body.classList.remove("is-geo-blocked");
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#030208",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 16px) 16px",
        fontFamily: "var(--font-mono, monospace)",
        boxSizing: "border-box",
        animation: "geoModalFadeIn 0.3s ease-out forwards",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "calc(100dvh - 32px)",
          overflowY: "auto",
          background: "#05060f",
          border: `2px solid ${pulse ? "#00f0ff" : "#ff003c"}`,
          borderRadius: 16,
          padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)",
          boxShadow: `0 0 50px ${pulse ? "rgba(0, 240, 255, 0.3)" : "rgba(255, 0, 60, 0.4)"}`,
          textAlign: "center",
          position: "relative",
          boxSizing: "border-box",
          margin: "auto",
        }}
      >
        {/* Top Warning Strobe Header */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            background: "rgba(0, 240, 255, 0.12)",
            border: "1px solid #00f0ff",
            borderRadius: 999,
            color: "#00f0ff",
            fontSize: "0.74rem",
            letterSpacing: "0.12em",
            fontWeight: 700,
            marginBottom: 16,
            animation: "geoPulseStrobe 1.5s infinite",
          }}
        >
          <span>🌐</span> DYNAMIC GEO-FENCE POLICY REGULATION
        </div>

        {/* Main Title */}
        <h2
          style={{
            margin: "0 0 12px 0",
            color: "#ffffff",
            fontSize: "clamp(1.2rem, 5vw, 1.7rem)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            lineHeight: 1.25,
            textTransform: "uppercase",
          }}
        >
          ACCESS OUTSIDE INDIA RESTRICTED
        </h2>

        {/* Clear Security Policy Statement Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(0, 240, 255, 0.2)",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#00f0ff", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            🔒 GEO-FENCE REGULATION #403-GEO:
          </p>
          <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.85)", fontSize: "0.82rem", lineHeight: 1.55 }}>
            Per internal security policy, administrative access to vault gateways on <strong>ganeshvarma.in</strong> is strictly restricted to verified network connections originating within <strong>India (IN)</strong>. Connections from non-permitted country regions are automatically blocked at the edge.
          </p>
        </div>

        {/* Live Telemetry Data Box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 20,
            fontSize: "0.72rem",
            textAlign: "left",
          }}
        >
          <div style={{ background: "rgba(0,0,0,0.6)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 2 }}>DETECTED REGION:</span>
            <strong style={{ color: "#ffaa00", wordBreak: "break-all" }}>
              {countryName || countryCode ? `${countryCode} (${countryName || "External"})` : "NON-IN REGION"}
            </strong>
          </div>
          <div style={{ background: "rgba(0,0,0,0.6)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 2 }}>POLICY PERMITTED:</span>
            <strong style={{ color: "#00ff88" }}>🇮🇳 INDIA (IN) ONLY</strong>
          </div>
        </div>

        {/* Policy Status Badge */}
        <div
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "rgba(255, 0, 60, 0.15)",
            border: "1px solid #ff003c",
            borderRadius: 10,
            color: "#ff003c",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            boxSizing: "border-box",
          }}
        >
          🚫 ACCESS RESTRICTED: GEO-FENCE ENFORCED
        </div>

        <p style={{ margin: "12px 0 0 0", color: "rgba(255, 255, 255, 0.45)", fontSize: "0.7rem" }}>
          Administrative vault routes are monitored and restricted to local geographic regions.
        </p>
      </div>

      <style jsx global>{`
        body.is-geo-blocked #nav,
        body.is-geo-blocked .nav,
        body.is-geo-blocked .theme-selector,
        body.is-geo-blocked header {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        @keyframes geoModalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes geoPulseStrobe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
