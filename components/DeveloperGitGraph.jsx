"use client";

import { useState } from "react";

const COMMITS = [
  {
    hash: "da1ab2a",
    branch: "main",
    author: "Ganesh Varma",
    msg: "feat: add mobile touch drag 3D tilt & hardware gyroscope sensor engine",
    file: "components/ModeSelector.jsx",
    diff: [
      { type: "context", text: "  useEffect(() => {" },
      { type: "remove", text: "-   // Desktop mouse only physics" },
      { type: "add", text: "+   // Hardware Gyroscope (beta/gamma) + Mobile Touch Drag physics" },
      { type: "add", text: "+   const handleOrientation = (e) => {" },
      { type: "add", text: "+     const gyroRotX = Math.max(-14, Math.min(14, (e.beta - 45) * 0.35));" },
      { type: "add", text: "+     targetRotX = gyroRotX;" },
      { type: "add", text: "+   };" },
    ],
  },
  {
    hash: "9fa244b",
    branch: "feature/neural-net",
    author: "Ganesh Varma",
    msg: "feat: implement input-specific hidden layer activations & prediction metrics",
    file: "components/AnalystNeuralNet.jsx",
    diff: [
      { type: "context", text: "  const inputs = [" },
      { type: "add", text: "+   { id: 'i1', label: 'MRI Scan Data', activeLayers: ['h1', 'h3'] }," },
      { type: "add", text: "+   { id: 'i2', label: 'Time Series Data', activeLayers: ['h2', 'h4'] }," },
      { type: "remove", text: "-   // Global static activation" },
    ],
  },
  {
    hash: "15187b8",
    branch: "hotfix/v5.3",
    author: "Ganesh Varma",
    msg: "fix: dead-center nav header title & prevent mobile element collision",
    file: "app/style.css",
    diff: [
      { type: "remove", text: "- .nav__mode-label { position: static; }" },
      { type: "add", text: "+ .nav__mode-label { position: absolute; left: 50%; transform: translateX(-50%); }" },
      { type: "add", text: "+ @media (max-width: 768px) { .nav__mode-label { display: none; } }" },
    ],
  },
];

export default function DeveloperGitGraph({ accent = "#39ff88" }) {
  const [activeCommitIdx, setActiveCommitIdx] = useState(0);

  const commit = COMMITS[activeCommitIdx];

  return (
    <div
      className="developer-git-card"
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
            VERSION CONTROL ENGINE // GIT REPOSITORY GRAPH
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Visual Git Branch Tree &amp; Diff Inspector</h4>
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
          Click Commit Node to Inspect Diff
        </span>
      </div>

      {/* Visual Branch Commit Nodes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        {COMMITS.map((c, idx) => (
          <button
            key={c.hash}
            onClick={() => setActiveCommitIdx(idx)}
            style={{
              flex: "1 1 auto",
              textAlign: "left",
              padding: "10px 14px",
              background: activeCommitIdx === idx ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${activeCommitIdx === idx ? accent : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeCommitIdx === idx ? accent : "rgba(255,255,255,0.4)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: accent, fontWeight: 700 }}>
                {c.hash}
              </span>
              <span style={{ fontSize: "0.7rem", opacity: 0.6, fontFamily: "var(--font-mono)" }}>[{c.branch}]</span>
            </div>
            <div style={{ fontSize: "0.78rem", marginTop: 4, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c.msg}
            </div>
          </button>
        ))}
      </div>

      {/* Code Diff Viewer */}
      <div style={{ background: "#020604", border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`, borderRadius: 8, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 8, marginBottom: 10, fontSize: "0.76rem", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: accent }}>📄 {commit.file}</span>
          <span style={{ opacity: 0.6 }}>{commit.author}</span>
        </div>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", overflowX: "auto", lineHeight: 1.6 }}>
          {commit.diff.map((d, i) => (
            <div
              key={i}
              style={{
                background: d.type === "add" ? "rgba(57, 255, 136, 0.12)" : d.type === "remove" ? "rgba(255, 75, 75, 0.12)" : "transparent",
                color: d.type === "add" ? "#39ff88" : d.type === "remove" ? "#ff4b4b" : "rgba(255,255,255,0.6)",
                padding: "2px 8px",
                borderRadius: 4,
                margin: "1px 0",
              }}
            >
              <code>{d.text}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
