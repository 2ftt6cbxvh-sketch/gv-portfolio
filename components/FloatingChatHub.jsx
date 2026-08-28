"use client";

import { useState, useEffect, useRef } from "react";

const QUICK_PROMPTS = [
  "🚀 Let's build a project together!",
  "🎬 Video editing & creative direction inquiry",
  "📊 AI / Data Science consulting",
  "👋 Hey Ganesh, just wanted to connect!",
];

// Validate 10-digit Indian Mobile Number
function isValidIndianPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, "");
  let standardDigits = digits;
  if (digits.length === 12 && digits.startsWith("91")) standardDigits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) standardDigits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(standardDigits);
}

export default function FloatingChatHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "contacts"
  const [sessionToken, setSessionToken] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentMode, setCurrentMode] = useState("Landing");
  const [validationError, setValidationError] = useState("");

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Initialize session token from sessionStorage (clears automatically on browser close/refresh to save space)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let token = sessionStorage.getItem("gv_chat_session_token");
    if (!token) {
      token = "sess_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
      sessionStorage.setItem("gv_chat_session_token", token);
    }
    setSessionToken(token);

    const savedName = sessionStorage.getItem("gv_chat_name") || "";
    const savedPhone = sessionStorage.getItem("gv_chat_phone") || "";
    const savedEmail = sessionStorage.getItem("gv_chat_email") || "";
    if (savedName) setVisitorName(savedName);
    if (savedPhone) setVisitorPhone(savedPhone);
    if (savedEmail) setVisitorEmail(savedEmail);

    // Track active mode from DOM
    const checkMode = () => {
      const stage = document.getElementById("stage");
      const mode = stage?.getAttribute("data-mode") || "Landing";
      setCurrentMode(mode.charAt(0).toUpperCase() + mode.slice(1));
    };

    checkMode();
    const observer = new MutationObserver(checkMode);
    const stageEl = document.getElementById("stage");
    if (stageEl) observer.observe(stageEl, { attributes: true, attributeFilter: ["data-mode"] });

    return () => observer.disconnect();
  }, []);

  // Sync messages from server
  const syncMessages = async (token) => {
    const activeToken = token || sessionToken;
    if (!activeToken) return;

    try {
      const res = await fetch(`/api/public/chat/sync?sessionToken=${encodeURIComponent(activeToken)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.messages) {
          setMessages(data.messages);

          // Calculate unread admin messages when widget is closed
          if (!isOpen) {
            const lastReadCount = parseInt(sessionStorage.getItem("gv_chat_last_read_count") || "0", 10);
            const adminMsgs = data.messages.filter((m) => m.sender === "ADMIN").length;
            if (adminMsgs > lastReadCount) {
              setUnreadCount(adminMsgs - lastReadCount);
            }
          }
        }
      }
    } catch (e) {}
  };

  // Poll for replies
  useEffect(() => {
    if (!sessionToken) return;

    syncMessages(sessionToken);

    // Poll every 3 seconds for live replies
    pollIntervalRef.current = setInterval(() => {
      syncMessages(sessionToken);
    }, 3000);

    return () => clearInterval(pollIntervalRef.current);
  }, [sessionToken, isOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      const adminMsgs = messages.filter((m) => m.sender === "ADMIN").length;
      sessionStorage.setItem("gv_chat_last_read_count", String(adminMsgs));
      setUnreadCount(0);
    }
  }, [messages, isOpen, activeTab]);

  // Start fresh new chat (clear session from browser)
  const handleStartFreshChat = () => {
    const newToken = "sess_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
    sessionStorage.setItem("gv_chat_session_token", newToken);
    setSessionToken(newToken);
    setMessages([]);
    setValidationError("");
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    setValidationError("");

    // Validate Name
    if (!visitorName.trim() || visitorName.trim().length < 2) {
      setValidationError("⚠️ Please enter your name (minimum 2 characters).");
      return;
    }

    // Validate Indian Phone Number
    if (!isValidIndianPhone(visitorPhone)) {
      setValidationError("⚠️ Please enter a valid 10-digit Indian phone number (e.g. 9876543210).");
      return;
    }

    if (!messageText.trim() || isSending) return;

    const textToSend = messageText.trim();
    const finalName = visitorName.trim();
    const finalPhone = visitorPhone.trim();
    setMessageText("");
    setIsSending(true);

    sessionStorage.setItem("gv_chat_name", finalName);
    sessionStorage.setItem("gv_chat_phone", finalPhone);
    if (visitorEmail.trim()) sessionStorage.setItem("gv_chat_email", visitorEmail.trim());

    // Optimistic UI update
    const tempId = "temp_" + Date.now();
    const newMsg = {
      id: tempId,
      sender: "VISITOR",
      senderName: finalName,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const res = await fetch("/api/public/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          visitorName: finalName,
          visitorPhone: finalPhone,
          visitorEmail: visitorEmail.trim(),
          text: textToSend,
          currentMode,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setValidationError(data.error || "Failed to send message.");
      } else {
        syncMessages(sessionToken);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setValidationError("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 🔮 ALWAYS-FLOATING CYBER ACTION BUTTON (BOTTOM-RIGHT HUD)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div
        className="floating-chat-fab"
        style={{
          position: "fixed",
          bottom: "22px",
          right: "22px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setUnreadCount(0);
            }
          }}
          className="cyber-fab-btn"
          aria-label="Open live chat and contact modal"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            background: "rgba(10, 12, 18, 0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            borderRadius: "999px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.2)",
            color: "#ffffff",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isOpen ? "scale(0.96)" : "scale(1)",
          }}
        >
          {/* Pulsing Status Dot */}
          <span
            style={{
              position: "relative",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#39ff88",
              boxShadow: "0 0 10px #39ff88",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "-3px",
                borderRadius: "50%",
                background: "#39ff88",
                opacity: 0.4,
                animation: "fab-pulse 2s infinite",
              }}
            />
          </span>

          <span style={{ fontWeight: 600, textTransform: "uppercase" }}>
            {isOpen ? "✕ Close" : "💬 Live Chat"}
          </span>

          {/* Unread Alert Pill */}
          {unreadCount > 0 && !isOpen && (
            <span
              style={{
                background: "#ff5f56",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "999px",
                padding: "2px 7px",
                boxShadow: "0 0 12px rgba(255, 95, 86, 0.8)",
                animation: "fab-bounce 1s infinite alternate",
              }}
            >
              {unreadCount} NEW
            </span>
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 🛸 EXPANDABLE CYBER GLASS CHAT & CONTACT MODAL              */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="cyber-chat-window"
          style={{
            position: "fixed",
            bottom: "76px",
            right: "22px",
            width: "calc(100vw - 44px)",
            maxWidth: "420px",
            height: "580px",
            maxHeight: "calc(100vh - 100px)",
            background: "rgba(8, 10, 16, 0.96)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.15)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(14, 18, 28, 0.9)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #00f0ff22, #a56ce844)",
                  border: "1px solid rgba(0, 240, 255, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#00f0ff",
                  fontFamily: "var(--font-mono)",
                }}
              >
                GV
              </div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>Ganesh Varma</div>
                <div style={{ fontSize: "10.5px", color: "#39ff88", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#39ff88" }} />
                  Active on Telegram &amp; Phone
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {messages.length > 0 && (
                <button
                  onClick={handleStartFreshChat}
                  title="Clear & Start Fresh Conversation"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  🔄 Reset
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "rgba(10, 12, 18, 0.8)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
            }}
          >
            <button
              onClick={() => setActiveTab("chat")}
              style={{
                padding: "10px",
                background: activeTab === "chat" ? "rgba(0, 240, 255, 0.1)" : "transparent",
                color: activeTab === "chat" ? "#00f0ff" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                borderBottom: activeTab === "chat" ? "2px solid #00f0ff" : "2px solid transparent",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              💬 LIVE CHAT
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              style={{
                padding: "10px",
                background: activeTab === "contacts" ? "rgba(57, 255, 136, 0.1)" : "transparent",
                color: activeTab === "contacts" ? "#39ff88" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                borderBottom: activeTab === "contacts" ? "2px solid #39ff88" : "2px solid transparent",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              ⚡ DIRECT CONTACTS
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 1: LIVE CHAT MESSENGER                                   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              {/* Message Feed */}
              <div
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Intro System Message */}
                <div
                  style={{
                    background: "rgba(0, 240, 255, 0.04)",
                    border: "1px solid rgba(0, 240, 255, 0.16)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "11.5px",
                    color: "rgba(255, 255, 255, 0.85)",
                    lineHeight: 1.45,
                  }}
                >
                  👋 <b>Direct Line to Ganesh</b>
                  <div style={{ marginTop: "2px", fontSize: "10.5px", color: "rgba(255, 255, 255, 0.6)" }}>
                    Enter your name &amp; Indian mobile number below to start. Your message arrives directly on my phone.
                  </div>
                </div>

                {messages.length === 0 && (
                  <div style={{ marginTop: "auto", marginBottom: "4px" }}>
                    <div style={{ fontSize: "10.5px", color: "rgba(255, 255, 255, 0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                      QUICK TOPICS:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setMessageText(prompt)}
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            padding: "7px 12px",
                            color: "rgba(255, 255, 255, 0.85)",
                            fontSize: "11px",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "background 0.2s, border-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0, 240, 255, 0.1)";
                            e.currentTarget.style.borderColor = "rgba(0, 240, 255, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender === "VISITOR";
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          fontFamily: "var(--font-mono)",
                          color: "rgba(255, 255, 255, 0.4)",
                          marginBottom: "3px",
                        }}
                      >
                        {isMe ? "You" : "Ganesh Varma"}
                      </div>
                      <div
                        style={{
                          maxWidth: "84%",
                          padding: "9px 13px",
                          borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          background: isMe
                            ? "linear-gradient(135deg, #00f0ff, #0099ff)"
                            : "rgba(255, 255, 255, 0.08)",
                          color: isMe ? "#000000" : "#ffffff",
                          fontWeight: isMe ? 500 : 400,
                          fontSize: "12px",
                          lineHeight: 1.45,
                          boxShadow: isMe ? "0 4px 14px rgba(0, 240, 255, 0.25)" : "none",
                          border: isMe ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.text}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "rgba(255, 255, 255, 0.35)",
                          marginTop: "2px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Just now"}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Identity & Input Footer */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "12px 16px",
                  background: "rgba(10, 12, 18, 0.95)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Inline Validation Banner */}
                {validationError && (
                  <div
                    style={{
                      background: "rgba(255, 95, 86, 0.15)",
                      border: "1px solid rgba(255, 95, 86, 0.4)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      color: "#ff5f56",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    {validationError}
                  </div>
                )}

                {/* Mandatory Name & Phone Input Row */}
                {messages.length === 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "8px" }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name *"
                        required
                        value={visitorName}
                        onChange={(e) => {
                          setVisitorName(e.target.value);
                          setValidationError("");
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "11px",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="+91 Mobile Number *"
                        required
                        value={visitorPhone}
                        onChange={(e) => {
                          setVisitorPhone(e.target.value);
                          setValidationError("");
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(57, 255, 136, 0.3)",
                          borderRadius: "6px",
                          color: "#39ff88",
                          fontSize: "11px",
                          outline: "none",
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      setValidationError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(0, 240, 255, 0.3)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    style={{
                      padding: "0 16px",
                      background: messageText.trim() ? "#00f0ff" : "rgba(255, 255, 255, 0.1)",
                      color: messageText.trim() ? "#000000" : "rgba(255, 255, 255, 0.4)",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "11.5px",
                      cursor: messageText.trim() ? "pointer" : "default",
                      transition: "all 0.2s",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {isSending ? "..." : "SEND →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 2: DIRECT CONTACTS HUB                                   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "contacts" && (
            <div
              style={{
                flex: 1,
                padding: "18px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>
                Reach out directly across any of my channels:
              </div>

              {/* Phone & WhatsApp Card */}
              <div
                style={{
                  background: "rgba(57, 255, 136, 0.04)",
                  border: "1px solid rgba(57, 255, 136, 0.2)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", color: "rgba(57, 255, 136, 0.85)" }}>
                    DIRECT PHONE / WHATSAPP
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginTop: "2px", letterSpacing: "0.02em" }}>
                    +91 85550 21322
                  </div>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => copyToClipboard("+91 85550 21322", "phone")}
                    style={{
                      padding: "5px 8px",
                      background: "rgba(57, 255, 136, 0.1)",
                      border: "1px solid rgba(57, 255, 136, 0.3)",
                      borderRadius: "6px",
                      color: "#39ff88",
                      fontSize: "10.5px",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {copiedKey === "phone" ? "COPIED!" : "COPY"}
                  </button>
                  <a
                    href="tel:+918555021322"
                    style={{
                      padding: "5px 8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "10.5px",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    CALL ↗
                  </a>
                  <a
                    href="https://wa.me/918555021322"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 8px",
                      background: "rgba(37, 211, 102, 0.15)",
                      border: "1px solid rgba(37, 211, 102, 0.4)",
                      borderRadius: "6px",
                      color: "#25d366",
                      fontSize: "10.5px",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                    }}
                  >
                    WA ↗
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}>
                    PRIMARY EMAIL
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff", marginTop: "2px" }}>
                    gp61080@gmail.com
                  </div>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => copyToClipboard("gp61080@gmail.com", "email")}
                    style={{
                      padding: "5px 8px",
                      background: "rgba(0, 240, 255, 0.1)",
                      border: "1px solid rgba(0, 240, 255, 0.3)",
                      borderRadius: "6px",
                      color: "#00f0ff",
                      fontSize: "10.5px",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {copiedKey === "email" ? "COPIED!" : "COPY"}
                  </button>
                  <a
                    href="mailto:gp61080@gmail.com"
                    style={{
                      padding: "5px 8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "10.5px",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    OPEN ↗
                  </a>
                </div>
              </div>

              {/* LinkedIn & GitHub Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    textDecoration: "none",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#a56ce8", fontFamily: "var(--font-mono)" }}>LINKEDIN</span>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>Connect Profile ↗</span>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    textDecoration: "none",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#39ff88", fontFamily: "var(--font-mono)" }}>GITHUB</span>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>View Code &amp; Repos ↗</span>
                </a>
              </div>

              {/* Location Badge */}
              <div
                style={{
                  marginTop: "auto",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>📍 Location: Andhra Pradesh, India</span>
                <span style={{ color: "#39ff88" }}>IST (UTC+5:30)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes fab-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes fab-bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        @keyframes chatModalSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cyber-fab-btn:hover {
          border-color: rgba(0, 240, 255, 0.8) !important;
          box-shadow: 0 10px 35px rgba(0, 240, 255, 0.35) !important;
          transform: translateY(-2px) scale(1.02) !important;
        }
      `}</style>
    </>
  );
}
