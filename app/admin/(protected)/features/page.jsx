"use client";
import { useEffect, useState } from "react";

const REQUIRED_FLAGS = [
  { key: "signature_intro", name: "Full-Screen Signature Scribble Intro", defaultEnabled: true },
  { key: "theme_moods", name: "Instant Theme Mood Switcher Pill (OLED / Cyberpunk / Cinema)", defaultEnabled: true },
  { key: "constellation_bg", name: "Landing Particle Constellation Canvas", defaultEnabled: true },
  { key: "kinetic_headline", name: "Landing Cyber Scramble Sub-Headline", defaultEnabled: true },
  { key: "status_pill", name: "Landing Status Indicator Pill", defaultEnabled: true },
  { key: "hotkey_hints", name: "Landing Keyboard Shortcut Hints ([1], [2], [3])", defaultEnabled: true },
  { key: "analyst_ticker", name: "Analyst Mode Data Ticker Ribbon", defaultEnabled: true },
  { key: "analyst_ai_sandbox", name: "Analyst Mode AI Neural Net & 3D Hologram Cube Sandbox", defaultEnabled: true },
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

  const [moodConfig, setMoodConfig] = useState({
    defaultMood: "oled",
    oledAccent: "#00f0ff",
    cyberpunkAccent: "#39ff88",
    cinemaAccent: "#a56ce8",
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

  const [aiSandboxConfig, setAiSandboxConfig] = useState({
    inputsStr: "MRI Scan Data, Time Series Data, Tabular Metrics",
    output1Label: "Tumor Classification",
    output1Val: "99.4% Accuracy",
    output2Label: "Anomaly Prediction",
    output2Val: "0.012 Loss",
    output3Label: "Confidence Score",
    output3Val: "98.7% Conf",
    f1Title: "15+ DATASETS",
    f1Sub: "Processed & Modeled",
    f2Title: "99.4% ACCURACY",
    f2Sub: "ML Classification",
    f3Title: "PYTORCH & ML",
    f3Sub: "Deep Neural Nets",
    f4Title: "SQL & PIPELINES",
    f4Sub: "Big Data Processing",
    f5Title: "LIVERPOOL MSc",
    f5Sub: "AI & Data Science",
    f6Title: "POWER BI DASHBOARDS",
    f6Sub: "Live Analytics",
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

          const moodFlag = flagMap.get("theme_moods");
          if (moodFlag && moodFlag.metadata) {
            try {
              const parsed = typeof moodFlag.metadata === "string" ? JSON.parse(moodFlag.metadata) : moodFlag.metadata;
              setMoodConfig({
                defaultMood: parsed.defaultMood || "oled",
                oledAccent: parsed.oledAccent || "#00f0ff",
                cyberpunkAccent: parsed.cyberpunkAccent || "#39ff88",
                cinemaAccent: parsed.cinemaAccent || "#a56ce8",
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

          const sandboxFlag = flagMap.get("analyst_ai_sandbox");
          if (sandboxFlag && sandboxFlag.metadata) {
            try {
              const parsed = typeof sandboxFlag.metadata === "string" ? JSON.parse(sandboxFlag.metadata) : sandboxFlag.metadata;
              setAiSandboxConfig((prev) => ({
                ...prev,
                inputsStr: parsed.inputsStr || prev.inputsStr,
                output1Label: parsed.outputs?.[0]?.label || prev.output1Label,
                output1Val: parsed.outputs?.[0]?.defaultVal || prev.output1Val,
                output2Label: parsed.outputs?.[1]?.label || prev.output2Label,
                output2Val: parsed.outputs?.[1]?.defaultVal || prev.output2Val,
                output3Label: parsed.outputs?.[2]?.label || prev.output3Label,
                output3Val: parsed.outputs?.[2]?.defaultVal || prev.output3Val,
                f1Title: parsed.cubeFaces?.[0]?.title || prev.f1Title,
                f1Sub: parsed.cubeFaces?.[0]?.sub || prev.f1Sub,
                f2Title: parsed.cubeFaces?.[1]?.title || prev.f2Title,
                f2Sub: parsed.cubeFaces?.[1]?.sub || prev.f2Sub,
                f3Title: parsed.cubeFaces?.[2]?.title || prev.f3Title,
                f3Sub: parsed.cubeFaces?.[2]?.sub || prev.f3Sub,
                f4Title: parsed.cubeFaces?.[3]?.title || prev.f4Title,
                f4Sub: parsed.cubeFaces?.[3]?.sub || prev.f4Sub,
                f5Title: parsed.cubeFaces?.[4]?.title || prev.f5Title,
                f5Sub: parsed.cubeFaces?.[4]?.sub || prev.f5Sub,
                f6Title: parsed.cubeFaces?.[5]?.title || prev.f6Title,
                f6Sub: parsed.cubeFaces?.[5]?.sub || prev.f6Sub,
              }));
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

  const handleSaveMoodMetadata = async () => {
    setSavingKey("theme_moods");
    try {
      const currentFlag = flags.find((f) => f.key === "theme_moods");
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "theme_moods",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(moodConfig),
        }),
      });
      if (res.ok) {
        alert("Theme Mood Switcher settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save theme mood settings.");
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

  const handleSaveAiSandboxMetadata = async () => {
    setSavingKey("analyst_ai_sandbox");
    try {
      const currentFlag = flags.find((f) => f.key === "analyst_ai_sandbox");
      const metadataObj = {
        inputsStr: aiSandboxConfig.inputsStr,
        outputs: [
          { label: aiSandboxConfig.output1Label, defaultVal: aiSandboxConfig.output1Val },
          { label: aiSandboxConfig.output2Label, defaultVal: aiSandboxConfig.output2Val },
          { label: aiSandboxConfig.output3Label, defaultVal: aiSandboxConfig.output3Val },
        ],
        cubeFaces: [
          { title: aiSandboxConfig.f1Title, sub: aiSandboxConfig.f1Sub, icon: "📊" },
          { title: aiSandboxConfig.f2Title, sub: aiSandboxConfig.f2Sub, icon: "🧠" },
          { title: aiSandboxConfig.f3Title, sub: aiSandboxConfig.f3Sub, icon: "🔬" },
          { title: aiSandboxConfig.f4Title, sub: aiSandboxConfig.f4Sub, icon: "⚡" },
          { title: aiSandboxConfig.f5Title, sub: aiSandboxConfig.f5Sub, icon: "🎓" },
          { title: aiSandboxConfig.f6Title, sub: aiSandboxConfig.f6Sub, icon: "📈" },
        ],
      };

      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "analyst_ai_sandbox",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(metadataObj),
        }),
      });

      if (res.ok) {
        alert("Analyst AI Sandbox & Hologram Cube text updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save Analyst AI Sandbox settings.");
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

      {/* 0.5. Theme Mood Switcher Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>🌓 Instant Theme Mood Switcher Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the default theme mood and accent colors for OLED, Cyberpunk, and Cinema modes.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Default Mood on Page Load
            </label>
            <select
              className="admin-input"
              value={moodConfig.defaultMood}
              onChange={(e) => setMoodConfig({ ...moodConfig, defaultMood: e.target.value })}
            >
              <option value="oled">🌙 OLED (Deep Dark &amp; Cyan)</option>
              <option value="cyberpunk">⚡ CYBERPUNK (Matrix Neon Green)</option>
              <option value="cinema">🎬 CINEMA (Anamorphic Gold &amp; Purple)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                OLED Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={moodConfig.oledAccent.startsWith("#") && moodConfig.oledAccent.length === 7 ? moodConfig.oledAccent : "#00f0ff"}
                  onChange={(e) => setMoodConfig({ ...moodConfig, oledAccent: e.target.value })}
                  style={{ width: 34, height: 34, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={moodConfig.oledAccent}
                  onChange={(e) => setMoodConfig({ ...moodConfig, oledAccent: e.target.value })}
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Cyberpunk Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={moodConfig.cyberpunkAccent.startsWith("#") && moodConfig.cyberpunkAccent.length === 7 ? moodConfig.cyberpunkAccent : "#39ff88"}
                  onChange={(e) => setMoodConfig({ ...moodConfig, cyberpunkAccent: e.target.value })}
                  style={{ width: 34, height: 34, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={moodConfig.cyberpunkAccent}
                  onChange={(e) => setMoodConfig({ ...moodConfig, cyberpunkAccent: e.target.value })}
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Cinema Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={moodConfig.cinemaAccent.startsWith("#") && moodConfig.cinemaAccent.length === 7 ? moodConfig.cinemaAccent : "#a56ce8"}
                  onChange={(e) => setMoodConfig({ ...moodConfig, cinemaAccent: e.target.value })}
                  style={{ width: 34, height: 34, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={moodConfig.cinemaAccent}
                  onChange={(e) => setMoodConfig({ ...moodConfig, cinemaAccent: e.target.value })}
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveMoodMetadata}
            disabled={savingKey === "theme_moods"}
          >
            {savingKey === "theme_moods" ? "Saving..." : "Save Theme Mood Settings"}
          </button>
        </div>
      </div>

      {/* 3. Analyst AI Sandbox Customization */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>🧠 Analyst AI Neural Net &amp; 3D Hologram Cube Customization</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the Neural Network input nodes, prediction outputs, and 3D Hologram Cube face titles.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Neural Net Input Layer Nodes (Comma Separated)
            </label>
            <input
              type="text"
              className="admin-input"
              value={aiSandboxConfig.inputsStr}
              onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, inputsStr: e.target.value })}
              placeholder="e.g. MRI Scan Data, Time Series Data, Tabular Metrics"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prediction 1 (Label / Value)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 6 }}>
                <input type="text" className="admin-input" value={aiSandboxConfig.output1Label} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, output1Label: e.target.value })} />
                <input type="text" className="admin-input" value={aiSandboxConfig.output1Val} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, output1Val: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prediction 2 (Label / Value)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 6 }}>
                <input type="text" className="admin-input" value={aiSandboxConfig.output2Label} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, output2Label: e.target.value })} />
                <input type="text" className="admin-input" value={aiSandboxConfig.output2Val} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, output2Val: e.target.value })} />
              </div>
            </div>
          </div>

          <h4 style={{ margin: "10px 0 4px 0", fontSize: "0.95rem" }}>🎲 3D Hologram Cube Faces (Title / Sub-description)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 1 (Front)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f1Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f1Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f1Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f1Sub: e.target.value })} placeholder="Sub" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 2 (Back)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f2Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f2Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f2Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f2Sub: e.target.value })} placeholder="Sub" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 3 (Right)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f3Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f3Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f3Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f3Sub: e.target.value })} placeholder="Sub" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 4 (Left)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f4Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f4Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f4Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f4Sub: e.target.value })} placeholder="Sub" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 5 (Top)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f5Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f5Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f5Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f5Sub: e.target.value })} placeholder="Sub" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Face 6 (Bottom)</label>
              <input type="text" className="admin-input" value={aiSandboxConfig.f6Title} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f6Title: e.target.value })} placeholder="Title" style={{ marginBottom: 4 }} />
              <input type="text" className="admin-input" value={aiSandboxConfig.f6Sub} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, f6Sub: e.target.value })} placeholder="Sub" />
            </div>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveAiSandboxMetadata}
            disabled={savingKey === "analyst_ai_sandbox"}
          >
            {savingKey === "analyst_ai_sandbox" ? "Saving..." : "Save AI Sandbox Settings"}
          </button>
        </div>
      </div>

      {/* 4. Analyst Data Ticker Config */}
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

      {/* 5. Video Showreel Config */}
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
