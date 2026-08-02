"use client";

import { useEffect, useState } from "react";

export default function EmergencyKillswitchOverlay() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999999,
        background: "#02040a",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Background Matrix Grid Pattern & Flashy Strobe Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes strobeNeon {
          0%, 100% { box-shadow: 0 0 50px #ff003c, inset 0 0 35px #ff003c; border-color: #ff003c; }
          50% { box-shadow: 0 0 75px #0088ff, inset 0 0 50px #0088ff; border-color: #0088ff; }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.98); }
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      ` }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255, 0, 60, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 8s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Emergency 503 Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "rgba(4, 7, 16, 0.95)",
          border: "2px solid #ff003c",
          borderRadius: 16,
          padding: "36px 32px",
          textAlign: "center",
          position: "relative",
          animation: "strobeNeon 1.4s infinite ease-in-out",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        {/* Top Alarm Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255, 0, 60, 0.2)", border: "1px solid #ff003c", padding: "6px 16px", borderRadius: 20, marginBottom: 18 }}>
          <span style={{ fontSize: 16 }}>🚨</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "#ff003c", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            HTTP 503 // ACTIVE CYBER EMERGENCY DEFENSE
          </span>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#ffffff",
            margin: "0 0 10px 0",
            letterSpacing: "0.02em",
            animation: "pulseText 1.5s infinite ease-in-out",
          }}
        >
          SYSTEM IN EMERGENCY LOCKDOWN
        </h1>

        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 20 }}>
          Public access to this server has been <strong>remotely suspended by the Administrator</strong> due to detected cyber intrusion activity or emergency infrastructure defense protocol.
        </p>

        {/* Indian Cyber Law Statutory Citation Block */}
        <div
          style={{
            background: "rgba(255, 0, 60, 0.08)",
            border: "1px solid rgba(255, 0, 60, 0.35)",
            borderRadius: 10,
            padding: 16,
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "#ff003c", fontWeight: 800, marginBottom: 6, letterSpacing: "0.1em" }}>
            ⚖️ STATUTORY CYBER LAW WARNING & NOTICE
          </div>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.55, margin: 0 }}>
            Unauthorized penetration testing, automated bot scanning, or cyber tampering is sternly prohibited and punishable under <strong>Section 66 (Hacking), Section 66B (Data Theft) &amp; Section 66F (Cyber Terrorism)</strong> of the <strong>Indian Information Technology (IT) Act, 2000</strong> &amp; relevant sections of the <strong>Bharatiya Nyaya Sanhita (BNS) / IPC</strong> with up to 10 years imprisonment. All IP addresses, device signatures, and geolocation telemetry are actively logged and transmitted to cyber law enforcement agencies.
          </p>
        </div>

        {/* Telemetry Status Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
          <span>DEFENSE ACTIVE: {seconds}s</span>
          <span>HTTP 503 SERVICE UN-AVAILABLE</span>
        </div>
      </div>
    </div>
  );
}
