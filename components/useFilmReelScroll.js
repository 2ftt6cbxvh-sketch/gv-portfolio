"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ties four .film-reel tracks inside `rootSelector` to scroll progress.
 * Scrub-based (no rAF math), paused entirely when off-screen.
 * Each reel moves at a different speed, direction, and Y-offset for cinematic
 * parallax depth. Respects reduced-motion and simplifies on touch/small screens.
 */
export function useFilmReelScroll(rootSelector) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompact = window.matchMedia("(max-width: 720px)").matches;

    if (prefersReduced) return;

    // Build track config: el, from%, to%, rotation start/end
    const tracks = [
      !isCompact && {
        el: root.querySelector("#reel-back .film-reel__track"),
        from: "2%", to: "-16%",
        rotFrom: "-0.6deg", rotTo: "0.6deg",
        scrub: 1.4,
      },
      {
        el: root.querySelector("#reel-mid .film-reel__track"),
        from: "-4%", to: isCompact ? "6%" : "22%",
        rotFrom: "0.4deg", rotTo: "-0.4deg",
        scrub: 0.9,
      },
      {
        el: root.querySelector("#reel-front .film-reel__track"),
        from: "3%", to: isCompact ? "-5%" : "-12%",
        rotFrom: "-0.3deg", rotTo: "0.3deg",
        scrub: 1.1,
      },
      // Extra deep-back layer (very slow, opposite direction)
      !isCompact && {
        el: root.querySelector("#reel-deep .film-reel__track"),
        from: "-2%", to: "8%",
        rotFrom: "0.2deg", rotTo: "-0.2deg",
        scrub: 2.0,
      },
    ].filter(Boolean).filter((t) => t && t.el);

    if (!tracks.length) return;

    const triggers = tracks.map((t) =>
      gsap.fromTo(
        t.el,
        { xPercent: parseFloat(t.from), rotation: t.rotFrom },
        {
          xPercent: parseFloat(t.to),
          rotation: t.rotTo,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: t.scrub,
          },
        }
      )
    );

    // Subtle opacity pulse on the mid reel tied to scroll velocity
    const midTrack = root.querySelector("#reel-mid");
    let opacityTween;
    if (midTrack) {
      opacityTween = gsap.to(midTrack, {
        opacity: 0.7,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 60%",
          end: "bottom 40%",
          scrub: true,
          yoyo: true,
        },
      });
    }

    return () => {
      triggers.forEach((tw) => { tw.scrollTrigger?.kill(); tw.kill(); });
      opacityTween?.scrollTrigger?.kill();
      opacityTween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSelector]);
}
