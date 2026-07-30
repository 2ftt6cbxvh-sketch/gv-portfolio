"use client";
import { useEffect, useState } from "react";

export default function JourneyAdminPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    institution: "",
    location: "",
    description: "",
    tagsStr: "",
    order: 0,
    visible: true,
  });

  const fetchMilestones = () => {
    fetch("/api/admin/journey")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMilestones(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const openNewForm = () => {
    setEditingItem("NEW");
    setFormData({
      year: "2026",
      title: "",
      institution: "",
      location: "",
      description: "",
      tagsStr: "",
      order: milestones.length,
      visible: true,
    });
  };

  const openEditForm = (m) => {
    setEditingItem(m.id);
    setFormData({
      year: m.year || "",
      title: m.title || "",
      institution: m.institution || "",
      location: m.location || "",
      description: m.description || "",
      tagsStr: m.tags ? m.tags.join(", ") : "",
      order: m.order ?? 0,
      visible: m.visible !== false,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const tags = formData.tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      year: formData.year,
      title: formData.title,
      institution: formData.institution,
      location: formData.location,
      description: formData.description,
      tags,
      order: parseInt(formData.order, 10) || 0,
      visible: formData.visible,
    };

    if (editingItem === "NEW") {
      await fetch("/api/admin/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/admin/journey/${editingItem}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setEditingItem(null);
    fetchMilestones();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    await fetch(`/api/admin/journey/${id}`, { method: "DELETE" });
    fetchMilestones();
  };

  const handleToggleVisible = async (m) => {
    await fetch(`/api/admin/journey/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !m.visible }),
    });
    fetchMilestones();
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const itemA = milestones[index];
    const itemB = milestones[targetIndex];

    const orderA = itemB.order ?? targetIndex;
    const orderB = itemA.order ?? index;

    // Swap order in database
    await Promise.all([
      fetch(`/api/admin/journey/${itemA.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderA }),
      }),
      fetch(`/api/admin/journey/${itemB.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderB }),
      }),
    ]);

    fetchMilestones();
  };

  if (loading) {
    return <div style={{ padding: 24, color: "var(--a-muted)" }}>Loading Journey Milestones...</div>;
  }

  return (
    <div style={{ maxWidth: 840 }}>
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Academic &amp; Career Journey Map</h1>
          <p>Add, edit, reorder (↑ ↓), or toggle visibility of roadmap milestones.</p>
        </div>
        <button onClick={openNewForm} className="admin-btn admin-btn--primary">
          + Add Milestone
        </button>
      </div>

      {/* Modal / Form overlay for Add & Edit */}
      {editingItem !== null && (
        <div className="admin-card" style={{ marginBottom: 24, border: "1px solid var(--a-accent)" }}>
          <h3 style={{ marginTop: 0 }}>{editingItem === "NEW" ? "New Journey Milestone" : "Edit Milestone"}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Year / Duration</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024 - 2026"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Institution / Company</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="University of Liverpool"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Sort Order</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Title / Degree</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="MSc Advanced Computer Science & AI"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Location</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Liverpool, UK"
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Description / Key Highlights</label>
              <textarea
                className="admin-input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key research topics, projects, or fest leadership..."
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Tags (comma separated)</label>
              <input
                type="text"
                className="admin-input"
                value={formData.tagsStr}
                onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                placeholder="Machine Learning, Python, Event Direction"
              />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="submit" className="admin-btn admin-btn--primary">
                Save Milestone
              </button>
              <button type="button" onClick={() => setEditingItem(null)} className="admin-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Milestones */}
      <div className="admin-card">
        {milestones.length === 0 ? (
          <div style={{ color: "var(--a-muted)" }}>No journey milestones yet. Click &quot;+ Add Milestone&quot; above.</div>
        ) : (
          milestones.map((m, index) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--a-border)",
                opacity: m.visible ? 1 : 0.5,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Reorder Up / Down Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="admin-btn admin-btn--sm"
                    style={{ padding: "2px 6px", fontSize: 11, opacity: index === 0 ? 0.3 : 1 }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === milestones.length - 1}
                    className="admin-btn admin-btn--sm"
                    style={{ padding: "2px 6px", fontSize: 11, opacity: index === milestones.length - 1 ? 0.3 : 1 }}
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--a-accent)", fontWeight: 700, background: "rgba(0,240,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--a-accent)", fontWeight: 600 }}>{m.year}</span>
                    <strong style={{ fontSize: 15 }}>{m.title}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 2 }}>
                    {m.institution} {m.location ? `· ${m.location}` : ""}
                  </div>
                  {m.description && <p style={{ fontSize: 13, margin: "4px 0 0 0" }}>{m.description}</p>}
                  {m.tags && m.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {m.tags.map((t, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => handleToggleVisible(m)} className="admin-btn admin-btn--sm">
                  {m.visible ? "Hide" : "Show"}
                </button>
                <button onClick={() => openEditForm(m)} className="admin-btn admin-btn--sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(m.id)} className="admin-btn admin-btn--sm" style={{ color: "#ff4444" }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
