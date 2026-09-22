"use client";

import { useState } from "react";

const TABS = [
  { id: "ai", label: "🤖 AI Assistant", icon: "💬" },
  { id: "flow", label: "🚀 System Architecture", icon: "⚡" },
  { id: "ui", label: "🎨 Live UI Playground", icon: "🔮" },
];

const AI_PROMPTS = [
  {
    question: "Who is Ganesh in 30 seconds?",
    answer: "Buddharaju Ganesh Sai Varma is an MSc Advanced Data Science & AI candidate at the University of Liverpool. He bridges deep learning research (PyTorch, 99.4% accuracy models) with high-performance full-stack web engineering (Next.js, Node.js, PostgreSQL).",
    stats: ["🎓 Liverpool MSc AI", "🧠 99.4% ML Model Accuracy", "💻 Full-Stack Systems"],
  },
  {
    question: "Why hire Ganesh as an Engineer?",
    answer: "Ganesh designs complete end-to-end products—from database schemas and training custom deep learning models to shipping responsive Next.js apps deployed to AWS with zero-latency edge caching.",
    stats: ["⚡ End-to-End Delivery", "📊 Data Science + Web", "🚀 Production Ready"],
  },
  {
    question: "Show top projects & achievements",
    answer: "1. MRI Brain Tumor AI Classifier (99.4% accuracy PyTorch model)\n2. National Stage & BTech Fest Creative Direction (8+ major stage productions)\n3. Production Full-Stack Portfolio Platform with zero-latency Next.js edge routing.",
    stats: ["🔬 MRI Tumor AI (99.4%)", "🎬 8+ Stage Productions", "🌐 Next.js Edge Architecture"],
  },
];

const ARCH_STAGES = [
  {
    id: "s1",
    node: "📱 Visitor Device",
    tech: "React 19 / Mobile Touch",
    simple: "The visitor taps on a phone or desktop browser. The app handles high-speed touch gestures and 3D tilts smoothly.",
    techDetail: "Touch Handlers + Hardware Accelerometer Gyroscope API",
  },
  {
    id: "s2",
    node: "⚡ Next.js Edge CDN",
    tech: "Vercel / Edge Network",
    simple: "Global servers deliver pre-rendered pages to your device in milliseconds with zero loading lag.",
    techDetail: "Server-Side Rendering (SSR) + Edge Caching Headers (Cache-Control: no-store)",
  },
  {
    id: "s3",
    node: "🧠 PyTorch Neural Model",
    tech: "Python / Deep Learning",
    simple: "Artificial Intelligence neural networks process complex data arrays and return 99.4% accurate predictions.",
    techDetail: "Convolutional Neural Nets (Conv2D) + Attention Transformers",
  },
  {
    id: "s4",
    node: "💾 PostgreSQL Database",
    tech: "Relational DB / SQL",
    simple: "All portfolio projects, skill groups, and certificates are securely stored and fetched instantly.",
    techDetail: "Indexed Relational Schema + Connection Pooling + 0.38ms Query Latency",
  },
];

