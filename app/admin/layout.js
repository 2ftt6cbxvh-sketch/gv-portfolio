import "./admin.css";
import { Suspense } from "react";
import AdminVaultSecurityShield from "@/components/AdminVaultSecurityShield";

export const metadata = { title: "Admin — GV Portfolio" };

export default function AdminRootLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f0ff" }}>
          <span>🔐 INITIALIZING SECURITY SHIELD...</span>
        </div>
      }
    >
      <AdminVaultSecurityShield>{children}</AdminVaultSecurityShield>
    </Suspense>
  );
}
