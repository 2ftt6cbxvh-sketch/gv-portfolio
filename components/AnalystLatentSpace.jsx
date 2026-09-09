"use client";

import { useEffect, useRef, useState, useMemo } from "react";

const PROJECTIONS = ["t-SNE", "UMAP", "PCA", "Cosine Sim"];

export default function AnalystLatentSpace({ data, metadata }) {
  const [activeProjection, setActiveProjection] = useState("t-SNE");
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const canvasRef = useRef(null);
  const rotRef = useRef({ x: 0.2, y: 0.4 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Build high-dimensional nodes dynamically from database projects, papers, and skills (ZERO HARDCODING)
  const nodes = useMemo(() => {
    const rawNodes = [];

    // Map projects
    (data?.projects || []).forEach((p, idx) => {
      rawNodes.push({
        id: `proj-${p.id || idx}`,
        name: p.title || p.name || "AI Project",
        category: "Project",
        color: "#33c7b0",
        details: p.description || "Deep Learning Neural Architecture",
        metric: p.tags?.join(" • ") || "PyTorch / Computer Vision",
        coords: {
          "t-SNE": { x: Math.sin(idx * 1.5) * 160 + (idx % 2) * 30, y: Math.cos(idx * 1.3) * 120, z: Math.sin(idx * 0.8) * 140 },
          "UMAP": { x: (idx - 3) * 45, y: Math.sin(idx * 2) * 140, z: Math.cos(idx * 1.8) * 130 },
          "PCA": { x: (idx - 4) * 60, y: (idx % 3 - 1) * 70, z: ((idx * 37) % 100 - 50) },
          "Cosine Sim": { x: Math.cos(idx * 1.1) * 150, y: Math.sin(idx * 1.1) * 150, z: (idx * 20 - 50) },
        },
      });
    });

    // Map research papers
    (data?.papers || []).forEach((paper, idx) => {
      rawNodes.push({
        id: `paper-${paper.id || idx}`,
        name: paper.title || "Research Publication",
        category: "Paper",
        color: "#a56ce8",
        details: paper.abstract || paper.publisher || "Academic Publication",
        metric: paper.year ? `Year: ${paper.year} | ${paper.doi || "Peer Reviewed"}` : "Research Thesis",
        coords: {
          "t-SNE": { x: Math.cos(idx * 2.1) * 170 - 40, y: Math.sin(idx * 1.7) * 130, z: Math.cos(idx * 1.2) * 160 },
          "UMAP": { x: Math.sin(idx * 1.4) * 150 + 60, y: Math.cos(idx * 2.2) * 120, z: (idx * 40 - 80) },
          "PCA": { x: (idx * 50 - 80), y: (idx * 40 - 60), z: Math.sin(idx) * 100 },
          "Cosine Sim": { x: Math.sin(idx * 1.8) * 160, y: Math.cos(idx * 1.8) * 160, z: Math.sin(idx * 0.9) * 120 },
        },
      });
    });

    // Map core skills
    const skillGroups = data?.skills || [];
    skillGroups.forEach((group, gIdx) => {
      (group.bars || []).slice(0, 4).forEach((skill, sIdx) => {
        rawNodes.push({
          id: `skill-${gIdx}-${sIdx}`,
          name: skill.name,
          category: "Skill Tensor",
          color: "#39ff88",
          details: `Proficiency Vector: ${skill.level || 90}%`,
          metric: group.name || "Technical Domain",
          coords: {
            "t-SNE": { x: Math.sin((gIdx + sIdx) * 1.2) * 140, y: Math.cos((gIdx + sIdx) * 1.4) * 140, z: Math.sin(sIdx * 2.3) * 130 },
            "UMAP": { x: Math.cos(sIdx * 1.9) * 130 - 30, y: (gIdx * 50 - 60), z: Math.sin(gIdx * 1.5) * 140 },
            "PCA": { x: (sIdx * 45 - 70), y: (gIdx * 50 - 50), z: (sIdx * 30 - 40) },
            "Cosine Sim": { x: Math.cos(gIdx * 2 + sIdx) * 140, y: Math.sin(gIdx * 2 + sIdx) * 140, z: (sIdx * 35 - 50) },
          },
        });
      });
    });

    return rawNodes;
  }, [data]);

  // 3D Canvas Projection Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Draw faint background grid circles
      ctx.strokeStyle = "rgba(51, 199, 176, 0.08)";
      ctx.lineWidth = 1;
      for (let r = 80; r <= 240; r += 80) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Smooth auto-orbit when not dragging
      if (!isDraggingRef.current) {
        rotRef.current.y += 0.003;
      }

      const cosX = Math.cos(rotRef.current.x);
      const sinX = Math.sin(rotRef.current.x);
      const cosY = Math.cos(rotRef.current.y);
      const sinY = Math.sin(rotRef.current.y);

      // Project each 3D point to 2D screen coordinates
      const projected = nodes.map((node) => {
        const raw = node.coords[activeProjection] || { x: 0, y: 0, z: 0 };
        // Rotate Y
        const x1 = raw.x * cosY + raw.z * sinY;
        const z1 = -raw.x * sinY + raw.z * cosY;
        // Rotate X
        const y1 = raw.y * cosX - z1 * sinX;
        const z2 = raw.y * sinX + z1 * cosX;

        const fov = 400;
        const scale = fov / (fov + z2 + 250);
        const screenX = cx + x1 * scale;
        const screenY = cy + y1 * scale;

        return { ...node, screenX, screenY, scale, depth: z2 };
      });

      // Sort by depth for correct 3D z-ordering
      projected.sort((a, b) => b.depth - a.depth);

      // Draw neural affinity vector lines between close nodes
      ctx.strokeStyle = "rgba(51, 199, 176, 0.12)";
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].screenX - projected[j].screenX;
          const dy = projected[i].screenY - projected[j].screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(projected[i].screenX, projected[i].screenY);
            ctx.lineTo(projected[j].screenX, projected[j].screenY);
            ctx.stroke();
          }
        }
      }

      // Draw projected nodes
      projected.forEach((p) => {
        const isSelected = selectedNode?.id === p.id;
        const isHovered = hoveredNode?.id === p.id;
        const radius = Math.max(3, (isSelected || isHovered ? 8 : 4.5) * p.scale);

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isSelected || isHovered ? 16 : 6;

        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Node label on hover
        if (isSelected || isHovered) {
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 4;
          ctx.fillText(p.name, p.screenX + 10, p.screenY - 8);
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [nodes, activeProjection, selectedNode, hoveredNode]);

  // Pointer Drag Interaction
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    rotRef.current.y += dx * 0.008;
    rotRef.current.x = Math.max(-0.8, Math.min(0.8, rotRef.current.x + dy * 0.008));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className="analyst-latent-space"
      style={{
        margin: "40px auto",
        maxWidth: "960px",
        width: "100%",
        background: "rgba(10, 18, 20, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(51, 199, 176, 0.25)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: "#33c7b0", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              🌌 High-Dimensional Latent Space Galaxy
            </span>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(51, 199, 176, 0.15)", color: "#33c7b0" }}>
              {nodes.length} Mathematical Tensors
            </span>
          </div>
          <h3 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", color: "#fff", fontWeight: 700 }}>
            Interactive Manifold & Embedding Projection Space
          </h3>
        </div>

        {/* Projection Switchers */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PROJECTIONS.map((proj) => (
            <button
              key={proj}
              onClick={() => setActiveProjection(proj)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: activeProjection === proj ? 700 : 500,
                cursor: "pointer",
                background: activeProjection === proj ? "rgba(51, 199, 176, 0.25)" : "rgba(255, 255, 255, 0.04)",
                color: activeProjection === proj ? "#33c7b0" : "var(--color-fg-muted)",
                border: activeProjection === proj ? "1px solid #33c7b0" : "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.15s ease",
              }}
            >
              {proj}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        style={{
          position: "relative",
          width: "100%",
          height: "380px",
          borderRadius: "12px",
          overflow: "hidden",
          background: "radial-gradient(ellipse at center, #071518 0%, #03080a 100%)",
          border: "1px solid rgba(51, 199, 176, 0.15)",
          cursor: "grab",
        }}
      >
        <canvas ref={canvasRef} width={800} height={380} style={{ width: "100%", height: "100%", display: "block" }} />

        {/* Floating Instruction Hint */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 16,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-mono, monospace)",
            pointerEvents: "none",
          }}
        >
          DRAG TO ROTATE 3D MANIFOLD // {activeProjection.toUpperCase()} CLUSTERING
        </div>
      </div>

      {/* Selected / Hovered Node Card */}
      {selectedNode && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(51, 199, 176, 0.08)",
            border: "1px solid rgba(51, 199, 176, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{selectedNode.name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-fg-muted)", marginTop: 2 }}>{selectedNode.details}</div>
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: "#33c7b0" }}>
            {selectedNode.metric}
          </span>
        </div>
      )}
    </div>
  );
}
