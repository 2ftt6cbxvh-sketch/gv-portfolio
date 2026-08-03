"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CyberVaultSecuritySettingsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 2FA Setup States
  const [totpSecret, setTotpSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [totpCodeInput, setTotpCodeInput] = useState("");
  const [totpStatus, setTotpStatus] = useState("");
  const [is2FAActive, setIs2FAActive] = useState(false);

  const [gatewayConfig, setGatewayConfig] = useState({
    sequenceStr: "1,2,3,4,1,3",
    adminSecretKey: "134214",
    pinCode: "180296",
    maxAttempts: "3",
    lockdownSec: "90",
    accentColor: "#00f0ff",
    titleText: "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED",
    telegramBotToken: "",
    telegramChatId: "",
    enableAlerts: true,
    enableLumosWand: true,
    is2FAEnabled: false,
    totpSecret: "",
  });

  useEffect(() => {
    fetch(`/api/public/features?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        let flagList = [];
        if (Array.isArray(data)) {
          flagList = data;
        } else if (data && data.flags) {
          if (Array.isArray(data.flags)) {
            flagList = data.flags;
          } else if (typeof data.flags === "object") {
            flagList = Object.entries(data.flags).map(([key, val]) => ({ key, ...val }));
          }
        }
        setFlags(flagList);

        const gatewayFlag = flagList.find((f) => f.key === "admin_secret_gateway");
        if (gatewayFlag && gatewayFlag.metadata) {
          try {
            const parsed = typeof gatewayFlag.metadata === "string" ? JSON.parse(gatewayFlag.metadata) : gatewayFlag.metadata;
            const active2FA = !!parsed.is2FAEnabled;
            setIs2FAActive(active2FA);

            setGatewayConfig({
              sequenceStr: parsed.sequenceStr || "1,2,3,4,1,3",
              adminSecretKey: parsed.adminSecretKey || "134214",
              pinCode: parsed.pinCode || "180296",
              maxAttempts: String(parsed.maxAttempts || "3"),
              lockdownSec: String(parsed.lockdownSec || "90"),
              accentColor: parsed.accentColor || "#00f0ff",
              titleText: parsed.titleText || "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED",
              telegramBotToken: parsed.telegramBotToken || "",
              telegramChatId: parsed.telegramChatId || "",
              enableAlerts: typeof parsed.enableAlerts === "boolean" ? parsed.enableAlerts : true,
              enableLumosWand: typeof parsed.enableLumosWand === "boolean" ? parsed.enableLumosWand : true,
              is2FAEnabled: active2FA,
              totpSecret: parsed.totpSecret || "",
            });
          } catch (e) {}
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGenerate2FASecret = async () => {
    try {
      setTotpStatus("Generating 2FA Secret Key...");
      const res = await fetch("/api/admin/setup-2fa");
      const data = await res.json();
      if (data.secret) {
        setTotpSecret(data.secret);
        setOtpauthUrl(data.otpauthUrl);
        setTotpStatus("Scan or paste secret into Apple Passwords App / Authenticator.");
      } else {
        setTotpStatus("Failed to generate 2FA key.");
      }
    } catch (e) {
      setTotpStatus("Error generating 2FA secret.");
    }
  };

  const handleEnable2FA = async () => {
    if (!totpSecret || !totpCodeInput) {
      alert("Please generate 2FA key and enter 6-digit code from Apple Passwords App.");
      return;
    }

    try {
      setTotpStatus("Verifying 6-digit code...");
      const res = await fetch("/api/admin/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", secret: totpSecret, code: totpCodeInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIs2FAActive(true);
        setTotpStatus("✅ 2FA TOTP Enabled! Authenticator code required on Gatekeeper.");
        setTotpCodeInput("");
        alert("🎉 Success! TOTP 2FA is now active. Your Apple Passwords App code is required after entering your 6-Digit PIN.");
      } else {
        setTotpStatus("❌ Error: " + (data.error || "Invalid code"));
      }
    } catch (e) {
      setTotpStatus("Error verifying 2FA code.");
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;

    try {
      const res = await fetch("/api/admin/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAActive(false);
        setTotpSecret("");
        setTotpStatus("2FA Disabled.");
        alert("2FA Disabled.");
      }
    } catch (e) {
      alert("Error disabling 2FA");
    }
  };

  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      const isArr = Array.isArray(flags);
      const currentFlag = isArr ? flags.find((f) => f.key === "admin_secret_gateway") : null;
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "admin_secret_gateway",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(gatewayConfig),
        }),
      });

      if (res.ok) {
        alert("✅ Security Vault settings updated in PostgreSQL!");
      } else {
        alert("Error saving security settings");
      }
    } catch (e) {
      alert("Error saving settings: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-topbar">
          <h1 className="admin-h1">🛡️ Loading Security & Cyber Vault Settings...</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="admin-h1">🛡️ Cyber Vault & Telegram Alert Customization</h1>
          <p className="admin-sub">
            Full control over 4-Star Spell Rune tap sequence, Secret URL Keys, 6-Digit Keypad PIN, Apple Passwords 2FA, Telegram Alerts, and Remote Killswitch.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={async () => {
              if (typeof window !== "undefined" && navigator.credentials) {
                try {
                  const challenge = new Uint8Array(32);
                  window.crypto.getRandomValues(challenge);

                  const credential = await navigator.credentials.create({
                    publicKey: {
                      challenge: challenge.buffer,
                      rp: { name: "GV Cyber Vault", id: window.location.hostname },
                      user: {
                        id: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
                        name: "admin@ganeshvarma.in",
                        displayName: "Ganesh Varma (GV Vault Owner)",
                      },
                      pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                      authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required",
                      },
                      timeout: 60000,
                    },
                  });

                  if (credential && credential.rawId) {
                    const base64Id = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                    const updatedConfig = { ...gatewayConfig, allowedPasskeyCredentialId: base64Id };
                    setGatewayConfig(updatedConfig);

                    await fetch("/api/admin/features", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        key: "admin_secret_gateway",
                        enabled: true,
                        metadata: JSON.stringify(updatedConfig),
                      }),
                    });

                    alert("✅ Success! Your Mac's Touch ID Hardware is now EXCLUSIVELY registered to this Cyber Vault in PostgreSQL!");
                  }
                } catch (e) {
                  alert("⚠️ Registration cancelled or error: " + e.message);
                }
              }
            }}
            className="admin-btn"
            style={{ background: "rgba(255, 215, 0, 0.15)", color: "#ffd700", borderColor: "rgba(255, 215, 0, 0.4)" }}
          >
            🛡️ Register This Mac's Touch ID Hardware
          </button>
          <button onClick={handleSaveSecuritySettings} disabled={saving} className="admin-btn admin-btn--primary">
            {saving ? "Saving..." : "💾 Save Security Settings"}
          </button>
        </div>
      </div>

      {/* 100% Free 2FA Authenticator Section (Apple Passwords App) */}
      <div className="admin-card" style={{ marginBottom: 20, border: is2FAActive ? "1px solid rgba(0, 240, 255, 0.4)" : "1px solid var(--a-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: "#00f0ff" }}>🔐 100% Free 2FA Authenticator (Apple Passwords App / Google Authenticator)</h3>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: is2FAActive ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.1)", color: is2FAActive ? "#00f0ff" : "#aaa", fontWeight: 700 }}>
            STATUS: {is2FAActive ? "ENABLED" : "DISABLED"}
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--a-muted)", marginTop: 0, marginBottom: 16 }}>
          Standard RFC 6238 TOTP Two-Factor Authentication. Works 100% FREE with Apple Native Passwords App on macOS/iOS, Google Authenticator, and 1Password without any paid APIs or subscriptions!
        </p>

        {!is2FAActive ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button onClick={handleGenerate2FASecret} className="admin-btn" style={{ background: "rgba(0, 240, 255, 0.15)", color: "#00f0ff", borderColor: "rgba(0, 240, 255, 0.4)", fontWeight: 600 }}>
                🔑 1. Generate 2FA Key for Apple Passwords App
              </button>
            </div>

            {totpSecret && (
              <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: 16, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
                  Apple Passwords Setup Key:
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 16, color: "#00f0ff", letterSpacing: 2, background: "#050811", padding: "8px 12px", borderRadius: 6, userSelect: "all", display: "inline-block", marginBottom: 10 }}>
                  {totpSecret}
                </div>
                <div style={{ fontSize: 11, color: "var(--a-muted)" }}>
                  Open <strong>Apple Passwords App ➔ Add Password / Edit ➔ Setup Verification Code</strong> and paste this key.
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    className="admin-input"
                    value={totpCodeInput}
                    onChange={(e) => setTotpCodeInput(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{ width: 160, fontFamily: "monospace", letterSpacing: 3, fontSize: 16 }}
                  />
                  <button onClick={handleEnable2FA} className="admin-btn admin-btn--primary">
                    ✅ 2. Verify & Enable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "#00f0ff", marginBottom: 12, fontWeight: 600 }}>
              ✅ TOTP 2FA is Active! Gatekeeper requires your 6-digit Apple Passwords App verification code after entering your PIN.
            </div>
            <button onClick={handleDisable2FA} className="admin-btn" style={{ background: "rgba(255, 51, 102, 0.15)", color: "#ff3366", borderColor: "rgba(255, 51, 102, 0.3)" }}>
              ❌ Disable 2FA
            </button>
          </div>
        )}

        {totpStatus && (
          <div style={{ fontSize: 11, color: totpStatus.includes("✅") ? "#00f0ff" : "#ffdd00", marginTop: 10 }}>
            {totpStatus}
          </div>
        )}
      </div>

      {/* 4-Star Spell Rune Sequence Card */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#ffd700" }}>🪄 4-Star Multi-Stroke Spell Rune Sequence</h3>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Secret Tap Sequence (Current Default: 1,2,3,4,1,3)
          </label>
          <input
            type="text"
            className="admin-input"
            value={gatewayConfig.sequenceStr}
            onChange={(e) => setGatewayConfig({ ...gatewayConfig, sequenceStr: e.target.value })}
            placeholder="1,2,3,4,1,3"
          />
          <span style={{ fontSize: 11, color: "var(--a-muted)", marginTop: 4, display: "block" }}>
            Star 1 = Top-Left, Star 2 = Top-Right, Star 3 = Bottom-Left, Star 4 = Bottom-Right. Tapping this sequence unlocks the Alohomora Gateway!
          </span>
        </div>
      </div>

      {/* Secret Keys & 6-Digit Keypad PIN Card */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#5fa8ff" }}>🔑 URL Access Key & 6-Digit Keypad PIN</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Secret Direct URL Key (/admin?key=134214)
            </label>
            <input
              type="text"
              className="admin-input"
              value={gatewayConfig.adminSecretKey}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, adminSecretKey: e.target.value })}
              placeholder="134214"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              6-Digit Gatekeeper Keypad PIN
            </label>
            <input
              type="text"
              className="admin-input"
              value={gatewayConfig.pinCode}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, pinCode: e.target.value })}
              placeholder="180296"
            />
            <span style={{ fontSize: 11, color: "var(--a-muted)", marginTop: 4, display: "block" }}>
              Admin-Controlled PIN Code (Saved directly into PostgreSQL database).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
