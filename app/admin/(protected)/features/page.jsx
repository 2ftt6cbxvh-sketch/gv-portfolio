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
  { key: "admin_secret_gateway", name: "Secret Star Constellation Pattern Admin Gateway", defaultEnabled: true },
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
    defaultMood: "auto",
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
    input1Label: "MRI Scan Data",
    input1Desc: "Brain Image Tensors",
    input1Layers: "h1, h3",
    input1Acc: "99.4% Accuracy",
    input1Loss: "0.012 Loss",
    input1Conf: "98.7% Conf",

    input2Label: "Time Series Data",
    input2Desc: "Sequential Signals",
    input2Layers: "h2, h4",
    input2Acc: "98.6% Accuracy",
    input2Loss: "0.018 Loss",
    input2Conf: "99.1% Conf",

    input3Label: "Tabular Metrics",
    input3Desc: "32-Feature Vectors",
    input3Layers: "h3, h4",
    input3Acc: "99.1% Accuracy",
    input3Loss: "0.009 Loss",
    input3Conf: "99.5% Conf",

    output1Label: "Classification",
    output2Label: "Anomaly Prediction",
    output3Label: "Confidence Score",

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

  const [gatewayConfig, setGatewayConfig] = useState({
    sequenceStr: "1,3,4,2,1,4",
    maxAttempts: "3",
    lockdownSec: "30",
    accentColor: "#ffd700",
    titleText: "AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED",
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
                defaultMood: parsed.defaultMood || "auto",
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
                input1Label: parsed.inputs?.[0]?.label || prev.input1Label,
                input1Desc: parsed.inputs?.[0]?.desc || prev.input1Desc,
                input1Layers: Array.isArray(parsed.inputs?.[0]?.activeLayers) ? parsed.inputs[0].activeLayers.join(", ") : prev.input1Layers,
                input1Acc: parsed.inputs?.[0]?.accuracy || prev.input1Acc,
                input1Loss: parsed.inputs?.[0]?.loss || prev.input1Loss,
                input1Conf: parsed.inputs?.[0]?.conf || prev.input1Conf,

                input2Label: parsed.inputs?.[1]?.label || prev.input2Label,
                input2Desc: parsed.inputs?.[1]?.desc || prev.input2Desc,
                input2Layers: Array.isArray(parsed.inputs?.[1]?.activeLayers) ? parsed.inputs[1].activeLayers.join(", ") : prev.input2Layers,
                input2Acc: parsed.inputs?.[1]?.accuracy || prev.input2Acc,
                input2Loss: parsed.inputs?.[1]?.loss || prev.input2Loss,
                input2Conf: parsed.inputs?.[1]?.conf || prev.input2Conf,

                input3Label: parsed.inputs?.[2]?.label || prev.input3Label,
                input3Desc: parsed.inputs?.[2]?.desc || prev.input3Desc,
                input3Layers: Array.isArray(parsed.inputs?.[2]?.activeLayers) ? parsed.inputs[2].activeLayers.join(", ") : prev.input3Layers,
                input3Acc: parsed.inputs?.[2]?.accuracy || prev.input3Acc,
                input3Loss: parsed.inputs?.[2]?.loss || prev.input3Loss,
                input3Conf: parsed.inputs?.[2]?.conf || prev.input3Conf,

                output1Label: parsed.outputs?.[0]?.label || prev.output1Label,
                output2Label: parsed.outputs?.[1]?.label || prev.output2Label,
                output3Label: parsed.outputs?.[2]?.label || prev.output3Label,

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
        inputs: [
          {
            id: "i1",
            label: aiSandboxConfig.input1Label,
            desc: aiSandboxConfig.input1Desc,
            activeLayers: aiSandboxConfig.input1Layers.split(",").map((s) => s.trim()).filter(Boolean),
            accuracy: aiSandboxConfig.input1Acc,
            loss: aiSandboxConfig.input1Loss,
            conf: aiSandboxConfig.input1Conf,
          },
          {
            id: "i2",
            label: aiSandboxConfig.input2Label,
            desc: aiSandboxConfig.input2Desc,
            activeLayers: aiSandboxConfig.input2Layers.split(",").map((s) => s.trim()).filter(Boolean),
            accuracy: aiSandboxConfig.input2Acc,
            loss: aiSandboxConfig.input2Loss,
            conf: aiSandboxConfig.input2Conf,
          },
          {
            id: "i3",
            label: aiSandboxConfig.input3Label,
            desc: aiSandboxConfig.input3Desc,
            activeLayers: aiSandboxConfig.input3Layers.split(",").map((s) => s.trim()).filter(Boolean),
            accuracy: aiSandboxConfig.input3Acc,
            loss: aiSandboxConfig.input3Loss,
            conf: aiSandboxConfig.input3Conf,
          },
        ],
        outputs: [
          { label: aiSandboxConfig.output1Label, defaultVal: aiSandboxConfig.input1Acc },
          { label: aiSandboxConfig.output2Label, defaultVal: aiSandboxConfig.input1Loss },
          { label: aiSandboxConfig.output3Label, defaultVal: aiSandboxConfig.input1Conf },
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
        alert("Analyst AI Sandbox & Hologram Cube settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save Analyst AI Sandbox settings.");
    }
    setSavingKey(null);
  };

  const handleSaveGatewayMetadata = async () => {
    setSavingKey("admin_secret_gateway");
    try {
      const currentFlag = flags.find((f) => f.key === "admin_secret_gateway");
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "admin_secret_gateway",
          enabled: currentFlag?.enabled !== false,
          metadata: JSON.stringify(gatewayConfig),
        }),
      });
      if (res.ok) {
        alert("Secret Constellation Admin Gateway settings updated successfully! Changes are live on frontend.");
      }
    } catch (e) {
      alert("Failed to save secret gateway settings.");
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
              <option value="auto">✨ AUTO (Native Mode Colors: Editor=Purple, Analyst=Teal, Dev=Green)</option>
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
          Edit the Neural Network input nodes, active hidden layers (h1=Conv2D, h2=LSTM, h3=Dense, h4=Attention), and outputs.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          {/* Input Node 1 */}
          <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--a-border)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 14 }}>⚡ Input Node 1</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 12 }}>Label</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Label} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Label: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Description</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Desc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Desc: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11 }}>Active Layers (e.g. h1, h3)</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Layers} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Layers: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Accuracy Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Acc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Acc: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Loss Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Loss} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Loss: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Conf Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input1Conf} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input1Conf: e.target.value })} style={{ fontSize: 12 }} />
              </div>
            </div>
          </div>

          {/* Input Node 2 */}
          <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--a-border)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 14 }}>⚡ Input Node 2</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 12 }}>Label</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Label} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Label: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Description</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Desc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Desc: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11 }}>Active Layers (e.g. h2, h4)</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Layers} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Layers: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Accuracy Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Acc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Acc: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Loss Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Loss} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Loss: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Conf Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input2Conf} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input2Conf: e.target.value })} style={{ fontSize: 12 }} />
              </div>
            </div>
          </div>

          {/* Input Node 3 */}
          <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--a-border)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 14 }}>⚡ Input Node 3</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 12 }}>Label</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Label} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Label: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Description</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Desc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Desc: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11 }}>Active Layers (e.g. h3, h4)</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Layers} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Layers: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Accuracy Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Acc} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Acc: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Loss Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Loss} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Loss: e.target.value })} style={{ fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11 }}>Conf Output</label>
                <input type="text" className="admin-input" value={aiSandboxConfig.input3Conf} onChange={(e) => setAiSandboxConfig({ ...aiSandboxConfig, input3Conf: e.target.value })} style={{ fontSize: 12 }} />
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

      {/* 3.5. Secret Constellation Pattern Gateway Config */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>🔐 Secret Constellation Pattern Admin Gateway</h3>
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 16 }}>
          Edit the secret 3-star constellation laser triangle color and gateway welcome text.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Secret 4-Star Spell Rune Tap Sequence (Comma Separated Star IDs: 1, 2, 3, 4)
            </label>
            <input
              type="text"
              className="admin-input"
              value={gatewayConfig.sequenceStr}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, sequenceStr: e.target.value })}
              placeholder="e.g. 1,3,4,2,1,4"
            />
            <span style={{ fontSize: 11, color: "var(--a-muted)" }}>
              Star 1 = Top-Left, Star 2 = Top-Right, Star 3 = Bottom-Left, Star 4 = Bottom-Right. Default: 1,3,4,2,1,4
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Max Strike Attempts
              </label>
              <input
                type="number"
                className="admin-input"
                value={gatewayConfig.maxAttempts}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, maxAttempts: e.target.value })}
                placeholder="3"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Lockdown (Sec)
              </label>
              <input
                type="number"
                className="admin-input"
                value={gatewayConfig.lockdownSec}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, lockdownSec: e.target.value })}
                placeholder="30"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Laser Line Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={gatewayConfig.accentColor.startsWith("#") && gatewayConfig.accentColor.length === 7 ? gatewayConfig.accentColor : "#ffd700"}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, accentColor: e.target.value })}
                  style={{ width: 40, height: 38, border: "1px solid var(--a-border)", borderRadius: 6, cursor: "pointer", background: "transparent", padding: 2 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  value={gatewayConfig.accentColor}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, accentColor: e.target.value })}
                  placeholder="#ffd700"
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Gateway Welcome Title
            </label>
            <input
              type="text"
              className="admin-input"
              value={gatewayConfig.titleText}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, titleText: e.target.value })}
              placeholder="AUTHENTICATED // SECRET ADMIN GATEWAY UNLOCKED"
            />
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSaveGatewayMetadata}
            disabled={savingKey === "admin_secret_gateway"}
          >
            {savingKey === "admin_secret_gateway" ? "Saving..." : "Save Secret Gateway Settings"}
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
