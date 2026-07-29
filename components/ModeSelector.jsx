import { modes, person } from "@/content/site";

export default function ModeSelector({ selectorRef }) {
  return (
    <main className="selector" id="selector" ref={selectorRef}>
      <div className="selector__intro reveal" style={{ opacity: 0 }}>
        <span className="label-mono selector__eyebrow">{person.name} / {person.initials}</span>
        <h1 className="selector__title">Three disciplines. One line of work.</h1>
        <p className="selector__sub">Choose how you&apos;d like to explore — each mode is a distinct world, built from the same person.</p>
      </div>

      <div className="portals" role="list">
        {modes.map((mode) => (
          <article className="portal" data-target={mode.id} role="listitem" tabIndex={0} style={{ opacity: 0 }} key={mode.id}>
            <div className="portal__tint" />
            <span className="portal__index">{mode.index}</span>
            <div>
              <h2 className="portal__name">{mode.name}</h2>
              <p className="portal__desc">{mode.desc}</p>
              <div className="portal__cue" aria-hidden="true">
                {mode.id === "analyst" && (
                  <svg viewBox="0 0 200 40" fill="none" aria-hidden="true">
                    <path d="M2 32 L40 20 L75 26 L110 8 L145 14 L198 4" stroke="#33c7b0" strokeWidth="2" />
                  </svg>
                )}
              </div>
            </div>
            <span className="portal__enter">Enter mode →</span>
          </article>
        ))}
      </div>
    </main>
  );
}
