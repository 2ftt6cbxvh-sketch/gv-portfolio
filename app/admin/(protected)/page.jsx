import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [modes, projects, skills, certificates, papers, achievements] = await Promise.all([
    prisma.modeContent.count(),
    prisma.project.count(),
    prisma.skill.count(),
    prisma.certificate.count(),
    prisma.paper.count(),
    prisma.achievement.count(),
  ]);

  const stats = [
    { label: "Modes", value: modes },
    { label: "Projects", value: projects },
    { label: "Skills", value: skills },
    { label: "Certificates", value: certificates },
    { label: "Papers", value: papers },
    { label: "Achievements", value: achievements },
  ];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-h1">Dashboard</h1>
          <p className="admin-sub">Overview of your portfolio content.</p>
        </div>
      </div>

      <div className="admin-grid">
        {stats.map((s) => (
          <div className="admin-card" key={s.label}>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>Quick links</h2>
        <p className="admin-sub" style={{ margin: 0 }}>
          Edit hero copy per mode under <strong>Modes & Hero copy</strong>. Manage projects, skills,
          certificates, papers, and achievements per mode from their sections. Control what shows and
          in what order under <strong>Section visibility & order</strong>. Update contact/social links
          under <strong>Contact & Social</strong>.
        </p>
      </div>
    </div>
  );
}
