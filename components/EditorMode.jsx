"use client";

import FilmReel from "./FilmReel";
import { useFilmReelScroll } from "./useFilmReelScroll";

// Not admin-editable this phase (per "do not overengineer" — cinematic
// flavor text, not core content). Keyed by mode id so this file stays
// generic if reused; only "editor" ships a story beat today.
const REEL_STRIPS = ["STAGE", "DECOR", "TEAMS", "BUDGET", "EDIT", "CUES", "GUESTS", "DANCE"];
const STORY = {
  heading: "Eight fests. One thread.",
  body: "Across 8 national-level BTech fests, I ran the parts most people never see: the budget spreadsheet at 2am, the decor crew waiting on a call, the chief guest running late, the dance rehearsal that needed one more pass. I led the teams, held the money, coordinated every department in the room, and still sat down afterward to cut the film that made it all look effortless. That's the job -- creative direction and hard logistics, at the same time, under a clock that doesn't stop.",
};

export default function EditorMode({ data }) {
  const d = data;
  useFilmReelScroll("#mode-editor");

  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showCertificates = d.sections.certificates?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;
  const reelStrips = REEL_STRIPS;

  return (
    <div className="mode-view mode-view--editor" id="mode-editor" data-theme="editor">
      <div className="reel-field" aria-hidden="true">
        <FilmReel id="reel-deep" labels={reelStrips} className="film-reel--deep" />
        <FilmReel id="reel-back" labels={reelStrips} className="film-reel--back" />
        <FilmReel id="reel-mid" labels={reelStrips} className="film-reel--mid" />
        <FilmReel id="reel-front" labels={reelStrips} className="film-reel--front" />
      </div>

      <section className="hero-mode hero-mode--editor wrap">
        <div className="hero-mode__role">
          <span className="label-mono">{d.role}</span>
          <span className="hero-mode__cursor" aria-hidden="true" />
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

      {showProjects && d.projects.length > 0 && (
        <section className="section wrap" aria-labelledby="editor-productions-title">
          <div className="section-head">
            <h3 className="section-head__title" id="editor-productions-title">Selected Productions</h3>
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
        <span>© 2026</span>
      </footer>
    </div>
  );
}
