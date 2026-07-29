/**
 * GV Logo System
 * One continuous-stroke monogram, reused for: intro, nav-corner, mode-select.
 * States: idle -> hover (magnetic + electrified) -> active (discharge) -> exit (spring return)
 * Mobile/touch: idle ambient only + tap discharge, no drag-follow.
 *
 * Framework-agnostic by design: this class drives a DOM node directly via GSAP.
 * The React wrapper (GVLogo.jsx) instantiates it once per mount and calls
 * destroy() on unmount. Kept as plain JS (not a hook) so the exact same
 * engine can back a future non-React surface if needed.
 */
import { gsap } from 'gsap';

// Single path definition shared by every instance — the "one line" concept.
// A continuous stroke: draws the G as an open circular form, then the tail
// extends and folds down into the two strokes of the V. One unbroken line.
const GV_PATH = "M 100 32 C 84 20 62 18 45 28 C 22 41 16 68 28 90 C 40 112 68 120 90 108 C 104 100 111 86 109 72 L 78 72 M 40 34 L 70 118 L 100 34";

function buildLogoSVG(idPrefix) {
  return `
    <svg viewBox="0 0 140 150" fill="none" aria-hidden="true">
      <path class="gv-logo__core" d="${GV_PATH}" />
      <path class="gv-logo__energy" id="${idPrefix}-e1" d="${GV_PATH}" style="stroke-dasharray:26 220; stroke-dashoffset:0;" />
      <path class="gv-logo__energy" id="${idPrefix}-e2" d="${GV_PATH}" style="stroke-dasharray:14 240; stroke-dashoffset:0;" />
    </svg>
  `;
}

class GVLogo {
  /**
   * @param {HTMLElement} el - container with class .gv-logo-wrap
   * @param {Object} opts
   */
  constructor(el, opts = {}) {
    this.el = el;
    this.opts = Object.assign({ radius: 140, maxOffset: 9, onActivate: null, ambient: true }, opts);
    this.idPrefix = 'logo' + Math.random().toString(36).slice(2, 8);
    this.el.innerHTML = buildLogoSVG(this.idPrefix);
    this.el.classList.add('is-idle');
    this.core = this.el.querySelector('.gv-logo__core');
    this.e1 = this.el.querySelector(`#${this.idPrefix}-e1`);
    this.e2 = this.el.querySelector(`#${this.idPrefix}-e2`);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isTouch = window.matchMedia('(hover: none)').matches;

    this.xTo = gsap.quickTo(this.el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.55)' });
    this.yTo = gsap.quickTo(this.el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.55)' });

    if (!this.reducedMotion) {
      this._ambientPulse();
      this.isTouch ? this._bindTouch() : this._bindPointer();
    }
  }

  _accentColor() {
    const raw = getComputedStyle(this.el).getPropertyValue('--color-accent').trim() || '#a56ce8';
    return raw;
  }

  _ambientPulse() {
    if (!this.opts.ambient) return;
    const c = this._accentColor();
    gsap.to(this.core, {
      filter: `drop-shadow(0 0 3px ${c}55)`,
      opacity: 0.85,
      duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1
    });
  }

  _bindPointer() {
    let hovering = false;
    let raf = null;

    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = this.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const r = this.opts.radius;
        if (dist > r) {
          if (hovering) this._onLeave();
          return;
        }
        if (!hovering) this._onEnter();
        const pull = 1 - dist / r; // stronger pull near center
        const clampedX = gsap.utils.clamp(-this.opts.maxOffset, this.opts.maxOffset, (dx / r) * this.opts.maxOffset * (0.6 + pull * 0.4));
        const clampedY = gsap.utils.clamp(-this.opts.maxOffset, this.opts.maxOffset, (dy / r) * this.opts.maxOffset * (0.6 + pull * 0.4));
        this.xTo(clampedX);
        this.yTo(clampedY);
      });
    };

    window.addEventListener('pointermove', move, { passive: true });
    this.el.addEventListener('pointerleave', () => this._onLeave());
    this.el.addEventListener('click', () => this._onActivate());

    this._hoveringRef = () => hovering;
    this._setHovering = (v) => { hovering = v; };
    this._onEnter = () => { this._setHovering(true); this._startEnergy(); };
    this._onLeave = () => {
      this._setHovering(false);
      this.xTo(0); this.yTo(0);
      this._stopEnergy();
    };
  }

  _bindTouch() {
    this.el.addEventListener('click', () => this._onActivate());
  }

  _startEnergy() {
    if (this._energyTl) this._energyTl.kill();
    const c = this._accentColor();
    gsap.to([this.e1, this.e2], { opacity: 0.55, duration: 0.3, ease: 'power2.out' });
    gsap.to(this.core, {
      filter: `drop-shadow(0 0 12px ${c}90)`,
      duration: 0.35, ease: 'power2.out'
    });
    this._energyTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    this._energyTl
      .fromTo(this.e1, { strokeDashoffset: 0 }, { strokeDashoffset: -246, duration: 0.8, ease: 'power2.inOut' })
      .fromTo(this.e2, { strokeDashoffset: 254 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.1);
  }

  _stopEnergy() {
    if (this._energyTl) this._energyTl.kill();
    const c = this._accentColor();
    gsap.to([this.e1, this.e2], { opacity: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(this.core, {
      filter: `drop-shadow(0 0 3px ${c}55)`,
      duration: 0.4, ease: 'power2.out'
    });
  }

  _onActivate() {
    const c = this._accentColor();
    gsap.timeline()
      .to([this.e1, this.e2], { opacity: 1, duration: 0.12, ease: 'power1.out' })
      .to(this.core, { filter: `drop-shadow(0 0 22px ${c})`, duration: 0.12 }, 0)
      .to([this.e1, this.e2, this.core], { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.15);
    if (typeof this.opts.onActivate === 'function') this.opts.onActivate();
  }

  /** Plays the full draw-on intro sequence. Returns a Promise resolved on completion. */
  playIntro() {
    const c = this._accentColor();
    return new Promise((resolve) => {
      gsap.set(this.core, { strokeDasharray: 340, strokeDashoffset: 340, opacity: 1 });
      gsap.set([this.e1, this.e2], { opacity: 0 });
      gsap.timeline({ onComplete: resolve })
        .to(this.core, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
        .to(this.core, { filter: `drop-shadow(0 0 16px ${c})`, duration: 0.4, ease: 'power2.out' }, '-=0.1')
        .to(this.core, { filter: `drop-shadow(0 0 3px ${c}55)`, duration: 0.6, ease: 'power2.out' });
    });
  }

  /** Mode-entry transition: recolor + discharge wipe. Returns Promise. */
  playModeTransition() {
    const c = this._accentColor();
    return new Promise((resolve) => {
      gsap.timeline({ onComplete: resolve })
        .to([this.e1, this.e2], { opacity: 0.9, duration: 0.2 })
        .fromTo(this.e1, { strokeDashoffset: 0 }, { strokeDashoffset: -246, duration: 0.5, ease: 'power2.inOut' }, 0)
        .to(this.core, { filter: `drop-shadow(0 0 30px ${c})`, scale: 1.06, duration: 0.35, ease: 'power2.out' }, 0)
        .to([this.e1, this.e2, this.core], { opacity: 0.9, duration: 0.15 }, 0.3)
        .to(this.el, { scale: 1, duration: 0.01 });
    });
  }

  destroy() {
    if (this._energyTl) this._energyTl.kill();
    gsap.killTweensOf([this.el, this.core, this.e1, this.e2]);
  }
}

export default GVLogo;
