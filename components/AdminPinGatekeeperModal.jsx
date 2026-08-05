"use client";

import { useState, useEffect } from "react";
import VpnBlockModal from "./VpnBlockModal";
import GeoBlockModal from "./GeoBlockModal";
import RateLimitBlockModal from "./RateLimitBlockModal";
import DecoyAdminDashboardModal from "./DecoyAdminDashboardModal";

export default function AdminPinGatekeeperModal({ isOpen, onSuccess, onFail }) {
  const [pinInput, setPinInput] = useState("");
  const [totpInput, setTotpInput] = useState("");
  const [step, setStep] = useState("pin"); // "pin" | "totp"
  const [verifiedPin, setVerifiedPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isVerifying, setIsVerifying] = useState(false);
  const [vpnBlock, setVpnBlock] = useState({ isOpen: false, ip: "" });
  const [geoBlock, setGeoBlock] = useState({ isOpen: false, countryCode: "", countryName: "" });
  const [rateLimitBlock, setRateLimitBlock] = useState({ isOpen: false, ip: "", hoursRemaining: "", resetAt: "" });
  const [isDecoyOpen, setIsDecoyOpen] = useState(false);

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

            if (res.status === 403) {
              if (data.error && (data.error.includes("RESTRICTED") || data.error.includes("India"))) {
                setGeoBlock({ isOpen: true, countryCode: "EXTERNAL", countryName: "Non-IN Region" });
              } else {
                setVpnBlock({ isOpen: true, ip: data.ip || "Active Proxy IP" });
              }
              return;
            }

            if (res.status === 429) {
              setRateLimitBlock({
                isOpen: true,
                ip: data.ip || "Your Current IP",
                hoursRemaining: data.hoursRemaining || "24.0",
                resetAt: data.resetAt || "In 24 Hours",
              });
              return;
            }

            if (data.requires2FA) {
              setVerifiedPin(nextPin);
              setStep("totp");
              setErrorMsg("PIN VERIFIED. ENTER 6-DIGIT CODE FROM APPLE PASSWORDS APP.");
              return;
            }

            if (data.isDecoy) {
              setErrorMsg("GATEKEEPER PIN VERIFIED. GRANTED.");
              setTimeout(() => {
                setIsDecoyOpen(true);
                if (onSuccess) onSuccess(true);
              }, 400);
              return;
            }

            if (data.success) {
              setTimeout(() => {
                onSuccess(false);
              }, 400);
            } else {
              const newLeft = attemptsLeft - 1;
              setAttemptsLeft(newLeft);

              if (newLeft <= 0) {
                try {
                  fetch("/api/public/verify-vault", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "lockdown_triggered" }),
                  });
                } catch (e) {}
                onFail();
              } else {
                setErrorMsg(`INVALID PIN. ${newLeft} ATTEMPTS REMAINING.`);
                setPinInput("");
              }
            }
          } catch (err) {
            setIsVerifying(false);
            setErrorMsg("SERVER VERIFICATION ERROR. TRY AGAIN.");
            setPinInput("");
          }
        }
      }
    }
  };

  const handleTotpVerify = async (codeToVerify) => {
    const finalCode = codeToVerify || totpInput;
    if (finalCode.length < 6 || isVerifying) return;

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/verify-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pin",
          payload: verifiedPin,
          totpCode: finalCode,
        }),
      });

      const data = await res.json();
      setIsVerifying(false);

      if (res.status === 403) {
        setVpnBlock({ isOpen: true, ip: data.ip || "Active Proxy IP" });
        return;
      }

      if (res.status === 429) {
        setErrorMsg(data.error || "RATE LIMIT EXCEEDED. LOCKDOWN ACTIVATED.");
        onFail();
        return;
      }

      if (data.success) {
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        const newLeft = attemptsLeft - 1;
        setAttemptsLeft(newLeft);

        if (newLeft <= 0) {
          try {
            fetch("/api/public/verify-vault", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "lockdown_triggered" }),
            });
          } catch (e) {}
          onFail();
        } else {
          setErrorMsg(`INVALID 2FA CODE. ${newLeft} ATTEMPTS REMAINING.`);
          setTotpInput("");
        }
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg("SERVER VERIFICATION ERROR. TRY AGAIN.");
      setTotpInput("");
    }
  };

  const handleDelete = () => {
    if (step === "pin") {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      setTotpInput((prev) => prev.slice(0, -1));
    }
    setErrorMsg("");
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

  return (
    <>
      <DecoyAdminDashboardModal isOpen={isDecoyOpen} onClose={() => setIsDecoyOpen(false)} />
      <VpnBlockModal isOpen={vpnBlock.isOpen} ipAddress={vpnBlock.ip} />
      <GeoBlockModal isOpen={geoBlock.isOpen} countryCode={geoBlock.countryCode} countryName={geoBlock.countryName} />
      <RateLimitBlockModal
        isOpen={rateLimitBlock.isOpen}
        ipAddress={rateLimitBlock.ip}
        hoursRemaining={rateLimitBlock.hoursRemaining}
        resetAtTime={rateLimitBlock.resetAt}
      />

      <div
        className="gatekeeper-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "rgba(3, 2, 8, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          className="gatekeeper-modal"
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#080612",
            border: "1px solid color-mix(in oklab, var(--color-accent) 30%, transparent)",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px color-mix(in oklab, var(--color-accent) 15%, transparent)",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Header Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: step === "totp" ? "rgba(0, 240, 255, 0.1)" : "rgba(255, 215, 0, 0.1)",
              border: `1px solid ${step === "totp" ? "#00f0ff" : "#ffd700"}`,
              borderRadius: 999,
              color: step === "totp" ? "#00f0ff" : "#ffd700",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            <span>{step === "totp" ? "🔐 STEP 2: TOTP 2FA CODE" : "🔐 STEP 1: KEYPAD PIN"}</span>
          </div>

          <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.3rem", fontWeight: 700 }}>
            {step === "totp" ? "Authenticator 2FA Code" : "6-Digit Gatekeeper PIN"}
          </h3>
          <p style={{ margin: "0 0 20px 0", color: "var(--color-fg-muted)", fontSize: "0.82rem", lineHeight: 1.4 }}>
            {step === "totp"
              ? "Open Apple Passwords App or Authenticator to enter your 6-digit TOTP code."
              : "Enter secret 6-digit authorization PIN."}
          </p>

          {/* Dots Indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const currentInput = step === "pin" ? pinInput : totpInput;
              const isFilled = i < currentInput.length;
              return (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: `2px solid ${step === "totp" ? "#00f0ff" : "var(--color-accent)"}`,
                    background: isFilled ? (step === "totp" ? "#00f0ff" : "var(--color-accent)") : "transparent",
                    boxShadow: isFilled
                      ? `0 0 12px ${step === "totp" ? "#00f0ff" : "var(--color-accent)"}`
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                />
              );
            })}
          </div>

          {/* Error / Status Message */}
          {errorMsg && (
            <div
              style={{
                fontSize: "0.75rem",
                color: errorMsg.includes("VERIFIED") ? "#00ff88" : "#ff003c",
                marginBottom: 16,
                minHeight: 20,
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Touch ID Passkey Quick Verification Option */}
          {step === "pin" && (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={async () => {
                  if (isVerifying) return;
                  setIsVerifying(true);
                  setErrorMsg("REQUESTING TOUCH ID PASSKEY...");

                  try {
                    if (!window.PublicKeyCredential) {
                      throw new Error("Touch ID Passkeys not supported on this browser.");
                    }

                    const challenge = new Uint8Array(32);
                    window.crypto.getRandomValues(challenge);

                    const credential = await navigator.credentials.get({
                      publicKey: {
                        challenge,
                        timeout: 60000,
                        userVerification: "required",
                        authenticatorSelection: { authenticatorAttachment: "platform" },
                      },
                    });

                    if (credential) {
                      const res = await fetch("/api/public/verify-vault", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "pin", payload: "180296" }),
                      });

                      const data = await res.json();
                      setIsVerifying(false);

                      if (res.status === 403) {
                        setVpnBlock({ isOpen: true, ip: data.ip || "Active Proxy IP" });
                        return;
                      }

                      if (data.requires2FA) {
                        setVerifiedPin("180296");
                        setStep("totp");
                        setErrorMsg("TOUCH ID VERIFIED! ENTER 6-DIGIT TOTP CODE.");
                        return;
                      }

                      if (data.success) {
                        onSuccess();
                      } else {
                        setErrorMsg("TOUCH ID VERIFICATION FAILED.");
                      }
                    }
                  } catch (e) {
                    setIsVerifying(false);
                    setErrorMsg("TOUCH ID FAILED. USE KEYPAD PIN BELOW.");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                <span>👆 Use Touch ID / Face ID Passkey</span>
              </button>
            </div>
          )}

          {/* Keypad Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (step === "pin") {
                    handleKeyPress(String(num));
                  } else {
                    if (totpInput.length < 6) {
                      const nextCode = totpInput + String(num);
                      setTotpInput(nextCode);
                      if (nextCode.length === 6) {
                        handleTotpVerify(nextCode);
                      }
                    }
                  }
                }}
                style={{
                  padding: "16px 0",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseDown={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
                onMouseUp={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
              >
                {num}
              </button>
            ))}

            <button
              onClick={handleClear}
              style={{
                padding: "16px 0",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              CLEAR
            </button>

            <button
              onClick={() => {
                if (step === "pin") {
                  handleKeyPress("0");
                } else {
                  if (totpInput.length < 6) {
                    const nextCode = totpInput + "0";
                    setTotpInput(nextCode);
                    if (nextCode.length === 6) {
                      handleTotpVerify(nextCode);
                    }
                  }
                }
              }}
              style={{
                padding: "16px 0",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                color: "#ffffff",
                fontSize: "1.25rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              0
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: "16px 0",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 12,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ⌫ DEL
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.3)" }}>
            GV SECURITY VAULT SHIELD • FIDO2 WEBAUTHN + TOTP 2FA
          </p>
        </div>
      </div>
    </>
  );
}
