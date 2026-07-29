"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

export default function ModesAdminPage() {
  const [modes, setModes] = useState([]);
  const [active, setActive] = useState("editor");
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [metaDraft, setMetaDraft] = useState({ label: "", value: "" });

  async function load() {
    const data = await adminFetch("/api/admin/modes");
    setModes(data);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const m = modes.find((x) => x.modeId === active);
    setForm(m || null);
  }, [modes, active]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setError(""); setStatus("Saving...");
    try {
      await adminFetch(`/api/admin/modes/${active}`, { method: "PATCH", body: JSON.stringify(form) });
      setStatus("Saved.");
      await load();
      setTimeout(() => setStatus(""), 1500);
    } catch (e) {
      setError(e.message); setStatus("");
    }
  }

  async function addMeta() {
    if (!metaDraft.label && !metaDraft.value) return;
    await adminFetch("/api/admin/meta-items", {
      method: "POST",
      body: JSON.stringify({ modeId: active, ...metaDraft }),
    });
    setMetaDraft({ label: "", value: "" });
    await load();
  }

  async function updateMeta(id, key, value) {
    setForm((f) => ({
      ...f,
      metaItems: f.metaItems.map((m) => (m.id === id ? { ...m, [key]: value } : m)),
    }));
  }

  async function saveMeta(id) {
    const item = form.metaItems.find((m) => m.id === id);
    await adminFetch(`/api/admin/meta-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ label: item.label, value: item.value }),
    });
    await load();
  }

  async function deleteMeta(id) {
    await adminFetch(`/api/admin/meta-items/${id}`, { method: "DELETE" });
    await load();
  }

  if (!form) return <div className="admin-empty">Loading...</div>;

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Modes & Hero copy</h1>
          <p className="admin-sub">Edit the hero title, lede, role, and mode description for each mode.</p>
        </div>
      </div>

      <ModeTabs active={active} onChange={setActive} />

      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <div className="admin-card">
        <div className="admin-field">
          <label>Mode name (shown in selector)</label>
          <input className="admin-input" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Mode description (shown in selector)</label>
          <textarea className="admin-textarea" value={form.desc} onChange={(e) => updateField("desc", e.target.value)} />
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Index label (e.g. "01")</label>
            <input className="admin-input" value={form.index} onChange={(e) => updateField("index", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Accent color</label>
            <input className="admin-input" type="text" value={form.accentColor} onChange={(e) => updateField("accentColor", e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Role / title (hero eyebrow)</label>
          <input className="admin-input" value={form.role} onChange={(e) => updateField("role", e.target.value)} />
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Hero title — prefix</label>
            <input className="admin-input" value={form.heroTitlePrefix} onChange={(e) => updateField("heroTitlePrefix", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Hero title — accent word</label>
            <input className="admin-input" value={form.heroTitleAccent} onChange={(e) => updateField("heroTitleAccent", e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label>Hero title — suffix</label>
          <input className="admin-input" value={form.heroTitleSuffix} onChange={(e) => updateField("heroTitleSuffix", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Lede / intro paragraph</label>
          <textarea className="admin-textarea" style={{ minHeight: 120 }} value={form.lede} onChange={(e) => updateField("lede", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Contact section heading</label>
          <input className="admin-input" value={form.contactHeading} onChange={(e) => updateField("contactHeading", e.target.value)} />
        </div>
        <div className="admin-form-actions">
          <button className="admin-btn admin-btn--primary" onClick={save}>Save changes</button>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 15, margin: "0 0 12px" }}>Meta chips (hero stat row)</h2>
        {form.metaItems.length === 0 && <div className="admin-empty">No meta items yet.</div>}
        {form.metaItems.map((m) => (
          <div key={m.id} className="admin-form-row" style={{ alignItems: "end", marginBottom: 10 }}>
            <input
              className="admin-input"
              placeholder="Label"
              value={m.label}
              onChange={(e) => updateMeta(m.id, "label", e.target.value)}
              onBlur={() => saveMeta(m.id)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="admin-input"
                placeholder="Value"
                value={m.value}
                onChange={(e) => updateMeta(m.id, "value", e.target.value)}
                onBlur={() => saveMeta(m.id)}
              />
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => deleteMeta(m.id)}>Delete</button>
            </div>
          </div>
        ))}
        <div className="admin-form-row" style={{ marginTop: 8 }}>
          <input className="admin-input" placeholder="New label" value={metaDraft.label} onChange={(e) => setMetaDraft((d) => ({ ...d, label: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <input className="admin-input" placeholder="New value" value={metaDraft.value} onChange={(e) => setMetaDraft((d) => ({ ...d, value: e.target.value }))} />
            <button className="admin-btn admin-btn--sm" onClick={addMeta}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
