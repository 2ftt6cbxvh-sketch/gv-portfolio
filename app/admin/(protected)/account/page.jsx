"use client";
import { useState } from "react";
import { adminFetch } from "@/components/admin/adminApi";

export default function AccountAdminPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(""); setStatus("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setLoading(true);
    try {
      await adminFetch("/api/admin/account/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setStatus("Password updated. Use your new password next time you sign in.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Change password</h1>
          <p className="admin-sub">Rotate your admin password any time — no code edits or redeploy needed.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <form className="admin-card" onSubmit={submit} style={{ maxWidth: 420 }}>
        <div className="admin-field">
          <label htmlFor="currentPassword">Current password</label>
          <input id="currentPassword" name="currentPassword" className="admin-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label htmlFor="newPassword">New password</label>
          <input id="newPassword" name="newPassword" className="admin-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
          <div className="admin-hint">At least 8 characters.</div>
        </div>
        <div className="admin-field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" name="confirmPassword" className="admin-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
        </div>
        <button className="admin-btn admin-btn--primary" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
