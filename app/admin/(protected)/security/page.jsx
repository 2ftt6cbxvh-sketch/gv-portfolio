"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SecurityAuditDashboardPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/security");
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (e) {}
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">📊 Security Audit & Telemetry Dashboard</h1>
          <p className="admin-sub">
            Real-time security logs, verification attempts, rate-limiting telemetry, and active 3-minute session tokens.
          </p>
        </div>
        <Link href="/admin/features" className="admin-btn admin-btn--primary">
          ⚙️ Security Settings
        </Link>
      </div>

      {/* Security Status Grid Cards */}
      <div className="admin-grid" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-stat-value" style={{ color: "#4ade80" }}>6 LAYERS</div>
          <div className="admin-stat-label">Active Cyber Vault Shield</div>
        </div>
        <div className="admin-card">
          <div className="admin-stat-value" style={{ color: "#5fa8ff" }}>SHA-256</div>
          <div className="admin-stat-color">Server-Side Hash Standard</div>
        </div>
        <div className="admin-card">
          <div className="admin-stat-value" style={{ color: "#ffd700" }}>3 MINS</div>
          <div className="admin-stat-label">Session Token Sliding TTL</div>
        </div>
      </div>

      {/* Audit Telemetry Logs Table */}
      <div className="admin-card">
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>🛡️ Real-Time Audit Telemetry Logs</h3>
        {loading ? (
          <p style={{ color: "var(--a-muted)" }}>Loading security telemetry...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: "var(--a-muted)" }}>No security incidents or login attempts logged yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{log.type}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{log.ip}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: log.status === "SUCCESS" ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 107, 107, 0.15)",
                        color: log.status === "SUCCESS" ? "#4ade80" : "#ff6b6b",
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--a-muted)", fontSize: 12 }}>
                    {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
