"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminVaultSecurityShield({ children }) {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    // 1. Check if ?key= matches or if patternToken is verified in sessionStorage
    const keyParam = searchParams.get("key");
    const isPatternVerified = typeof window !== "undefined" && sessionStorage.getItem("starPatternVerified") === "true";

    // Secret Key matches 134214 or Pattern Handshake verified
    if (keyParam === "134214" || isPatternVerified) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [searchParams]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f0ff", fontFamily: "var(--font-mono)" }}>
        <span>🔐 VERIFYING VAULT SECURITY CREDENTIALS...</span>
      </div>
    );
  }

  // Authentic 404 Page Not Found Screen for unauthorized direct address bar access!
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
          The requested URL path does not exist on this server or requires classified authorization credentials.
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
