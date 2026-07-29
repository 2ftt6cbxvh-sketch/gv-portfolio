// Content/config layer — kept separate from UI so Phase 3 can swap this
// for a Postgres/Prisma-backed fetch without touching any component markup.
// Every component below reads from this file only; no hardcoded copy in JSX.

export const person = {
  name: "Ganesh Varma",
  initials: "GV",
  email: "gp61080@gmail.com",
  location: "Andhra Pradesh, IN",
};

export const modes = [
  {
    id: "editor",
    index: "01",
    name: "Editor",
    desc: "Cinematic edits, visual storytelling, and creative direction.",
    accent: "#a56ce8",
  },
  {
    id: "analyst",
    index: "02",
    name: "Data Analyst",
    desc: "Analytics, visualization, and data-driven decision making.",
    accent: "#33c7b0",
  },
  {
    id: "developer",
    index: "03",
    name: "Software Developer",
    desc: "Full-stack engineering, systems, and shipped products.",
    accent: "#39ff88",
  },
];

// Full reference-mode content (Phase 2 scope). Editor/Analyst content
// objects are intentionally empty placeholders for Phase 3.
export const developerContent = {
  role: "Software Developer",
  heroTitlePrefix: "Ganesh Varma builds ",
  heroTitleAccent: "full-stack",
  heroTitleSuffix: " systems that ship.",
  lede: "MSc Advanced Data Science & AI candidate at the University of Liverpool. I build end-to-end products — from PostgreSQL schemas to React interfaces to AWS deployments — with the same attention to craft as this page.",
  meta: [
    { label: "Based in", value: "Andhra Pradesh, IN" },
    { label: "Stack", value: "Node.js · React · PostgreSQL" },
    { label: "Currently", value: "MSc AI & Data Science" },
  ],
  projects: [
    { index: "01", title: "FarmFreshFarmer", stack: ["Node.js", "React", "PostgreSQL"] },
    { index: "02", title: "Conway's Game of Life — 3D", stack: ["Unity", "C#", "GPU Instancing"] },
    { index: "03", title: "AI-Assisted Project Pipeline", stack: ["Python", "Generative AI", "Automation"] },
  ],
  skills: [
    {
      label: "Frontend",
      bars: [
        { name: "React / TypeScript", level: 90 },
        { name: "Responsive UI", level: 80 },
      ],
    },
    {
      label: "Backend",
      bars: [
        { name: "Node.js / Express", level: 88 },
        { name: "PostgreSQL", level: 85 },
      ],
    },
    {
      label: "Cloud & DevOps",
      bars: [
        { name: "AWS / Elastic Beanstalk", level: 75 },
        { name: "CI / Deployment", level: 70 },
      ],
    },
  ],
  social: [
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Resume", href: "#" },
  ],
};

// Deferred to Phase 3 — same shape as developerContent once populated.
export const editorContent = null;
export const analystContent = null;
