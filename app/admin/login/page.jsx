"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPinGatekeeperModal from "@/components/AdminPinGatekeeperModal";
import CyberLockdownModal from "@/components/CyberLockdownModal";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ganeshvarma.in");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPinGatekeeperOpen, setIsPinGatekeeperOpen] = useState(true);
  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [isDecoySession, setIsDecoySession] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const gw = sessionStorage.getItem("adminGatewayVerified");
      const sp = sessionStorage.getItem("starPatternVerified");
      if (gw === "true" || sp) {
        setIsPinGatekeeperOpen(false);
      }
    }

    // Check if 2FA is active
    fetch("/api/public/features")
      .then((res) => res.json())
      .then((data) => {
        const gwFlag = data.flags?.find((f) => f.key === "admin_secret_gateway");
        if (gwFlag?.metadata) {
          try {
            const parsed = JSON.parse(gwFlag.metadata);
            if (parsed.is2FAEnabled) setIs2FAActive(true);
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      totpCode: totpCode.trim(),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error.includes("TOTP_REQUIRED")) {
        setError("6-Digit Authenticator code is required.");
      } else if (res.error.includes("INVALID_TOTP")) {
        setError("Invalid 6-digit Authenticator code. Check Apple Passwords or Google Authenticator.");
      } else if (res.error.includes("RATE_LIMITED")) {
        setError("🚫 24-Hour security block active. 5 failed attempts exceeded.");
      } else {
        setError("Incorrect email, password, or 2FA Authenticator code.");
      }
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin">
      {/* 6-Digit Cyber Security Holographic Keypad Gatekeeper Modal */}
      <AdminPinGatekeeperModal
        isOpen={isPinGatekeeperOpen}
        onSuccess={(isDecoy) => {
          if (isDecoy) {
            setIsDecoySession(true);
          } else {
            setIsPinGatekeeperOpen(false);
          }
        }}
        onFail={() => {
          setIsPinGatekeeperOpen(false);
          setIsLockdownOpen(true);
        }}
        expectedPin="134214"
      />

      {/* Cyber Security Warning Lockdown Modal */}
      <CyberLockdownModal
        isOpen={isLockdownOpen}
        lockdownSeconds={90}
        onClose={() => {
          setIsLockdownOpen(false);
          router.push("/");
        }}
      />

      {/* Hide real admin email/password card completely if decoy trap session is active */}
      {!isDecoySession && (
        <div className="admin-login-wrap" style={{ filter: isPinGatekeeperOpen ? "blur(16px)" : "none", transition: "filter 0.3s ease" }}>
          <div className="admin-login-card">
            <h1 className="admin-login-title">
              <span style={{ fontSize: "1.3rem" }}>🔐</span>
              <span>Admin Vault Authentication</span>
            </h1>
            <p className="admin-login-sub">Enter your master password and 2FA Authenticator code to continue.</p>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-field">
                <label>Admin Email</label>
                <input
                  type="email"
                  className="admin-login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ganeshvarma.in"
                  required
                />
              </div>

              <div className="admin-field">
                <label>Master Password</label>
                <input
                  type="password"
                  className="admin-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="admin-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🛡️ 6-Digit Authenticator Code (TOTP)</span>
                  </label>
                  {is2FAActive && (
                    <span style={{ fontSize: 10.5, color: "#00f0ff", background: "rgba(0, 240, 255, 0.12)", border: "1px solid rgba(0, 240, 255, 0.3)", padding: "2px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.06em" }}>
                      2FA ENFORCED
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className="admin-totp-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  required={is2FAActive}
                />
                <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.4)", marginTop: 6, display: "block", textAlign: "center" }}>
                  Apple Passwords · Google Authenticator · 1Password
                </span>
              </div>

              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading ? "Authenticating Vault..." : "Sign In & Unlock Vault →"}
              </button>

              <div style={{ textAlign: "center", marginTop: 18 }}>
                <a
                  href="/"
                  style={{
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: 12,
                    textDecoration: "none",
                    fontFamily: "var(--font-mono, monospace)",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#00f0ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
                >
                  ← Return to Portfolio
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
