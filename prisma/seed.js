// Seeds the DB from the existing static content (content/site.js) so the
// migration from static -> DB-backed loses nothing, plus creates the admin
// user. Safe to re-run: uses upsert/deleteMany+create per section.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Re-implemented here (not imported) because this runs standalone via
// `node prisma/seed.js`, outside Next's module resolution / JSX pipeline.
const person = {
  name: "Ganesh Varma",
  initials: "GV",
  email: "gp61080@gmail.com",
  location: "Andhra Pradesh, IN",
};

const modesSeed = [
  {
    modeId: "editor",
    index: "01",
    name: "Editor",
    desc: "Cinematic edits, visual storytelling, and creative direction.",
    accentColor: "#a56ce8",
    role: "Editor & Creative Director",
    heroTitlePrefix: "Ganesh Varma directs ",
    heroTitleAccent: "moments",
    heroTitleSuffix: " worth remembering.",
    lede: "Four years shaping live events end to end -- from raw footage and stage design to the last edit that ships. I work in the space between chaos and timing: the cut that lands, the cue that hits, the frame that holds.",
    contactHeading: "Let's produce something.",
    meta: [
      { label: "Experience", value: "4 years, live production" },
      { label: "Scale", value: "8 national BTech fests" },
      { label: "Tools", value: "DaVinci Resolve · Premiere" },
    ],
    skillGroups: [
      { label: "Production", skills: [{ name: "Event & stage direction", level: 92 }, { name: "Budget management", level: 85 }] },
      { label: "Coordination", skills: [{ name: "Team & vendor leadership", level: 90 }, { name: "Cross-department sync", level: 88 }] },
      { label: "Post & Story", skills: [{ name: "Video editing", level: 82 }, { name: "Narrative pacing", level: 80 }] },
    ],
    projects: [
      { title: "National BTech Fest -- Stage & Decor Direction", stack: ["Stage design", "Decor", "Chief guest coordination"] },
      { title: "Cross-Department Event Command", stack: ["Team leadership", "Budget ownership", "Cross-dept sync"] },
      { title: "Post-Production & Highlight Edits", stack: ["DaVinci Resolve", "Video editing", "Story pacing"] },
    ],
    achievements: [
      { title: "Organised 8 national-level BTech fest events", description: "End-to-end production across stage, decor, budget, and cross-department coordination.", year: "2022-2026" },
    ],
  },
  {
    modeId: "analyst",
    index: "02",
    name: "Data Analyst",
    desc: "Analytics, visualization, and data-driven decision making.",
    accentColor: "#33c7b0",
    role: "Data Analyst",
    heroTitlePrefix: "Ganesh Varma turns data into ",
    heroTitleAccent: "decisions",
    heroTitleSuffix: ".",
    lede: "MSc Advanced Data Science & AI candidate. I build the pipeline from raw numbers to a chart someone actually acts on -- clean data, honest models, visuals that tell the truth fast.",
    contactHeading: "Let's dig into some data.",
    meta: [
      { label: "Focus", value: "Big Data & ML" },
      { label: "Tools", value: "Python · Power BI · SQL" },
      { label: "Currently", value: "MSc AI & Data Science" },
    ],
    skillGroups: [
      { label: "Analysis", skills: [{ name: "Python / Pandas", level: 88 }, { name: "SQL", level: 85 }] },
      { label: "Visualization", skills: [{ name: "Power BI", level: 84 }, { name: "Dashboard design", level: 80 }] },
      { label: "Machine Learning", skills: [{ name: "Model building", level: 78 }, { name: "Statistical analysis", level: 82 }] },
    ],
    projects: [
      { title: "Big Data Analytics Coursework", stack: ["Python", "Spark", "Data pipelines"] },
      { title: "Computational Intelligence Models", stack: ["Machine Learning", "Python", "Optimization"] },
      { title: "Power BI Dashboarding", stack: ["Power BI", "SQL", "Data visualization"] },
    ],
    papers: [],
  },
  {
    modeId: "developer",
    index: "03",
    name: "Software Developer",
    desc: "Full-stack engineering, systems, and shipped products.",
    accentColor: "#39ff88",
    role: "Software Developer",
    heroTitlePrefix: "Ganesh Varma builds ",
    heroTitleAccent: "full-stack",
    heroTitleSuffix: " systems that ship.",
    lede: "MSc Advanced Data Science & AI candidate at the University of Liverpool. I build end-to-end products — from PostgreSQL schemas to React interfaces to AWS deployments — with the same attention to craft as this page.",
    contactHeading: "Let's build something.",
    meta: [
      { label: "Based in", value: "Andhra Pradesh, IN" },
      { label: "Stack", value: "Node.js · React · PostgreSQL" },
      { label: "Currently", value: "MSc AI & Data Science" },
    ],
    skillGroups: [
      { label: "Frontend", skills: [{ name: "React / TypeScript", level: 90 }, { name: "Responsive UI", level: 80 }] },
      { label: "Backend", skills: [{ name: "Node.js / Express", level: 88 }, { name: "PostgreSQL", level: 85 }] },
      { label: "Cloud & DevOps", skills: [{ name: "AWS / Elastic Beanstalk", level: 75 }, { name: "CI / Deployment", level: 70 }] },
    ],
    projects: [
      { title: "FarmFreshFarmer", stack: ["Node.js", "React", "PostgreSQL"] },
      { title: "Conway's Game of Life — 3D", stack: ["Unity", "C#", "GPU Instancing"] },
      { title: "AI-Assisted Project Pipeline", stack: ["Python", "Generative AI", "Automation"] },
    ],
  },
];

