"use client";

import { useState } from "react";

export default function AnalystNeuralNet({ metadata, accent = "#33c7b0" }) {
  const [activeInput, setActiveInput] = useState("i1");
  const [pulse, setPulse] = useState(0);

  let inputs = [
    { id: "i1", label: "MRI Scan Data", desc: "Brain Image Tensors" },
    { id: "i2", label: "Time Series Data", desc: "Sequential Signals" },
    { id: "i3", label: "Tabular Metrics", desc: "32-Feature Vectors" },
  ];

  let hidden = [
    { id: "h1", label: "Conv2D Layer" },
    { id: "h2", label: "LSTM Cell" },
    { id: "h3", label: "Dense ReLU" },
    { id: "h4", label: "Attention Head" },
  ];

  let outputs = [
    { id: "o1", label: "Tumor Classification", defaultVal: "99.4% Accuracy" },
    { id: "o2", label: "Anomaly Prediction", defaultVal: "0.012 Loss" },
    { id: "o3", label: "Confidence Score", defaultVal: "98.7% Conf" },
  ];

  if (metadata) {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (parsed.inputs && Array.isArray(parsed.inputs) && parsed.inputs.length > 0) {
        inputs = parsed.inputs;
      } else if (parsed.inputsStr) {
        inputs = parsed.inputsStr.split(",").map((s, idx) => ({
          id: `i${idx + 1}`,
          label: s.trim(),
          desc: "Feature Array",
        }));
      }
      if (parsed.outputs && Array.isArray(parsed.outputs) && parsed.outputs.length > 0) {
        outputs = parsed.outputs;
      }
    } catch (e) {}
  }

  const triggerForwardPass = (id) => {
    setActiveInput(id);
    setPulse((p) => p + 1);
  };

  return (
    <div
      className="neural-net-card"
      style={{
        background: "#080f0d",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: 24,
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.74rem" }}>
            INTERACTIVE AI MODEL // FORWARD PASS SIMULATOR
          </span>
          <h4 style={{ margin: "4px 0 0 0", fontSize: "1.1rem" }}>Deep Neural Network Graph</h4>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            background: `color-mix(in oklab, ${accent} 15%, transparent)`,
            color: accent,
            padding: "3px 10px",
            borderRadius: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          Click any Input Node to Fire Signal
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 20, alignItems: "center" }}>
        {/* Input Layer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>INPUT LAYER</span>
          {inputs.map((inp) => (
            <button
              key={inp.id || inp.label}
              onClick={() => triggerForwardPass(inp.id || inp.label)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                background: activeInput === (inp.id || inp.label) ? `color-mix(in oklab, ${accent} 20%, transparent)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeInput === (inp.id || inp.label) ? accent : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: activeInput === (inp.id || inp.label) ? accent : "#fff" }}>
                ⚡ {inp.label}
              </div>
              {inp.desc && <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 2 }}>{inp.desc}</div>}
            </button>
          ))}
        </div>

        {/* Hidden Layer (Animated Connections) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", position: "relative" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>HIDDEN LAYERS</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
            {hidden.map((h, idx) => (
              <div
                key={h.id}
                style={{
                  padding: "10px",
                  background: "rgba(0,0,0,0.4)",
                  border: `1px dashed color-mix(in oklab, ${accent} 40%, transparent)`,
                  borderRadius: 6,
                  textAlign: "center",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "rgba(255,255,255,0.8)",
                  boxShadow: pulse % 2 === idx % 2 ? `0 0 15px ${accent}66` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Output Layer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>PREDICTION OUTPUT</span>
          {outputs.map((out, idx) => (
            <div
              key={out.id || idx}
              style={{
                padding: "10px 14px",
                background: "rgba(0,0,0,0.5)",
                border: `1px solid color-mix(in oklab, ${accent} 30%, transparent)`,
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{out.label}</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: accent, marginTop: 2, fontFamily: "var(--font-mono)" }}>
                {out.defaultVal || out.value || "99.4% Accuracy"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
