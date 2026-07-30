"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { id: "d1", left: "5%",  top: "10%", size: 95,  speed: 100, rot: -10, op: 0.15, mX: 20, mY: 16, type: "brackets" },
  { id: "d2", left: "76%", top: "7%",  size: 115, speed: 145, rot: 8,   op: 0.10, mX: -24, mY: 18, type: "terminal" },
  { id: "d3", left: "85%", top: "54%", size: 70,  speed: 65,  rot: -8,  op: 0.16, mX: 22, mY: -16, type: "database" },
  { id: "d4", left: "4%",  top: "65%", size: 100, speed: 110, rot: 15,  op: 0.12, mX: -18, mY: 22, type: "git" },
  { id: "d5", left: "48%", top: "85%", size: 60,  speed: 55,  rot: -20, op: 0.14, mX: 16, mY: -14, type: "circuit" },
  { id: "d6", left: "28%", top: "18%", size: 85,  speed: 95,  rot: 6,   op: 0.09, mX: -14, mY: 10, type: "fn" },
];

function DevSVG({ type, size }) {
  const w = size;
  const h = Math.round(size * 0.75);

  if (type === "brackets") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <path d="M24 16 L8 30 L24 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M56 16 L72 30 L56 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="46" y1="12" x2="34" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      </svg>
    );
  }
  if (type === "terminal") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="72" height="48" rx="5" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="4" y1="18" x2="76" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        <circle cx="20" cy="12" r="2.5" fill="currentColor" opacity="0.6"/>
        <circle cx="28" cy="12" r="2.5" fill="currentColor" opacity="0.3"/>
        <path d="M12 28 L18 33 L12 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="24" y1="38" x2="38" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="42" y="27" width="8" height="13" fill="currentColor" opacity="0.7"/>
      </svg>
    );
  }
  if (type === "database") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <ellipse cx="40" cy="14" rx="26" ry="7" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M14 14 V 30 C 14 37, 66 37, 66 30 V 14" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M14 30 V 46 C 14 53, 66 53, 66 46 V 30" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    );
  }
  if (type === "git") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <line x1="24" y1="12" x2="24" y2="48" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M24 24 C 48 24, 48 38, 56 38" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="12" r="4.5" fill="currentColor"/>
        <circle cx="24" cy="48" r="4.5" fill="currentColor"/>
        <circle cx="56" cy="38" r="4.5" fill="currentColor"/>
      </svg>
    );
  }
  if (type === "circuit") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <rect x="28" y="18" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="8" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="8" y1="36" x2="28" y2="36" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="52" y1="30" x2="72" y2="30" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="8" cy="24" r="3" fill="currentColor"/>
        <circle cx="8" cy="36" r="3" fill="currentColor"/>
        <circle cx="72" cy="30" r="3" fill="currentColor"/>
      </svg>
    );
  }
  return (
    <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="64" height="44" rx="4" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <text x="16" y="28" fill="currentColor" fontSize="12" fontFamily="monospace" fontWeight="bold">const app = ()</text>
      <text x="16" y="44" fill="currentColor" fontSize="11" fontFamily="monospace" opacity="0.7">=&gt; async {}</text>
    </svg>
  );
}

export default function DeveloperParallax() {
  const itemRefs = useRef([]);

  useEffect(() => {
    const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 720px)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (reduce || compact) return;

    const root = document.getElementById("mode-developer");
    const els  = itemRefs.current.filter(Boolean);
    if (!root || !els.length) return;

    const triggers = els.map((el, i) =>
      gsap.to(el, {
        y: ITEMS[i].speed,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.2 },
      })
    );

    if (isTouch) return () => triggers.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });

    const cur = ITEMS.map(() => ({ x: 0, y: 0 }));
    const tgt = ITEMS.map(() => ({ x: 0, y: 0 }));
    let rafId;

    const onMouse = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      ITEMS.forEach((c, i) => { tgt[i].x = nx * c.mX; tgt[i].y = ny * c.mY; });
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
    <div className="mode-parallax-field" aria-hidden="true">
      {ITEMS.map((c, i) => (
        <div
          key={c.id}
          ref={el => { itemRefs.current[i] = el; }}
          className="mode-parallax__item"
          style={{ left: c.left, top: c.top, transform: `rotate(${c.rot}deg)`, opacity: c.op, color: "var(--color-accent)" }}
        >
          <DevSVG type={c.type} size={c.size} />
        </div>
      ))}
    </div>
  );
}
