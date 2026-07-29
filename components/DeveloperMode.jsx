import { useState } from "react";
import UnityGame from "./UnityGame";

export default function DeveloperMode({ data }) {
  const d = data;
  const showProjects = d.sections.projects?.visible !== false;
  const showSkills = d.sections.skills?.visible !== false;
  const showContact = d.sections.contact?.visible !== false;
  const [loadGame, setLoadGame] = useState(false);

  return (
    <div className="mode-view" id="mode-developer" data-theme="developer">
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
      </section>

      <section className="section wrap" aria-labelledby="dev-sim-title">
        <div className="section-head">
          <h3 className="section-head__title" id="dev-sim-title">Featured Simulation — Conway's Game of Life (3D, Unity)</h3>
        </div>
        <p className="hero-mode__lede" style={{ marginBottom: "var(--space-6)" }}>
          GPU-instanced 3D cellular automaton built in Unity, compiled to WebGL and running live in this page.
        </p>
        {loadGame ? (
          <UnityGame buildName="GameOfLife3D" title="Conway's Game of Life — 3D" />
        ) : (
          <button className="admin-btn admin-btn--primary" onClick={() => setLoadGame(true)}>
            ▶ Load simulation
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
        <span>© 2026</span>
      </footer>
    </div>
  );
}