const sectionDefaults = ["hero", "projects", "skills", "certificates", "papers", "achievements", "contact"];

async function main() {
  console.log("Seeding SiteSettings...");
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        name: person.name,
        initials: person.initials,
        email: person.email,
        location: person.location,
        resumeUrl: "#",
        githubUrl: "#",
        linkedinUrl: "#",
      },
    });
  }

  for (const [i, m] of modesSeed.entries()) {
    console.log(`Seeding mode: ${m.modeId}`);
    const mode = await prisma.modeContent.upsert({
      where: { modeId: m.modeId },
      update: {
        index: m.index, name: m.name, desc: m.desc, accentColor: m.accentColor,
        role: m.role, heroTitlePrefix: m.heroTitlePrefix, heroTitleAccent: m.heroTitleAccent,
        heroTitleSuffix: m.heroTitleSuffix, lede: m.lede, contactHeading: m.contactHeading, order: i,
      },
      create: {
        modeId: m.modeId, index: m.index, name: m.name, desc: m.desc, accentColor: m.accentColor,
        role: m.role, heroTitlePrefix: m.heroTitlePrefix, heroTitleAccent: m.heroTitleAccent,
        heroTitleSuffix: m.heroTitleSuffix, lede: m.lede, contactHeading: m.contactHeading, order: i,
      },
    });

    // Re-seed child collections only if empty (idempotent, admin edits survive re-seed).
    const metaCount = await prisma.metaItem.count({ where: { modeId: mode.modeId } });
    if (metaCount === 0 && m.meta?.length) {
      await prisma.metaItem.createMany({
        data: m.meta.map((mi, idx) => ({ modeId: mode.modeId, label: mi.label, value: mi.value, order: idx })),
      });
    }

    const groupCount = await prisma.skillGroup.count({ where: { modeId: mode.modeId } });
    if (groupCount === 0 && m.skillGroups?.length) {
      for (const [gi, g] of m.skillGroups.entries()) {
        const group = await prisma.skillGroup.create({
          data: { modeId: mode.modeId, label: g.label, order: gi },
        });
        await prisma.skill.createMany({
          data: g.skills.map((s, si) => ({ groupId: group.id, name: s.name, level: s.level, order: si })),
        });
      }
    }

    const projectCount = await prisma.project.count({ where: { modeId: mode.modeId } });
    if (projectCount === 0 && m.projects?.length) {
      await prisma.project.createMany({
        data: m.projects.map((p, idx) => ({
          modeId: mode.modeId, title: p.title, stack: p.stack, order: idx, featured: idx === 0,
        })),
      });
    }

    if (m.achievements?.length) {
      const achCount = await prisma.achievement.count({ where: { modeId: mode.modeId } });
      if (achCount === 0) {
        await prisma.achievement.createMany({
          data: m.achievements.map((a, idx) => ({
            modeId: mode.modeId, title: a.title, description: a.description, year: a.year, order: idx,
          })),
        });
      }
    }

    for (const [si, section] of sectionDefaults.entries()) {
      await prisma.sectionConfig.upsert({
        where: { modeId_section: { modeId: mode.modeId, section } },
        update: {},
        create: { modeId: mode.modeId, section, visible: true, order: si },
      });
    }
  }

  console.log("Seeding theme tokens...");
  const tokenDefaults = {
    "editor.accent": "#a56ce8",
    "analyst.accent": "#33c7b0",
    "developer.accent": "#39ff88",
  };
  for (const [key, value] of Object.entries(tokenDefaults)) {
    await prisma.themeToken.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seeding admin user...");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ganeshvarma.in").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "12345678";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({ data: { email: adminEmail, passwordHash } });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
