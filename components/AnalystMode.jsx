"use client";

import { useEffect, useRef } from "react";
import { drawLineChart } from "./motion";
import { useAnalystAnimations } from "./useAnalystAnimations";

// KPI strip — not DB-modeled (would be overengineering per the brief), but
// each value is derived from real content already in the database (project
// count, skill count, top skill average) so it never drifts from admin edits.
function buildStats(d) {
  const allLevels = d.skills.flatMap((g) => g.bars.map((b) => b.level));
  const avgLevel = allLevels.length ? Math.round(allLevels.reduce((a, b) => a + b, 0) / allLevels.length) : 0;
  return [
    { label: "Projects shipped", value: String(d.projects.length).padStart(2, "0") },
    { label: "Core skills tracked", value: String(allLevels.length).padStart(2, "0") },
    { label: "Avg. proficiency", value: `${avgLevel}%` },
    { label: "Papers & publications", value: String(d.papers.length).padStart(2, "0") },
  ];
}

function StatChart({ accent }) {
  const svgRef = useRef(null);
  useEffect(() => {
    if (svgRef.current) drawLineChart(svgRef.current);
  }, []);
  return (
    <svg ref={svgRef} className="analyst-chart" viewBox="0 0 320 88" fill="none" aria-hidden="true">
      <path
        d="M2 70 L40 58 L78 62 L116 34 L154 42 L192 18 L230 26 L268 10 L318 4"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AnalystMode({ data }) {
  const d = data;
  useAnalystAnimations("#mode-analyst");
  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showAchievements = d.sections.achievements?.visible !== false;
  const showPapers = d.sections.papers?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;
  const stats = buildStats(d);

  return (
    <div className="mode-view" id="mode-analyst" data-theme="analyst">
      <section className="hero-mode wrap">
        <div className="hero-mode__role">
          <span className="label-mono">{d.role}</span>
          <span className="hero-mode__cursor" aria-hidden="true" />
        </div>
        <h2 className="hero-mode__title">
          {d.heroTitlePrefix}
          <span className="accent">{d.heroTitleAccent}</span>
          {d.heroTitleSuffix}
        </h2>
        <p className="hero-mode__lede">{d.lede}</p>
        <div className="hero-mode__meta">
          {d.meta.map((m) => (
            <span className="meta-item" key={m.label}>
              {m.label}
              <strong>{m.value}</strong>
            </span>
          ))}
        </div>
        <div className="analyst-chart-wrap" aria-hidden="true">
          <StatChart accent={d.accent || "#33c7b0"} />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="analyst-stats-title">
        <div className="section-head">
          <h3 className="section-head__title" id="analyst-stats-title">At a Glance</h3>
          <span className="section-head__num">/ 04</span>
        </div>
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {showProjects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-projects-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-projects-title">Analysis & Dashboards</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="projects-list">
            {d.projects.map((p) => (
              <div className="project-row" key={p.index}>
                <span className="project-row__index">{p.index}</span>
                <div>
                  <h4 className="project-row__title">{p.title}</h4>
                  {p.description ? <p className="project-row__desc">{p.description}</p> : null}
                  <div className="project-row__stack">
                    {p.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
                  </div>
                </div>
                {p.url ? (
                  <a className="project-row__arrow project-row__cta" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title}`}>View Project →</a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {showSkills && d.skills.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-skills-title">Toolkit</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="skills-grid">
            {d.skills.map((block) => (
              <div className="skill-block" key={block.label}>
                <div className="skill-block__label">{block.label}</div>
                {block.bars.map((bar) => (
                  <div className="skill-bar" data-level={bar.level} key={bar.name}>
                    <span className="skill-bar__name">{bar.name}</span>
                    <div className="skill-bar__track"><div className="skill-bar__fill" /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {showCertificates && d.certificates.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-certs-title">Certificates</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="cert-grid">
            {d.certificates.map((c) => (
              <div className="cert-card" key={c.title}>
                <h4 className="cert-card__title">{c.title}</h4>
                <div className="cert-card__meta">
                  {c.issuer && <span>{c.issuer}</span>}
                  {c.year && <span>{c.year}</span>}
                </div>
                {c.url && (
                  <a className="cert-card__link" href={c.url} target="_blank" rel="noopener noreferrer">View credential →</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {showAchievements && d.achievements.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-achievements-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-achievements-title">Achievements</h3>
            <span className="section-head__num">/ {String(d.achievements.length).padStart(2, "0")}</span>
          </div>
          <div className="achievements-list">
            {d.achievements.map((a) => (
              <div className="achievement-row" key={a.title}>
                <div className="achievement-row__body">
                  <h4 className="achievement-row__title">{a.title}</h4>
                  {a.description && <p className="achievement-row__desc">{a.description}</p>}
                </div>
                {a.year && <span className="achievement-row__year">{a.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {showPapers && d.papers.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-papers-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-papers-title">Papers & Publications</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="papers-list">
            {d.papers.map((p) => (
              <div className="paper-row" key={p.title}>
                <div>
                  <h4 className="paper-row__title">{p.title}</h4>
                  <div className="paper-row__meta">
                    {p.venue && <span>{p.venue}</span>}
                    {p.year && <span>{p.year}</span>}
                  </div>
                </div>
                {p.url ? (
                  <a className="project-row__arrow project-row__cta" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title}`}>View Project →</a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <section className="section wrap wrap--default" aria-labelledby="analyst-contact-title">
          <div className="contact-block">
            <h3 className="contact-block__title" id="analyst-contact-title">{d.contactHeading}</h3>
            <a className="contact-block__email" href={`mailto:${d.email || "gp61080@gmail.com"}`}>{d.email || "gp61080@gmail.com"}</a>
            <div className="social-row">
              {d.social.map((s) => (
                <a href={s.href} target="_blank" rel="noopener noreferrer" key={s.label}>{s.label}</a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer-mode wrap">
        <span>GV / Data Analyst</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
