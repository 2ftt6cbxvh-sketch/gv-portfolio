"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";

export default function SettingsAdminPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/settings").then(setForm);
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setError(""); setStatus("Saving...");
    try {
      await adminFetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify(form) });
      setStatus("Saved.");
      setTimeout(() => setStatus(""), 1500);
    } catch (e) {
      setError(e.message); setStatus("");
    }
  }

  if (!form) return <div className="admin-empty">Loading...</div>;

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Contact & Social</h1>
          <p className="admin-sub">Update your name, contact email, resume link, and social profiles — shown across all modes.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <div className="admin-card">
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Full name</label>
            <input className="admin-input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Initials (logo)</label>
            <input className="admin-input" value={form.initials} onChange={(e) => update("initials", e.target.value)} />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Contact email</label>
            <input className="admin-input" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Location</label>
            <input className="admin-input" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Resume URL</label>
          <input className="admin-input" value={form.resumeUrl} onChange={(e) => update("resumeUrl", e.target.value)} />
          <div className="admin-hint">Link to a hosted PDF (e.g. Google Drive share link, or /media/resume.pdf if placed in /public/media).</div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>GitHub URL</label>
            <input className="admin-input" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>LinkedIn URL</label>
            <input className="admin-input" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Twitter / X URL (optional)</label>
          <input className="admin-input" value={form.twitterUrl || ""} onChange={(e) => update("twitterUrl", e.target.value)} />
        </div>
        <div className="admin-form-actions">
          <button className="admin-btn admin-btn--primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
