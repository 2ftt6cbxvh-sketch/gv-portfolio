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
import TextScramble from "./TextScramble";

export default function DeveloperMode({ data, features }) {
  const d = data;
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  useDeveloperAnimations("#mode-developer");
  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showAchievements = d.sections.achievements?.visible !== false;
  const showEducation = d.sections.education?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;
  const [loadGame, setLoadGame] = useState(false);

  return (
    <div className="mode-view" id="mode-developer" data-theme="developer">
      <DeveloperParallax />
      <section className="hero-mode wrap">
        <div className="hero-mode__role">
          <span className="label-mono">{d.role}</span>
          <span className="hero-mode__cursor" aria-hidden="true" />
        </div>
        <h2
          className="hero-mode__title"
          data-text={`${d.heroTitlePrefix}${d.heroTitleAccent}${d.heroTitleSuffix}`}
        >
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

      <section className="section wrap" aria-labelledby="dev-sim-title">
        <div className="section-head">
          <h3 className="section-head__title" id="dev-sim-title">Featured Simulation — Conway's Game of Life (3D, Unity)</h3>
        </div>
        <p className="hero-mode__lede" style={{ marginBottom: "var(--space-6)" }}>
          GPU-instanced 3D cellular automaton built in Unity, compiled to WebGL and running live in this page.
        </p>
        {loadGame ? (
          <UnityGame buildName="GameOfLife3D1" title="Conway's Game of Life — 3D" />
        ) : (
          <button
            onClick={() => setLoadGame(true)}
            style={{
              padding: "12px 24px",
              background: "rgba(57, 255, 136, 0.08)",
              border: "1.5px solid var(--color-accent, #39ff88)",
              borderRadius: 8,
              color: "var(--color-accent, #39ff88)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.92rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(57, 255, 136, 0.2)",
              transition: "all 0.2s ease-in-out",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-accent, #39ff88)";
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(57, 255, 136, 0.6)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(57, 255, 136, 0.08)";
              e.currentTarget.style.color = "var(--color-accent, #39ff88)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(57, 255, 136, 0.2)";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            <span>▶</span> LAUNCH 3D UNITY SIMULATION
          </button>
        )}
      </section>

      {showProjects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-projects-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-projects-title">Selected Work</h3>
            <span className="section-head__num">/ 03</span>
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
                  <h4 className="project-row__title">
                    <TextScramble text={p.title} />
                  </h4>
                  {p.description ? <p className="project-row__desc">{p.description}</p> : null}
                  <div className="project-row__stack">
                    {p.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
                  </div>
                </div>
                <button
                  className="project-row__arrow project-row__cta"
                  onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                  aria-label={`Preview ${p.title}`}
                >
                  Preview Details →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {showSkills && d.skills.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-skills-title">Capabilities</h3>
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
        <section className="section wrap" aria-labelledby="dev-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-certs-title">Certifications</h3>
            <span className="section-head__num">/ {String(d.certificates.length).padStart(2, "0")}</span>
          </div>
          <div className="cert-grid">
            {d.certificates.map((c) => (
              <div className="cert-card" key={c.title} onClick={() => setSelectedCert(c)} style={{ cursor: "pointer" }}>
                <h4 className="cert-card__title">{c.title}</h4>
                <div className="cert-card__meta">
                  {c.issuer && <span>{c.issuer}</span>}
                  {c.year && <span>{c.year}</span>}
                </div>
                {c.url && (
                  <a className="cert-card__link" href={c.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>View credential →</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {showAchievements && d.achievements.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-achievements-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-achievements-title">Achievements</h3>
            <span className="section-head__num">/ {String(d.achievements.length).padStart(2, "0")}</span>
          </div>
          <div className="achievements-list">
            {d.achievements.map((a) => (
              <div className="achievement-row" key={a.title} onClick={() => setSelectedCert(a)} style={{ cursor: "pointer" }}>
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

      {showEducation && d.education?.length > 0 && (
        <section className="section wrap" aria-labelledby="dev-edu-title">
          <div className="section-head">
            <h3 className="section-head__title" id="dev-edu-title">Education</h3>
            <span className="section-head__num">/ {String(d.education.length).padStart(2, "0")}</span>
          </div>
          <div className="edu-list">
            {d.education.map((e, i) => (
              <div className="edu-row" key={i}>
                <div className="edu-row__years">
                  <span>{e.startYear || "—"}</span>
                  <span className="edu-row__divider">→</span>
                  <span>{e.endYear || "—"}</span>
                </div>
                <div className="edu-row__body">
                  <h4 className="edu-row__institution">{e.institution}</h4>
                  {(e.degree || e.field) && (
                    <p className="edu-row__degree">
                      {e.degree}{e.degree && e.field ? " · " : ""}{e.field}
                    </p>
                  )}
                  {e.description && <p className="edu-row__desc">{e.description}</p>}
                </div>
                {e.grade && <span className="edu-row__grade">{e.grade}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Journey map: show when milestones exist — per-milestone Show/Hide in admin is the control */}
      {features?.milestones?.length > 0 && (
        <section className="section wrap">
          <JourneyMap milestones={features.milestones} accent={d.accent} />
        </section>
      )}

      {showContact && (
        <section className="section wrap wrap--default" aria-labelledby="dev-contact-title">
          <div className="contact-block">
            <h3 className="contact-block__title" id="dev-contact-title">{d.contactHeading}</h3>
            <a className="contact-block__email" href={`mailto:${d.email || "gp61080@gmail.com"}`}>
              {d.email || "gp61080@gmail.com"}
            </a>
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

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        accentColor={d.accent}
      />
      <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
