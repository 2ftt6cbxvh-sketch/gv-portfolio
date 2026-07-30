"use client";
import { useEffect } from "react";

/**
 * Holographic Certificate & Achievement Verification Modal.
 * Displays verification badge seal, issuing authority, dates, and credential links.
 */
export default function CertModal({ cert, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!cert) return null;

  return (
    <div
      className="cert-modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(6, 5, 10, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="cert-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#0d0c14",
          border: "1px solid var(--color-accent, #00f0ff)",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 0 40px rgba(0,240,255,0.15)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "var(--color-fg-muted)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🎖️</span>
          <div>
            <span className="label-mono" style={{ fontSize: "0.75rem", color: "var(--color-accent)" }}>
              VERIFIED CREDENTIAL
            </span>
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{cert.title || cert.name}</h3>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, fontSize: "0.85rem" }}>
          <div>
            <span style={{ opacity: 0.6, display: "block" }}>Issuer / Organization</span>
            <strong>{cert.issuer || cert.org || "Verified Issuer"}</strong>
          </div>
          <div>
            <span style={{ opacity: 0.6, display: "block" }}>Date Issued</span>
            <strong>{cert.year || cert.date || "2026"}</strong>
          </div>
        </div>

        {cert.description && (
          <p style={{ fontSize: "0.88rem", color: "var(--color-fg-muted)", lineHeight: 1.6, marginBottom: 20 }}>
            {cert.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.7 }}>
            ID: {cert.id || "CERT-GV-2026"}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "6px 16px",
              background: "var(--color-accent)",
              color: "#000",
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
