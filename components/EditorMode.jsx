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
import EditorLUTMatrix from "./EditorLUTMatrix";
import JourneyMap from "./JourneyMap";
import EditorAudioWave from "./EditorAudioWave";
import EditorFilmGrainToggle from "./EditorFilmGrainToggle";
import CertModal from "./CertModal";
import KineticHeroTitle from "./KineticHeroTitle";

// Not admin-editable this phase (per "do not overengineer" — cinematic
// flavor text, not core content). Keyed by mode id so this file stays
// generic if reused; only "editor" ships a story beat today.
const REEL_STRIPS = ["STAGE", "DECOR", "TEAMS", "BUDGET", "EDIT", "CUES", "GUESTS", "DANCE"];
const STORY = {
  heading: "Eight fests. One thread.",
  body: "Across 8 national-level BTech fests, I ran the parts most people never see: the budget spreadsheet at 2am, the decor crew waiting on a call, the chief guest running late, the dance rehearsal that needed one more pass. I led the teams, held the money, coordinated every department in the room, and still sat down afterward to cut the film that made it all look effortless. That's the job -- creative direction and hard logistics, at the same time, under a clock that doesn't stop.",
};

export default function EditorMode({ data, features }) {
  const d = data;
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [lutFilter, setLutFilter] = useState("none");
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
        <div className="hero-mode__role" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="label-mono">{d.role}</span>
          <EditorAudioWave accent={d.accent || "#a56ce8"} />
          <EditorFilmGrainToggle />
          <EditorCinematicToggle />
        </div>
        <KineticHeroTitle
          prefix={d.heroTitlePrefix}
          accent={d.heroTitleAccent}
          suffix={d.heroTitleSuffix}
          className="hero-mode__title--editor"
          isScript={true}
        />
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

      {features?.flags?.video_reel?.enabled !== false && (
        <EditorVideoReel metadata={features?.flags?.video_reel?.metadata} accent={d.accent || "#a56ce8"} />
      )}

      {showProjects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="editor-productions-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-productions-title">Selected Productions</h3>
            <span className="section-head__num">/ 03</span>
          </div>
          <div className="projects-list">
            {d.projects.map((p) => (
              <div
                className="project-row"
                key={p.index}
                onClick={() => setSelectedProject(p)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <span className="project-row__index">{p.index}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h4 className="project-row__title" style={{ margin: 0 }}>{p.title}</h4>
                    <span className="slate-focus-badge" style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--color-accent)", border: "1px solid var(--color-accent)", padding: "1px 6px", borderRadius: 4, opacity: 0.85 }}>
                      [ 🎬 FOCUS :: 24FPS ]
                    </span>
                  </div>
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
        <section className="section wrap" aria-labelledby="editor-skills-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-skills-title">Craft</h3>
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
        <section className="section wrap" aria-labelledby="editor-certs-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-certs-title">Credentials</h3>
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
        <section className="section wrap" aria-labelledby="editor-achievements-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-achievements-title">Highlights</h3>
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
        <section className="section wrap" aria-labelledby="editor-edu-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-edu-title">Education</h3>
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

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        accentColor={d.accent}
      />
      <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
}
