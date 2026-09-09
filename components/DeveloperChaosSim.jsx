"use client";

import { useState, useRef, useEffect } from "react";

const NODES = [
  { id: "client", label: "Client Browser", sub: "Global Visitors", x: 80, y: 150, color: "#39ff88" },
  { id: "edge", label: "Cloudflare Edge", sub: "DDoS Shield & CDN", x: 230, y: 150, color: "#00f0ff" },
  { id: "nextjs", label: "Next.js 14 SSR", sub: "Node.js Runtime", x: 390, y: 150, color: "#ffffff" },
  { id: "cache", label: "In-Memory Cache", sub: "1.5s Zero-IO Shield", x: 550, y: 90, color: "#ffaa00" },
  { id: "postgres", label: "PostgreSQL Pool", sub: "Prisma & Neon", x: 550, y: 210, color: "#33c7b0" },
  { id: "telegram", label: "Telegram / AI", sub: "Webhooks & Gemini", x: 710, y: 150, color: "#a56ce8" },
];

export default function DeveloperChaosSim() {
  const [trafficRps, setTrafficRps] = useState(150); // 10 to 50,000 req/s
  const [chaosMode, setChaosMode] = useState("normal"); // "normal" | "db_down" | "ai_timeout" | "cache_shield"
  const canvasRef = useRef(null);
  const packetsRef = useRef([]);

  // Calculate dynamic telemetry metrics based on state
  const isCacheShield = chaosMode === "cache_shield" || trafficRps > 2000;
  const isDbDown = chaosMode === "db_down";
  const isAiTimeout = chaosMode === "ai_timeout";

  const cacheHitRatio = isDbDown ? "100.0%" : isCacheShield ? "99.4%" : trafficRps > 500 ? "94.2%" : "42.0%";
  const p99Latency = isDbDown ? "1.2ms (Fallback)" : isAiTimeout ? "2.5s (Race-Win)" : isCacheShield ? "0.8ms" : `${Math.round(8 + (trafficRps / 1000) * 1.5)}ms`;
  const activeDbConns = isDbDown ? 0 : isCacheShield ? 2 : Math.min(20, Math.round(3 + (trafficRps / 2500) * 8));

  // Packet animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    // Spawn packets proportionally to traffic
    const spawnInterval = setInterval(() => {
      const packetCount = Math.max(1, Math.min(12, Math.round(trafficRps / 800)));
      for (let i = 0; i < packetCount; i++) {
        packetsRef.current.push({
          x: 80,
          y: 150,
          targetIdx: 1,
          progress: 0,
          speed: 0.02 + Math.min(0.08, (trafficRps / 10000) * 0.05),
          routeToCache: isCacheShield || isDbDown,
        });
      }
    }, 120);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw Connection Paths between Nodes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;

      // Client -> Edge -> Nextjs
      ctx.beginPath();
      ctx.moveTo(80, 150);
      ctx.lineTo(230, 150);
      ctx.lineTo(390, 150);
      ctx.stroke();

      // Nextjs -> Cache
      ctx.beginPath();
      ctx.moveTo(390, 150);
      ctx.lineTo(550, 90);
      ctx.stroke();

      // Nextjs -> Postgres
      ctx.beginPath();
      ctx.moveTo(390, 150);
      ctx.lineTo(550, 210);
      ctx.stroke();

      // Nextjs -> Telegram
      ctx.beginPath();
      ctx.moveTo(390, 150);
      ctx.lineTo(710, 150);
      ctx.stroke();

      // Update & Draw Packets
      ctx.fillStyle = isDbDown ? "#ff3366" : isCacheShield ? "#ffaa00" : "#39ff88";
      for (let i = packetsRef.current.length - 1; i >= 0; i--) {
        const p = packetsRef.current[i];
        p.progress += p.speed;

        let startX, startY, endX, endY;
        if (p.targetIdx === 1) {
          startX = 80; startY = 150; endX = 230; endY = 150;
        } else if (p.targetIdx === 2) {
          startX = 230; startY = 150; endX = 390; endY = 150;
        } else {
          // Route to Cache or Postgres
          startX = 390; startY = 150;
          if (p.routeToCache) {
            endX = 550; endY = 90;
          } else {
            endX = 550; endY = 210;
          }
        }

        const currentX = startX + (endX - startX) * p.progress;
        const currentY = startY + (endY - startY) * p.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (p.progress >= 1) {
          if (p.targetIdx < 3) {
            p.targetIdx += 1;
            p.progress = 0;
          } else {
            packetsRef.current.splice(i, 1);
          }
        }
      }

      // Draw Architecture Nodes
      NODES.forEach((node) => {
        const isNodeDisabled = (node.id === "postgres" && isDbDown) || (node.id === "telegram" && isAiTimeout);
        const nodeColor = isNodeDisabled ? "#ff3366" : node.color;

        ctx.save();
        ctx.fillStyle = "rgba(18, 16, 26, 0.9)";
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = isNodeDisabled ? 2.5 : 1.5;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isNodeDisabled ? 16 : 8;

        // Node card box
        ctx.beginPath();
        ctx.roundRect(node.x - 65, node.y - 30, 130, 60, [8]);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y - 6);

        ctx.font = "9px monospace";
        ctx.fillStyle = isNodeDisabled ? "#ff3366" : "rgba(255, 255, 255, 0.55)";
        ctx.fillText(isNodeDisabled ? "CIRCUIT BREAKER" : node.sub, node.x, node.y + 12);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animId);
    };
  }, [trafficRps, isCacheShield, isDbDown, isAiTimeout]);

  return (
    <div
      className="developer-chaos-sim"
      style={{
        margin: "40px auto",
        maxWidth: "960px",
        width: "100%",
        background: "rgba(14, 18, 16, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(57, 255, 136, 0.25)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: "#39ff88", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              🕹️ Distributed Architecture Chaos Simulator
            </span>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(57, 255, 136, 0.15)", color: "#39ff88" }}>
              Live System Pipeline
            </span>
          </div>
          <h3 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", color: "#fff", fontWeight: 700 }}>
            Fault-Tolerant Microservices & Zero-Overhead Caching
          </h3>
        </div>

        {/* Live Metrics HUD */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "2px solid #39ff88" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--color-fg-muted)" }}>Throughput</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#39ff88", fontFamily: "var(--font-mono, monospace)" }}>
              {trafficRps.toLocaleString()} req/s
            </div>
          </div>
          <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "2px solid #00f0ff" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--color-fg-muted)" }}>p99 Latency</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00f0ff", fontFamily: "var(--font-mono, monospace)" }}>
              {p99Latency}
            </div>
          </div>
          <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "2px solid #ffaa00" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--color-fg-muted)" }}>Cache Hit Ratio</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffaa00", fontFamily: "var(--font-mono, monospace)" }}>
              {cacheHitRatio}
            </div>
          </div>
          <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "2px solid #33c7b0" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--color-fg-muted)" }}>Postgres Pool</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#33c7b0", fontFamily: "var(--font-mono, monospace)" }}>
              {activeDbConns} / 20
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Packet Flow Canvas */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "300px",
          borderRadius: "12px",
          overflow: "hidden",
          background: "radial-gradient(ellipse at center, #0a1410 0%, #030805 100%)",
          border: "1px solid rgba(57, 255, 136, 0.15)",
        }}
      >
        <canvas ref={canvasRef} width={800} height={300} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Chaos Control Deck */}
      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        {/* Traffic Slider */}
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--color-fg-muted)", marginBottom: 6 }}>
            <span>Traffic Load Pressure:</span>
            <span style={{ color: "#39ff88", fontFamily: "var(--font-mono, monospace)", fontWeight: 700 }}>{trafficRps.toLocaleString()} Requests / Sec</span>
          </div>
          <input
            type="range"
            min="10"
            max="25000"
            step="100"
            value={trafficRps}
            onChange={(e) => setTrafficRps(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: "#39ff88" }}
          />
        </div>

        {/* Chaos Injection Triggers */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setChaosMode(chaosMode === "cache_shield" ? "normal" : "cache_shield")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              background: chaosMode === "cache_shield" ? "rgba(255, 170, 0, 0.3)" : "rgba(255, 255, 255, 0.04)",
              color: chaosMode === "cache_shield" ? "#ffaa00" : "var(--color-fg-muted)",
              border: chaosMode === "cache_shield" ? "1px solid #ffaa00" : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            🛡️ {chaosMode === "cache_shield" ? "Cache Shield Active" : "Engage In-Memory Cache"}
          </button>

          <button
            onClick={() => setChaosMode(chaosMode === "db_down" ? "normal" : "db_down")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              background: chaosMode === "db_down" ? "rgba(255, 51, 102, 0.3)" : "rgba(255, 255, 255, 0.04)",
              color: chaosMode === "db_down" ? "#ff3366" : "var(--color-fg-muted)",
              border: chaosMode === "db_down" ? "1px solid #ff3366" : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            💣 {chaosMode === "db_down" ? "DB Pool Offline (Circuit Open)" : "Simulate DB Overload"}
          </button>

          <button
            onClick={() => setChaosMode("normal")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.06)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            ↺ Reset Normal
          </button>
        </div>
      </div>
    </div>
  );
}
