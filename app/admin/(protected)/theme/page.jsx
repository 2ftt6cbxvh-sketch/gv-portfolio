"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";

export default function ThemeAdminPage() {
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await adminFetch("/api/admin/theme");
    setTokens(data);
  }

  useEffect(() => { load(); }, []);

  function updateLocal(key, value) {
    setTokens((ts) => ts.map((t) => (t.key === key ? { ...t, value } : t)));
  }

  async function save(key, value) {
    setError(""); setStatus("Saving...");
    try {
      await adminFetch(`/api/admin/theme/${encodeURIComponent(key)}`, { method: "PATCH", body: JSON.stringify({ value }) });
      setStatus("Saved. Reload the public site to see the new accent.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e) { setError(e.message); setStatus(""); }
  }

  async function saveAll() {
    setError(""); setStatus("Saving...");
    try {
      await Promise.all(tokens.map((t) => adminFetch(`/api/admin/theme/${encodeURIComponent(t.key)}`, { method: "PATCH", body: JSON.stringify({ value: t.value }) })));
      setStatus("Saved. Reload the public site to see the new accents.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e) { setError(e.message); setStatus(""); }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Theme tokens</h1>
          <p className="admin-sub">Adjust the accent color per mode. Changes apply on the public site's next page load.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={saveAll}>Save changes</button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <div className="admin-card">
        {tokens.map((t) => (
          <div key={t.key} className="admin-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ minWidth: 160, marginBottom: 0 }}>{t.key}</label>
            <input type="color" value={t.value} onChange={(e) => updateLocal(t.key, e.target.value)} onBlur={(e) => save(t.key, e.target.value)} style={{ width: 44, height: 34, padding: 0, border: "1px solid var(--a-border)", borderRadius: 6, background: "none" }} />
            <input
              className="admin-input"
              style={{ maxWidth: 140 }}
              value={t.value}
              onChange={(e) => updateLocal(t.key, e.target.value)}
              onBlur={(e) => save(t.key, e.target.value)}
            />
          </div>
        ))}
        <p className="admin-hint">
          This is the live accent color used across the public site for each mode (borders, links, hover states, and
          highlights). Colors save per-field automatically as you edit, and the button above re-saves all fields at once.
        </p>
      </div>
    </div>
  );
}
