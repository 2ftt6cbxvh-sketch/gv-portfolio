"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

const ALL_MODES = ["editor", "analyst", "developer"];

export default function EducationAdminPage() {
  const [active, setActive] = useState("editor");
  const [items, setItems]   = useState([]);
  const [error, setError]   = useState("");
  const [savedId, setSavedId]   = useState("");
  const [copyingId, setCopyingId] = useState("");

  async function load() {
    const modes = await adminFetch("/api/admin/education");
    const mode  = modes.find((m) => m.modeId === active);
    setItems(mode?.education || []);
  }

  useEffect(() => { load(); }, [active]);

  function updateLocal(id, key, value) {
    setItems((its) => its.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  async function save(item) {
    setError("");
    try {
      await adminFetch(`/api/admin/education/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          institution: item.institution,
          degree: item.degree,
          field: item.field,
          startYear: item.startYear,
          endYear: item.endYear,
          grade: item.grade,
          description: item.description,
          visible: item.visible,
        }),
      });
      setSavedId(item.id);
      setTimeout(() => setSavedId(""), 1800);
    } catch (e) { setError(e.message); }
  }

  async function addNew() {
    await adminFetch("/api/admin/education", {
      method: "POST",
      body: JSON.stringify({ modeId: active }),
    });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this education entry?")) return;
    await adminFetch(`/api/admin/education/${id}`, { method: "DELETE" });
    await load();
  }

  async function copyToAllModes(item) {
    setCopyingId(item.id);
    setError("");
    try {
      const others = ALL_MODES.filter((m) => m !== active);
      await Promise.all(others.map((modeId) =>
        adminFetch("/api/admin/education", {
          method: "POST",
          body: JSON.stringify({
            modeId,
            institution: item.institution,
            degree: item.degree,
            field: item.field,
            startYear: item.startYear,
            endYear: item.endYear,
            grade: item.grade,
            description: item.description,
            visible: item.visible,
          }),
        })
      ));
      setSavedId(item.id + "-copied");
      setTimeout(() => setSavedId(""), 2500);
    } catch (e) { setError(e.message); }
    setCopyingId("");
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Education</h1>
          <p className="admin-sub">
            Education entries are <strong>per mode</strong>. Use <strong>Copy to all modes</strong> to share the same entry across all three modes.
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={addNew}>+ Add education</button>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {items.length === 0 && (
        <div className="admin-empty">
          No education entries yet for <strong>{active}</strong> mode. Add one above.
        </div>
      )}

      {items.map((item) => (
        <div className="admin-card" key={item.id}>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label>Institution / University</label>
              <input
                className="admin-input"
                value={item.institution || ""}
                onChange={(e) => updateLocal(item.id, "institution", e.target.value)}
                onBlur={() => save(item)}
                placeholder="e.g. Stanford University"
              />
            </div>
            <div className="admin-field">
              <label>Grade / CGPA</label>
              <input
                className="admin-input"
                value={item.grade || ""}
                onChange={(e) => updateLocal(item.id, "grade", e.target.value)}
                onBlur={() => save(item)}
                placeholder="e.g. 9.2 / 10"
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label>Degree</label>
              <input
                className="admin-input"
                value={item.degree || ""}
                onChange={(e) => updateLocal(item.id, "degree", e.target.value)}
                onBlur={() => save(item)}
                placeholder="e.g. B.Tech / M.Sc"
              />
            </div>
            <div className="admin-field" style={{ flex: 2 }}>
              <label>Field / Specialisation</label>
              <input
                className="admin-input"
                value={item.field || ""}
                onChange={(e) => updateLocal(item.id, "field", e.target.value)}
                onBlur={() => save(item)}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="admin-field">
              <label>Start Year</label>
              <input
                className="admin-input"
                value={item.startYear || ""}
                onChange={(e) => updateLocal(item.id, "startYear", e.target.value)}
                onBlur={() => save(item)}
                placeholder="2020"
              />
            </div>
            <div className="admin-field">
              <label>End Year</label>
              <input
                className="admin-input"
                value={item.endYear || ""}
                onChange={(e) => updateLocal(item.id, "endYear", e.target.value)}
                onBlur={() => save(item)}
                placeholder="2024 / Present"
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Description / Notes (optional)</label>
            <textarea
              className="admin-textarea"
              value={item.description || ""}
              onChange={(e) => updateLocal(item.id, "description", e.target.value)}
              onBlur={() => save(item)}
              placeholder="Relevant coursework, thesis, activities..."
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={item.visible}
                onChange={(e) => { updateLocal(item.id, "visible", e.target.checked); save({ ...item, visible: e.target.checked }); }}
              />
              Visible
            </label>
            {savedId === item.id && <span className="admin-success" style={{ padding: "4px 10px" }}>Saved</span>}
            {savedId === item.id + "-copied" && <span className="admin-success" style={{ padding: "4px 10px" }}>✓ Copied to all modes</span>}
            <button
              className="admin-btn admin-btn--sm"
              style={{ marginLeft: "auto" }}
              disabled={copyingId === item.id}
              onClick={() => copyToAllModes(item)}
            >
              {copyingId === item.id ? "Copying…" : "Copy to all modes"}
            </button>
            <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => save(item)}>Save</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
