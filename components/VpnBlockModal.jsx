"use client";

import { useEffect, useState } from "react";

export default function VpnBlockModal({ isOpen, ipAddress, onRefresh }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setPulse((prev) => !prev), 800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(3, 2, 8, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "var(--font-mono, monospace)",
        boxSizing: "border-box",
        animation: "vpnModalFadeIn 0.3s ease-out forwards",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          background: "#08040d",
          border: `2px solid ${pulse ? "#ff003c" : "#ffaa00"}`,
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: `0 0 50px ${pulse ? "rgba(255, 0, 60, 0.4)" : "rgba(255, 170, 0, 0.3)"}`,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        {/* Top Warning Strobe Header */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(255, 0, 60, 0.15)",
            border: "1px solid #ff003c",
            borderRadius: 999,
            color: "#ff003c",
            fontSize: "0.78rem",
            letterSpacing: "0.15em",
            fontWeight: 700,
            marginBottom: 20,
            animation: "vpnPulseStrobe 1.5s infinite",
          }}
        >
          <span style={{ fontSize: "1rem" }}>⚠️</span> INTERNAL SECURITY POLICY VIOLATION
        </div>

        {/* Main Title */}
        <h2
          style={{
            margin: "0 0 12px 0",
            color: "#ffffff",
            fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
            fontWeight: 800,
            letterSpacing: "0.05em",
            lineHeight: 1.25,
            textTransform: "uppercase",
          }}
        >
          VPN OR PROXY TUNNEL DETECTED
        </h2>

        {/* Clear Security Policy Statement Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <p style={{ margin: "0 0 10px 0", color: "#ffaa00", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            🔒 SECURITY POLICY REGULATION #403:
          </p>
          <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.85)", fontSize: "0.88rem", lineHeight: 1.6 }}>
            Per internal security policy, direct access to <strong>ganeshvarma.in</strong> is restricted to verified home/mobile network connections. 
            Active VPNs, anonymizing proxies, and datacenter relay tunnels are <strong>strictly prohibited</strong> from interacting with internal site gateways.
          </p>
        </div>

        {/* Live Telemetry Data Box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 28,
            fontSize: "0.75rem",
            textAlign: "left",
          }}
        >
          <div style={{ background: "rgba(0,0,0,0.5)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 2 }}>DETECTED IP:</span>
            <strong style={{ color: "#00f0ff" }}>{ipAddress || "Active Proxy IP"}</strong>
          </div>
          <div style={{ background: "rgba(0,0,0,0.5)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 2 }}>ACTION STATUS:</span>
            <strong style={{ color: "#ff003c" }}>BLOCKED BY VAULT SHIELD</strong>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onRefresh) onRefresh();
            else window.location.reload();
          }}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #ff003c 0%, #aa0022 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: 10,
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            boxShadow: "0 0 24px rgba(255, 0, 60, 0.4)",
            transition: "transform 0.2s ease, boxShadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 0 32px rgba(255, 0, 60, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 24px rgba(255, 0, 60, 0.4)";
          }}
        >
          🔄 DISCONNECT VPN &amp; REFRESH PAGE
        </button>

        <p style={{ margin: "14px 0 0 0", color: "rgba(255, 255, 255, 0.45)", fontSize: "0.72rem" }}>
          Once your VPN is disconnected, click refresh to restore site access.
        </p>
      </div>

      <style jsx global>{`
        @keyframes vpnModalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes vpnPulseStrobe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
