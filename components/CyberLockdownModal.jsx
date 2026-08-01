"use client";

import { useEffect, useState } from "react";

export default function CyberLockdownModal({ isOpen, lockdownSeconds = 90, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(lockdownSeconds);

  // 1. Live Countdown Timer
  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(lockdownSeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, lockdownSeconds, onClose]);

  // 2. Soft Atmospheric Cyber Warning Siren (Web Audio API)
  useEffect(() => {
    if (!isOpen) return;

    let audioCtx = null;
    let osc = null;
    let gainNode = null;
    let sirenInterval = null;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        osc = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(520, audioCtx.currentTime); // Atmospheric warning pitch

        // Soft, comfortable volume level (0.04)
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();

        let isHigh = false;
        sirenInterval = setInterval(() => {
          if (audioCtx && osc) {
            isHigh = !isHigh;
            osc.frequency.setTargetAtTime(isHigh ? 720 : 520, audioCtx.currentTime, 0.12);
          }
        }, 650);
      }
    } catch (e) {}

    return () => {
      if (sirenInterval) clearInterval(sirenInterval);
      if (osc) {
        try { osc.stop(); } catch (e) {}
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999999,
        background: "rgba(2, 4, 8, 0.95)",
        backdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        pointerEvents: "auto",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      {/* Flashing Red & Blue Police Strobe Ambient Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 30% 30%, rgba(255, 0, 50, 0.25) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(0, 120, 255, 0.25) 0%, transparent 60%)",
          animation: "strobeFlash 0.8s infinite alternate",
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes strobeFlash {
          0% { opacity: 0.4; }
          100% { opacity: 1.0; }
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 30px #ff003c, inset 0 0 20px #ff003c; }
          50% { box-shadow: 0 0 50px #0088ff, inset 0 0 35px #0088ff; }
        }
      ` }} />

      {/* Cyber Security Warning Frame (Reference Neon Double Frame) */}
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          background: "#040710",
          border: "2px solid #ff003c",
          borderRadius: 12,
          padding: "32px 28px",
          textAlign: "center",
          position: "relative",
          animation: "neonPulse 1.6s infinite ease-in-out",
          boxSizing: "border-box",
        }}
      >
        {/* Top Cyber Telemetry Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,0,60,0.3)", paddingBottom: 10, marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#ff003c" }}>
          <span>🚨 SECURITY ALERT // STATUS 403 RESTRICTED</span>
          <span>SYS_ID: 34 1004 84 10</span>
        </div>

        {/* Warning Triangle Icon */}
        <div style={{ margin: "0 auto 16px auto", width: 72, height: 72, borderRadius: "50%", border: "2px solid #ff003c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "rgba(255, 0, 60, 0.12)", boxShadow: "0 0 25px rgba(255, 0, 60, 0.5)" }}>
          ⚠️
        </div>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "#ff003c", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
          RESTRICTED AREA // ACCESS DENIED
        </span>

        <h2 style={{ margin: "0 0 14px 0", fontSize: "1.45rem", color: "#ffffff", fontWeight: 800, letterSpacing: "0.04em" }}>
          UNAUTHORIZED ACCESS ATTEMPT DETECTED
        </h2>

        {/* Indian Cyber Law Statutory Warning Box */}
        <div style={{ background: "rgba(255, 0, 60, 0.08)", border: "1px solid rgba(255, 0, 60, 0.35)", borderRadius: 8, padding: 16, textAlign: "left", marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "0.82rem", color: "#ffffff", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>
            ⚠️ <strong>STATUTORY WARNING UNDER INDIAN CYBER LAWS:</strong>
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.55, fontFamily: "var(--font-mono)" }}>
            You are attempting to gain unauthorized entry into a restricted area of this system. Repeated unauthorized intrusion or cyber tampering is sternly prohibited and punishable under <strong>Section 66 (Hacking), Section 66B (Data Theft) &amp; Section 66F (Cyber Terrorism)</strong> of the <strong>Indian Information Technology (IT) Act, 2000</strong> &amp; relevant sections of the <strong>Bharatiya Nyaya Sanhita (BNS) / IPC</strong> with up to 10 years imprisonment.
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(0, 136, 255, 0.15)", border: "1.5px solid #0088ff", padding: "8px 18px", borderRadius: 20, marginBottom: 24 }}>
          <span style={{ fontSize: 16 }}>⏱️</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: "#0088ff", fontWeight: 700 }}>
            SYSTEM LOCKDOWN: {secondsLeft}s REMAINING
          </span>
        </div>

        {/* OK Button to Return to Site */}
        <div>
          <button
            onClick={onClose}
            style={{
              padding: "12px 28px",
              background: "#ff003c",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 0 25px rgba(255, 0, 60, 0.6)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(255, 0, 60, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 0, 60, 0.6)";
            }}
          >
            🆗 ACKNOWLEDGE &amp; RETURN TO PORTFOLIO
          </button>
        </div>
      </div>
    </div>
  );
}
