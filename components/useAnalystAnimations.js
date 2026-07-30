"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Analyst Mode animations:
 * 1. Stat card value count-up on scroll entry.
 * 2. Data crosshair that follows the mouse inside the mode — shows
 *    pixel coordinates in a monospace label, evoking a data dashboard.
 * 3. Ripple pulse on stat cards when hovered.
 */
export function useAnalystAnimations(rootSelector) {
  useEffect(() => {
    const root    = document.querySelector(rootSelector);
    const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (!root) return;

    const cleanups = [];

    // ── 1. Animated stat counters ──────────────────────────────────────
    if (!reduce) {
      root.querySelectorAll(".stat-card__value").forEach(el => {
        const raw      = el.textContent.trim();
        const isPct    = raw.includes("%");
        const num      = parseInt(raw.replace(/\D/g,""), 10);
        if (isNaN(num) || num === 0) return;

        el.textContent = isPct ? "00%" : "00";
        const obj = { val: 0 };

        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(obj, {
            val: num, duration: 1.8, ease: "power3.out",
            onUpdate: () => {
              const v = Math.round(obj.val);
              el.textContent = isPct ? `${v}%` : String(v).padStart(2,"0");
            },
            onComplete: () => { el.textContent = raw; },
          }),
        });
        cleanups.push(() => st.kill());
      });
    }

    // ── 2. Data crosshair cursor ───────────────────────────────────────
    if (!isTouch && !reduce) {
      const xhair = document.createElement("div");
      xhair.className = "analyst-crosshair";
      xhair.innerHTML = `
        <div class="analyst-xh__h"></div>
        <div class="analyst-xh__v"></div>
        <div class="analyst-xh__label"></div>
      `;
      root.appendChild(xhair);

      const lbl = xhair.querySelector(".analyst-xh__label");
      let rafId = null, mx = -400, my = -400, cx = -400, cy = -400;
      let active = false;
      let rect = { left: 0, top: 0 };

      const updateRect = () => { rect = root.getBoundingClientRect(); };

      const onMove = (e) => {
        if (!active) return;
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
        if (lbl) lbl.textContent = `${Math.round(mx)} × ${Math.round(my)}`;
      };

      const tick = () => {
        if (!active) return;
        cx += (mx - cx) * 0.12;
        cy += (my - cy) * 0.12;
        xhair.style.setProperty("--xh-x", `${cx}px`);
        xhair.style.setProperty("--xh-y", `${cy}px`);
        rafId = requestAnimationFrame(tick);
      };

      const onEnter = () => {
        updateRect();
        active = true;
        xhair.classList.add("is-active");
        if (!rafId) tick();
      };

      const onLeave = () => {
        active = false;
        xhair.classList.remove("is-active");
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      };

      window.addEventListener("resize", updateRect, { passive: true });
      root.addEventListener("mousemove", onMove, { passive: true });
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        window.removeEventListener("resize", updateRect);
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        if (rafId) cancelAnimationFrame(rafId);
        xhair.remove();
      });
    }

    // ── 3. Ripple on stat cards ────────────────────────────────────────
    if (!reduce) {
      const addRipple = () => {
        root.querySelectorAll(".stat-card").forEach(card => {
          if (card.dataset.rippleBound) return;
          card.dataset.rippleBound = "1";
          card.addEventListener("mouseenter", () => card.classList.add("analyst-pulse"));
          card.addEventListener("animationend", () => card.classList.remove("analyst-pulse"));
        });
      };
      addRipple();
      const mo = new MutationObserver(addRipple);
      mo.observe(root, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());
    }

    return () => cleanups.forEach(fn => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSelector]);
}
