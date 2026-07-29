"use client";

import { editorContent } from "@/content/site";
import FilmReel from "./FilmReel";
import { useFilmReelScroll } from "./useFilmReelScroll";

export default function EditorMode() {
  const d = editorContent;
  useFilmReelScroll("#mode-editor");

  return (
    <div className="mode-view mode-view--editor" id="mode-editor" data-theme="editor">
      <div className="reel-field" aria-hidden="true">
        <FilmReel id="reel-back" labels={d.reelStrips} className="film-reel--back" />
        <FilmReel id="reel-mid" labels={d.reelStrips} className="film-reel--mid" />
        <FilmReel id="reel-front" labels={d.reelStrips} className="film-reel--front" />
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
          <h3 className="editor-story__heading" id="editor-story-title">{d.story.heading}</h3>
          <p className="editor-story__body">{d.story.body}</p>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="editor-productions-title">
        <div className="section-head">
          <h3 className="section-head__title" id="editor-productions-title">Selected Productions</h3>
          <span className="section-head__num">/ 03</span>
        </div>
        <div className="projects-list">
          {d.productions.map((p) => (
            <div className="project-row" key={p.index}>
              <span className="project-row__index">{p.index}</span>
              <div>
                <h4 className="project-row__title">{p.title}</h4>
                <div className="project-row__stack">
                  {p.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
                </div>
              </div>
              <span className="project-row__arrow">→</span>
            </div>
          ))}
        </div>
      </section>

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

      <section className="section wrap wrap--default" aria-labelledby="editor-contact-title">
        <div className="contact-block">
          <h3 className="contact-block__title" id="editor-contact-title">Let&apos;s produce something.</h3>
          <a className="contact-block__email" href="mailto:gp61080@gmail.com">gp61080@gmail.com</a>
          <div className="social-row">
            {d.social.map((s) => (
              <a href={s.href} target="_blank" rel="noopener noreferrer" key={s.label}>{s.label}</a>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer-mode wrap">
        <span>GV / Editor</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
