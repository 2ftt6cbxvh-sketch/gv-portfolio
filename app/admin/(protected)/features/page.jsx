"use client";
import { useEffect, useState } from "react";

const REQUIRED_FLAGS = [
  { key: "signature_intro", name: "Full-Screen Signature Scribble Intro", defaultEnabled: true },
  { key: "constellation_bg", name: "Landing Particle Constellation Canvas", defaultEnabled: true },
  { key: "kinetic_headline", name: "Landing Cyber Scramble Sub-Headline", defaultEnabled: true },
  { key: "status_pill", name: "Landing Status Indicator Pill", defaultEnabled: true },
  { key: "hotkey_hints", name: "Landing Keyboard Shortcut Hints ([1], [2], [3])", defaultEnabled: true },
  { key: "analyst_ticker", name: "Analyst Mode Data Ticker Ribbon", defaultEnabled: true },
  { key: "video_reel", name: "Editor Video Showreel Player", defaultEnabled: true },
];

export default function FeaturesAdminPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  // Feature specific configs
  const [signatureConfig, setSignatureConfig] = useState({
    text: "Ganesh Varma",
    accentColor: "#00f0ff",
    glowColor: "#00ffff",
  });

  const [statusPillConfig, setStatusPillConfig] = useState({
    status: "Available for Opportunities",
    location: "Liverpool, UK & India",
  });

  const [kineticConfig, setKineticConfig] = useState({
    rolesStr: "🎬 Video Director & Film Editor, 📊 Data Science & AI Architect, 💻 Full-Stack Software Engineer, 🚀 Computational Intelligence Researcher",
  });

  const [analystTickerConfig, setAnalystTickerConfig] = useState({
    itemsStr: "⚡ LIVE DATA STREAM, 📊 15+ DATASETS PROCESSED, 🧠 99.4% AI MODEL ACCURACY, 🔬 MRI BRAIN TUMOR CLASSIFICATION, 🎓 LIVERPOOL MSc RESEARCH, 📈 PYTHON / PYTORCH / SQL / POWER BI",
    accentColor: "#33c7b0",
    speedSec: "24",
  });

  const [videoConfig, setVideoConfig] = useState({
    url: "https://www.youtube.com/embed/dQw4w9WgWgXQ",
    title: "GV Creative Direction Reel",
    desc: "Selected cuts from 8 national BTech fests and stage productions.",
  });

  useEffect(() => {
    fetch("/api/admin/features")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Merge fetched flags with default flags schema
          const flagMap = new Map(data.map((f) => [f.key, f]));
          
          REQUIRED_FLAGS.forEach((req) => {
            if (!flagMap.has(req.key)) {
              flagMap.set(req.key, {
                key: req.key,
                name: req.name,
                enabled: req.defaultEnabled,
                metadata: "",
              });
            }
          });

          const mergedFlags = Array.from(flagMap.values());
          setFlags(mergedFlags);

          // Populate sub-configs from metadata
          const sigFlag = flagMap.get("signature_intro");
          if (sigFlag && sigFlag.metadata) {
            try {
              const parsed = typeof sigFlag.metadata === "string" ? JSON.parse(sigFlag.metadata) : sigFlag.metadata;
              setSignatureConfig({
                text: parsed.text || "Ganesh Varma",
                accentColor: parsed.accentColor || "#00f0ff",
                glowColor: parsed.glowColor || "#00ffff",
              });
            } catch (e) {}
          }

          const statusFlag = flagMap.get("status_pill");
          if (statusFlag && statusFlag.metadata) {
            try {
              const parsed = typeof statusFlag.metadata === "string" ? JSON.parse(statusFlag.metadata) : statusFlag.metadata;
              setStatusPillConfig({
                status: parsed.status || "Available for Opportunities",
                location: parsed.location || "Liverpool, UK & India",
              });
            } catch (e) {}
          }

          const kineticFlag = flagMap.get("kinetic_headline");
          if (kineticFlag && kineticFlag.metadata) {
            try {
              const parsed = typeof kineticFlag.metadata === "string" ? JSON.parse(kineticFlag.metadata) : kineticFlag.metadata;
              if (parsed.roles && Array.isArray(parsed.roles)) {
                setKineticConfig({ rolesStr: parsed.roles.join(", ") });
              } else if (typeof parsed === "string") {
                setKineticConfig({ rolesStr: parsed });
              }
            } catch (e) {
              setKineticConfig({ rolesStr: kineticFlag.metadata });
            }
          }

          const analystFlag = flagMap.get("analyst_ticker");
          if (analystFlag && analystFlag.metadata) {
            try {
              const parsed = typeof analystFlag.metadata === "string" ? JSON.parse(analystFlag.metadata) : analystFlag.metadata;
              setAnalystTickerConfig({
                itemsStr: Array.isArray(parsed.items) ? parsed.items.join(", ") : parsed.itemsStr || analystTickerConfig.itemsStr,
                accentColor: parsed.accentColor || "#33c7b0",
                speedSec: String(parsed.speedSec || "24"),
              });
            } catch (e) {}
          }

          const videoFlag = flagMap.get("video_reel");
          if (videoFlag && videoFlag.metadata) {
            try {
              const parsed = typeof videoFlag.metadata === "string" ? JSON.parse(videoFlag.metadata) : videoFlag.metadata;
              setVideoConfig({
                url: parsed.url || "",
                title: parsed.title || "",
                desc: parsed.desc || "",
              });
            } catch (e) {}
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (key, currentEnabled) => {
    setSavingKey(key);
    try {
      const newEnabled = !currentEnabled;
      const targetFlag = flags.find((f) => f.key === key);

      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          enabled: newEnabled,
          metadata: targetFlag?.metadata || "",
        }),
      });

      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.key === key ? { ...f, enabled: newEnabled } : f))
        );
      }
    } catch (e) {
      alert("Failed to update feature flag.");
    }
    setSavingKey(null);
  };

  const handleSaveSignatureMetadata = async () => {
    setSavingKey("signature_intro");
    try {
      const currentFlag = flags.find((f) => f.key === "signature_intro");
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "signature_intro",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(signatureConfig),
        }),
      });
      if (res.ok) {
        alert("Signature Intro settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save signature intro settings.");
    }
    setSavingKey(null);
  };

  const handleSaveStatusPillMetadata = async () => {
    setSavingKey("status_pill");
    try {
      const currentFlag = flags.find((f) => f.key === "status_pill");
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "status_pill",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(statusPillConfig),
        }),
      });
      if (res.ok) {
        alert("Status pill settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save status pill settings.");
    }
    setSavingKey(null);
  };

  const handleSaveKineticMetadata = async () => {
    setSavingKey("kinetic_headline");
    try {
      const rolesArray = kineticConfig.rolesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const currentFlag = flags.find((f) => f.key === "kinetic_headline");

      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "kinetic_headline",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify({ roles: rolesArray }),
        }),
      });
      if (res.ok) {
        alert("Kinetic headline roles updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save kinetic headline settings.");
    }
    setSavingKey(null);
  };

  const handleSaveAnalystTickerMetadata = async () => {
    setSavingKey("analyst_ticker");
    try {
      const itemsArray = analystTickerConfig.itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const currentFlag = flags.find((f) => f.key === "analyst_ticker");

      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "analyst_ticker",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify({
            items: itemsArray,
            accentColor: analystTickerConfig.accentColor,
            speedSec: analystTickerConfig.speedSec,
          }),
        }),
      });
      if (res.ok) {
        alert("Analyst Data Ticker settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save Analyst Data Ticker settings.");
    }
    setSavingKey(null);
  };

  const handleSaveVideoMetadata = async () => {
    setSavingKey("video_reel");
    try {
      const currentFlag = flags.find((f) => f.key === "video_reel");
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "video_reel",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(videoConfig),
        }),
      });
      if (res.ok) {
        alert("Showreel video settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save showreel settings.");
    }
    setSavingKey(null);
  };

  if (loading) {
    return <div style={{ padding: 24, color: "var(--a-muted)" }}>Loading creative feature flags...</div>;
  }

  return (
    <div style={{ maxWidth: 840 }}>
      <div className="admin-page-header">
        <h1>Creative Feature Control &amp; Live Customization</h1>
        <p>Turn landing page &amp; mode features ON/OFF, and edit live content directly from admin.</p>
      </div>

      {/* Feature Toggles List */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Landing Page &amp; Mode Feature Toggles</h3>

        {flags.map((flag) => (
          <div
            key={flag.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--a-border)",
            }}
          >
            <div>
              <strong style={{ fontSize: 15, display: "block" }}>{flag.name || flag.key}</strong>
              <span style={{ fontSize: 12, color: "var(--a-muted)" }}>
                Key: <code>{flag.key}</code>
              </span>
            </div>

            <button
              type="button"
              className={`admin-btn ${flag.enabled !== false ? "admin-btn--primary" : ""}`}
              onClick={() => handleToggle(flag.key, flag.enabled !== false)}
              disabled={savingKey === flag.key}
            >
              {savingKey === flag.key
                ? "Saving..."
                : flag.enabled !== false
                ? "ENABLED (Click to Disable)"
                : "DISABLED (Click to Enable)"}
            </button>
          </div>
        ))}
      </div>

      {/* 0. Signature Intro Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>✍️ Signature Scribble Intro Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the signature intro text, stroke accent, and particle glow colors.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Signature Name / Text
            </label>
            <input
              type="text"
              className="admin-input"
              value={signatureConfig.text}
              onChange={(e) => setSignatureConfig({ ...signatureConfig, text: e.target.value })}
              placeholder="e.g. Ganesh Varma"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Stroke Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={signatureConfig.accentColor.startsWith("#") && signatureConfig.accentColor.length === 7 ? signatureConfig.accentColor : "#00f0ff"}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, accentColor: e.target.value })}
                  style={{ width: 40, height: 38, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent", padding: 2 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={signatureConfig.accentColor}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, accentColor: e.target.value })}
                  placeholder="#00f0ff"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Particle Glow Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={signatureConfig.glowColor.startsWith("#") && signatureConfig.glowColor.length === 7 ? signatureConfig.glowColor : "#00ffff"}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, glowColor: e.target.value })}
                  style={{ width: 40, height: 38, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent", padding: 2 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={signatureConfig.glowColor}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, glowColor: e.target.value })}
                  placeholder="#00ffff"
                />
              </div>
            </div>
          </div>

          {/* Live Mini Preview Box */}
          <div style={{ marginTop: 12, padding: 16, background: "#06050a", border: "1px solid var(--a-border)", borderRadius: 8, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--a-muted)", display: "block", marginBottom: 8 }}>
              LIVE SIGNATURE INTRO PREVIEW
            </span>
            <div style={{ fontSize: 32, fontFamily: "'Great Vibes', cursive", color: signatureConfig.accentColor, textShadow: `0 0 10px ${signatureConfig.glowColor}` }}>
              {signatureConfig.text || "Ganesh Varma"}
            </div>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveSignatureMetadata}
            disabled={savingKey === "signature_intro"}
          >
            {savingKey === "signature_intro" ? "Saving..." : "Save Signature Settings"}
          </button>
        </div>
      </div>

      {/* 1. Status Pill Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>🟢 Status Pill Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the live status message and location shown on the landing page pill.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Status Text
            </label>
            <input
              type="text"
              className="admin-input"
              value={statusPillConfig.status}
              onChange={(e) => setStatusPillConfig({ ...statusPillConfig, status: e.target.value })}
              placeholder="e.g. Available for Opportunities"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Location Text
            </label>
            <input
              type="text"
              className="admin-input"
              value={statusPillConfig.location}
              onChange={(e) => setStatusPillConfig({ ...statusPillConfig, location: e.target.value })}
              placeholder="e.g. Liverpool, UK &amp; India"
            />
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveStatusPillMetadata}
            disabled={savingKey === "status_pill"}
          >
            {savingKey === "status_pill" ? "Saving..." : "Save Status Pill Settings"}
          </button>
        </div>
      </div>

      {/* 2. Kinetic Roles Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>⚡ Kinetic Headline Roles Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Comma-separated list of roles that scramble sequentially under your name.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Roles (Comma Separated)
            </label>
            <textarea
              className="admin-input"
              rows={3}
              value={kineticConfig.rolesStr}
              onChange={(e) => setKineticConfig({ rolesStr: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveKineticMetadata}
            disabled={savingKey === "kinetic_headline"}
          >
            {savingKey === "kinetic_headline" ? "Saving..." : "Save Kinetic Roles"}
          </button>
        </div>
      </div>

      {/* 3. Analyst Data Ticker Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>📊 Analyst Mode Data Ticker Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the scrolling ticker items, accent color, and scroll animation duration.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Ticker Items (Comma Separated)
            </label>
            <textarea
              className="admin-input"
              rows={3}
              value={analystTickerConfig.itemsStr}
              onChange={(e) => setAnalystTickerConfig({ ...analystTickerConfig, itemsStr: e.target.value })}
              placeholder="e.g. ⚡ LIVE DATA STREAM, 📊 15+ DATASETS PROCESSED, 🧠 99.4% ML ACCURACY"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Ticker Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={analystTickerConfig.accentColor.startsWith("#") && analystTickerConfig.accentColor.length === 7 ? analystTickerConfig.accentColor : "#33c7b0"}
                  onChange={(e) => setAnalystTickerConfig({ ...analystTickerConfig, accentColor: e.target.value })}
                  style={{ width: 40, height: 38, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent", padding: 2 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={analystTickerConfig.accentColor}
                  onChange={(e) => setAnalystTickerConfig({ ...analystTickerConfig, accentColor: e.target.value })}
                  placeholder="#33c7b0"
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Scroll Speed</label>
                <span style={{ fontSize: 12, color: "#33c7b0", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  ⚡ {analystTickerConfig.speedSec}s / cycle
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={parseInt(analystTickerConfig.speedSec, 10) || 24}
                onChange={(e) => setAnalystTickerConfig({ ...analystTickerConfig, speedSec: e.target.value })}
                style={{ width: "100%", height: 38, cursor: "pointer", accentColor: "#33c7b0" }}
              />
            </div>
          </div>

          {/* Live Mini Preview Box */}
          <div style={{ marginTop: 12, padding: 12, background: "#06050a", border: `1px solid ${analystTickerConfig.accentColor}`, borderRadius: 8, overflow: "hidden", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: analystTickerConfig.accentColor }}>
            <span style={{ fontSize: 10, opacity: 0.6, display: "block", marginBottom: 6 }}>LIVE DATA TICKER PREVIEW (SPEED: {analystTickerConfig.speedSec}s)</span>
            <div style={{ display: "inline-flex", gap: 20 }}>
              {analystTickerConfig.itemsStr.split(",").slice(0, 3).map((item, idx) => (
                <span key={idx}>⚡ {item.trim()} //</span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveAnalystTickerMetadata}
            disabled={savingKey === "analyst_ticker"}
          >
            {savingKey === "analyst_ticker" ? "Saving..." : "Save Analyst Ticker Settings"}
          </button>
        </div>
      </div>

      {/* 4. Video Showreel Config */}
      <div className="admin-card">
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>🎬 Editor Mode Video Showreel Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the embed YouTube URL, title, and description for the video player.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              YouTube Embed / Video URL
            </label>
            <input
              type="text"
              className="admin-input"
              value={videoConfig.url}
              onChange={(e) => setVideoConfig({ ...videoConfig, url: e.target.value })}
              placeholder="e.g. https://www.youtube.com/embed/YOUR_VIDEO_ID"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Showreel Title
            </label>
            <input
              type="text"
              className="admin-input"
              value={videoConfig.title}
              onChange={(e) => setVideoConfig({ ...videoConfig, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Showreel Description
            </label>
            <textarea
              className="admin-input"
              rows={2}
              value={videoConfig.desc}
              onChange={(e) => setVideoConfig({ ...videoConfig, desc: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveVideoMetadata}
            disabled={savingKey === "video_reel"}
          >
            {savingKey === "video_reel" ? "Saving..." : "Save Showreel Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
