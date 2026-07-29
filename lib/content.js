// Server-side data-access layer. Public pages and admin pages both read
// through here so the query shape lives in one place.
import { prisma } from "./prisma";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }
  return settings;
}

export async function getModeContent(modeId) {
  return prisma.modeContent.findUnique({
    where: { modeId },
    include: {
      metaItems: { orderBy: { order: "asc" } },
      skillGroups: { orderBy: { order: "asc" }, include: { skills: { orderBy: { order: "asc" } } } },
      projects: { orderBy: { order: "asc" } },
      certificates: { orderBy: { order: "asc" } },
      papers: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
    },
  });
}

export async function getAllModes() {
  return prisma.modeContent.findMany({ orderBy: { order: "asc" } });
}

export async function getSectionConfig(modeId) {
  const rows = await prisma.sectionConfig.findMany({ where: { modeId }, orderBy: { order: "asc" } });
  const map = {};
  rows.forEach((r) => { map[r.section] = { visible: r.visible, order: r.order }; });
  return map;
}

export async function isSectionVisible(modeId, section, fallback = true) {
  const row = await prisma.sectionConfig.findUnique({ where: { modeId_section: { modeId, section } } });
  return row ? row.visible : fallback;
}

export async function getThemeTokens() {
  const rows = await prisma.themeToken.findMany();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return map;
}

// Aggregates everything the public site needs in one shot: site settings,
// every mode's full content (with section visibility/order applied), so
// app/page.js can do a single server-side fetch and pass plain props down
// to the (client) AppShell / mode components. No component below this layer
// talks to Prisma directly.
export async function getPublicSiteData() {
  const [settings, modeRows, themeTokens] = await Promise.all([
    getSiteSettings(),
    prisma.modeContent.findMany({
      orderBy: { order: "asc" },
      where: { visible: true },
      include: {
        metaItems: { orderBy: { order: "asc" } },
        skillGroups: { orderBy: { order: "asc" }, include: { skills: { orderBy: { order: "asc" } } } },
        projects: { where: { visible: true }, orderBy: { order: "asc" } },
        certificates: { where: { visible: true }, orderBy: { order: "asc" } },
        papers: { where: { visible: true }, orderBy: { order: "asc" } },
        achievements: { where: { visible: true }, orderBy: { order: "asc" } },
      },
    }),
    getThemeTokens(),
  ]);

  const sectionRows = await prisma.sectionConfig.findMany({ orderBy: { order: "asc" } });
  const sectionsByMode = {};
  sectionRows.forEach((r) => {
    if (!sectionsByMode[r.modeId]) sectionsByMode[r.modeId] = {};
    sectionsByMode[r.modeId][r.section] = { visible: r.visible, order: r.order };
  });

  const social = [
    { label: "GitHub", href: settings.githubUrl || "#" },
    { label: "LinkedIn", href: settings.linkedinUrl || "#" },
    { label: "Resume", href: settings.resumeUrl || "#" },
  ];
  if (settings.twitterUrl) social.push({ label: "Twitter", href: settings.twitterUrl });

  const modes = modeRows.map((m) => ({
    id: m.modeId,
    index: m.index,
    name: m.name,
    desc: m.desc,
    accent: themeTokens[`${m.modeId}.accent`] || m.accentColor,
    role: m.role,
    heroTitlePrefix: m.heroTitlePrefix,
    heroTitleAccent: m.heroTitleAccent,
    heroTitleSuffix: m.heroTitleSuffix,
    lede: m.lede,
    contactHeading: m.contactHeading,
    meta: m.metaItems.map((mi) => ({ label: mi.label, value: mi.value })),
    skills: m.skillGroups.map((g) => ({
      label: g.label,
      bars: g.skills.map((s) => ({ name: s.name, level: s.level })),
    })),
    projects: m.projects.map((p, idx) => ({
      index: String(idx + 1).padStart(2, "0"),
      title: p.title,
      description: p.description,
      stack: p.stack,
      url: p.url,
      imageUrl: p.imageUrl,
      featured: p.featured,
    })),
    certificates: m.certificates.map((c) => ({
      title: c.title, issuer: c.issuer, year: c.year, url: c.url, imageUrl: c.imageUrl,
    })),
    papers: m.papers.map((p) => ({ title: p.title, venue: p.venue, year: p.year, url: p.url })),
    achievements: m.achievements.map((a) => ({ title: a.title, description: a.description, year: a.year })),
    social,
    email: settings.email,
    sections: sectionsByMode[m.modeId] || {},
  }));

  return {
    person: { name: settings.name, initials: settings.initials, email: settings.email, location: settings.location },
    social,
    modes,
  };
}
