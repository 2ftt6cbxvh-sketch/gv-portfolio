"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ties three .film-reel tracks inside `rootSelector` to scroll progress:
 * scrub-based (no rAF math of our own), so it's paused entirely when off-
 * screen and costs nothing on other modes/pages. Each reel moves at a
 * different speed/direction for parallax depth. Respects reduced-motion
 * and simplifies to a single slow drift on touch/small screens.
 */
export function useFilmReelScroll(rootSelector) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompact = window.matchMedia("(max-width: 720px)").matches;

    const tracks = [
      // Back layer is hidden via CSS on small screens (≤720px) — skip its
      // ScrollTrigger entirely there so nothing animates off-screen for free.
      !isCompact && { el: root.querySelector("#reel-back .film-reel__track"), from: "0%", to: "-14%" },
      { el: root.querySelector("#reel-mid .film-reel__track"), from: "0%", to: isCompact ? "5%" : "18%" },
      { el: root.querySelector("#reel-front .film-reel__track"), from: "0%", to: isCompact ? "-4%" : "-9%" },
    ].filter(Boolean).filter((t) => t.el);

    if (prefersReduced || !tracks.length) return;

    const triggers = tracks.map((t) =>
      gsap.fromTo(
        t.el,
        { xPercent: parseFloat(t.from) },
        {
          xPercent: parseFloat(t.to),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      )
    );

    return () => {
      triggers.forEach((tw) => tw.scrollTrigger?.kill());
      triggers.forEach((tw) => tw.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSelector]);
}
