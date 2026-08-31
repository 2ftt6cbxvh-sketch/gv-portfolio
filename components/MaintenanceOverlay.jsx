"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MaintenanceOverlay({ metadata }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let notice = "We are currently performing high-speed infrastructure optimizations and upgrading the 3D graphics & AI pipelines. Public services will be fully restored shortly.";
  let eta = "30 - 45 Minutes";

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.message) notice = parsed.message;
      if (parsed.eta) eta = parsed.eta;
    } catch (e) {}
  }

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999990,
        background: "#03050c",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Background Matrix Grid Pattern & Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes amberNeonPulse {
          0%, 100% { box-shadow: 0 0 45px rgba(255, 183, 0, 0.2), inset 0 0 30px rgba(255, 183, 0, 0.1); border-color: rgba(255, 183, 0, 0.5); }
          50% { box-shadow: 0 0 65px rgba(0, 240, 255, 0.25), inset 0 0 45px rgba(0, 240, 255, 0.15); border-color: rgba(0, 240, 255, 0.6); }
        }
        @keyframes radarRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
        }
        @keyframes gridMoveMaint {
          0% { background-position: 0 0; }
          100% { background-position: 36px 36px; }
        }
      ` }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255, 183, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 183, 0, 0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          animation: "gridMoveMaint 10s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Maintenance Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "rgba(6, 8, 16, 0.96)",
          backdropFilter: "blur(24px)",
          border: "2px solid rgba(255, 183, 0, 0.4)",
          borderRadius: 18,
          padding: "38px 32px",
          textAlign: "center",
          position: "relative",
          animation: "amberNeonPulse 2s infinite ease-in-out",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        {/* Animated Radar Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "2px dashed #ffb700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "radarRotate 12s linear infinite",
              background: "rgba(255, 183, 0, 0.08)",
              boxShadow: "0 0 25px rgba(255, 183, 0, 0.3)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🛠️</span>
          </div>
        </div>

        {/* Top Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255, 183, 0, 0.12)",
            border: "1px solid rgba(255, 183, 0, 0.4)",
            padding: "6px 16px",
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ffb700", boxShadow: "0 0 8px #ffb700" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.74rem",
              color: "#ffb700",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            SYSTEM STATUS // SCHEDULED MAINTENANCE
          </span>
        </div>

        <h1
          style={{
            fontSize: "1.9rem",
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 12px 0",
            letterSpacing: "0.02em",
            animation: "pulseGlow 2.5s infinite ease-in-out",
          }}
        >
          UNDER ACTIVE MAINTENANCE
        </h1>

        <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 24, padding: "0 10px" }}>
          {notice}
        </p>

        {/* ETA & Telemetry Strip */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: 24,
            textAlign: "left",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              ESTIMATED COMPLETION
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#39ff88", marginTop: "3px" }}>
              ⚡ {eta}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              ELAPSED TIME
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#00f0ff", marginTop: "3px" }}>
              ⏱️ {formatElapsed(seconds)}
            </div>
          </div>
        </div>

        {/* Direct Contact Bar */}
        <div
          style={{
            background: "rgba(255, 183, 0, 0.04)",
            border: "1px solid rgba(255, 183, 0, 0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span>Need immediate assistance?</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <a
              href="tel:+918555021322"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#39ff88",
                padding: "4px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              📞 +91 85550 21322
            </a>
            <a
              href="mailto:gp61080@gmail.com"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#00f0ff",
                padding: "4px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              ✉️ Email
            </a>
          </div>
        </div>

        {/* Footer with subtle Admin Portal Link */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>GV INFRASTRUCTURE // V7</span>
          <Link
            href="/admin"
            style={{
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#00f0ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            🔑 Admin Vault Login
          </Link>
        </div>
      </div>
    </div>
  );
}
