"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Six camera SVGs floating at different depths in the Editor hero/reel field.
 *  Scroll drives each camera downward at a different speed (parallax).
 *  Mouse move adds a perpendicular X drift per camera for 3-D depth.
 *  All motion is skipped on reduced-motion / touch / compact screens.
 */

const CAMS = [
  { id:"c1", left:"5%",  top:"10%", size:76,  speed:90,  rot:-14, op:0.15, mX:20, mY:14 },
  { id:"c2", left:"75%", top:"5%",  size:128, speed:150, rot:9,   op:0.09, mX:-24, mY:18 },
  { id:"c3", left:"87%", top:"50%", size:58,  speed:65,  rot:-7,  op:0.19, mX:22, mY:-20 },
  { id:"c4", left:"3%",  top:"66%", size:100, speed:110, rot:16,  op:0.11, mX:-18, mY:22 },
  { id:"c5", left:"47%", top:"88%", size:50,  speed:55,  rot:-22, op:0.13, mX:16, mY:-14 },
  { id:"c6", left:"28%", top:"20%", size:86,  speed:100, rot:6,   op:0.08, mX:-14, mY:10 },
];

function CamSVG({ size }) {
  return (
    <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 80 60" fill="none" aria-hidden="true">
      {/* Body */}
      <rect x="4" y="14" width="72" height="42" rx="6" stroke="currentColor" strokeWidth="1.8"/>
      {/* Lens outer */}
      <circle cx="40" cy="35" r="16" stroke="currentColor" strokeWidth="1.8"/>
      {/* Lens mid */}
      <circle cx="40" cy="35" r="9"  stroke="currentColor" strokeWidth="1.4" opacity="0.65"/>
      {/* Lens core */}
      <circle cx="40" cy="35" r="3.5" fill="currentColor" opacity="0.45"/>
      {/* Viewfinder */}
      <rect x="16" y="4" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      {/* Flash/hotshoe */}
      <rect x="56" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      {/* Film windows */}
      <rect x="8"  y="20" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <rect x="61" y="20" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      {/* Focus ring ticks */}
      {[0,45,90,135,180,225,270,315].map(a => {
        const r = 19.5, rad = a * Math.PI/180;
        const x1 = 40 + r*Math.cos(rad), y1 = 35 + r*Math.sin(rad);
        const x2 = 40 + (r+3)*Math.cos(rad), y2 = 35 + (r+3)*Math.sin(rad);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.3"/>;
      })}
    </svg>
  );
}

export default function CameraParallax() {
  const itemRefs = useRef([]);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const reduce   = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact  = window.matchMedia("(max-width: 720px)").matches;
    const isTouch  = window.matchMedia("(hover: none)").matches;
    if (reduce || compact) return;

    const root = document.getElementById("mode-editor");
    const els  = itemRefs.current.filter(Boolean);
    if (!root || !els.length) return;

    // --- Scroll parallax: each camera moves Y at its own speed ---
    const triggers = els.map((el, i) =>
      gsap.to(el, {
        y: CAMS[i].speed,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.2 },
      })
    );

    // --- Mouse parallax: smooth x/y drift per camera ---
    if (isTouch) return () => triggers.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });

    const cur = CAMS.map(() => ({ x:0, y:0 }));
    const tgt = CAMS.map(() => ({ x:0, y:0 }));
    let rafId;

    const onMouse = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      CAMS.forEach((c, i) => { tgt[i].x = nx * c.mX; tgt[i].y = ny * c.mY; });
    };

    const tick = () => {
      if (root.classList.contains("is-active")) {
        els.forEach((el, i) => {
          cur[i].x += (tgt[i].x - cur[i].x) * 0.055;
          cur[i].y += (tgt[i].y - cur[i].y) * 0.055;
          gsap.set(el, { x: cur[i].x, overwrite: false });
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    tick();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
      triggers.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
    };
  }, []);

  return (
    <div className="camera-parallax-field" ref={wrapRef} aria-hidden="true">
      {CAMS.map((c, i) => (
        <div
          key={c.id}
          ref={el => { itemRefs.current[i] = el; }}
          className="camera-parallax__item"
          style={{ left: c.left, top: c.top, transform: `rotate(${c.rot}deg)`, opacity: c.op, color: "var(--color-accent)" }}
        >
          <CamSVG size={c.size} />
        </div>
      ))}
    </div>
  );
}
