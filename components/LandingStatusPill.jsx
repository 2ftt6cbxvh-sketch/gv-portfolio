"use client";

import { useEffect, useState } from "react";

export default function LandingStatusPill({ status, location }) {
  const [times, setTimes] = useState({ ist: "", gmt: "", est: "" });

  useEffect(() => {
    function updateClocks() {
      const now = new Date();
      const istStr = now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
      const gmtStr = now.toLocaleTimeString("en-US", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false });
      const estStr = now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false });

      setTimes({ ist: istStr, gmt: gmtStr, est: estStr });
    }

    updateClocks();
    const interval = setInterval(updateClocks, 10000); // update every 10s

    // Trigger Vercel Edge Function Warmup in background
    fetch("/api/public/warmup").catch(() => null);

    return () => clearInterval(interval);
  }, []);

  const statusText = status || "Available for Opportunities";

  return (
    <div
      className="landing-status-pill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        padding: "6px 16px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 999,
        fontSize: "0.78rem",
        fontFamily: "var(--font-mono)",
        color: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
      }}
    >
      <span className="landing-status-pill__dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 10px #00ff88" }} />
      <span className="landing-status-pill__text" style={{ fontWeight: 600 }}>{statusText}</span>

      <span style={{ opacity: 0.3 }}>|</span>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.75)" }}>
        <span>🇮🇳 IST {times.ist || "--:--"}</span>
        <span style={{ opacity: 0.25 }}>•</span>
        <span>🇬🇧 GMT {times.gmt || "--:--"}</span>
        <span style={{ opacity: 0.25 }}>•</span>
        <span>🇺🇸 EST {times.est || "--:--"}</span>
      </div>
    </div>
  );
}
