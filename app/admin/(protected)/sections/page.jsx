"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";

const MODE_LABELS = { editor: "Editor", analyst: "Data Analyst", developer: "Developer" };
const SECTION_LABELS = {
  hero: "Hero", projects: "Projects", skills: "Skills", certificates: "Certificates",
  papers: "Papers", achievements: "Achievements", contact: "Contact",
};

export default function SectionsAdminPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const data = await adminFetch("/api/admin/sections");
    setRows(data);
  }

  useEffect(() => { load(); }, []);

  async function toggleVisible(row) {
    setError("");
    try {
      await adminFetch(`/api/admin/sections/${row.id}`, { method: "PATCH", body: JSON.stringify({ visible: !row.visible }) });
      await load();
    } catch (e) { setError(e.message); }
  }

  async function move(row, direction) {
    const siblings = rows.filter((r) => r.modeId === row.modeId).sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((r) => r.id === row.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const other = siblings[swapIdx];
    await adminFetch(`/api/admin/sections/${row.id}`, { method: "PATCH", body: JSON.stringify({ order: other.order }) });
    await adminFetch(`/api/admin/sections/${other.id}`, { method: "PATCH", body: JSON.stringify({ order: row.order }) });
    await load();
  }

  const grouped = rows.reduce((acc, r) => {
    (acc[r.modeId] = acc[r.modeId] || []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Section visibility & order</h1>
          <p className="admin-sub">Show/hide sections per mode and reorder them. Public pages read this config on every request.</p>
        </div>
      </div>
      {error && <div className="admin-error">{error}</div>}

      {Object.entries(grouped).map(([modeId, sectionRows]) => (
        <div className="admin-card" key={modeId}>
          <h2 style={{ fontSize: 15, margin: "0 0 12px" }}>{MODE_LABELS[modeId] || modeId}</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Section</th><th>Status</th><th>Order</th><th></th></tr>
            </thead>
            <tbody>
              {sectionRows.sort((a, b) => a.order - b.order).map((row) => (
                <tr key={row.id}>
                  <td>{SECTION_LABELS[row.section] || row.section}</td>
                  <td>
                    <span className={`admin-badge ${row.visible ? "admin-badge--on" : "admin-badge--off"}`}>
                      {row.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>{row.order}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="admin-btn admin-btn--sm" onClick={() => move(row, -1)}>↑</button>
                    <button className="admin-btn admin-btn--sm" onClick={() => move(row, 1)}>↓</button>
                    <button className="admin-btn admin-btn--sm" onClick={() => toggleVisible(row)}>
                      {row.visible ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
