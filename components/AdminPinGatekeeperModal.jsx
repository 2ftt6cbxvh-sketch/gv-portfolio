"use client";

import { useState, useEffect } from "react";

export default function AdminPinGatekeeperModal({ isOpen, onSuccess, onFail }) {
  const [pinInput, setPinInput] = useState("");
  const [totpInput, setTotpInput] = useState("");
  const [step, setStep] = useState("pin"); // "pin" | "totp"
  const [verifiedPin, setVerifiedPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput("");
      setTotpInput("");
      setStep("pin");
      setVerifiedPin("");
      setErrorMsg("");
      setAttemptsLeft(3);
    }
  }, [isOpen]);

  const handleKeyPress = async (digit) => {
    if (step === "pin") {
      if (pinInput.length < 6 && !isVerifying) {
        const nextPin = pinInput + digit;
        setPinInput(nextPin);
        setErrorMsg("");

        if (nextPin.length === 6) {
          setIsVerifying(true);
          try {
            const res = await fetch("/api/public/verify-vault", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "pin", payload: nextPin }),
            });

            const data = await res.json();
            setIsVerifying(false);

            if (res.status === 429) {
              setErrorMsg(data.error || "RATE LIMIT EXCEEDED. LOCKDOWN ACTIVATED.");
              onFail();
              return;
            }

            if (data.requires2FA) {
              // Move to Step 2: 2FA Code Verification
              setVerifiedPin(nextPin);
              setStep("totp");
              setErrorMsg("PIN VERIFIED. ENTER 6-DIGIT CODE FROM APPLE PASSWORDS APP.");
              return;
            }

            if (data.success) {
              setTimeout(() => {
                onSuccess();
              }, 250);
            } else {
              const remaining = attemptsLeft - 1;
              setAttemptsLeft(remaining);
              setErrorMsg(`INVALID SECURITY PIN. ${remaining} ATTEMPTS REMAINING.`);
              setPinInput("");

              if (remaining <= 0) {
                onFail();
              }
            }
          } catch (e) {
            setIsVerifying(false);
            setErrorMsg("SERVER VERIFICATION ERROR.");
          }
        }
      }
    } else if (step === "totp") {
      if (totpInput.length < 6 && !isVerifying) {
        const nextTotp = totpInput + digit;
        setTotpInput(nextTotp);
        setErrorMsg("");

        if (nextTotp.length === 6) {
          setIsVerifying(true);
          try {
            const res = await fetch("/api/public/verify-vault", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "pin", payload: verifiedPin, totpCode: nextTotp }),
            });

            const data = await res.json();
            setIsVerifying(false);

            if (data.success) {
              setTimeout(() => {
                onSuccess();
              }, 250);
            } else {
              const remaining = attemptsLeft - 1;
              setAttemptsLeft(remaining);
              setErrorMsg(`INVALID 2FA AUTHENTICATOR CODE. ${remaining} ATTEMPTS REMAINING.`);
              setTotpInput("");

              if (remaining <= 0) {
                onFail();
              }
            }
          } catch (e) {
            setIsVerifying(false);
            setErrorMsg("2FA VERIFICATION ERROR.");
          }
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
            onSuccess();
            return;
          }
        } else {
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
    if (step === "pin") {
      setPinInput("");
    } else {
      setTotpInput("");
    }
    setErrorMsg("");
  };

  if (!isOpen) return null;

  const currentDisplayValue = step === "pin" ? pinInput : totpInput;

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
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#090d16",
          border: step === "totp" ? "1px solid rgba(0, 240, 255, 0.4)" : "1px solid rgba(0, 240, 255, 0.25)",
          borderRadius: 16,
          padding: "28px 24px",
          boxShadow: step === "totp" ? "0 0 45px rgba(0, 240, 255, 0.25)" : "0 0 35px rgba(0, 240, 255, 0.12)",
          textAlign: "center",
          color: "#e2e8f0",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>{step === "totp" ? "🔐" : "🛡️"}</div>

        <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "1px", margin: "0 0 6px 0", color: step === "totp" ? "#00f0ff" : "#fff" }}>
          {step === "totp" ? "STEP 2: APPLE PASSWORDS 2FA" : "SECURITY GATEKEEPER"}
        </h2>

        <p style={{ fontSize: 11, color: "rgba(226, 232, 240, 0.6)", margin: "0 0 16px 0" }}>
          {step === "totp" ? "ENTER 6-DIGIT CODE FROM APPLE PASSWORDS / AUTHENTICATOR APP" : "ENTER 6-DIGIT SECURITY VAULT PIN CODE"}
        </p>

        {/* Display Dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: step === "totp" ? "1.5px solid rgba(0, 240, 255, 0.6)" : "1.5px solid rgba(0, 240, 255, 0.4)",
                background: index < currentDisplayValue.length ? (step === "totp" ? "#00f0ff" : "#00f0ff") : "transparent",
                boxShadow: index < currentDisplayValue.length ? (step === "totp" ? "0 0 10px #00f0ff" : "0 0 8px #00f0ff") : "none",
                transition: "all 0.15s ease",
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <div
            style={{
              fontSize: 10,
              color: errorMsg.includes("VERIFIED") ? "#00f0ff" : "#ff3366",
              marginBottom: 16,
              background: errorMsg.includes("VERIFIED") ? "rgba(0, 240, 255, 0.08)" : "rgba(255, 51, 102, 0.1)",
              border: errorMsg.includes("VERIFIED") ? "1px solid rgba(0, 240, 255, 0.2)" : "1px solid rgba(255, 51, 102, 0.2)",
              padding: "8px 10px",
              borderRadius: 8,
              lineHeight: 1.4,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* 3x4 Keypad Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(String(num))}
              disabled={isVerifying}
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                padding: "12px 0",
                fontSize: 18,
                fontWeight: 600,
                color: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseDown={(e) => (e.currentTarget.style.background = "rgba(0, 240, 255, 0.2)")}
              onMouseUp={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)")}
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            disabled={isVerifying}
            style={{
              background: "rgba(255, 51, 102, 0.12)",
              border: "1px solid rgba(255, 51, 102, 0.2)",
              borderRadius: 10,
              padding: "12px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#ff3366",
              cursor: "pointer",
            }}
          >
            CLR
          </button>

          <button
            onClick={() => handleKeyPress("0")}
            disabled={isVerifying}
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              padding: "12px 0",
              fontSize: 18,
              fontWeight: 600,
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            0
          </button>

          {step === "totp" ? (
            <button
              onClick={() => {
                setStep("pin");
                setTotpInput("");
                setErrorMsg("");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 10,
                padding: "12px 0",
                fontSize: 10,
                fontWeight: 700,
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              BACK
            </button>
          ) : (
            <div />
          )}
        </div>

        {step === "pin" && (
          <button
            onClick={handleBiometricAuth}
            disabled={isVerifying}
            style={{
              width: "100%",
              background: "rgba(0, 240, 255, 0.08)",
              border: "1px solid rgba(0, 240, 255, 0.25)",
              borderRadius: 10,
              padding: "10px 0",
              fontSize: 11,
              fontWeight: 600,
              color: "#00f0ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            📱 USE FACEID / TOUCHID BIOMETRICS
          </button>
        )}
      </div>
    </div>
  );
}
