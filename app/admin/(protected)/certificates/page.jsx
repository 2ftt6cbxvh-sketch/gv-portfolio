"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

export default function CertificatesAdminPage() {
  const [active, setActive] = useState("editor");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");

  async function load() {
    const modes = await adminFetch("/api/admin/modes");
    const mode = modes.find((m) => m.modeId === active);
    setItems(mode?.certificates || []);
  }

  useEffect(() => { load(); }, [active]);

  function updateLocal(id, key, value) {
    setItems((its) => its.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  async function save(item) {
    setError("");
    try {
      await adminFetch(`/api/admin/certificates/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: item.title, issuer: item.issuer, year: item.year, url: item.url, imageUrl: item.imageUrl, visible: item.visible }),
      });
      setSavedId(item.id);
      setTimeout(() => setSavedId(""), 1800);
    } catch (e) { setError(e.message); }
  }

  async function addNew() {
    await adminFetch("/api/admin/certificates", { method: "POST", body: JSON.stringify({ modeId: active }) });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this certificate?")) return;
    await adminFetch(`/api/admin/certificates/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Certificates</h1>
          <p className="admin-sub">Add, edit, or remove certificates per mode.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={addNew}>+ Add certificate</button>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {items.length === 0 && <div className="admin-empty">No certificates yet for this mode.</div>}

      {items.map((item) => (
        <div className="admin-card" key={item.id}>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Title</label>
              <input className="admin-input" value={item.title} onChange={(e) => updateLocal(item.id, "title", e.target.value)} onBlur={() => save(item)} />
            </div>
            <div className="admin-field">
              <label>Issuer</label>
              <input className="admin-input" value={item.issuer || ""} onChange={(e) => updateLocal(item.id, "issuer", e.target.value)} onBlur={() => save(item)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Year</label>
              <input className="admin-input" value={item.year || ""} onChange={(e) => updateLocal(item.id, "year", e.target.value)} onBlur={() => save(item)} />
            </div>
            <div className="admin-field">
              <label>URL (optional)</label>
              <input className="admin-input" value={item.url || ""} onChange={(e) => updateLocal(item.id, "url", e.target.value)} onBlur={() => save(item)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Image URL (optional)</label>
            <input className="admin-input" value={item.imageUrl || ""} onChange={(e) => updateLocal(item.id, "imageUrl", e.target.value)} onBlur={() => save(item)} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={item.visible} onChange={(e) => { updateLocal(item.id, "visible", e.target.checked); save({ ...item, visible: e.target.checked }); }} />
              Visible
            </label>
            {savedId === item.id && <span className="admin-success" style={{ padding: "4px 10px" }}>Saved</span>}
            <button className="admin-btn admin-btn--primary admin-btn--sm" style={{ marginLeft: "auto" }} onClick={() => save(item)}>Save changes</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
