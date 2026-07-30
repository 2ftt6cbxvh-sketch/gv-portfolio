"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { id: "a1", left: "4%",  top: "12%", size: 90,  speed: 95,  rot: -8,  op: 0.14, mX: 22, mY: 15, type: "chart" },
  { id: "a2", left: "78%", top: "8%",  size: 110, speed: 140, rot: 12,  op: 0.10, mX: -22, mY: 18, type: "scatter" },
  { id: "a3", left: "86%", top: "52%", size: 75,  speed: 70,  rot: -6,  op: 0.16, mX: 20, mY: -18, type: "donut" },
  { id: "a4", left: "5%",  top: "68%", size: 105, speed: 115, rot: 14,  op: 0.12, mX: -16, mY: 20, type: "bars" },
  { id: "a5", left: "46%", top: "86%", size: 65,  speed: 60,  rot: -18, op: 0.15, mX: 18, mY: -12, type: "network" },
  { id: "a6", left: "30%", top: "22%", size: 85,  speed: 105, rot: 8,   op: 0.09, mX: -15, mY: 12, type: "matrix" },
];

function AnalystSVG({ type, size }) {
  const w = size;
  const h = Math.round(size * 0.75);

  if (type === "chart") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="72" height="52" rx="4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"/>
        <path d="M12 44 L28 32 L44 38 L68 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="44" r="3" fill="currentColor"/>
        <circle cx="28" cy="32" r="3" fill="currentColor"/>
        <circle cx="44" cy="38" r="3" fill="currentColor"/>
        <circle cx="68" cy="16" r="3.5" fill="currentColor"/>
        <line x1="12" y1="48" x2="68" y2="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5"/>
      </svg>
    );
  }
  if (type === "scatter") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <line x1="10" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="10" y1="10" x2="10" y2="50" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="22" cy="40" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="34" cy="28" r="4" fill="currentColor" opacity="0.9"/>
        <circle cx="42" cy="35" r="2.5" fill="currentColor" opacity="0.7"/>
        <circle cx="54" cy="18" r="4.5" fill="currentColor"/>
        <circle cx="64" cy="24" r="3" fill="currentColor" opacity="0.85"/>
        <line x1="15" y1="45" x2="70" y2="15" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.6"/>
      </svg>
    );
  }
  if (type === "donut") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <circle cx="40" cy="30" r="22" stroke="currentColor" strokeWidth="6" opacity="0.3"/>
        <path d="M40 8 A22 22 0 0 1 62 30" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="40" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    );
  }
  if (type === "bars") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <rect x="12" y="32" width="10" height="20" rx="2" fill="currentColor" opacity="0.5"/>
        <rect x="28" y="20" width="10" height="32" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="44" y="10" width="10" height="42" rx="2" fill="currentColor"/>
        <rect x="60" y="26" width="10" height="26" rx="2" fill="currentColor" opacity="0.6"/>
        <line x1="8" y1="52" x2="74" y2="52" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
  }
  if (type === "network") {
    return (
      <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <line x1="20" y1="20" x2="40" y2="38" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <line x1="60" y1="18" x2="40" y2="38" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <line x1="40" y1="38" x2="30" y2="50" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <line x1="40" y1="38" x2="58" y2="46" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="60" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="40" cy="38" r="7" fill="currentColor"/>
        <circle cx="30" cy="50" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="58" cy="46" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
  return (
    <svg width={w} height={h} viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="64" height="44" rx="4" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 2" opacity="0.5"/>
      <text x="18" y="28" fill="currentColor" fontSize="11" fontFamily="monospace" fontWeight="bold">∑ (x - μ)²</text>
      <text x="18" y="44" fill="currentColor" fontSize="10" fontFamily="monospace" opacity="0.7">Δy / Δx</text>
    </svg>
  );
}

export default function AnalystParallax() {
  const itemRefs = useRef([]);

  useEffect(() => {
    const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 720px)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (reduce || compact) return;

    const root = document.getElementById("mode-analyst");
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
      els.forEach((el, i) => {
        cur[i].x += (tgt[i].x - cur[i].x) * 0.055;
        cur[i].y += (tgt[i].y - cur[i].y) * 0.055;
        gsap.set(el, { x: cur[i].x, overwrite: false });
      });
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
          <AnalystSVG type={c.type} size={c.size} />
        </div>
      ))}
    </div>
  );
}
