"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";

const TOKEN_LABELS = {
  "landing.logoColor":  { name: "Landing Logo Color", desc: "Main GV logo outline & monogram color on the main Landing page screen" },
  "landing.sparkColor": { name: "Landing Electric Spark Color", desc: "Electric lightning arc & glow color when hovering logo on Landing page" },
  "editor.accent":     { name: "Editor Mode Accent", desc: "Logo color, theme borders, and highlights when viewing Editor Mode" },
  "analyst.accent":    { name: "Data Analyst Mode Accent", desc: "Logo color, theme borders, and highlights when viewing Data Analyst Mode" },
  "developer.accent":  { name: "Software Developer Mode Accent", desc: "Logo color, theme borders, and highlights when viewing Software Developer Mode" },
};

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
      setStatus("Saved. Reload the public site to see changes.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e) { setError(e.message); setStatus(""); }
  }

  async function saveAll() {
    setError(""); setStatus("Saving...");
    try {
      await Promise.all(tokens.map((t) => adminFetch(`/api/admin/theme/${encodeURIComponent(t.key)}`, { method: "PATCH", body: JSON.stringify({ value: t.value }) })));
      setStatus("Saved all changes. Reload the public site to see changes.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e) { setError(e.message); setStatus(""); }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Theme & Logo Colors</h1>
          <p className="admin-sub">
            Customize the GV Logo colors (landing screen vs individual modes) and electric lightning spark effects.
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={saveAll}>Save all changes</button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <div className="admin-card">
        {tokens.map((t) => {
          const info = TOKEN_LABELS[t.key] || { name: t.key, desc: "" };
          return (
            <div key={t.key} className="admin-field" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--a-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--a-fg)" }}>{info.name}</strong>
                  <code style={{ marginLeft: 8, opacity: 0.6, fontSize: "0.8rem" }}>{t.key}</code>
                </div>
              </div>
              {info.desc && <p style={{ fontSize: "0.82rem", color: "var(--a-sub)", margin: "0 0 10px 0" }}>{info.desc}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  value={t.value || "#00f0ff"}
                  onChange={(e) => updateLocal(t.key, e.target.value)}
                  onBlur={(e) => save(t.key, e.target.value)}
                  style={{ width: 48, height: 36, padding: 0, border: "1px solid var(--a-border)", borderRadius: 6, background: "none", cursor: "pointer" }}
                />
                <input
                  className="admin-input"
                  style={{ maxWidth: 160 }}
                  value={t.value || ""}
                  onChange={(e) => updateLocal(t.key, e.target.value)}
                  onBlur={(e) => save(t.key, e.target.value)}
                />
              </div>
            </div>
          );
        })}
        <p className="admin-hint" style={{ marginTop: 16 }}>
          Landing page colors and mode accents save per-field as you edit. Reload the main website to see live updates.
        </p>
      </div>
    </div>
  );
}
