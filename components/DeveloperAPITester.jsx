"use client";

import { useState } from "react";

const ENDPOINTS = [
  {
    method: "GET",
    url: "/api/v1/projects?tech=pytorch",
    status: "200 OK",
    latency: "14 ms",
    size: "2.4 KB",
    response: {
      status: "success",
      count: 3,
      data: [
        { id: "proj_01", name: "MRI Brain Tumor AI", framework: "PyTorch 2.2", accuracy: 0.994, status: "DEPLOYED" },
        { id: "proj_02", name: "Audio Denoising Model", framework: "PyTorch Signal", accuracy: 0.988, status: "DEPLOYED" },
      ],
    },
  },
  {
    method: "POST",
    url: "/api/v1/inference/predict",
    status: "201 CREATED",
    latency: "28 ms",
    size: "1.1 KB",
    response: {
      status: "success",
      prediction: "Glioblastoma Multiforme",
      confidence: 0.994,
      inference_time: "0.012s",
      vector_dim: 512,
    },
  },
  {
    method: "GET",
    url: "/api/v1/system/health",
    status: "200 OK",
    latency: "8 ms",
    size: "0.8 KB",
    response: {
      status: "healthy",
      uptime_seconds: 489201,
      db_connections: "ACTIVE (PostgreSQL)",
      cache_hit_ratio: "99.4%",
      region: "eu-west-1 (Liverpool / London)",
    },
  },
];

export default function DeveloperAPITester({ accent = "#39ff88" }) {
  const [activeEpIdx, setActiveEpIdx] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const ep = ENDPOINTS[activeEpIdx];

  const handleSend = (idx) => {
    setActiveEpIdx(idx);
    setIsSending(true);
    setTimeout(() => setIsSending(false), 300);
  };

  return (
    <div
      className="developer-api-card"
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
            REST &amp; GRAPHQL API PLAYGROUND // HTTP CLIENT
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Interactive Endpoint Request Tester</h4>
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
          {isSending ? "⚡ SENDING REQUEST..." : `STATUS: ${ep.status}`}
        </span>
      </div>

      {/* Endpoint Selector Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {ENDPOINTS.map((item, idx) => (
          <button
            key={item.url}
            onClick={() => handleSend(idx)}
            style={{
              padding: "6px 12px",
              background: activeEpIdx === idx ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeEpIdx === idx ? accent : "rgba(255,255,255,0.12)"}`,
              borderRadius: 6,
              color: activeEpIdx === idx ? accent : "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ color: item.method === "GET" ? "#39ff88" : "#00f0ff", fontWeight: 700, marginRight: 6 }}>
              {item.method}
            </span>
            {item.url}
          </button>
        ))}
      </div>

      {/* Request Header bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, background: "#020604", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 14 }}>
        <span style={{ background: ep.method === "GET" ? "#39ff8822" : "#00f0ff22", color: ep.method === "GET" ? "#39ff88" : "#00f0ff", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
          {ep.method}
        </span>
        <span style={{ flex: 1, color: "#fff", wordBreak: "break-all" }}>{ep.url}</span>
        <button
          onClick={() => handleSend(activeEpIdx)}
          style={{
            background: accent,
            color: "#050d08",
            border: "none",
            borderRadius: 6,
            padding: "4px 12px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.76rem",
            fontFamily: "inherit",
          }}
        >
          {isSending ? "SENDING..." : "⚡ SEND"}
        </button>
      </div>

      {/* Response Payload Viewer */}
      <div style={{ background: "#020604", border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`, borderRadius: 8, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "var(--font-mono)", opacity: 0.6, marginBottom: 8 }}>
          <span>RESPONSE PAYLOAD (JSON)</span>
          <span>LATENCY: {ep.latency} // SIZE: {ep.size}</span>
        </div>
        <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: accent, overflowX: "auto", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(ep.response, null, 2)}
        </pre>
      </div>
    </div>
  );
}
