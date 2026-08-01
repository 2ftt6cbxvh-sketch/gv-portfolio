"use client";

import { useEffect, useState, useRef } from "react";

export default function CyberLockdownModal({ isOpen, lockdownSeconds = 90, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(lockdownSeconds);
  const audioCtxRef = useRef(null);

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

  // 2. High-Alert Emergency Siren Synthesis with Mobile AudioContext Autoplay Unlock
  useEffect(() => {
    if (!isOpen) return;

    let audioCtx = null;
    let oscPrimary = null;
    let oscSub = null;
    let gainNode = null;
    let sirenInterval = null;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        // Auto Resume for Mobile Web Browsers
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        // Master Gain Node - Smooth 450ms Crescendo Ramp-In Envelope (No ear-blowing initial pop!)
        gainNode = audioCtx.createGain();
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.45);
        gainNode.connect(audioCtx.destination);

        // Primary Piercing Sawtooth Alarm Oscillator
        oscPrimary = audioCtx.createOscillator();
        oscPrimary.type = "sawtooth";
        oscPrimary.frequency.setValueAtTime(820, audioCtx.currentTime);
        oscPrimary.connect(gainNode);
        oscPrimary.start();

        // Deep Square Sub-Bass Oscillator for Industrial Threat Texture
        oscSub = audioCtx.createOscillator();
        oscSub.type = "square";
        oscSub.frequency.setValueAtTime(410, audioCtx.currentTime);
        oscSub.connect(gainNode);
        oscSub.start();

        // Rapid 320ms High-Alert Two-Tone Siren Pitch Sweep (880Hz <-> 460Hz)
        let isHighTone = false;
        sirenInterval = setInterval(() => {
          if (audioCtx && oscPrimary && oscSub) {
            isHighTone = !isHighTone;
            const now = audioCtx.currentTime;
            oscPrimary.frequency.setTargetAtTime(isHighTone ? 880 : 460, now, 0.05);
            oscSub.frequency.setTargetAtTime(isHighTone ? 440 : 230, now, 0.05);
          }
        }, 320);

        // Mobile Gesture Unlock Listener (iOS Safari & Android Chrome autoplay policy fix)
        const unlockAudioOnMobile = () => {
          if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
          }
        };

        window.addEventListener("touchstart", unlockAudioOnMobile, { passive: true });
        window.addEventListener("click", unlockAudioOnMobile, { passive: true });
      }
    } catch (e) {}

    return () => {
      if (sirenInterval) clearInterval(sirenInterval);
      if (oscPrimary) {
        try { oscPrimary.stop(); } catch (e) {}
      }
      if (oscSub) {
        try { oscSub.stop(); } catch (e) {}
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
      }
    };
  }, [isOpen]);

  const handleModalTap = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleModalTap}
      onTouchStart={handleModalTap}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999999,
        background: "rgba(2, 4, 8, 0.96)",
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
          background: "radial-gradient(circle at 30% 30%, rgba(255, 0, 50, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(0, 120, 255, 0.35) 0%, transparent 60%)",
          animation: "strobeFlash 0.5s infinite alternate",
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes strobeFlash {
          0% { opacity: 0.3; }
          100% { opacity: 1.0; }
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 40px #ff003c, inset 0 0 25px #ff003c; }
          50% { box-shadow: 0 0 65px #0088ff, inset 0 0 40px #0088ff; }
        }
      ` }} />

      {/* Cyber Security Warning Frame */}
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
          animation: "neonPulse 1.2s infinite ease-in-out",
          boxSizing: "border-box",
        }}
      >
        {/* Top Cyber Telemetry Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,0,60,0.3)", paddingBottom: 10, marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#ff003c" }}>
          <span>🚨 SECURITY ALERT // HIGH INTENSITY LOCKDOWN</span>
          <span>SYS_ID: 34 1004 84 10</span>
        </div>

        {/* Warning Triangle Icon */}
        <div style={{ margin: "0 auto 16px auto", width: 72, height: 72, borderRadius: "50%", border: "2px solid #ff003c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "rgba(255, 0, 60, 0.12)", boxShadow: "0 0 30px rgba(255, 0, 60, 0.7)" }}>
          ⚠️
        </div>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "#ff003c", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 }}>
          HIGH-ALERT SECURITY BREACH // ACCESS DENIED
        </span>

        <h2 style={{ margin: "0 0 14px 0", fontSize: "1.45rem", color: "#ffffff", fontWeight: 800, letterSpacing: "0.04em" }}>
          UNAUTHORIZED ACCESS ATTEMPT DETECTED
        </h2>

        {/* Indian Cyber Law Statutory Warning Box */}
        <div style={{ background: "rgba(255, 0, 60, 0.1)", border: "1px solid rgba(255, 0, 60, 0.45)", borderRadius: 8, padding: 16, textAlign: "left", marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "0.82rem", color: "#ffffff", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>
            ⚠️ <strong>STATUTORY WARNING UNDER INDIAN CYBER LAWS:</strong>
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.55, fontFamily: "var(--font-mono)" }}>
            You are attempting to gain unauthorized entry into a restricted classified area of this system. Repeated unauthorized intrusion or cyber tampering is sternly prohibited and punishable under <strong>Section 66 (Hacking), Section 66B (Data Theft) &amp; Section 66F (Cyber Terrorism)</strong> of the <strong>Indian Information Technology (IT) Act, 2000</strong> &amp; relevant sections of the <strong>Bharatiya Nyaya Sanhita (BNS) / IPC</strong> with up to 10 years imprisonment.
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
