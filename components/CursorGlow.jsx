"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Global custom cursor — replaces default cursor on pointer devices.
 * Dot follows instantly; ring lags behind with lerp for a fluid trailing feel.
 * Color automatically tracks --color-accent so it changes per mode.
 * Disabled on touch/hover:none devices and prefers-reduced-motion.
 */
export default function CursorGlow() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const posRef  = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const rafRef  = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const canHover      = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduce) return;

    setMounted(true);
    const pos = posRef.current;

    const onMove = (e) => { pos.mx = e.clientX; pos.my = e.clientY; };
    document.addEventListener("mousemove", onMove, { passive: true });

    // Scale ring on interactive elements
    const big   = () => ringRef.current?.classList.add("is-hovering");
    const small = () => ringRef.current?.classList.remove("is-hovering");
    const SELECTORS = "a,button,[tabindex='0'],.portal,.project-row,.cert-card,.achievement-row,.paper-row,.stat-card,.skill-bar,.portal__enter";
    const addHover = () => {
      document.querySelectorAll(SELECTORS).forEach((el) => {
        el.addEventListener("mouseenter", big);
        el.addEventListener("mouseleave", small);
      });
    };
    addHover();
    // Re-scan after mode switches (MutationObserver on #stage)
    const mo = new MutationObserver(addHover);
    const stage = document.getElementById("stage");
    if (stage) mo.observe(stage, { attributes: true, attributeFilter: ["data-mode"] });

    // Animation loop — dot instant, ring lerped
    const tick = () => {
      pos.rx += (pos.mx - pos.rx) * 0.13;
      pos.ry += (pos.my - pos.ry) * 0.13;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.mx}px,${pos.my}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.rx}px,${pos.ry}px) translate(-50%,-50%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      mo.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
