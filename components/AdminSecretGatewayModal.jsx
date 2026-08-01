"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSecretGatewayModal({ isOpen, onClose, metadata }) {
  const router = useRouter();

  let accentColor = "#ffd700";
  let titleText = "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED";

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.accentColor) accentColor = parsed.accentColor;
      if (parsed.titleText) titleText = parsed.titleText;
    } catch (e) {}
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(3, 5, 8, 0.88)",
        backdropFilter: "blur(18px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#080c14",
          border: `1.5px solid ${accentColor}`,
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
          boxShadow: `0 0 40px color-mix(in oklab, ${accentColor} 40%, transparent)`,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: 44, marginBottom: 12, animation: "pulse 1.5s infinite" }}>
          🔐
        </div>

        <span
          style={{
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono)",
            color: accentColor,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          STAR PATTERN VERIFIED
        </span>

        <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", color: "#fff", fontWeight: 600 }}>
          {titleText}
        </h3>

        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5, marginBottom: 24 }}>
          You have successfully connected the secret 3-star constellation pattern. Access granted to administrative control.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => {
              onClose();
              router.push("/admin");
            }}
            style={{
              padding: "12px 20px",
              background: accentColor,
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: `0 0 20px color-mix(in oklab, ${accentColor} 60%, transparent)`,
              transition: "all 0.2s ease",
            }}
          >
            🚀 ENTER ADMIN PANEL
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
