"use client";

import { useState } from "react";
import { SITE_VERSION } from "@/lib/version";
import FilmReel from "./FilmReel";
import CameraParallax from "./CameraParallax";
import { useFilmReelScroll } from "./useFilmReelScroll";
import { useEditorAnimations } from "./useEditorAnimations";
import ProjectModal from "./ProjectModal";
import EditorCinematicToggle from "./EditorCinematicToggle";
import EditorVideoReel from "./EditorVideoReel";
import JourneyMap from "./JourneyMap";
import EditorAudioWave from "./EditorAudioWave";
import EditorFilmGrainToggle from "./EditorFilmGrainToggle";
import CertModal from "./CertModal";

const REEL_STRIPS = ["STAGE", "DECOR", "TEAMS", "BUDGET", "EDIT", "CUES", "GUESTS", "DANCE"];
const STORY = {
  heading: "Eight fests. One thread.",
  body: "Across 8 national-level BTech fests, I ran the parts most people never see: the budget spreadsheet at 2am, the decor crew waiting on a call, the chief guest running late, the dance rehearsal that needed one more pass. I led the teams, held the money, coordinated every department in the room, and still sat down afterward to cut the film that made it all look effortless. That's the job -- creative direction and hard logistics, at the same time, under a clock that doesn't stop.",
};

export default function EditorMode({ data, features }) {
  const d = data;
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useFilmReelScroll("#mode-editor");
  useEditorAnimations("#mode-editor");

  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showAchievements = d.sections.achievements?.visible !== false;
  const showEducation = d.sections.education?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;
  const reelStrips = REEL_STRIPS;

  return (
    <div className="mode-view mode-view--editor" id="mode-editor" data-theme="editor">
      <div className="reel-field" aria-hidden="true">
        <FilmReel id="reel-deep" labels={reelStrips} className="film-reel--deep" />
        <FilmReel id="reel-back" labels={reelStrips} className="film-reel--back" />
        <FilmReel id="reel-mid" labels={reelStrips} className="film-reel--mid" />
        <FilmReel id="reel-front" labels={reelStrips} className="film-reel--front" />
        <CameraParallax />
      </div>

      <section className="hero-mode hero-mode--editor wrap">
        <div className="hero-mode__role" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="label-mono">{d.role}</span>
          <EditorAudioWave accent={d.accent || "#a56ce8"} />
          <EditorFilmGrainToggle />
          <EditorCinematicToggle />
        </div>

        <h2 className="hero-mode__title hero-mode__title--editor">
          {d.heroTitlePrefix}
          <span className="accent accent--script">{d.heroTitleAccent}</span>
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

      <section className="section wrap wrap--default editor-story" aria-labelledby="editor-story-title">
        <div className="editor-story__frame">
          <span className="editor-story__slate">SCENE 01 / TAKE 08</span>
          <h3 className="editor-story__heading" id="editor-story-title">{STORY.heading}</h3>
          <p className="editor-story__body">{STORY.body}</p>
        </div>
      </section>

      {/* Video Showreel Player */}
      {features?.flags?.video_reel?.enabled !== false && (
        <EditorVideoReel metadata={features?.flags?.video_reel?.metadata} />
      )}

      {showProjects && d.projects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="editor-projects-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-projects-title">Selected Projects</h3>
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
        <section className="section wrap" aria-labelledby="editor-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-skills-title">Technical Skills</h3>
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

      {showCertificates && d.certificates && d.certificates.length > 0 && (
        <section className="section wrap" aria-labelledby="editor-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-certs-title">Certifications</h3>
            <span className="section-head__num">/ 03</span>
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
        <section className="section wrap" aria-labelledby="editor-achieve-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-achieve-title">Key Achievements</h3>
            <span className="section-head__num">/ 04</span>
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
        <section className="section wrap" aria-labelledby="editor-edu-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-edu-title">Education</h3>
            <span className="section-head__num">/ 05</span>
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
        <section className="section wrap wrap--default" aria-labelledby="editor-contact-title">
          <div className="contact-block">
            <h3 className="contact-block__title" id="editor-contact-title">{d.contactHeading}</h3>
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
        <span>GV / Editor</span>
        <span className="version-badge">{SITE_VERSION}</span>
        <span>© 2026</span>
      </footer>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
