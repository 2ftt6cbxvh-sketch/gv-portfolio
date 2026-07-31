"use client";

import { useState } from "react";

const PRESET_QUERIES = [
  {
    id: "q1",
    label: "SELECT Projects by ML Stack",
    sql: "SELECT title, category, accuracy FROM projects WHERE stack @> ARRAY['PyTorch', 'Python'] ORDER BY accuracy DESC;",
    latency: "0.38 ms",
    plan: "Index Scan using idx_projects_stack on projects",
    rows: [
      { id: "p101", title: "MRI Brain Tumor Classifier", category: "Medical AI", accuracy: "99.4%" },
      { id: "p102", label: "Neural Audio Denoising", category: "Audio Signal", accuracy: "98.8%" },
      { id: "p103", title: "Financial Time-Series Model", category: "Quant ML", accuracy: "99.1%" },
    ],
  },
  {
    id: "q2",
    label: "EXPLAIN ANALYZE JOIN Skills",
    sql: "EXPLAIN ANALYZE SELECT s.name, count(p.id) FROM skills s JOIN project_skills ps ON s.id = ps.skill_id GROUP BY s.name;",
    latency: "0.52 ms",
    plan: "Hash Aggregate -> Hash Join -> Seq Scan on skills",
    rows: [
      { skill: "PyTorch & Deep Learning", count: 8, efficiency: "O(1) Vectorized" },
      { skill: "SQL / PostgreSQL / Supabase", count: 14, efficiency: "Index B-Tree" },
      { skill: "Next.js & React / TypeScript", count: 12, efficiency: "V8 Compiled" },
    ],
  },
  {
    id: "q3",
    label: "AGGREGATE System Metrics",
    sql: "SELECT metric, value, unit FROM system_telemetry WHERE timestamp > NOW() - INTERVAL '1 hour';",
    latency: "0.24 ms",
    plan: "Bitmap Index Scan on telemetry_time_idx",
    rows: [
      { metric: "API P99 Latency", value: "14.2", unit: "ms" },
      { metric: "Database Concurrency", value: "128", unit: "connections" },
      { metric: "Model Inference Throughput", value: "2,450", unit: "req/sec" },
    ],
  },
];

export default function DeveloperSQLSandbox({ accent = "#39ff88" }) {
  const [activeQueryIdx, setActiveQueryIdx] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const query = PRESET_QUERIES[activeQueryIdx];

  const handleRunQuery = (idx) => {
    setActiveQueryIdx(idx);
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 350);
  };

  return (
    <div
      className="developer-sql-card"
      style={{
        background: "#050d08",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        margin: "24px 0",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            LIVE DATABASE TERMINAL // POSTGRESQL ENGINE
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Interactive SQL Query Executor</h4>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            background: `color-mix(in oklab, ${accent} 15%, transparent)`,
            color: accent,
            padding: "4px 12px",
            borderRadius: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          {isExecuting ? "⚡ RUNNING QUERY..." : `EXEC TIME: ${query.latency}`}
        </span>
      </div>

      {/* Preset Query Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {PRESET_QUERIES.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => handleRunQuery(idx)}
            style={{
              padding: "6px 12px",
              background: activeQueryIdx === idx ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeQueryIdx === idx ? accent : "rgba(255,255,255,0.12)"}`,
              borderRadius: 6,
              color: activeQueryIdx === idx ? accent : "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              transition: "all 0.2s ease",
            }}
          >
            ⚡ {q.label}
          </button>
        ))}
      </div>

      {/* SQL Code Terminal Input */}
      <div style={{ background: "#020604", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: accent, marginBottom: 14, overflowX: "auto" }}>
        <code>{query.sql}</code>
      </div>

      {/* Execution Plan & Output Table */}
      <div style={{ background: "#020604", border: `1px solid color-mix(in oklab, ${accent} 20%, transparent)`, borderRadius: 8, padding: 12, overflowX: "auto" }}>
        <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
          PLAN: {query.plan}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", textAlign: "left" }}>
              {Object.keys(query.rows[0]).map((key) => (
                <th key={key} style={{ padding: "6px 10px", color: accent, textTransform: "uppercase", fontSize: "0.7rem" }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {query.rows.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {Object.values(row).map((val, cIdx) => (
                  <td key={cIdx} style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
