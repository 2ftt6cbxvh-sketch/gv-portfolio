"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import { drawLineChart } from "./motion";
import { useAnalystAnimations } from "./useAnalystAnimations";
import AnalystParallax from "./AnalystParallax";
import AnalystRadarChart from "./AnalystRadarChart";
import ProjectModal from "./ProjectModal";
import JourneyMap from "./JourneyMap";
import AnalystDataTicker from "./AnalystDataTicker";
import CertModal from "./CertModal";

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

export default function AnalystMode({ data, features }) {
  const d = data;
  const chartRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useAnalystAnimations("#mode-analyst");

  useEffect(() => {
    if (chartRef.current) drawLineChart(chartRef.current);
  }, []);

  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showPapers = d.sections.papers?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showAchievements = d.sections.achievements?.visible !== false;
  const showEducation = d.sections.education?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;

  const stats = buildStats(d);

  return (
    <div className="mode-view mode-view--analyst" id="mode-analyst" data-theme="analyst">
      <AnalystParallax />

      <section className="hero-mode hero-mode--analyst wrap">
        <div className="hero-mode__role">
          <span className="label-mono">{d.role}</span>
          <span className="hero-mode__cursor" aria-hidden="true" />
        </div>
        <h2 className="hero-mode__title hero-mode__title--analyst">
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
      </section>

      {/* Cyber Data Ticker Ribbon */}
      <AnalystDataTicker />

      <section className="section wrap" aria-label="Analyst Metrics Overview">
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-card__val">{s.value}</span>
              <span className="stat-card__lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section wrap" aria-label="Skill Proficiency Chart">
        <div className="analyst-chart-card">
          <div className="analyst-chart-card__head">
            <span className="label-mono">ANALYSIS // PROFICIENCY TRAJECTORY</span>
            <span className="analyst-chart-card__tag">LIVE</span>
          </div>
          <svg className="analyst-chart-svg" viewBox="0 0 600 120" ref={chartRef} aria-hidden="true">
            <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <path
              className="chart-line"
              d="M0 100 Q150 40 300 50 T600 20"
              fill="none"
              stroke={d.accent}
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </section>

      {showProjects && d.projects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-projects-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-projects-title">Data &amp; AI Projects</h3>
            <span className="section-head__num">/ 01</span>
          </div>
          <div className="projects-list">
            {d.projects.map((p) => (
              <div
                className="project-row"
                key={p.index}
                onClick={() => setSelectedProject(p)}
                style={{ willChange: "transform", cursor: "pointer" }}
              >
                <span className="project-row__index">{p.index}</span>
                <div>
                  <h4 className="project-row__title">{p.title}</h4>
                  <p className="project-row__sub">{p.sub}</p>
                </div>
                <div className="project-row__tags">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="project-row__preview-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(p);
                  }}
                >
                  Preview ↗
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {showSkills && d.skills && d.skills.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-skills-title">Analytics &amp; Technical Skills</h3>
            <span className="section-head__num">/ 02</span>
          </div>

          <AnalystRadarChart skills={d.skills} accent={d.accent || "#33c7b0"} />

          <div className="skills-grid" style={{ marginTop: 28 }}>
            {d.skills.map((grp) => (
              <div className="skill-group" key={grp.title}>
                <h4 className="skill-group__title">{grp.title}</h4>
                <div className="skill-bars">
                  {grp.bars.map((b) => (
                    <div className="skill-bar" key={b.label} data-level={b.level}>
                      <div className="skill-bar__info">
                        <span className="skill-bar__label">{b.label}</span>
                        <span className="skill-bar__pct">{b.level}%</span>
                      </div>
                      <div className="skill-bar__track">
                        <div className="skill-bar__fill" style={{ width: `${b.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showPapers && d.papers && d.papers.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-papers-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-papers-title">Research &amp; Publications</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="papers-list">
            {d.papers.map((p) => (
              <article className="paper-row" key={p.title}>
                <div className="paper-row__meta">
                  <span className="label-mono">{p.venue}</span>
                  <span className="paper-row__year">{p.year}</span>
                </div>
                <h4 className="paper-row__title">{p.title}</h4>
                <p className="paper-row__abstract">{p.abstract}</p>
                {p.url && (
                  <a className="paper-row__link" href={p.url} target="_blank" rel="noopener noreferrer">
                    Read Paper ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {showCertificates && d.certificates && d.certificates.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-certs-title">Certifications</h3>
            <span className="section-head__num">/ 04</span>
          </div>
          <div className="certs-grid">
            {d.certificates.map((c) => (
              <div className="cert-card" key={c.id || c.name} onClick={() => setSelectedCert(c)} style={{ cursor: "pointer" }}>
                <div className="cert-card__org">{c.org}</div>
                <h4 className="cert-card__name">{c.name}</h4>
                <div className="cert-card__year">{c.year}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showAchievements && d.achievements && d.achievements.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-achieve-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-achieve-title">Key Achievements</h3>
            <span className="section-head__num">/ 05</span>
          </div>
          <div className="certs-grid">
            {d.achievements.map((a) => (
              <div className="cert-card" key={a.id || a.title} onClick={() => setSelectedCert(a)} style={{ cursor: "pointer" }}>
                <div className="cert-card__org">{a.year}</div>
                <h4 className="cert-card__name">{a.title}</h4>
                {a.desc && <p style={{ fontSize: "0.82rem", color: "var(--color-fg-muted)", margin: "6px 0 0 0" }}>{a.desc}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {showEducation && d.education && d.education.length > 0 && (
        <section className="section wrap" aria-labelledby="analyst-edu-title">
          <div className="section-head">
            <h3 className="section-head__title" id="analyst-edu-title">Education</h3>
            <span className="section-head__num">/ 06</span>
          </div>
          <div className="edu-list">
            {d.education.map((e) => (
              <div className="edu-row" key={e.degree}>
                <div className="edu-row__years">
                  <span>{e.years}</span>
                  <span className="edu-row__inst">{e.institution}</span>
                </div>
                <div className="edu-row__main">
                  <h4 className="edu-row__degree">{e.degree}</h4>
                  {e.location && <span className="edu-row__loc">{e.location}</span>}
                  {e.field && <p className="edu-row__field">{e.field}</p>}
                </div>
                {e.grade && <span className="edu-row__grade">{e.grade}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {features?.milestones?.length > 0 && (
        <section className="section wrap">
          <JourneyMap milestones={features.milestones} accent={d.accent} />
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
        <span className="version-badge">{SITE_VERSION}</span>
        <span>© 2026</span>
      </footer>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
