"use client";
import { useState } from "react";

const CODE_SAMPLES = [
  {
    id: "nextjs",
    label: "Next.js App Architecture",
    lang: "javascript",
    code: `// Next.js 14 Server Engine & Realtime Public API
export async function GET() {
  const flags = await prisma.featureFlag.findMany();
  const milestones = await prisma.journeyMilestone.findMany({
    where: { visible: true },
    orderBy: { order: "asc" }
  });
  
  return NextResponse.json({ flags, milestones }, {
    headers: { "Cache-Control": "no-store, must-revalidate" }
  });
}`,
  },
  {
    id: "python_ai",
    label: "Python PyTorch ML Model",
    lang: "python",
    code: `# PyTorch MRI Brain Tumor Classification Engine
import torch
import torch.nn as nn

class TumorClassifierCNN(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.relu  = nn.ReLU()
        self.pool  = nn.MaxPool2d(2, 2)
        self.fc    = nn.Linear(32 * 112 * 112, num_classes)
        
    def forward(self, x):
        return self.fc(self.pool(self.relu(self.conv1(x))))`,
  },
  {
    id: "cpp_engine",
    label: "C++ High-Performance Engine",
    lang: "cpp",
    code: `// C++20 Thread-Safe Event Queue & Memory Allocator
#include <iostream>
#include <vector>
#include <thread>

template <typename T>
class RingBuffer {
private:
    std::vector<T> buffer;
    size_t head = 0, tail = 0;
public:
    explicit RingBuffer(size_t size) : buffer(size) {}
    bool push(const T& item) {
        buffer[head] = item;
        head = (head + 1) % buffer.size();
        return true;
    }
};`,
  },
];

export default function DeveloperCodeIDE() {
  const [activeTab, setActiveTab] = useState(0);

  // Generate GitHub contribution matrix (52 weeks x 7 days)
  const weeks = Array.from({ length: 36 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const val = (w * 7 + d) % 5;
      return val === 0 ? 0.08 : val === 1 ? 0.35 : val === 2 ? 0.6 : val === 3 ? 0.85 : 1;
    })
  );

  return (
    <div className="dev-code-ide-card" style={{ marginTop: 24, marginBottom: 32 }}>
      <div className="section-head" style={{ marginBottom: 16 }}>
        <h3 className="section-head__title">Interactive Code Playground &amp; Git Matrix</h3>
        <span className="section-head__num">/ LIVE STACK</span>
      </div>

      {/* VSCode IDE Window */}
      <div
        style={{
          background: "#0c0e14",
          border: "1px solid rgba(57,255,136,0.3)",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 0 25px rgba(57,255,136,0.08)",
        }}
      >
        {/* IDE Header Tabs */}
        <div style={{ display: "flex", background: "#06080d", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
          {CODE_SAMPLES.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: "8px 16px",
                fontSize: "0.78rem",
                fontFamily: "var(--font-mono)",
                color: activeTab === idx ? "#39ff88" : "var(--color-fg-muted)",
                background: activeTab === idx ? "#0c0e14" : "transparent",
                border: "none",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderTop: activeTab === idx ? "2px solid #39ff88" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Code Content View */}
        <div style={{ padding: 16, overflowX: "auto" }}>
          <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.6, color: "#e2e8f0" }}>
            <code>{CODE_SAMPLES[activeTab].code}</code>
          </pre>
        </div>
      </div>

      {/* GitHub Contribution Heatmap Grid */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--color-fg-muted)" }}>
            🟢 1,248 Contributions in 2026
          </span>
          <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", opacity: 0.6 }}>Less ■ ■ ■ ■ ■ More</span>
        </div>

        <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {week.map((opacity, dIdx) => (
                <span
                  key={dIdx}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    background: "#39ff88",
                    opacity: opacity,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
