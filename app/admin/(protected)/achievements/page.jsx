"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

export default function AchievementsAdminPage() {
  const [active, setActive] = useState("editor");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const modes = await adminFetch("/api/admin/modes");
    const mode = modes.find((m) => m.modeId === active);
    setItems(mode?.achievements || []);
  }

  useEffect(() => { load(); }, [active]);

  function updateLocal(id, key, value) {
    setItems((its) => its.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  async function save(item) {
    setError("");
    try {
      await adminFetch(`/api/admin/achievements/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: item.title, description: item.description, year: item.year, visible: item.visible }),
      });
    } catch (e) { setError(e.message); }
  }

  async function addNew() {
    await adminFetch("/api/admin/achievements", { method: "POST", body: JSON.stringify({ modeId: active }) });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this achievement?")) return;
    await adminFetch(`/api/admin/achievements/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Achievements</h1>
          <p className="admin-sub">Add, edit, or remove achievements per mode.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={addNew}>+ Add achievement</button>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {items.length === 0 && <div className="admin-empty">No achievements yet for this mode.</div>}

      {items.map((item) => (
        <div className="admin-card" key={item.id}>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Title</label>
              <input className="admin-input" value={item.title} onChange={(e) => updateLocal(item.id, "title", e.target.value)} onBlur={() => save(item)} />
            </div>
            <div className="admin-field">
              <label>Year</label>
              <input className="admin-input" value={item.year || ""} onChange={(e) => updateLocal(item.id, "year", e.target.value)} onBlur={() => save(item)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Description</label>
            <textarea className="admin-textarea" value={item.description || ""} onChange={(e) => updateLocal(item.id, "description", e.target.value)} onBlur={() => save(item)} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={item.visible} onChange={(e) => { updateLocal(item.id, "visible", e.target.checked); save({ ...item, visible: e.target.checked }); }} />
              Visible
            </label>
            <button className="admin-btn admin-btn--danger admin-btn--sm" style={{ marginLeft: "auto" }} onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
