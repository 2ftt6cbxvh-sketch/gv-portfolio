"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

const ALL_MODES = ["editor", "analyst", "developer"];

export default function AchievementsAdminPage() {
  const [active, setActive] = useState("editor");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const [copyingId, setCopyingId] = useState("");

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
      setSavedId(item.id);
      setTimeout(() => setSavedId(""), 1800);
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

  // Duplicate an achievement to all other modes so it shows up everywhere in the frontend
  async function copyToAllModes(item) {
    setCopyingId(item.id);
    setError("");
    try {
      const otherModes = ALL_MODES.filter((m) => m !== active);
      await Promise.all(
        otherModes.map((modeId) =>
          adminFetch("/api/admin/achievements", {
            method: "POST",
            body: JSON.stringify({
              modeId,
              title: item.title,
              description: item.description,
              year: item.year,
              visible: item.visible,
            }),
          })
        )
      );
      setSavedId(item.id + "-copied");
      setTimeout(() => setSavedId(""), 2500);
    } catch (e) { setError(e.message); }
    setCopyingId("");
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Achievements</h1>
          <p className="admin-sub">
            Achievements are <strong>per mode</strong> — switch tabs to manage each mode.
            Use <strong>Copy to all modes</strong> to share an achievement across Editor, Analyst &amp; Developer at once.
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={addNew}>+ Add achievement</button>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {items.length === 0 && (
        <div className="admin-empty">
          No achievements yet for <strong>{active}</strong> mode. Add one above, or switch to another tab and use &quot;Copy to all modes&quot;.
        </div>
      )}

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
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={item.visible} onChange={(e) => { updateLocal(item.id, "visible", e.target.checked); save({ ...item, visible: e.target.checked }); }} />
              Visible
            </label>
            {savedId === item.id && <span className="admin-success" style={{ padding: "4px 10px" }}>Saved</span>}
            {savedId === item.id + "-copied" && <span className="admin-success" style={{ padding: "4px 10px" }}>✓ Copied to all modes</span>}
            <button
              className="admin-btn admin-btn--sm"
              style={{ marginLeft: "auto" }}
              disabled={copyingId === item.id}
              onClick={() => copyToAllModes(item)}
              title="Duplicate this achievement to all other modes"
            >
              {copyingId === item.id ? "Copying…" : "Copy to all modes"}
            </button>
            <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => save(item)}>Save changes</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
