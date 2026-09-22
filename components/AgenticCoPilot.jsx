"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

  const [isThinking, setIsThinking] = useState(false);
  const chatLogsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Admin Long-Press Gateway state ──────────────────────────────────────────
  const [gwState, setGwState] = useState("idle"); // idle|loading|active|verified|expired|failed
  const [gwCode, setGwCode] = useState(null);
  const [gwChallengeId, setGwChallengeId] = useState(null);
  const [gwSecondsLeft, setGwSecondsLeft] = useState(30);
  const longPressTimer = useRef(null);
  const gwPollTimer = useRef(null);
  const gwCountdownTimer = useRef(null);

  const clearGateway = useCallback(() => {
    clearTimeout(longPressTimer.current);
    clearInterval(gwPollTimer.current);
    clearInterval(gwCountdownTimer.current);
    setGwState("idle");
    setGwCode(null);
    setGwChallengeId(null);
    setGwSecondsLeft(30);
  }, []);

  const startGatewayChallenge = useCallback(async () => {
    setGwState("loading");
    try {
      const res = await fetch("/api/admin/challenge/initiate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGwState(data.retryIn ? "failed" : "failed");
        setTimeout(clearGateway, 3000);
        return;
      }
      setGwCode(data.code);
      setGwChallengeId(data.challengeId);
      setGwState("active");
      setGwSecondsLeft(30);

      // Countdown timer
      gwCountdownTimer.current = setInterval(() => {
        setGwSecondsLeft((s) => {
          if (s <= 1) { clearInterval(gwCountdownTimer.current); return 0; }
          return s - 1;
        });
      }, 1000);

      // Poll for Telegram verification every 2s
      gwPollTimer.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/admin/challenge/status?id=${data.challengeId}`);
          const d = await r.json();
          if (d.status === "verified") {
            clearInterval(gwPollTimer.current);
            clearInterval(gwCountdownTimer.current);
            setGwState("verified");
            
            // Set security credentials in sessionStorage so AdminVaultSecurityShield authorizes
            if (typeof window !== "undefined") {
              const expiresAt = d.expiresAt || (Date.now() + 15 * 60 * 1000);
              sessionStorage.setItem("starPatternVerified", JSON.stringify({
                verified: true,
                expiresAt,
              }));
              sessionStorage.setItem("adminGatewayVerified", "true");
            }

            const targetKey = d.secretKey || "134214";
            setTimeout(() => {
              window.location.href = `/admin?key=${targetKey}`;
            }, 1000);
          } else if (d.status === "expired" || d.status === "failed" || d.status === "not_found") {
            clearInterval(gwPollTimer.current);
            clearInterval(gwCountdownTimer.current);
            setGwState(d.status === "failed" ? "failed" : "expired");
            setTimeout(clearGateway, 3000);
          }
        } catch (_) {}
      }, 2000);

      // Auto-expire overlay after 33s (grace period)
      setTimeout(() => {
        clearInterval(gwPollTimer.current);
        clearInterval(gwCountdownTimer.current);
        setGwState((s) => s === "active" ? "expired" : s);
        setTimeout(clearGateway, 2500);
      }, 33000);
    } catch (e) {
      setGwState("failed");
      setTimeout(clearGateway, 2500);
    }
  }, [clearGateway]);

  const handleLongPressStart = useCallback((e) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(startGatewayChallenge, 800);
  }, [startGatewayChallenge]);

  const handleLongPressEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearGateway(), [clearGateway]);

  // SVG countdown ring helpers
  const RING_R = 54;
  const RING_C = 2 * Math.PI * RING_R;
  const ringProgress = RING_C - (gwSecondsLeft / 30) * RING_C;


  // Auto-scroll chat log directly inside container
  useEffect(() => {
    if (chatLogsRef.current) {
      chatLogsRef.current.scrollTo({
        top: chatLogsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs, isThinking]);

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

  // Agentic Action Dispatcher backed by Google Gemini API
  const handleExecuteCommand = async (rawQuery) => {
    const query = (rawQuery || inputText).trim();
    if (!query || isThinking) return;

    const currentLogs = [...logs, { sender: "user", text: query }];
    setLogs(currentLogs);
    setInputText("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/public/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: logs.slice(-6),
        }),
      });

      const data = await res.json();
      let rawReply = data?.reply || "Ganesh Varma is an AI & Data Science scholar and full-stack systems engineer.";

      // Extract & Execute Agentic Actions
      const actionMatch = rawReply.match(/<<<ACTION:(.*?)>>>/);
      if (actionMatch && actionMatch[1]) {
        try {
          const action = JSON.parse(actionMatch[1]);
          if (action.type === "warp" && action.mode) {
            const portal =
              document.querySelector(`.portal[data-target="${action.mode}"]`) ||
              document.querySelector(`.portal[data-mode="${action.mode}"]`) ||
              document.querySelector(`.portal[data-mode-id="${action.mode}"]`);
            if (portal) portal.click();
            else window.dispatchEvent(new CustomEvent("enterUniverseMode", { detail: { mode: action.mode } }));
          } else if (action.type === "scroll" && action.target === "unity") {
            const portal =
              document.querySelector(`.portal[data-target="developer"]`) ||
              document.querySelector(`.portal[data-mode="developer"]`) ||
              document.querySelector(`.portal[data-mode-id="developer"]`);
            if (portal) portal.click();
            else window.dispatchEvent(new CustomEvent("enterUniverseMode", { detail: { mode: "developer" } }));
            setTimeout(() => {
              const gameSection = document.getElementById("unity-game-section") || document.querySelector(".unity-game");
              if (gameSection) gameSection.scrollIntoView({ behavior: "smooth" });
            }, 600);
          } else if (action.type === "contact") {
            const chatBtn = document.querySelector(".floating-chat-trigger");
            if (chatBtn) chatBtn.click();
          }
        } catch (actErr) {
          console.error("Action execution error:", actErr);
        }
      }

      // Clean stripped text for display and speech synthesis
      const cleanReply = rawReply.replace(/<<<ACTION:.*?>>>/g, "").trim();

      setLogs((prev) => [...prev, { sender: "bot", text: cleanReply }]);
      speakReply(cleanReply);
    } catch (err) {
      const fallback = "Ganesh Varma is an AI scholar and engineer. Feel free to ask about his Liverpool MSc or projects.";
      setLogs((prev) => [...prev, { sender: "bot", text: fallback }]);
      speakReply(fallback);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating HUD Trigger Pill (Bottom Left) */}
      <button
        className="copilot-trigger-btn"
        onClick={() => { if (gwState === "idle") setIsOpen(!isOpen); }}
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
        onContextMenu={(e) => e.preventDefault()}
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
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.78rem",
          fontWeight: 700,
          cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: isSpeaking ? "#ff3366" : "var(--color-accent, #00f0ff)", boxShadow: "0 0 8px currentColor" }} />
        <span>AI CO-PILOT</span>
      </button>

      {/* ── Admin Gateway Glassmorphism Overlay ── */}
      {gwState !== "idle" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          background: "rgba(4,6,14,0.55)",
          animation: "gwFadeIn 0.2s ease",
        }}>
          <style>{`
            @keyframes gwFadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes gwPulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
            .gw-code-char { display:inline-block; font-family:var(--font-mono,monospace); font-size:2.6rem; font-weight:800; letter-spacing:0.35em; color:#ffffff; text-shadow:0 0 30px rgba(0,240,255,0.6),0 2px 8px rgba(0,0,0,0.8); }
          `}</style>
          <div style={{
            position: "relative", width: "min(400px, calc(100vw - 40px))",
            borderRadius: 24,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(48px) saturate(240%)",
            WebkitBackdropFilter: "blur(48px) saturate(240%)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderTop: "2px solid rgba(255,255,255,0.42)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,255,255,0.35)",
            padding: "32px 28px 28px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
            textAlign: "center",
          }}>
            {/* Specular line */}
            <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.85) 50%,transparent)", borderRadius:9999 }} />


            {gwState === "loading" && (
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.78rem", margin:0, fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.08em" }}>
                ···
              </p>
            )}


            {gwState === "active" && gwCode && (<>
              {/* SVG countdown ring + code in centre */}
              <div style={{ position:"relative", width:132, height:132 }}>
                <svg width="132" height="132" style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
                  <circle cx="66" cy="66" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                  <circle cx="66" cy="66" r={RING_R} fill="none"
                    stroke={gwSecondsLeft > 10 ? "#00f0ff" : "#ff4466"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={ringProgress}
                    style={{ transition:"stroke-dashoffset 1s linear, stroke 0.3s ease" }}
                  />
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"var(--font-mono,monospace)", fontSize:"2rem", fontWeight:800, letterSpacing:"0.05em", color: gwSecondsLeft > 10 ? "#00f0ff" : "#ff4466", textShadow:"0 0 20px currentColor" }}>
                    {String(gwSecondsLeft).padStart(2,"0")}
                  </span>
                  <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", marginTop:2 }}>SEC</span>
                </div>
              </div>

              {/* 8-digit code display */}
              <div style={{ background:"rgba(0,0,0,0.35)", borderRadius:14, padding:"16px 24px", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(8px)" }}>
                <div className="gw-code-char">{gwCode}</div>
              </div>


            </>)}

            {gwState === "verified" && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:"3rem" }}>✅</span>
                <p style={{ color:"#39ff14", fontWeight:800, fontSize:"0.9rem", margin:0, textShadow:"0 0 16px #39ff14", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.1em" }}>GRANTED</p>
              </div>
            )}

            {(gwState === "expired") && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:"2.5rem" }}>⏰</span>
                <p style={{ color:"#ff9944", fontWeight:700, fontSize:"0.95rem", margin:0, fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.06em" }}>EXPIRED</p>
              </div>
            )}

            {gwState === "failed" && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:"2.5rem" }}>🚫</span>
                <p style={{ color:"#ff4466", fontWeight:700, fontSize:"0.95rem", margin:0, fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.06em" }}>DENIED</p>
              </div>
            )}


            {/* Cancel button (only while active) */}
            {(gwState === "active" || gwState === "loading") && (
              <button onClick={clearGateway} style={{
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)",
                color:"rgba(255,255,255,0.55)", fontFamily:"var(--font-mono,monospace)",
                fontSize:"0.74rem", padding:"7px 20px", borderRadius:9999, cursor:"pointer",
                transition:"background 0.15s",
              }}
                onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                onMouseLeave={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}


      {/* Interactive Terminal Window */}
      {isOpen && (
        <div
          className="copilot-window"
          style={{
            position: "fixed",
            bottom: 80,
            left: 24,
            width: "min(390px, calc(100vw - 32px))",
            height: "min(490px, calc(100vh - 110px))",
            zIndex: 9991,
            backdropFilter: "blur(24px)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {/* Header */}
          <div
            className="copilot-header"
            style={{
              padding: "11px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 700, letterSpacing: "0.04em" }}>🤖 GANESH AI TWIN // AGENTIC CONTROLLER</span>
            <button
              onClick={() => setIsOpen(false)}
              className="copilot-close-btn"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.9rem",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Chat Logs with smooth scrolling and visible cyan scrollbar */}
          <div
            ref={chatLogsRef}
            onWheel={(e) => e.stopPropagation()}
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
            className="copilot-chat-scroll copilot-chat-body"
          >
            {logs.map((msg, i) => (
              <div
                key={i}
                className={`copilot-msg ${msg.sender === "user" ? "copilot-msg--user" : "copilot-msg--bot"}`}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  padding: "9px 13px",
                  borderRadius: "10px",
                  fontSize: "0.78rem",
                  lineHeight: 1.55,
                  wordBreak: "break-word",
                  userSelect: "text",
                }}
              >
                {msg.text}
              </div>
            ))}
            {isThinking && (
              <div
                className="copilot-thinking-msg"
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "86%",
                  padding: "9px 13px",
                  borderRadius: "10px",
                  fontSize: "0.78rem",
                  lineHeight: 1.55,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "currentColor", animation: "pulse 1s infinite" }}></span>
                <span>Thinking & querying Ganesh digital twin...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice & Input Row */}
          <div className="copilot-footer" style={{ padding: "10px 14px", display: "flex", gap: 8 }}>
            <button
              onClick={toggleMic}
              className="copilot-mic-btn"
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
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
              className="copilot-input-field"
              placeholder={isListening ? "Listening..." : "Type command or query..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecuteCommand()}
              style={{
                flex: 1,
                borderRadius: "8px",
                padding: "0 10px",
                fontSize: "0.78rem",
                outline: "none",
              }}
            />

            <button
              onClick={() => handleExecuteCommand()}
              className="copilot-send-btn"
              style={{
                padding: "0 12px",
                borderRadius: "8px",
                border: "none",
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
