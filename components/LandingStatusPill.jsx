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
    <div className="landing-status-pill">
      <span className="landing-status-pill__dot" />
      <span className="landing-status-pill__text">{statusText}</span>

      <span className="landing-status-pill__sep">|</span>

      <div className="landing-status-pill__clocks">
        <span>🇮🇳 IST {times.ist || "--:--"}</span>
        <span className="landing-status-pill__dot-sep">•</span>
        <span>🇬🇧 GMT {times.gmt || "--:--"}</span>
        <span className="landing-status-pill__dot-sep">•</span>
        <span>🇺🇸 EST {times.est || "--:--"}</span>
      </div>
    </div>
  );
}
