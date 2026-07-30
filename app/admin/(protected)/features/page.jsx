"use client";
import { useEffect, useState } from "react";

const REQUIRED_FLAGS = [
  { key: "constellation_bg", name: "Landing Particle Constellation Canvas", defaultEnabled: true },
  { key: "kinetic_headline", name: "Landing Cyber Scramble Sub-Headline", defaultEnabled: true },
  { key: "status_pill", name: "Landing Status Indicator Pill", defaultEnabled: true },
  { key: "hotkey_hints", name: "Landing Keyboard Shortcut Hints ([1], [2], [3])", defaultEnabled: true },
  { key: "video_reel", name: "Editor Video Showreel Player", defaultEnabled: true },
];

export default function FeaturesAdminPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  // Feature specific configs
  const [statusPillConfig, setStatusPillConfig] = useState({
    status: "Available for Opportunities",
    location: "Liverpool, UK & India",
  });

  const [kineticConfig, setKineticConfig] = useState({
    rolesStr: "🎬 Video Director & Film Editor, 📊 Data Science & AI Architect, 💻 Full-Stack Software Engineer, 🚀 Computational Intelligence Researcher",
  });

  const [videoConfig, setVideoConfig] = useState({
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
      const existingFlag = flags.find((f) => f.key === key);
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          enabled: !currentEnabled,
          metadata: existingFlag?.metadata || "",
        }),
      });
      if (res.ok) {
        setFlags(flags.map((f) => (f.key === key ? { ...f, enabled: !currentEnabled } : f)));
      }
    } catch (e) {
      alert("Failed to update feature toggle.");
    }
    setSavingKey(null);
  };

  const handleSaveStatusPill = async () => {
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
        alert("Landing status pill updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save status pill settings.");
    }
    setSavingKey(null);
  };

  const handleSaveKineticHeadline = async () => {
    setSavingKey("kinetic_headline");
    try {
      const currentFlag = flags.find((f) => f.key === "kinetic_headline");
      const rolesArray = kineticConfig.rolesStr
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

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
              onClick={() => handleToggle(flag.key, flag.enabled)}
              disabled={savingKey === flag.key}
              className={`admin-btn ${flag.enabled ? "admin-btn--primary" : ""}`}
              style={{ minWidth: 140 }}
            >
              {savingKey === flag.key ? "Saving..." : flag.enabled ? "ACTIVE (ON)" : "DISABLED (OFF)"}
            </button>
          </div>
        ))}
      </div>

      {/* Customize Status Indicator Pill */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>🟢 Customize Status Indicator Pill</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the status message and location shown on the landing page header.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Status Text</label>
            <input
              type="text"
              className="admin-input"
              value={statusPillConfig.status}
              onChange={(e) => setStatusPillConfig({ ...statusPillConfig, status: e.target.value })}
              placeholder="Available for Opportunities"
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Location Text</label>
            <input
              type="text"
              className="admin-input"
              value={statusPillConfig.location}
              onChange={(e) => setStatusPillConfig({ ...statusPillConfig, location: e.target.value })}
              placeholder="Liverpool, UK & India"
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        </div>

        <button
          onClick={handleSaveStatusPill}
          disabled={savingKey === "status_pill"}
          className="admin-btn admin-btn--primary"
        >
          {savingKey === "status_pill" ? "Saving..." : "Save Status Pill Settings"}
        </button>
      </div>

      {/* Customize Kinetic Headline Roles */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>⚡ Customize Kinetic Scramble Headline Roles</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Provide a comma-separated list of roles that cycle on the landing page sub-headline.
        </p>

        <div className="admin-form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Roles / Titles (comma separated)</label>
          <textarea
            className="admin-input"
            rows={3}
            value={kineticConfig.rolesStr}
            onChange={(e) => setKineticConfig({ rolesStr: e.target.value })}
            placeholder="🎬 Video Director & Film Editor, 📊 Data Science & AI Architect, 💻 Full-Stack Software Engineer"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          onClick={handleSaveKineticHeadline}
          disabled={savingKey === "kinetic_headline"}
          className="admin-btn admin-btn--primary"
        >
          {savingKey === "kinetic_headline" ? "Saving..." : "Save Kinetic Roles"}
        </button>
      </div>

      {/* Customize Video Showreel */}
      <div className="admin-card">
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>🎬 Editor Video Showreel Settings</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Control the video embed URL, title, and description displayed in Editor Mode.
        </p>

        <div className="admin-form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Video Embed URL (YouTube/Vimeo)</label>
          <input
            type="text"
            className="admin-input"
            value={videoConfig.url}
            onChange={(e) => setVideoConfig({ ...videoConfig, url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div className="admin-form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Showreel Title</label>
          <input
            type="text"
            className="admin-input"
            value={videoConfig.title}
            onChange={(e) => setVideoConfig({ ...videoConfig, title: e.target.value })}
            placeholder="GV Creative Direction Reel"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div className="admin-form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Showreel Description</label>
          <textarea
            className="admin-input"
            value={videoConfig.desc}
            onChange={(e) => setVideoConfig({ ...videoConfig, desc: e.target.value })}
            rows={3}
            placeholder="Selected cuts from live stage productions and fest directions."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          onClick={handleSaveVideoMetadata}
          disabled={savingKey === "video_reel"}
          className="admin-btn admin-btn--primary"
        >
          {savingKey === "video_reel" ? "Saving..." : "Save Showreel Settings"}
        </button>
      </div>
    </div>
  );
}
