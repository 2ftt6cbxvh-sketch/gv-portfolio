"use client";

import { useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import UnityGame from "./UnityGame";
import { useDeveloperAnimations } from "./useDeveloperAnimations";
import DeveloperParallax from "./DeveloperParallax";
import ProjectModal from "./ProjectModal";
import JourneyMap from "./JourneyMap";
import DeveloperCodeIDE from "./DeveloperCodeIDE";
import CertModal from "./CertModal";

export default function DeveloperMode({ data, features }) {
  const d = data;
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useDeveloperAnimations("#mode-developer");

  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showPapers = d.sections.papers?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showAchievements = d.sections.achievements?.visible !== false;
  const showEducation = d.sections.education?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;

  return (
    <div className="mode-view mode-view--developer" id="mode-developer" data-theme="developer">
      <DeveloperParallax />

      <section className="hero-mode hero-mode--developer wrap">
        <div className="hero-mode__role">
          <span className="label-mono">{d.role}</span>
          <span className="hero-mode__cursor" aria-hidden="true" />
        </div>
        <h2 className="hero-mode__title hero-mode__title--developer">
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

      {/* Interactive VSCode Code Playground & GitHub Contribution Matrix */}
      <section className="section wrap">
        <DeveloperCodeIDE />
      </section>

      {showProjects && d.projects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-projects-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-projects-title">Shipped Projects</h3>
            <span className="section-head__num">/ 01</span>
          </div>
          <div className="projects-list">
            {d.projects.map((p) => (
              <div
                className="project-row"
                key={p.index}
                style={{ willChange: "transform", cursor: "pointer" }}
                onClick={() => setSelectedProject(p)}
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
        <section className="section wrap" aria-labelledby="dev-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-skills-title">Engineering Stack</h3>
            <span className="section-head__num">/ 02</span>
          </div>
          <div className="skills-grid">
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

      {/* Interactive Canvas/Unity Game Section */}
      <section className="section wrap" aria-labelledby="dev-game-title">
        <div className="section-head">
          <h3 className="section-head__title" id="dev-game-title">Interactive Game Sandbox</h3>
          <span className="section-head__num">/ 03</span>
        </div>
        <UnityGame />
      </section>

      {showPapers && d.papers && d.papers.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-papers-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-papers-title">Research &amp; Systems Papers</h3>
            <span className="section-head__num">/ 04</span>
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
        <section className="section wrap" aria-labelledby="dev-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-certs-title">Certifications</h3>
            <span className="section-head__num">/ 05</span>
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
        <section className="section wrap" aria-labelledby="dev-achieve-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-achieve-title">Key Achievements</h3>
            <span className="section-head__num">/ 06</span>
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
        <section className="section wrap" aria-labelledby="dev-edu-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-edu-title">Education</h3>
            <span className="section-head__num">/ 07</span>
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
        <section className="section wrap wrap--default" aria-labelledby="dev-contact-title">
          <div className="contact-block">
            <h3 className="contact-block__title" id="dev-contact-title">{d.contactHeading}</h3>
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
        <span>GV / Software Developer</span>
        <span className="version-badge">{SITE_VERSION}</span>
        <span>© 2026</span>
      </footer>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
