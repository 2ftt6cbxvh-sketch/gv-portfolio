"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminVaultSecurityShield({ children }) {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const keyParam = searchParams.get("key");

    async function verifyCredentials() {
      // 1. URL History Masking: Strip ?key= parameter from URL address bar immediately
      if (keyParam && typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // 2. Check Client Session Storage or Verify via Server API
      let isPatternVerified = false;

      if (typeof window !== "undefined") {
        const rawToken = sessionStorage.getItem("starPatternVerified");
        if (rawToken) {
          try {
            const parsed = JSON.parse(rawToken);
            if (parsed.verified && parsed.expiresAt && Date.now() < parsed.expiresAt) {
              isPatternVerified = true;
            } else {
              sessionStorage.removeItem("starPatternVerified");
            }
          } catch (e) {
            if (rawToken === "true") isPatternVerified = true;
          }
        }
      }

      if (isPatternVerified) {
        setIsAuthorized(true);
        return;
      }

      // 3. Verify keyParam against Server Endpoint
      if (keyParam) {
        try {
          const res = await fetch("/api/public/verify-vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "key", payload: keyParam }),
          });
          const data = await res.json();
          if (data.success) {
            setIsAuthorized(true);
            return;
          }
        } catch (e) {}
      }

      // Dispatch Telegram Alert for Unauthorized Direct URL Access Attempt!
      try {
        fetch("/api/public/verify-vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "unauthorized_url", payload: window.location.href }),
        });
      } catch (e) {}

      setIsAuthorized(false);
    }

    verifyCredentials();
  }, [searchParams]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f0ff", fontFamily: "var(--font-mono)" }}>
        <span>🔐 VERIFYING VAULT SECURITY CREDENTIALS...</span>
      </div>
    );
  }

  // Authentic 404 Page Not Found Screen for unauthorized or expired direct address bar access!
  if (!isAuthorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030712",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em", marginBottom: 8 }}>
          404
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 12px 0", color: "#ffffff" }}>
          This page could not be found.
        </h1>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", maxWidth: 420, lineHeight: 1.6, marginBottom: 28 }}>
          The requested URL path does not exist on this server or your 3-minute pattern security handshake has expired.
        </p>

        <Link
          href="/"
          style={{
            padding: "12px 24px",
            background: "#ffffff",
            color: "#000000",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.88rem",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          Return to Home Page
        </Link>
      </div>
    );
  }

  return children;
}
