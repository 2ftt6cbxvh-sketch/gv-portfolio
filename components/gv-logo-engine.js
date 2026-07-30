import { gsap } from 'gsap';

/**
 * High-Tech Electric GV Logo System
 * SVG Frame + Interlocking Monogram + Procedural Electric Lightning Discharge on Hover.
 */

function buildLogoSVG(idPrefix) {
  return `
    <svg viewBox="0 0 160 160" fill="none" class="gv-logo-svg" aria-hidden="true">
      <defs>
        <filter id="${idPrefix}-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="${idPrefix}-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b1" />
          <feGaussianBlur stdDeviation="5" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Outer Cyber Shield Frame -->
      <polygon class="gv-logo__frame" points="80,12 140,46 140,114 80,148 20,114 20,46" />
      <polygon class="gv-logo__frame-inner" points="80,22 130,51 130,109 80,138 30,109 30,51" />

      <!-- Tech Corner Nodes -->
      <circle cx="80" cy="12" r="3" class="gv-logo__node" />
      <circle cx="140" cy="46" r="3" class="gv-logo__node" />
      <circle cx="140" cy="114" r="3" class="gv-logo__node" />
      <circle cx="80" cy="148" r="3" class="gv-logo__node" />
      <circle cx="20" cy="114" r="3" class="gv-logo__node" />
      <circle cx="20" cy="46" r="3" class="gv-logo__node" />

      <!-- Interlocking Monogram Core -->
      <path class="gv-logo__monogram-g" id="${idPrefix}-mg" d="M 116 52 C 94 34, 52 34, 38 56 C 24 78, 24 100, 38 120 C 52 138, 98 138, 116 116 L 116 86 L 82 86" />
      <path class="gv-logo__monogram-v" id="${idPrefix}-mv" d="M 44 62 L 80 130 L 116 62" />
      <line x1="68" y1="72" x2="92" y2="72" class="gv-logo__accent-slash" id="${idPrefix}-sl" />

      <!-- Electric Lightning Arc Overlay -->
      <path class="gv-logo__spark" id="${idPrefix}-s1" d="M 80 12 L 85 30 L 75 50 L 90 75 L 78 105 L 80 148" filter="url(#${idPrefix}-spark-glow)" />
      <path class="gv-logo__spark" id="${idPrefix}-s2" d="M 20 46 L 45 60 L 35 85 L 60 100 L 50 125 L 80 148" filter="url(#${idPrefix}-spark-glow)" />
      <path class="gv-logo__spark" id="${idPrefix}-s3" d="M 140 46 L 115 60 L 125 85 L 100 100 L 110 125 L 80 148" filter="url(#${idPrefix}-spark-glow)" />
    </svg>
  `;
}

