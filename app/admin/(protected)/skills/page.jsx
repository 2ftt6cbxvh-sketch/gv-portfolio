"use client";
import { useEffect, useState } from "react";
import ModeTabs from "@/components/admin/ModeTabs";
import { adminFetch } from "@/components/admin/adminApi";

export default function SkillsAdminPage() {
  const [active, setActive] = useState("editor");
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [savedId, setSavedId] = useState("");

  async function load() {
    const modes = await adminFetch("/api/admin/modes");
    const mode = modes.find((m) => m.modeId === active);
    setGroups(mode?.skillGroups || []);
  }

  useEffect(() => { load(); }, [active]);

  async function addGroup() {
    if (!newGroupLabel.trim()) return;
    await adminFetch("/api/admin/skill-groups", { method: "POST", body: JSON.stringify({ modeId: active, label: newGroupLabel }) });
    setNewGroupLabel("");
    await load();
  }

  async function renameGroup(id, label) {
    await adminFetch(`/api/admin/skill-groups/${id}`, { method: "PATCH", body: JSON.stringify({ label }) });
  }

  async function deleteGroup(id) {
    if (!confirm("Delete this skill group and all skills in it?")) return;
    await adminFetch(`/api/admin/skill-groups/${id}`, { method: "DELETE" });
    await load();
  }

  async function addSkill(groupId) {
    await adminFetch("/api/admin/skills", { method: "POST", body: JSON.stringify({ groupId, name: "New skill", level: 70 }) });
    await load();
  }

  function updateSkillLocal(groupId, skillId, key, value) {
    setGroups((gs) => gs.map((g) => g.id !== groupId ? g : {
      ...g,
      skills: g.skills.map((s) => s.id === skillId ? { ...s, [key]: value } : s),
    }));
  }

  async function saveSkill(groupId, skill) {
    setError("");
    try {
      await adminFetch(`/api/admin/skills/${skill.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: skill.name, level: skill.level }),
      });
      setSavedId(skill.id);
      setTimeout(() => setSavedId(""), 1800);
    } catch (e) { setError(e.message); }
  }

  async function deleteSkill(groupId, skillId) {
    await adminFetch(`/api/admin/skills/${skillId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Skills</h1>
          <p className="admin-sub">Group skills and control each skill's expertise percentage — drives the animated bars on the public site.</p>
        </div>
      </div>

      <ModeTabs active={active} onChange={setActive} />
      {error && <div className="admin-error">{error}</div>}

      {groups.map((group) => (
        <div className="admin-card" key={group.id}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            <input
              className="admin-input"
              style={{ fontWeight: 700, fontSize: 15 }}
              defaultValue={group.label}
              onBlur={(e) => renameGroup(group.id, e.target.value)}
            />
            <button className="admin-btn admin-btn--sm" onClick={() => addSkill(group.id)}>+ Skill</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => deleteGroup(group.id)}>Delete group</button>
          </div>

          {group.skills.length === 0 && <div className="admin-empty">No skills in this group yet.</div>}

          {group.skills.map((skill) => (
            <div key={skill.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--a-border)" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <input
                  className="admin-input"
                  value={skill.name}
                  onChange={(e) => updateSkillLocal(group.id, skill.id, "name", e.target.value)}
                  onBlur={() => saveSkill(group.id, { ...skill, name: skill.name })}
                />
                <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => saveSkill(group.id, skill)}>Save changes</button>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => deleteSkill(group.id, skill.id)}>Delete</button>
              </div>
              <div className="admin-skill-level-row">
                <span style={{ fontSize: 12, color: "var(--a-muted)" }}>Expertise</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.level}
                  onChange={(e) => updateSkillLocal(group.id, skill.id, "level", Number(e.target.value))}
                  onMouseUp={() => saveSkill(group.id, skill)}
                  onTouchEnd={() => saveSkill(group.id, skill)}
                />
                <span className="admin-skill-level-value">{skill.level}%</span>
                {savedId === skill.id && <span className="admin-success" style={{ padding: "4px 10px" }}>Saved</span>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="admin-card">
        <div style={{ display: "flex", gap: 10 }}>
          <input className="admin-input" placeholder="New group name (e.g. Frontend)" value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} />
          <button className="admin-btn admin-btn--primary" onClick={addGroup}>Add group</button>
        </div>
      </div>
    </div>
  );
}
