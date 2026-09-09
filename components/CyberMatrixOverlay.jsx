"use client";

import { useEffect, useState } from "react";

export default function CyberMatrixOverlay({ isActive, onClose }) {
  const [streamChars, setStreamChars] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    // Generate random falling matrix characters
    const chars = "01010101 GV-AI NEURAL KERNEL LIVERPOOL PYTORCH 294FPS UNITY 16MM LOG DA VINCI POSTGRES SHIFT 01".split(" ");
    setStreamChars(Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${(i * 4.2).toFixed(1)}%`,
      delay: `${(Math.random() * 3).toFixed(2)}s`,
      speed: `${(4 + Math.random() * 5).toFixed(1)}s`,
      char: chars[Math.floor(Math.random() * chars.length)],
    })));
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="matrix-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(0, 40, 10, 0.15) 0%, rgba(0, 10, 0, 0.65) 100%)",
        boxShadow: "inset 0 0 100px rgba(0, 255, 100, 0.3)",
      }}
    >
      <style>{`
        @keyframes scanlineAnim {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes rainAnim {
          0% { transform: translateY(-120%); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translateY(120vh); opacity: 0.1; }
        }
        .matrix-scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          background-size: 100% 3px, 6px 100%;
          opacity: 0.6;
        }
        .matrix-column {
          position: absolute;
          top: 0;
          font-family: var(--font-mono, monospace);
          font-size: 0.8rem;
          color: #39ff88;
          text-shadow: 0 0 8px #39ff88, 0 0 15px #00ff66;
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 4px;
          animation: rainAnim linear infinite;
        }
      `}</style>

      <div className="matrix-scanlines" />

      {streamChars.map((col) => (
        <div
          key={col.id}
          className="matrix-column"
          style={{
            left: col.left,
            animationDuration: col.speed,
            animationDelay: col.delay,
          }}
        >
          {col.char}
        </div>
      ))}

      {/* Cyber HUD Banner */}
      <div
        style={{
          position: "fixed",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "6px 18px",
          background: "rgba(0, 20, 10, 0.9)",
          border: "1px solid #39ff88",
          borderRadius: "20px",
          color: "#39ff88",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          letterSpacing: "1px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 0 20px rgba(57, 255, 136, 0.3)",
          pointerEvents: "auto",
        }}
      >
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#39ff88", boxShadow: "0 0 8px #39ff88" }} />
        <span>CYBER MATRIX ACTIVE // PRESS [~] OR [F2] TO TOGGLE</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#39ff88",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
