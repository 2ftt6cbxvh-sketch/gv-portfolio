"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DecoyAdminDashboardModal({ isOpen, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flags");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleExit = () => {
    if (onClose) onClose();
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#04040a",
        display: "flex",
        flexDirection: "column",
        color: "#ffffff",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      {/* Decoy Admin Navbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "#0a0a16",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.2rem" }}>🔐</span>
          <div>
            <strong style={{ fontSize: "1rem", color: "#00f0ff" }}>GV ADMIN CONTROL PANEL</strong>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", display: "block" }}>
              STAGING ENVIRONMENT • NODE_ENV: PRODUCTION
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.75rem", padding: "4px 10px", background: "rgba(0, 255, 136, 0.15)", border: "1px solid #00ff88", borderRadius: 999, color: "#00ff88" }}>
            🟢 SYSTEM STAGING ONLINE
          </span>
          <button
            onClick={handleExit}
            style={{
              padding: "6px 14px",
              background: "rgba(255, 0, 60, 0.2)",
              border: "1px solid #ff003c",
              borderRadius: 8,
              color: "#ff003c",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            EXIT SESSION
          </button>
        </div>
      </div>

      {/* Main Decoy Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#070712", borderRight: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { id: "flags", label: "⚙️ Feature Flags" },
              { id: "content", label: "📄 Content Sections" },
              { id: "security", label: "🛡️ Security Vault" },
              { id: "logs", label: "📊 Audit Logs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  background: activeTab === tab.id ? "rgba(0, 240, 255, 0.15)" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "#00f0ff" : "transparent"}`,
                  borderRadius: 8,
                  color: activeTab === tab.id ? "#00f0ff" : "rgba(255,255,255,0.7)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto", background: "#04040a" }}>
          {toast && (
            <div style={{ padding: "10px 16px", background: "rgba(0, 255, 136, 0.2)", border: "1px solid #00ff88", borderRadius: 8, color: "#00ff88", fontSize: "0.82rem", marginBottom: 20 }}>
              ✅ {toast}
            </div>
          )}

          {activeTab === "flags" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Feature Flag Controls</h3>
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  { name: "Kinetic Headline Animation", enabled: true },
                  { name: "Interactive Constellation Particle BG", enabled: true },
                  { name: "Emergency Cyber Killswitch", enabled: false },
                  { name: "Strict Rate-Limit Escalation Engine", enabled: true },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>{item.name}</strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Key: flag_{idx + 1}</span>
                    </div>
                    <button
                      onClick={() => showToast(`Toggled ${item.name} settings`)}
                      style={{ padding: "6px 16px", background: item.enabled ? "#00ff88" : "#ff003c", border: "none", borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer" }}
                    >
                      {item.enabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Manage Content Sections</h3>
              <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Headline Text Override</label>
                <input
                  type="text"
                  defaultValue="Three disciplines. One line of work."
                  style={{ width: "100%", padding: 10, background: "#0a0a16", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontFamily: "var(--font-mono)", marginBottom: 16 }}
                />
                <button onClick={() => showToast("Saved content changes to database")} style={{ padding: "8px 20px", background: "#00f0ff", border: "none", borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer" }}>
                  SAVE CHANGES
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Vault Security & Database Snapshot</h3>
              <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Download a full PostgreSQL backup snapshot or purge cache.</p>
                <button onClick={() => showToast("Downloading encrypted PostgreSQL snapshot...")} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #00f0ff, #0088ff)", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer" }}>
                  💾 EXPORT DATABASE BACKUP (.JSON)
                </button>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Audit Logs</h3>
              <div style={{ padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: "0.8rem" }}>
                <div style={{ color: "#00ff88", marginBottom: 8 }}>[05 AUG 14:32:01] LOGIN SUCCESSFUL: admin@ganeshvarma.in</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>[05 AUG 14:30:15] FEATURE_FLAG_FETCH: Status 200 OK</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>[05 AUG 14:28:44] POSTGRES_HEALTH_CHECK: Connection Pool Normal</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
