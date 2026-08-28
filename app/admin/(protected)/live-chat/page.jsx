"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminLiveChatPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.sessions) {
          setSessions(data.sessions);
          if (!selectedSessionId && data.sessions.length > 0) {
            setSelectedSessionId(data.sessions[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active session messages
  const fetchActiveSession = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/admin/chat?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.session) {
          setActiveSession(data.session);
        }
      }
    } catch (e) {
      console.error("Failed to fetch active session:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
    pollIntervalRef.current = setInterval(() => {
      fetchSessions();
      if (selectedSessionId) {
        fetchActiveSession(selectedSessionId);
      }
    }, 2500);

    return () => clearInterval(pollIntervalRef.current);
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchActiveSession(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedSessionId || isSending) return;

    const textToSend = replyText.trim();
    setReplyText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          text: textToSend,
        }),
      });

      if (res.ok) {
        fetchActiveSession(selectedSessionId);
        fetchSessions();
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
          💬 Live Visitor Chat Dashboard
          <span style={{ fontSize: "12px", background: "rgba(0, 240, 255, 0.15)", border: "1px solid rgba(0, 240, 255, 0.4)", color: "#00f0ff", padding: "3px 8px", borderRadius: "999px", fontFamily: "var(--font-mono)" }}>
            2-WAY TELEGRAM SYNCED
          </span>
        </h1>
        <p style={{ fontSize: "13px", color: "var(--a-text-muted)", marginTop: "4px" }}>
          Chat live with visitors on your portfolio. Messages here and in Telegram (via <code style={{ color: "#00f0ff" }}>/r &lt;text&gt;</code>) are synchronized in real-time.
        </p>
      </div>

      {/* Main Grid: Sidebar + Chat Window */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "16px",
          height: "640px",
          background: "var(--a-card-bg, #0c0e14)",
          border: "1px solid var(--a-border, rgba(255,255,255,0.1))",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Sessions List */}
        <div
          style={{
            borderRight: "1px solid var(--a-border, rgba(255,255,255,0.1))",
            display: "flex",
            flexDirection: "column",
            background: "rgba(6, 8, 12, 0.6)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--a-border, rgba(255,255,255,0.1))",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--a-text-muted)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>CONVERSATIONS ({sessions.length})</span>
            <span style={{ fontSize: "11px", color: "#39ff88" }}>● Live Polling</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {sessions.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--a-text-muted)", fontSize: "13px" }}>
                No visitor conversations yet.
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = sess.id === selectedSessionId;
                const lastMsg = sess.messages?.[0]?.text || "No messages yet";
                const isRecent = new Date() - new Date(sess.lastActiveAt) < 5 * 60 * 1000; // active in last 5m

                return (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      background: isSelected ? "rgba(0, 240, 255, 0.08)" : "transparent",
                      borderLeft: isSelected ? "3px solid #00f0ff" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: isRecent ? "#39ff88" : "rgba(255,255,255,0.3)",
                            boxShadow: isRecent ? "0 0 6px #39ff88" : "none",
                          }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                          {sess.visitorName}
                        </span>
                      </div>
                      {sess.unreadByAdmin > 0 && (
                        <span
                          style={{
                            background: "#ff5f56",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 700,
                            borderRadius: "999px",
                            padding: "1px 6px",
                          }}
                        >
                          {sess.unreadByAdmin} NEW
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "11.5px", color: "var(--a-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "10.5px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
                      <span>📍 {sess.currentMode || "Landing"}</span>
                      <span>{new Date(sess.lastActiveAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Room */}
        {activeSession ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(8, 10, 16, 0.4)" }}>
            {/* Active Visitor Info Header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--a-border, rgba(255,255,255,0.1))",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(12, 16, 24, 0.7)",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span>{activeSession.visitorName}</span>
                  {activeSession.visitorPhone && (
                    <span style={{ fontSize: "12px", color: "#39ff88", fontFamily: "var(--font-mono)", background: "rgba(57, 255, 136, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      📱 {activeSession.visitorPhone}
                    </span>
                  )}
                  {activeSession.visitorPhone && (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <a
                        href={`tel:${activeSession.visitorPhone.replace(/\s+/g, "")}`}
                        style={{
                          fontSize: "10px",
                          color: "#fff",
                          background: "rgba(255,255,255,0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        CALL ↗
                      </a>
                      <a
                        href={`https://wa.me/${activeSession.visitorPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "10px",
                          color: "#25d366",
                          background: "rgba(37, 211, 102, 0.15)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        WHATSAPP ↗
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "var(--a-text-muted)", marginTop: "2px" }}>
                  🌐 {activeSession.visitorLocation || "Location N/A"} • IP: <code>{activeSession.visitorIp || "127.0.0.1"}</code> • Mode: <span style={{ color: "#a56ce8" }}>{activeSession.currentMode || "Landing"}</span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Telegram Command: <code>/r &lt;reply&gt;</code>
              </div>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {activeSession.messages?.map((msg) => {
                const isAdmin = msg.sender === "ADMIN";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAdmin ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)", marginBottom: "3px" }}>
                      {isAdmin ? "You (Admin / Telegram)" : activeSession.visitorName}
                    </div>
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "10px 16px",
                        borderRadius: isAdmin ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        background: isAdmin
                          ? "linear-gradient(135deg, #00f0ff, #0099ff)"
                          : "rgba(255, 255, 255, 0.08)",
                        color: isAdmin ? "#000000" : "#ffffff",
                        fontWeight: isAdmin ? 600 : 400,
                        fontSize: "13px",
                        lineHeight: 1.45,
                        border: isAdmin ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                    <div style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendReply}
              style={{
                padding: "16px 20px",
                background: "rgba(10, 14, 20, 0.95)",
                borderTop: "1px solid var(--a-border, rgba(255,255,255,0.1))",
                display: "flex",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder={`Reply to ${activeSession.visitorName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isSending || !replyText.trim()}
                style={{
                  padding: "0 22px",
                  background: replyText.trim() ? "#00f0ff" : "rgba(255, 255, 255, 0.1)",
                  color: replyText.trim() ? "#000" : "rgba(255,255,255,0.4)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: replyText.trim() ? "pointer" : "default",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {isSending ? "Sending..." : "SEND REPLY →"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--a-text-muted)", fontSize: "14px" }}>
            Select a conversation on the left to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
