"use client";
import { useState } from "react";

/**
 * Interactive SVG Skill Radar / Spider Chart for Data Analyst Mode.
 * Plots multi-axis technical skills with hover tooltips & glowing polygon fill.
 */
export default function AnalystRadarChart({ skills = [], accent = "#ff0f06" }) {
  const [activePoint, setActivePoint] = useState(null);

  // Fallback radar axes if skill array is small
  const defaultAxes = [
    { name: "Python / ML", level: 91 },
    { name: "SQL & Pipelines", level: 84 },
    { name: "Power BI & Viz", level: 82 },
    { name: "Statistics & Math", level: 90 },
    { name: "Model Building", level: 85 },
    { name: "Data Handling", level: 88 },
  ];

  // Flatten skills or use defaultAxes
  const axes = skills.length >= 3
    ? skills.flatMap(g => g.bars || []).slice(0, 6)
    : defaultAxes;

  const numAxes = axes.length;
  const size = 320;
  const center = size / 2;
  const maxRadius = 110;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to compute polar -> Cartesian (x, y)
  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = maxRadius * (valuePercent / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon points string for skill data
  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.level || 75);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="analyst-radar-card">
      <div className="analyst-radar-header">
        <h4 className="analyst-radar-title">Skill Matrix / Radar</h4>
        <span className="label-mono analyst-radar-tag">6-AXIS DATA EVAL</span>
      </div>

      <div className="analyst-radar-svg-wrap">
        <svg viewBox={`0 0 ${size} ${size}`} className="analyst-radar-svg">
          {/* Concentric grid circles / polygons */}
          {levels.map((lvl, idx) => {
            const gridPoints = axes
              .map((_, i) => {
                const { x, y } = getCoordinates(i, lvl * 100);
                return `${x},${y}`;
              })
              .join(" ");
            return (
              <polygon
                key={idx}
                points={gridPoints}
                className="analyst-radar-grid"
              />
            );
          })}

          {/* Radar Axes Lines */}
          {axes.map((axis, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="analyst-radar-axis"
              />
            );
          })}

          {/* Filled Skill Polygon */}
          <polygon
            points={polygonPoints}
            className="analyst-radar-polygon"
            style={{
              fill: `color-mix(in oklab, ${accent} 18%, transparent)`,
              stroke: accent,
            }}
          />

          {/* Interactive Node Points */}
          {axes.map((axis, i) => {
            const { x, y } = getCoordinates(i, axis.level || 75);
            const labelCoord = getCoordinates(i, 118);
            const isHovered = activePoint === i;

            return (
              <g key={i} className="analyst-radar-node-group">
                {/* Outer Axis Label */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`analyst-radar-axis-label ${isHovered ? "is-hovered" : ""}`}
                >
                  {axis.name}
                </text>

                {/* Node Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  className="analyst-radar-node"
                  style={{ fill: accent, stroke: "#000", strokeWidth: 2 }}
                  onMouseEnter={() => setActivePoint(i)}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Active Tooltip */}
        {activePoint !== null && (
          <div className="analyst-radar-tooltip" style={{ borderColor: accent }}>
            <strong>{axes[activePoint]?.name}</strong>
            <span>Level: {axes[activePoint]?.level || 80}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
