"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPinGatekeeperModal from "@/components/AdminPinGatekeeperModal";
import CyberLockdownModal from "@/components/CyberLockdownModal";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPinGatekeeperOpen, setIsPinGatekeeperOpen] = useState(true);
  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [isDecoySession, setIsDecoySession] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
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
            <p className="admin-login-subtitle">Enter your primary credentials to continue.</p>

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
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
