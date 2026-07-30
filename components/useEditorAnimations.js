"use client";
import { useEffect } from "react";

/**
 * Editor Mode: cinematic film-frame cursor overlay.
 * Renders four corner brackets that follow the mouse with a slow lag,
 * giving the impression of camera frame composition lines.
 */
export function useEditorAnimations(rootSelector) {
  useEffect(() => {
    const root      = document.querySelector(rootSelector);
    const reduce    = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch   = window.matchMedia("(hover: none)").matches;
    if (!root || reduce || isTouch) return;

    // Build film-frame cursor overlay
    const frame = document.createElement("div");
    frame.className = "editor-frame-cursor";
    frame.innerHTML = `
      <span class="efc__tl"></span>
      <span class="efc__tr"></span>
      <span class="efc__bl"></span>
      <span class="efc__br"></span>
      <span class="efc__hline"></span>
      <span class="efc__vline"></span>
    `;
    root.appendChild(frame);

    let rafId, mx = -400, my = -400, cx = -400, cy = -400;

    const onMove  = (e) => { mx = e.clientX; my = e.clientY; };
    const onEnter = () => frame.classList.add("is-active");
    const onLeave = () => frame.classList.remove("is-active");

    const tick = () => {
      cx += (mx - cx) * 0.07;
      cy += (my - cy) * 0.07;
      // Convert from viewport coords to root-relative
      const rect = root.getBoundingClientRect();
      frame.style.transform = `translate(${cx - rect.left}px, ${cy - rect.top}px)`;
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    tick();

    // Subtle flicker on project / cert row hover (cinematic flash)
    const addFlicker = () => {
      root.querySelectorAll(".project-row, .cert-card, .achievement-row").forEach(el => {
        if (el.dataset.flickerBound) return;
        el.dataset.flickerBound = "1";
        el.addEventListener("mouseenter", () => el.classList.add("editor-flicker"));
        el.addEventListener("animationend",  () => el.classList.remove("editor-flicker"));
      });
    };
    addFlicker();
    // Re-scan if content changes
    const mo = new MutationObserver(addFlicker);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
      frame.remove();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSelector]);
}
