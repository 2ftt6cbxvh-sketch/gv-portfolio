"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSecretGatewayModal({ isOpen, onClose, metadata }) {
  const router = useRouter();
  const [isCastingSpell, setIsCastingSpell] = useState(false);

  let accentColor = "#ffd700";
  let titleText = "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED";
  let adminSecretKey = "134214";

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.accentColor) accentColor = parsed.accentColor;
      if (parsed.titleText) titleText = parsed.titleText;
      if (parsed.adminSecretKey) adminSecretKey = parsed.adminSecretKey;
    } catch (e) {}
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isCastingSpell) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isCastingSpell]);

  const handleEnterAdmin = () => {
    setIsCastingSpell(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("starPatternVerified", "true");
    }

    // 1.4s Harry Potter spell dissolution animation before redirecting to /admin with secret key
    setTimeout(() => {
      router.push(`/admin?key=${adminSecretKey}`);
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(3, 6, 12, 0.92)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        pointerEvents: "auto",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      {/* Harry Potter "Mischief Managed" Solid Opaque Animated Spell Screen */}
      {isCastingSpell && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000005,
            background: "#030712",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              border: `2px dashed ${accentColor}`,
              boxShadow: `0 0 50px color-mix(in oklab, ${accentColor} 50%, transparent)`,
              animation: "spin 3s linear infinite",
              opacity: 0.6,
            }}
          />

          <div
            style={{
              fontSize: 64,
              marginBottom: 16,
              filter: `drop-shadow(0 0 25px ${accentColor})`,
              animation: "bounce 1.2s infinite",
            }}
          >
            🪄✨
          </div>

          <h2
            style={{
              fontFamily: "var(--font-mono)",
              color: accentColor,
              letterSpacing: "0.18em",
              fontSize: "1.6rem",
              fontWeight: 800,
              margin: "0 0 10px 0",
              textShadow: `0 0 30px ${accentColor}`,
            }}
          >
            MISCHIEF MANAGED...
          </h2>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "#ffffff",
              fontSize: "0.95rem",
              margin: "0 0 16px 0",
              opacity: 0.9,
            }}
          >
            Alohomora Spell Activated :: Entering Admin Sanctum
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `color-mix(in oklab, ${accentColor} 15%, transparent)`,
              border: `1px solid ${accentColor}`,
              color: accentColor,
              padding: "6px 16px",
              borderRadius: 20,
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
            }}
          >
            <span>⚡ REDIRECTING TO /ADMIN VAULT...</span>
          </div>
        </div>
      )}

      {/* Main Secret Gateway Popup Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#080c14",
          border: `2px solid ${accentColor}`,
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
          boxShadow: `0 0 50px color-mix(in oklab, ${accentColor} 50%, transparent)`,
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            color: "rgba(255,255,255,0.8)",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: 44, marginBottom: 12 }}>
          🪄✨
        </div>

        <span
          style={{
            fontSize: "0.74rem",
            fontFamily: "var(--font-mono)",
            color: accentColor,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          ✨ ALOHOMORA! PATTERN VERIFIED ✨
        </span>

        <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", color: "#fff", fontWeight: 600 }}>
          {titleText}
        </h3>

        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5, marginBottom: 24 }}>
          You connected the secret 4-star spell rune pattern! Harry Potter magic has unlocked administrative access.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={handleEnterAdmin}
            style={{
              padding: "14px 24px",
              background: accentColor,
              color: "#000",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "0.92rem",
              cursor: "pointer",
              boxShadow: `0 0 25px color-mix(in oklab, ${accentColor} 65%, transparent)`,
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = `0 0 35px color-mix(in oklab, ${accentColor} 85%, transparent)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 0 25px color-mix(in oklab, ${accentColor} 65%, transparent)`;
            }}
          >
            🪄 ENTER ADMIN PANEL (ALOHOMORA)
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