export default function DeveloperInteractiveSuite({ accent = "#39ff88" }) {
  const [activeTab, setActiveTab] = useState("ai");
  const [aiIdx, setAiIdx] = useState(0);
  const [archIdx, setArchIdx] = useState(0);
  const [isNeonGlow, setIsNeonGlow] = useState(true);
  const [isGlass, setIsGlass] = useState(true);
  const [isSpeedTest, setIsSpeedTest] = useState(false);

  const prompt = AI_PROMPTS[aiIdx];
  const stage = ARCH_STAGES[archIdx];

  const handleRunSpeedTest = () => {
    setIsSpeedTest(true);
    setTimeout(() => setIsSpeedTest(false), 600);
  };

  return (
    <div
      className="developer-interactive-suite"
      style={{
        borderRadius: 14,
        padding: "24px",
        margin: "24px 0",
      }}
    >
      {/* Header & Tab Selector */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div>
          <span className="label-mono" style={{ color: accent, fontSize: "0.72rem" }}>
            ENGINEERING SANDBOX // INTERACTIVE SUITE
          </span>
          <h4 className="dev-suite-title" style={{ margin: "3px 0 0 0", fontSize: "1.15rem", fontWeight: 600 }}>
            Interactive AI &amp; Systems Dashboard
          </h4>
        </div>

        {/* Executive Tab Switcher Pill */}
        <div
          className="dev-suite-tabs-pill"
          style={{
            display: "inline-flex",
            borderRadius: 20,
            padding: 3,
            gap: 4,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`dev-suite-tab ${isActive ? "is-active" : ""}`}
                style={{
                  borderRadius: 16,
                  padding: "5px 14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI ASSISTANT */}
      {activeTab === "ai" && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {AI_PROMPTS.map((p, idx) => (
              <button
                key={p.question}
                onClick={() => setAiIdx(idx)}
                className={`dev-suite-prompt-btn ${aiIdx === idx ? "is-active" : ""}`}
                style={{
                  padding: "7px 14px",
                  borderRadius: 18,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.76rem",
                  transition: "all 0.2s ease",
                }}
              >
                💬 {p.question}
              </button>
            ))}
          </div>

          <div className="dev-suite-content-card" style={{ borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: accent, fontWeight: 600 }}>
                GV_AI_BOT :: {prompt.question}
              </span>
            </div>
            <p className="dev-suite-answer" style={{ margin: "0 0 14px 0", fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {prompt.answer}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {prompt.stats.map((st, i) => (
                <span key={i} className="dev-suite-stat-tag" style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: 10 }}>
                  {st}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM ARCHITECTURE FLOW */}
      {activeTab === "flow" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
            {ARCH_STAGES.map((st, idx) => {
              const isActive = archIdx === idx;
              return (
                <button
                  key={st.id}
                  onClick={() => setArchIdx(idx)}
                  className={`dev-suite-stage-btn ${isActive ? "is-active" : ""}`}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: accent }}>STAGE 0{idx + 1}</div>
                  <div className="dev-suite-stage-name" style={{ fontWeight: 600, fontSize: "0.82rem", margin: "3px 0" }}>{st.node}</div>
                </button>
              );
            })}
          </div>

          <div className="dev-suite-content-card" style={{ borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: accent, fontWeight: 600 }}>
                ⚡ {stage.node} ({stage.tech})
              </span>
              <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", opacity: 0.5 }}>STATUS: ACTIVE</span>
            </div>
            <p className="dev-suite-answer" style={{ margin: "0 0 10px 0", fontSize: "0.88rem", lineHeight: 1.5 }}>
              {stage.simple}
            </p>
            <div className="dev-suite-stat-tag" style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", padding: "6px 10px", borderRadius: 6 }}>
              🛠️ SYSTEM SPEC: {stage.techDetail}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE UI PLAYGROUND */}
      {activeTab === "ui" && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setIsNeonGlow(!isNeonGlow)}
              className={`dev-suite-toggle-btn ${isNeonGlow ? "is-active" : ""}`}
              style={{
                padding: "7px 14px",
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.76rem",
              }}
            >
              {isNeonGlow ? "⚡ NEON GLOW: ON" : "⚪ NEON GLOW: OFF"}
            </button>

            <button
              onClick={() => setIsGlass(!isGlass)}
              className={`dev-suite-toggle-btn ${isGlass ? "is-active" : ""}`}
              style={{
                padding: "7px 14px",
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.76rem",
              }}
            >
              {isGlass ? "🔮 GLASSMORPHISM: ON" : "⬛ GLASSMORPHISM: OFF"}
            </button>

            <button
              onClick={handleRunSpeedTest}
              className="dev-suite-test-btn"
              style={{
                padding: "7px 14px",
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.76rem",
                fontWeight: 600,
              }}
            >
              {isSpeedTest ? "🚀 TESTING..." : "⚡ RUN LATENCY TEST"}
            </button>
          </div>

          <div
            className="dev-suite-preview-card"
            style={{
              borderRadius: 10,
              padding: 18,
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: accent }}>LIVE PREVIEW CARD</span>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", background: `color-mix(in oklab, ${accent} 15%, transparent)`, color: accent, padding: "3px 10px", borderRadius: 8 }}>
                {isSpeedTest ? "⚡ 0.04ms LATENCY" : "STATUS: RESPONSIVE"}
              </span>
            </div>
            <p className="dev-suite-answer" style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
              This miniature app card dynamically updates layout styles and performance tokens in real-time as you switch controls.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
