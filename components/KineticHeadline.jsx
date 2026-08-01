"use client";
import { useMemo } from "react";

const DEFAULT_ROLES = [
  "🚀 Computational Intelligence Researcher",
];

export default function KineticHeadline({ roles }) {
  const displayRole = useMemo(() => {
    if (Array.isArray(roles) && roles.length > 0) return roles[0];
    if (typeof roles === "string" && roles.trim() !== "") {
      const parsed = roles.split(",").map((r) => r.trim()).filter((r) => r.length > 0);
      if (parsed.length > 0) return parsed[0];
    }
    return DEFAULT_ROLES[0];
  }, [roles]);

  return (
    <div className="kinetic-headline" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span
        className="kinetic-headline__text"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.92)",
          letterSpacing: "0.05em",
        }}
      >
        {displayRole}
      </span>
    </div>
  );
}
