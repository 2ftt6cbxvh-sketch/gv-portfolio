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
    <div className="cert-modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="cert-modal-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="cert-modal-close" aria-label="Close certificate details">
          ✕
        </button>

        <div className="cert-modal-header">
          <span className="cert-modal-seal">🎖️</span>
          <div>
            <span className="label-mono cert-modal-tag">
              VERIFIED CREDENTIAL
            </span>
            <h3 className="cert-modal-title">{cert.title || cert.name}</h3>
          </div>
        </div>

        <div className="cert-modal-grid">
          <div className="cert-modal-field">
            <span className="cert-modal-label">Issuer / Organization</span>
            <strong className="cert-modal-val">{cert.issuer || cert.org || "Verified Issuer"}</strong>
          </div>
          <div className="cert-modal-field">
            <span className="cert-modal-label">Date Issued</span>
            <strong className="cert-modal-val">{cert.year || cert.date || "2026"}</strong>
          </div>
        </div>

        {cert.description && (
          <p className="cert-modal-desc">
            {cert.description}
          </p>
        )}

        <div className="cert-modal-footer">
          <span className="cert-modal-id">
            ID: {cert.id || "CERT-GV-2026"}
          </span>
          <button onClick={onClose} className="cert-modal-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
