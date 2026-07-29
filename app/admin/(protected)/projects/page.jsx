"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

export default function ProjectsAdminPage() {
  const [active, setActive] = useState("editor");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");

  async function load() {
    const modes = await adminFetch("/api/admin/modes");
    const mode = modes.find((m) => m.modeId === active);
    setItems(mode?.projects || []);
  }

  useEffect(() => { load(); }, [active]);

  function updateLocal(id, key, value) {
    setItems((its) => its.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  async function save(item) {
    setError("");
    try {
      await adminFetch(`/api/admin/projects/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          stack: item.stack,
          url: item.url,
          imageUrl: item.imageUrl,
          featured: item.featured,
          visible: item.visible,
        }),
      });
      setSavedId(item.id);
      setTimeout(() => setSavedId(""), 1800);
    } catch (e) { setError(e.message); }
  }

  async function addNew() {
    await adminFetch("/api/admin/projects", { method: "POST", body: JSON.stringify({ modeId: active }) });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this project?")) return;
    await adminFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Projects</h1>
          <p className="admin-sub">Add, edit, feature, or remove projects per mode.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={addNew}>+ Add project</button>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {items.length === 0 && <div className="admin-empty">No projects yet for this mode.</div>}

      {items.map((item) => (
        <div className="admin-card" key={item.id}>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Title</label>
              <input className="admin-input" value={item.title} onChange={(e) => updateLocal(item.id, "title", e.target.value)} onBlur={() => save(item)} />
            </div>
            <div className="admin-field">
              <label>URL (optional)</label>
              <input className="admin-input" value={item.url || ""} onChange={(e) => updateLocal(item.id, "url", e.target.value)} onBlur={() => save(item)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Description</label>
            <textarea className="admin-textarea" value={item.description || ""} onChange={(e) => updateLocal(item.id, "description", e.target.value)} onBlur={() => save(item)} />
          </div>
          <div className="admin-field">
            <label>Stack / tags (comma-separated)</label>
            <input
              className="admin-input"
              value={(item.stack || []).join(", ")}
              onChange={(e) => updateLocal(item.id, "stack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              onBlur={() => save(item)}
            />
          </div>
          <div className="admin-field">
            <label>Image URL (optional — place file in /public/media and reference it here)</label>
            <input className="admin-input" value={item.imageUrl || ""} onChange={(e) => updateLocal(item.id, "imageUrl", e.target.value)} onBlur={() => save(item)} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={item.featured} onChange={(e) => { updateLocal(item.id, "featured", e.target.checked); save({ ...item, featured: e.target.checked }); }} />
              Featured
            </label>
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
