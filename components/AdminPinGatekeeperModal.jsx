"use client";

import { useState, useEffect } from "react";

export default function AdminPinGatekeeperModal({ isOpen, onSuccess, onFail }) {
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput("");
      setErrorMsg("");
      setAttemptsLeft(3);
    }
  }, [isOpen]);

  const handleKeyPress = async (digit) => {
    if (pinInput.length < 6 && !isVerifying) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg("");

      if (nextPin.length === 6) {
        setIsVerifying(true);
        try {
          // Server-Side PIN Verification API Call
          const res = await fetch("/api/public/verify-vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "pin", payload: nextPin }),
          });

          const data = await res.json();
          setIsVerifying(false);

          if (res.status === 429) {
            setErrorMsg(data.error || "RATE LIMIT EXCEEDED. LOCKDOWN ACTIVATED.");
            onFail(); // Trigger 90s Cyber Lockdown Strobe Modal & Siren
            return;
          }

          if (data.success) {
            // PIN Match!
            setTimeout(() => {
              onSuccess();
            }, 250);
          } else {
            // PIN Mismatch!
            const remaining = attemptsLeft - 1;
            setAttemptsLeft(remaining);
            setErrorMsg(`INVALID SECURITY PIN. ${remaining} ATTEMPTS REMAINING.`);
            setPinInput("");

            if (remaining <= 0) {
              onFail(); // Trigger 90s Cyber Lockdown Strobe Modal & Siren
            }
          }
        } catch (e) {
          setIsVerifying(false);
          setErrorMsg("SERVER VERIFICATION ERROR.");
        }
      }
    }
  };

  const handleBiometricAuth = async () => {
    if (typeof window !== "undefined" && window.PublicKeyCredential && navigator.credentials) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          setErrorMsg("TOUCHID / FACEID HARDWARE NOT AVAILABLE. USE 6-DIGIT PIN.");
          return;
        }

        setIsVerifying(true);
        setErrorMsg("VERIFYING REGISTERED TOUCHID PASSKEY...");

        // Fetch registered admin Passkey ID from public features API
        let registeredCredId = null;
        try {
          const featRes = await fetch("/api/public/features");
          const featData = await featRes.json();
          const gatewayObj = featData.flags?.admin_secret_gateway;

          if (gatewayObj?.metadata) {
            const meta = typeof gatewayObj.metadata === "string" ? JSON.parse(gatewayObj.metadata) : gatewayObj.metadata;
            if (meta.allowedPasskeyCredentialId) {
              registeredCredId = meta.allowedPasskeyCredentialId;
            }
          }
        } catch (e) {}

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        if (registeredCredId) {
          // Verify against Ganesh Varma's Official Registered Mac Passkey!
          const rawId = Uint8Array.from(atob(registeredCredId), (c) => c.charCodeAt(0));

          const credential = await navigator.credentials.get({
            publicKey: {
              challenge: challenge.buffer,
              allowCredentials: [{ id: rawId.buffer, type: "public-key" }],
              userVerification: "required",
              timeout: 60000,
            },
          });

          setIsVerifying(false);
          if (credential) {
            onSuccess(); // Official Admin Mac Hardware Verified!
            return;
          }
        } else {
          // If no Passkey registered in DB yet, instruct admin to register inside /admin/security-settings
          setIsVerifying(false);
          setErrorMsg("NO TOUCHID PASSKEY REGISTERED IN DB YET. REGISTER DEVICE IN ADMIN PANEL OR USE 6-DIGIT PIN.");
        }
      } catch (e) {
        setIsVerifying(false);
        setErrorMsg("TOUCHID SCAN REJECTED OR NOT REGISTERED FOR THIS VAULT. USE 6-DIGIT PIN.");
      }
    } else {
      setErrorMsg("WEBAUTHN NOT SUPPORTED ON THIS BROWSER.");
    }
  };

  const handleClear = () => {
    setPinInput("");
    setErrorMsg("");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(3, 6, 12, 0.94)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        pointerEvents: "auto",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#080c14",
          border: "2px solid #00f0ff",
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 0 50px rgba(0, 240, 255, 0.35)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 38, marginBottom: 10 }}>
          🛡️
        </div>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "#00f0ff", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
          SECURITY GATEKEEPER // PIN REQUIRED
        </span>

        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#ffffff", fontWeight: 700 }}>
          ENTER 6-DIGIT SECURITY PIN
        </h3>

        {/* PIN Dots Indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #00f0ff",
                background: i < pinInput.length ? "#00f0ff" : "transparent",
                boxShadow: i < pinInput.length ? "0 0 12px #00f0ff" : "none",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#ff003c", marginBottom: 16, fontWeight: 700 }}>
            ⚠️ {errorMsg}
          </p>
        )}

        {/* 3x4 Cyber Keypad Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 280, margin: "0 auto 20px auto" }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={isVerifying}
              style={{
                padding: "14px 0",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                borderRadius: 10,
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
                fontSize: "1.2rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 240, 255, 0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isVerifying}
            style={{
              padding: "14px 0",
              background: "rgba(255, 0, 60, 0.15)",
              border: "1px solid rgba(255, 0, 60, 0.4)",
              borderRadius: 10,
              color: "#ff003c",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            CLR
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            disabled={isVerifying}
            style={{
              padding: "14px 0",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: 10,
              color: "#ffffff",
              fontFamily: "var(--font-mono)",
              fontSize: "1.2rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 240, 255, 0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            0
          </button>
          <div />
        </div>

        {/* WebAuthn Hardware Biometric Passkey Option */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleBiometricAuth}
            style={{
              width: "100%",
              maxWidth: 280,
              padding: "10px 16px",
              background: "rgba(0, 240, 255, 0.1)",
              border: "1px solid #00f0ff",
              borderRadius: 10,
              color: "#00f0ff",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span>📱 USE FACEID / TOUCHID BIOMETRICS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