class GVLogoEngine {
  constructor(el, opts = {}) {
    this.el = el;
    this.opts = Object.assign({ radius: 140, maxOffset: 9, onActivate: null, ambient: true }, opts);
    this.idPrefix = 'logo' + Math.random().toString(36).slice(2, 8);
    this.el.innerHTML = buildLogoSVG(this.idPrefix);
    this.el.classList.add('is-idle');

    this.mg = this.el.querySelector(`#${this.idPrefix}-mg`);
    this.mv = this.el.querySelector(`#${this.idPrefix}-mv`);
    this.sl = this.el.querySelector(`#${this.idPrefix}-sl`);
    this.s1 = this.el.querySelector(`#${this.idPrefix}-s1`);
    this.s2 = this.el.querySelector(`#${this.idPrefix}-s2`);
    this.s3 = this.el.querySelector(`#${this.idPrefix}-s3`);

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isTouch = window.matchMedia('(hover: none)').matches;

    this.xTo = gsap.quickTo(this.el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.55)' });
    this.yTo = gsap.quickTo(this.el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.55)' });

    if (!this.reducedMotion) {
      this.isTouch ? this._bindTouch() : this._bindPointer();
    }
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

        const pull = 1 - dist / r;
        const clampedX = gsap.utils.clamp(-this.opts.maxOffset, this.opts.maxOffset, (dx / r) * this.opts.maxOffset * (0.6 + pull * 0.4));
        const clampedY = gsap.utils.clamp(-this.opts.maxOffset, this.opts.maxOffset, (dy / r) * this.opts.maxOffset * (0.6 + pull * 0.4));
        this.xTo(clampedX);
        this.yTo(clampedY);
      });
    };

    window.addEventListener('pointermove', move, { passive: true });
    this.el.addEventListener('pointerleave', () => this._onLeave());
    this.el.addEventListener('click', () => this._onActivate());

    this._onEnter = () => {
      hovering = true;
      this.el.classList.add('is-hovered');
      this._startLightning();
    };

    this._onLeave = () => {
      hovering = false;
      this.el.classList.remove('is-hovered');
      this.xTo(0);
      this.yTo(0);
      this._stopLightning();
    };
  }

  _bindTouch() {
    this.el.addEventListener('click', () => this._onActivate());
  }

  _startLightning() {
    if (this._lightningTimer) clearInterval(this._lightningTimer);

    const generateArc = (p1, p2) => {
      const midX = (p1[0] + p2[0]) / 2 + (Math.random() - 0.5) * 26;
      const midY = (p1[1] + p2[1]) / 2 + (Math.random() - 0.5) * 26;
      const q1X = (p1[0] + midX) / 2 + (Math.random() - 0.5) * 16;
      const q1Y = (p1[1] + midY) / 2 + (Math.random() - 0.5) * 16;
      return `M ${p1[0]} ${p1[1]} L ${q1X} ${q1Y} L ${midX} ${midY} L ${p2[0]} ${p2[1]}`;
    };

    gsap.to([this.s1, this.s2, this.s3], { opacity: 0.95, duration: 0.15 });

    this._lightningTimer = setInterval(() => {
      if (this.s1) this.s1.setAttribute('d', generateArc([80, 12], [80, 148]));
      if (this.s2) this.s2.setAttribute('d', generateArc([20, 46], [140, 114]));
      if (this.s3) this.s3.setAttribute('d', generateArc([140, 46], [20, 114]));
    }, 70);
  }

  _stopLightning() {
    if (this._lightningTimer) clearInterval(this._lightningTimer);
    gsap.to([this.s1, this.s2, this.s3], { opacity: 0, duration: 0.25 });
  }

  _onActivate() {
    gsap.timeline()
      .to([this.s1, this.s2, this.s3], { opacity: 1, duration: 0.1 })
      .to([this.mg, this.mv], { scale: 1.08, transformOrigin: "center center", duration: 0.15 })
      .to([this.mg, this.mv], { scale: 1, duration: 0.25, ease: "bounce.out" })
      .to([this.s1, this.s2, this.s3], { opacity: 0, duration: 0.2 }, "+=0.1");

    if (typeof this.opts.onActivate === 'function') this.opts.onActivate();
  }

  playIntro() {
    return new Promise((resolve) => {
      const mgLen = this.mg ? this.mg.getTotalLength() : 400;
      const mvLen = this.mv ? this.mv.getTotalLength() : 300;

      gsap.set(this.mg, { strokeDasharray: mgLen, strokeDashoffset: mgLen });
      gsap.set(this.mv, { strokeDasharray: mvLen, strokeDashoffset: mvLen });
      gsap.set([this.s1, this.s2, this.s3], { opacity: 0 });

      gsap.timeline({ onComplete: resolve })
        .to(this.mg, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
        .to(this.mv, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
        .add(() => this._startLightning(), '-=0.2')
        .to([this.s1, this.s2, this.s3], { opacity: 1, duration: 0.2 }, '-=0.2')
        .to({}, { duration: 0.5 })
        .add(() => this._stopLightning());
    });
  }

  playModeTransition() {
    return new Promise((resolve) => {
      this._startLightning();
      gsap.timeline({ onComplete: () => { this._stopLightning(); resolve(); } })
        .to([this.mg, this.mv], { scale: 1.1, transformOrigin: 'center center', duration: 0.2, ease: 'power2.out' })
        .to([this.mg, this.mv], { scale: 1, duration: 0.25, ease: 'power2.inOut' });
    });
  }

  destroy() {
    if (this._lightningTimer) clearInterval(this._lightningTimer);
    gsap.killTweensOf([this.el, this.mg, this.mv, this.sl, this.s1, this.s2, this.s3]);
  }
}

export default GVLogoEngine;
