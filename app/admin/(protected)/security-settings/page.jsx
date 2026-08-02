"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CyberVaultSecuritySettingsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gatewayConfig, setGatewayConfig] = useState({
    sequenceStr: "1,2,3,4,1,3",
    adminSecretKey: "134214",
    pinCode: "134214",
    maxAttempts: "3",
    lockdownSec: "90",
    accentColor: "#ffd700",
    titleText: "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED",
    telegramBotToken: "",
    telegramChatId: "",
    enableAlerts: true,
    enableLumosWand: true,
  });

  useEffect(() => {
    fetch(`/api/public/features?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.flags) {
          setFlags(data.flags);
          const flagMap = new Map(data.flags.map((f) => [f.key, f]));
          const gatewayFlag = flagMap.get("admin_secret_gateway");
          if (gatewayFlag && gatewayFlag.metadata) {
            try {
              const parsed = typeof gatewayFlag.metadata === "string" ? JSON.parse(gatewayFlag.metadata) : gatewayFlag.metadata;
              setGatewayConfig({
                sequenceStr: parsed.sequenceStr || "1,2,3,4,1,3",
                adminSecretKey: parsed.adminSecretKey || "134214",
                pinCode: parsed.pinCode || "134214",
                maxAttempts: String(parsed.maxAttempts || "3"),
                lockdownSec: String(parsed.lockdownSec || "90"),
                accentColor: parsed.accentColor || "#ffd700",
                titleText: parsed.titleText || "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED",
                telegramBotToken: parsed.telegramBotToken || "",
                telegramChatId: parsed.telegramChatId || "",
                enableAlerts: typeof parsed.enableAlerts === "boolean" ? parsed.enableAlerts : true,
                enableLumosWand: typeof parsed.enableLumosWand === "boolean" ? parsed.enableLumosWand : true,
              });
            } catch (e) {}
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      const currentFlag = flags.find((f) => f.key === "admin_secret_gateway");
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
        alert("🛡️ Security Vault & Telegram Push Alert settings saved successfully!");
      } else {
        alert("Failed to save security settings.");
      }
    } catch (e) {
      alert("Error saving security settings.");
    }
    setSaving(false);
  };

  const handleSendTestAlert = async () => {
    try {
      const res = await fetch("/api/public/verify-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test_telegram_alert" }),
      });
      const data = await res.json();
      if (res.ok) alert("🧪 Test Telegram Alert sent! Check your Telegram phone app now.");
      else alert("Failed to send test alert: " + (data.error || "Check Bot Token & Chat ID"));
    } catch (e) {
      alert("Error dispatching test alert.");
    }
  };

  if (loading) {
    return <div style={{ color: "var(--a-muted)" }}>Loading Security & Vault Settings...</div>;
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">🛡️ Cyber Vault & Telegram Alert Customization</h1>
          <p className="admin-sub">
            Full control over 4-Star Spell Rune tap sequence, Secret URL Keys, 6-Digit Keypad PIN, Telegram Alerts, and Remote Killswitch.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSendTestAlert} className="admin-btn">
            🧪 Send Test Telegram Alert
          </button>
          <button onClick={handleSaveSecuritySettings} disabled={saving} className="admin-btn admin-btn--primary">
            {saving ? "Saving..." : "💾 Save Security Settings"}
          </button>
        </div>
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
              placeholder="134214"
            />
          </div>
        </div>
      </div>

      {/* Telegram Real-Time Push Alerts Card */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#00f0ff" }}>📱 Real-Time Telegram Intrusion Push Alerts (100% Free)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Telegram Bot Token (@BotFather)
            </label>
            <input
              type="password"
              className="admin-input"
              value={gatewayConfig.telegramBotToken}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, telegramBotToken: e.target.value })}
              placeholder="e.g. 7123456789:AAFg8x..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Telegram Chat ID (@userinfobot)
            </label>
            <input
              type="text"
              className="admin-input"
              value={gatewayConfig.telegramChatId}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, telegramChatId: e.target.value })}
              placeholder="e.g. 987654321"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={gatewayConfig.enableAlerts}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, enableAlerts: e.target.checked })}
            />
            <span>Enable Real-Time Telegram Intrusion Push Alerts</span>
          </label>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={gatewayConfig.enableLumosWand}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, enableLumosWand: e.target.checked })}
            />
            <span>Enable Interactive "Lumos" Magic Wand Cursor Trail</span>
          </label>
        </div>
      </div>

      {/* Cyber Strobe Lockdown & Cooldown Parameters Card */}
      <div className="admin-card">
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#ff6b6b" }}>🚨 Cyber Strobe Lockdown & Remote Killswitch Parameters</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Max Failed Strike Attempts
            </label>
            <input
              type="number"
              className="admin-input"
              value={gatewayConfig.maxAttempts}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, maxAttempts: e.target.value })}
              placeholder="3"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Lockdown Cooldown Timer (Seconds)
            </label>
            <input
              type="number"
              className="admin-input"
              value={gatewayConfig.lockdownSec}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, lockdownSec: e.target.value })}
              placeholder="90"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Modal Accent Color
            </label>
            <input
              type="color"
              style={{ width: "100%", height: 38, border: "none", borderRadius: 6, cursor: "pointer" }}
              value={gatewayConfig.accentColor}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, accentColor: e.target.value })}
            />
          </div>
        </div>

        {/* 1-Tap Remote Killswitch Instruction Card */}
        <div style={{ background: "rgba(255, 0, 60, 0.1)", border: "1px solid rgba(255, 0, 60, 0.4)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b", marginBottom: 6 }}>
            🔴 TELEGRAM 1-TAP REMOTE KILL-SWITCH ACTIVE
          </div>
          <p style={{ fontSize: 13, color: "var(--a-muted)", margin: 0, lineHeight: 1.5 }}>
            Whenever you receive a security alert on Telegram, reply <code style={{ color: "#ff6b6b", fontWeight: 700 }}>/killswitch ON</code> to your Telegram bot to instantly take down public site access (HTTP 503 Cyber Defense Mode). Reply <code style={{ color: "#4ade80", fontWeight: 700 }}>/killswitch OFF</code> to restore your site live online in 1 second!
          </p>
        </div>
      </div>
    </div>
  );
}
