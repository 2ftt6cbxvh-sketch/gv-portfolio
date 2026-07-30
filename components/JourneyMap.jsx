"use client";
import { useState } from "react";

/**
 * Interactive Academic & Career Journey Map Timeline.
 * Displays milestone progression (BTech -> MSc Liverpool) with interactive tag highlights.
 */
export default function JourneyMap({ milestones = [], accent = "var(--color-accent)" }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="journey-map-card">
      <div className="journey-map-header">
        <div>
          <span className="label-mono journey-map-badge">ACADEMIC & CAREER ROADMAP</span>
          <h3 className="journey-map-title">Journey & Qualifications</h3>
        </div>
      </div>

      <div className="journey-timeline">
        {milestones.map((m, i) => {
          const isExpanded = expandedId === m.id || (expandedId === null && i === 0);
          return (
            <div
              key={m.id}
              className={`journey-node ${isExpanded ? "is-expanded" : ""}`}
              onClick={() => setExpandedId(isExpanded ? null : m.id)}
            >
              <div className="journey-node-line">
                <div className="journey-node-dot" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }} />
              </div>

              <div className="journey-node-content">
                <div className="journey-node-top">
                  <span className="journey-node-year">{m.year}</span>
                  {m.location && <span className="journey-node-location">{m.location}</span>}
                </div>

                <h4 className="journey-node-heading">{m.title}</h4>
                <div className="journey-node-inst" style={{ color: accent }}>{m.institution}</div>

                {m.description && (
                  <p className="journey-node-desc">{m.description}</p>
                )}

                {m.tags && m.tags.length > 0 && (
                  <div className="journey-node-tags">
                    {m.tags.map((t, idx) => (
                      <span className="tag" key={idx}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
