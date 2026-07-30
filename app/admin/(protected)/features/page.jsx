"use client";
import { useEffect, useState } from "react";

export default function FeaturesAdminPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [videoConfig, setVideoConfig] = useState({
    url: "",
    title: "",
    desc: "",
  });

  useEffect(() => {
    fetch("/api/admin/features")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFlags(data);
          const videoFlag = data.find((f) => f.key === "video_reel");
          if (videoFlag && videoFlag.metadata) {
            try {
              setVideoConfig(JSON.parse(videoFlag.metadata));
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
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: !currentEnabled }),
      });
      if (res.ok) {
        setFlags(flags.map((f) => (f.key === key ? { ...f, enabled: !currentEnabled } : f)));
      }
    } catch (e) {
      alert("Failed to update feature toggle.");
    }
    setSavingKey(null);
  };

  const handleSaveVideoMetadata = async () => {
    setSavingKey("video_reel");
    try {
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "video_reel",
          enabled: flags.find((f) => f.key === "video_reel")?.enabled !== false,
          metadata: JSON.stringify(videoConfig),
        }),
      });
      if (res.ok) {
        alert("Showreel video settings updated successfully!");
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
    <div style={{ maxWidth: 800 }}>
      <div className="admin-page-header">
        <h1>Creative Feature Toggles & Control</h1>
        <p>Turn landing page & mode features ON or OFF, and edit showreel video settings.</p>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Feature Toggles</h3>

        {flags.map((flag) => (
          <div
            key={flag.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid var(--a-border)",
            }}
          >
            <div>
              <strong style={{ fontSize: 16, display: "block" }}>{flag.name || flag.key}</strong>
              <span style={{ fontSize: 13, color: "var(--a-muted)" }}>
                Key: <code>{flag.key}</code>
              </span>
            </div>

            <button
              onClick={() => handleToggle(flag.key, flag.enabled)}
              disabled={savingKey === flag.key}
              className={`admin-btn ${flag.enabled ? "admin-btn--primary" : ""}`}
            >
              {savingKey === flag.key ? "Saving..." : flag.enabled ? "ACTIVE (ON)" : "DISABLED (OFF)"}
            </button>
          </div>
        ))}
      </div>

      {/* Video Showreel Settings */}
      <div className="admin-card">
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Editor Video Showreel Settings</h3>
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
            placeholder="https://www.youtube.com/embed/..."
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
            placeholder="Creative Showreel 2026"
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
