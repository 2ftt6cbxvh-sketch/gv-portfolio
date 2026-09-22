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
            <h1 className="admin-login-title">🔐 Admin Authentication</h1>
            <p className="admin-login-subtitle">Enter your password and 2FA Authenticator code to continue.</p>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ganeshvarma.in"
                  required
                />
              </div>

              <div className="admin-field">
                <label>Admin Password</label>
                <input
                  type="password"
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
                    <span style={{ fontSize: 11, color: "var(--a-accent, #5fa8ff)", background: "rgba(95,168,255,0.1)", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                      2FA ENFORCED
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "1.2rem",
                    letterSpacing: "0.3em",
                    textAlign: "center",
                  }}
                  required={is2FAActive}
                />
                <span style={{ fontSize: 12, color: "var(--a-muted, #8b8f96)", marginTop: 4, display: "block" }}>
                  Code from Apple Passwords, Google Authenticator, or 1Password.
                </span>
              </div>

              <button type="submit" className="admin-btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? "Authenticating..." : "Sign In & Unlock Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
