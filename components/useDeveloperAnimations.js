"use client";
import { useEffect } from "react";

/**
 * Developer Mode animations:
 * 1. Periodic CSS glitch on the hero title (class-toggled, no GSAP).
 * 2. Terminal block cursor that follows the mouse slowly — feels like
 *    a blinking CLI caret tracking your position on the page.
 * 3. Magnetic pull on project rows — they slightly tilt toward the cursor.
 */
export function useDeveloperAnimations(rootSelector) {
  useEffect(() => {
    const root    = document.querySelector(rootSelector);
    const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (!root) return;

    const cleanups = [];

    // ── 1. Clean hero title setup (glitch timer disabled to prevent text flickering) ──
    const title = root.querySelector(".hero-mode__title");
    if (title) {
      title.classList.remove("dev-glitch-active", "dev-glitch-title");
    }

    // ── 2. Terminal block cursor ───────────────────────────────────────
    if (!isTouch && !reduce) {
      const caret = document.createElement("div");
      caret.className = "dev-term-caret";
      root.appendChild(caret);

      let rafId = null, mx = -400, my = -400, cx = -400, cy = -400;
      let active = false;
      let rect = { left: 0, top: 0 };

      const updateRect = () => { rect = root.getBoundingClientRect(); };

      const onMove = (e) => {
        if (!active) return;
        mx = e.clientX;
        my = e.clientY;
      };

      const tick = () => {
        if (!active) return;
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        caret.style.transform = `translate(${cx - rect.left}px, ${cy - rect.top}px)`;
        rafId = requestAnimationFrame(tick);
      };

      const onEnter = () => {
        updateRect();
        active = true;
        caret.classList.add("is-active");
        if (!rafId) tick();
      };

      const onLeave = () => {
        active = false;
        caret.classList.remove("is-active");
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      };

      window.addEventListener("resize", updateRect, { passive: true });
      document.addEventListener("mousemove", onMove, { passive: true });
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        window.removeEventListener("resize", updateRect);
        document.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        if (rafId) cancelAnimationFrame(rafId);
        caret.remove();
      });
    }

    // ── 3. Magnetic tilt on project rows ──────────────────────────────
    if (!isTouch && !reduce) {
      const bindMagnetic = () => {
        root.querySelectorAll(".project-row").forEach(row => {
          if (row.dataset.magBound) return;
          row.dataset.magBound = "1";

          const onMagMove = (e) => {
            const rect = row.getBoundingClientRect();
            const rx   = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
            const ry   = ((e.clientY - rect.top)  / rect.height - 0.5) * 4;
            row.style.transform = `perspective(600px) rotateX(${-ry}deg) rotateY(${rx}deg)`;
          };
          const onMagLeave = () => { row.style.transform = ""; };

          row.addEventListener("mousemove",  onMagMove,  { passive: true });
          row.addEventListener("mouseleave", onMagLeave);
        });
      };
      bindMagnetic();
      const mo = new MutationObserver(bindMagnetic);
      mo.observe(root, { childList: true, subtree: true });
      cleanups.push(() => {
        mo.disconnect();
        root.querySelectorAll(".project-row").forEach(r => { r.style.transform = ""; });
      });
    }

    return () => cleanups.forEach(fn => typeof fn === "function" && fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSelector]);
}
