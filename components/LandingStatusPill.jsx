"use client";

export default function LandingStatusPill({ status, location }) {
  const statusText = status || "Available for Opportunities";
  const locationText = location || "Liverpool, UK & India";

  return (
    <div className="landing-status-pill">
      <span className="landing-status-pill__dot" />
      <span className="landing-status-pill__text">{statusText}</span>
      <span className="landing-status-pill__sep">•</span>
      <span className="landing-status-pill__loc">{locationText}</span>
    </div>
  );
}
