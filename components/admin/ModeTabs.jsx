"use client";

const MODE_LABELS = { editor: "Editor", analyst: "Data Analyst", developer: "Developer" };
const MODE_ORDER = ["editor", "analyst", "developer"];

export default function ModeTabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      {MODE_ORDER.map((id) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="admin-btn admin-btn--sm"
          style={active === id ? { background: "var(--a-accent)", borderColor: "var(--a-accent)", color: "#0a0f16" } : {}}
        >
          {MODE_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
