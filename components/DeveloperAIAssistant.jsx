"use client";

import { useState } from "react";

const PROMPTS = [
  {
    question: "Who is Ganesh in 30 seconds?",
    answer: "Buddharaju Ganesh Sai Varma is an MSc Advanced Data Science & AI candidate at the University of Liverpool. He bridges deep learning research (PyTorch, 99.4% accuracy models) with high-performance full-stack web engineering (Next.js, Node.js, PostgreSQL).",
    stats: ["🎓 Liverpool MSc AI", "🧠 99.4% ML Model Accuracy", "💻 Full-Stack Systems"],
  },
  {
    question: "Why hire Ganesh as an Engineer?",
    answer: "Ganesh doesn't just build UI—he designs complete end-to-end products. From designing optimized database schemas and training custom deep learning models to shipping responsive Next.js apps deployed to AWS, he brings exceptional technical craftsmanship and rapid execution.",
    stats: ["⚡ End-to-End Delivery", "📊 Data Science + Web Engineering", "🚀 Production Ready"],
  },
  {
    question: "Show top 3 projects & achievements",
    answer: "1. MRI Brain Tumor AI Classifier (99.4% accuracy PyTorch model)\n2. National Stage & BTech Fest Creative Direction (8+ major stage productions)\n3. Production Full-Stack Portfolio Platform with zero-latency Next.js edge routing.",
    stats: ["🔬 MRI Tumor AI (99.4%)", "🎬 8+ Stage Productions", "🌐 Next.js Edge Architecture"],
  },
  {
    question: "Calculate Project ROI & Delivery Speed",
    answer: "By combining AI automated data pipelines with modern Next.js/React architecture, engineering turnaround speed is accelerated by 3.5x while keeping infrastructure costs minimal through serverless edge caching.",
    stats: ["⚡ 3.5x Turnaround Speed", "💰 Serverless Cost Efficiency", "📈 99.9% System Uptime"],
  },
];

export default function DeveloperAIAssistant({ metadata, accent = "#39ff88" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const activePrompt = PROMPTS[activeIdx];

  const handleSelectPrompt = (idx) => {
    setActiveIdx(idx);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 300);
  };

  return (
    <div
      className="developer-ai-assistant-card"
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
            CYBER AI ASSISTANT // INTERACTIVE CONVERSATION BOT
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem" }}>Ask Ganesh's AI Assistant</h4>
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
          {isTyping ? "🤖 GENERATING RESPONSE..." : "Tap any Question Chip below"}
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {PROMPTS.map((p, idx) => (
          <button
            key={p.question}
            onClick={() => handleSelectPrompt(idx)}
            style={{
              padding: "8px 14px",
              background: activeIdx === idx ? `color-mix(in oklab, ${accent} 22%, transparent)` : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${activeIdx === idx ? accent : "rgba(255,255,255,0.12)"}`,
              borderRadius: 20,
              color: activeIdx === idx ? accent : "rgba(255,255,255,0.85)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              transition: "all 0.2s ease",
              boxShadow: activeIdx === idx ? `0 0 16px color-mix(in oklab, ${accent} 30%, transparent)` : "none",
            }}
          >
            💬 {p.question}
          </button>
        ))}
      </div>

      {/* Response Box */}
      <div
        style={{
          background: "#020604",
          border: `1px solid color-mix(in oklab, ${accent} 25%, transparent)`,
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: accent, fontWeight: 700 }}>
            GV_AI_BOT :: {activePrompt.question}
          </span>
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.6,
            margin: "0 0 14px 0",
            whiteSpace: "pre-line",
            opacity: isTyping ? 0.5 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {activePrompt.answer}
        </p>

        {/* Highlights / Stat Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {activePrompt.stats.map((st, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.72rem",
                fontFamily: "var(--font-mono)",
                background: `color-mix(in oklab, ${accent} 15%, transparent)`,
                color: accent,
                border: `1px solid color-mix(in oklab, ${accent} 40%, transparent)`,
                padding: "3px 10px",
                borderRadius: 12,
              }}
            >
              {st}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
