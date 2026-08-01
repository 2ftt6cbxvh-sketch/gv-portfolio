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
        onSuccess={() => setIsPinGatekeeperOpen(false)}
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

      <div className="admin-login-wrap" style={{ filter: isPinGatekeeperOpen ? "blur(12px)" : "none", transition: "filter 0.3s ease" }}>
        <div className="admin-login-card">
          <h1 className="admin-login-title">GV Admin Vault</h1>
          <p className="admin-login-sub">Sign in to manage portfolio content.</p>
          {error && <div className="admin-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
