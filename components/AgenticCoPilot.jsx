"use client";

import { useState, useEffect, useRef } from "react";

export default function AgenticCoPilot({ metadata }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [logs, setLogs] = useState([
    {
      sender: "bot",
      text: "⚡ Ganesh Digital Twin AI online. I have direct access to site controls. You can type or speak commands like 'Warp to Developer', 'Show Unity Game', or 'Explain Liverpool MSc'.",
    },
  ]);

  const recognitionRef = useRef(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = "en-US";

        reco.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleExecuteCommand(transcript);
        };

        reco.onend = () => setIsListening(false);
        reco.onerror = () => setIsListening(false);
        recognitionRef.current = reco;
      }
    }
  }, []);

  // Voice Speech Synthesis
  const speakReply = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition is not supported in this browser. Please type your command below!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Agentic Action Dispatcher
  const handleExecuteCommand = (rawQuery) => {
    const query = (rawQuery || inputText).trim().toLowerCase();
    if (!query) return;

    setLogs((prev) => [...prev, { sender: "user", text: rawQuery || inputText }]);
    setInputText("");

    let reply = "";

    if (query.includes("developer") || query.includes("dev mode") || query.includes("coding")) {
      reply = "Warping to Developer Universe. Initializing system architectures and GPU shaders.";
      const portal = document.querySelector(`.portal[data-mode="developer"]`);
      if (portal) portal.click();
    } else if (query.includes("unity") || query.includes("game of life") || query.includes("3d game")) {
      reply = "Deploying 3D Game of Life. Warping to Developer Mode and scrolling to Unity Engine canvas.";
      const portal = document.querySelector(`.portal[data-mode="developer"]`);
      if (portal) {
        portal.click();
        setTimeout(() => {
          const gameSection = document.getElementById("unity-game-section") || document.querySelector(".unity-game");
          if (gameSection) gameSection.scrollIntoView({ behavior: "smooth" });
        }, 600);
      }
    } else if (query.includes("editor") || query.includes("video") || query.includes("film") || query.includes("davinci")) {
      reply = "Warping to Editor Universe. Activating 16mm halation engine and cinematic showreel.";
      const portal = document.querySelector(`.portal[data-mode="editor"]`);
      if (portal) portal.click();
    } else if (query.includes("analyst") || query.includes("data") || query.includes("ai") || query.includes("machine learning")) {
      reply = "Warping to Analyst Universe. Loading 3D Latent Space Galaxy and neural manifolds.";
      const portal = document.querySelector(`.portal[data-mode="analyst"]`);
      if (portal) portal.click();
    } else if (query.includes("liverpool") || query.includes("education") || query.includes("degree") || query.includes("msc") || query.includes("gpa")) {
      reply = "Ganesh is pursuing his MSc in Advanced Data Science & AI at the University of Liverpool, UK (2025-2026), and holds a B.Tech in CSE from KL University with 8.87 GPA.";
    } else if (query.includes("matrix") || query.includes("cyber") || query.includes("ctf") || query.includes("hack")) {
      reply = "Triggering Cyber Matrix Mode. Phosphor CRT scanlines engaged!";
      window.dispatchEvent(new CustomEvent("toggleCyberMatrix"));
    } else if (query.includes("contact") || query.includes("hire") || query.includes("meet") || query.includes("phone")) {
      reply = "Opening Ganesh's direct live chat channel. Dispatched to Telegram alerts.";
      const chatBtn = document.querySelector(".floating-chat-trigger");
      if (chatBtn) chatBtn.click();
    } else {
      reply = `Understood: "${query}". I am Ganesh's digital co-pilot. I can warp across Editor, Analyst, Developer modes, trigger 3D Unity demos, or initiate live contact.`;
    }

    setLogs((prev) => [...prev, { sender: "bot", text: reply }]);
    speakReply(reply);
  };

  return (
    <>
      {/* Floating HUD Trigger Pill (Bottom Left) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: "30px",
          background: "rgba(10, 15, 20, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid #00f0ff",
          color: "#00f0ff",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.78rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.25)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: isSpeaking ? "#ff3366" : "#00f0ff", boxShadow: "0 0 8px currentColor" }} />
        <span>AI CO-PILOT</span>
      </button>

      {/* Interactive Terminal Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: 24,
            width: "360px",
            maxHeight: "440px",
            zIndex: 9991,
            background: "rgba(10, 14, 18, 0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(0, 240, 255, 0.08)",
              borderBottom: "1px solid rgba(0, 240, 255, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#00f0ff",
            }}
          >
            <span>🤖 GANESH AI TWIN // AGENTIC CONTROLLER</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "#00f0ff", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>

          {/* Chat Logs */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: "300px" }}>
            {logs.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                  background: msg.sender === "user" ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: msg.sender === "user" ? "#00f0ff" : "rgba(255, 255, 255, 0.9)",
                  border: msg.sender === "user" ? "1px solid rgba(0, 240, 255, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Voice & Input Row */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", gap: 8 }}>
            <button
              onClick={toggleMic}
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                border: isListening ? "1px solid #ff3366" : "1px solid rgba(0, 240, 255, 0.4)",
                background: isListening ? "rgba(255, 51, 102, 0.2)" : "rgba(0, 240, 255, 0.1)",
                color: isListening ? "#ff3366" : "#00f0ff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
              title="Speak voice command"
            >
              🎤
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Type command or query..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecuteCommand()}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "0 10px",
                color: "#ffffff",
                fontSize: "0.78rem",
                outline: "none",
              }}
            />

            <button
              onClick={() => handleExecuteCommand()}
              style={{
                padding: "0 12px",
                borderRadius: "8px",
                background: "#00f0ff",
                border: "none",
                color: "#05050a",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.78rem",
              }}
            >
              ↵
            </button>
          </div>
        </div>
      )}
    </>
  );
}
