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

    // (Extra floating caret removed completely to ensure only the inline text cursor remains)

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
