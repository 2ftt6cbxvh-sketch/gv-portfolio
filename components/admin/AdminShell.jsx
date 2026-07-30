"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { group: "Overview", links: [{ href: "/admin", label: "Dashboard" }] },
  {
    group: "Content",
    links: [
      { href: "/admin/modes", label: "Modes & Hero copy" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/certificates", label: "Certificates" },
      { href: "/admin/papers", label: "Papers & Publications" },
      { href: "/admin/achievements", label: "Achievements" },
      { href: "/admin/education", label: "Education" },
    ],
  },
  {
    group: "Site",
    links: [
      { href: "/admin/settings", label: "Contact & Social" },
      { href: "/admin/sections", label: "Section visibility & order" },
      { href: "/admin/theme", label: "Theme tokens" },
    ],
  },
  {
    group: "Account",
    links: [{ href: "/admin/account", label: "Change password" }],
  },
];

export default function AdminShell({ email, children }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">GV Admin</div>
        {NAV.map((section) => (
          <div key={section.group}>
            <div className="admin-nav-group-label">{section.group}</div>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="admin-sidebar__footer">
          <div style={{ fontSize: 12, color: "var(--a-muted)", marginBottom: 8, wordBreak: "break-all" }}>
            {email}
          </div>
          <Link href="/" className="admin-nav-link" style={{ marginBottom: 4 }}>
            ← View live site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="admin-btn admin-btn--sm"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
