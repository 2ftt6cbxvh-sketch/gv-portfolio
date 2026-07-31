"use client";

import { useState } from "react";

export default function AnalystNeuralNet({ metadata, accent = "#33c7b0" }) {
  const [activeInput, setActiveInput] = useState(0);
  const [isFiring, setIsFiring] = useState(false);

  let inputs = [
    { id: "i1", label: "MRI Scan Data", desc: "Brain Image Tensors", accuracy: "99.4% Accuracy", loss: "0.012 Loss", conf: "98.7% Conf" },
    { id: "i2", label: "Time Series Data", desc: "Sequential Signals", accuracy: "98.6% Accuracy", loss: "0.018 Loss", conf: "99.1% Conf" },
    { id: "i3", label: "Tabular Metrics", desc: "32-Feature Vectors", accuracy: "99.1% Accuracy", loss: "0.009 Loss", conf: "99.5% Conf" },
  ];

  let hidden = [
    { id: "h1", label: "Conv2D Layer" },
    { id: "h2", label: "LSTM Cell" },
    { id: "h3", label: "Dense ReLU" },
    { id: "h4", label: "Attention Head" },
  ];

  let outputs = [
    { id: "o1", label: "Classification", defaultVal: "99.4% Accuracy" },
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
          accuracy: `${(98.5 + idx * 0.4).toFixed(1)}% Accuracy`,
          loss: `0.00${12 + idx} Loss`,
          conf: `99.${idx} % Conf`,
        }));
      }
      if (parsed.outputs && Array.isArray(parsed.outputs) && parsed.outputs.length > 0) {
        outputs = parsed.outputs;
      }
    } catch (e) {}
  }

  const triggerForwardPass = (index) => {
    setActiveInput(index);
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 600);
  };

  const selectedInput = inputs[activeInput] || inputs[0];

  return (
    <div
      className="neural-net-card"
      style={{
        background: "#080f0d",
        border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
        borderRadius: 12,
        padding: "20px",
        boxShadow: `0 10px 30px color-mix(in oklab, ${accent} 10%, transparent)`,
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
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
            padding: "4px 12px",
            borderRadius: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          {isFiring ? "⚡ FIRING FORWARD PASS..." : "Click any Input Node to Fire Signal"}
        </span>
      </div>

      <div className="neural-net-grid">
        {/* Input Layer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>INPUT LAYER</span>
          {inputs.map((inp, idx) => (
            <button
              key={inp.id || idx}
              onClick={() => triggerForwardPass(idx)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                background: activeInput === idx ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${activeInput === idx ? accent : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeInput === idx ? `0 0 16px color-mix(in oklab, ${accent} 40%, transparent)` : "none",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: activeInput === idx ? accent : "#fff" }}>
                ⚡ {inp.label}
              </div>
              {inp.desc && <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 2 }}>{inp.desc}</div>}
            </button>
          ))}
        </div>

        {/* Hidden Layer (Animated Connections) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>HIDDEN WEIGHT LAYERS</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
            {hidden.map((h, idx) => (
              <div
                key={h.id}
                style={{
                  padding: "12px 8px",
                  background: isFiring ? `color-mix(in oklab, ${accent} 30%, rgba(0,0,0,0.6))` : "rgba(0,0,0,0.4)",
                  border: `1.5px dashed ${isFiring ? accent : `color-mix(in oklab, ${accent} 40%, transparent)`}`,
                  borderRadius: 6,
                  textAlign: "center",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: isFiring ? accent : "rgba(255,255,255,0.85)",
                  boxShadow: isFiring ? `0 0 20px ${accent}` : "none",
                  transform: isFiring ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.25s ease",
                }}
              >
                {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Output Layer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>LIVE PREDICTION OUTPUT</span>
          {outputs.map((out, idx) => {
            let computedVal = out.defaultVal;
            if (idx === 0) computedVal = selectedInput.accuracy || out.defaultVal;
            if (idx === 1) computedVal = selectedInput.loss || out.defaultVal;
            if (idx === 2) computedVal = selectedInput.conf || out.defaultVal;

            return (
              <div
                key={out.id || idx}
                style={{
                  padding: "12px 14px",
                  background: isFiring ? `color-mix(in oklab, ${accent} 15%, rgba(0,0,0,0.6))` : "rgba(0,0,0,0.5)",
                  border: `1.5px solid ${isFiring ? accent : `color-mix(in oklab, ${accent} 35%, transparent)`}`,
                  borderRadius: 8,
                  transition: "all 0.3s ease",
                  boxShadow: isFiring ? `0 0 15px color-mix(in oklab, ${accent} 30%, transparent)` : "none",
                }}
              >
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{out.label}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: accent, marginTop: 3, fontFamily: "var(--font-mono)" }}>
                  {computedVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
