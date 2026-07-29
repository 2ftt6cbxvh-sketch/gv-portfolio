"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { revealTitle, staggerIn, drawLineChart, animateSkillBars } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Direct port of the original app.js orchestration (intro -> selector -> mode
 * routing -> per-mode reveal). Logic is unchanged from the static Phase 2
 * build; only DOM lookups became refs so it works inside React's lifecycle.
 */
export function useSiteMotion({ stageRef, introRef, selectorRef, navRef, navModeLabelRef, navBackRef, introLogoEngineRef, navLogoEngineRef }) {
  const initedModes = useRef(new Set());
  const lenisRef = useRef(null);

  useEffect(() => {
    function initLenis() {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenisRef.current = lenis;
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      lenis.on("scroll", ScrollTrigger.update);
    }

    async function runIntro() {
      await introLogoEngineRef.current?.playIntro();
      await gsap.to(introRef.current, { opacity: 0, duration: 0.5, ease: "power2.in" });
      if (introRef.current) introRef.current.style.display = "none";
      showSelector();
    }

    function showSelector() {
      selectorRef.current?.classList.add("is-visible");
      navRef.current?.classList.add("is-visible");
      if (navModeLabelRef.current) navModeLabelRef.current.textContent = "GV — Select a Mode";
      document.querySelectorAll(".portal__index, .portal__name, .portal__desc, .portal__enter").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 10 });
      });
      gsap.to(".selector__intro", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      gsap.to(".portal", {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        onStart: function () {
          gsap.to(".portal__index, .portal__name, .portal__desc, .portal__enter", {
            opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05, delay: 0.1,
          });
        },
      });
      drawPortalCues();
    }

    function drawPortalCues() {
      document.querySelectorAll('.portal[data-target="analyst"] .portal__cue svg').forEach((svg) => drawLineChart(svg));
    }

    function enterMode(mode) {
      navLogoEngineRef.current?._onActivate?.();
      const targetTheme = mode;

      const flash = document.createElement("div");
      Object.assign(flash.style, {
        position: "fixed", inset: "0", zIndex: "60",
        background: "var(--color-bg)", opacity: "0", pointerEvents: "none",
      });
      document.body.appendChild(flash);

      gsap.timeline({
        onComplete: () => {
          stageRef.current?.setAttribute("data-mode", targetTheme);
          document.querySelectorAll(".portal").forEach((p) => (p.style.display = "none"));
          selectorRef.current?.classList.remove("is-visible");
          if (selectorRef.current) selectorRef.current.style.display = "none";
          document.getElementById("mode-" + targetTheme)?.classList.add("is-active");
          if (navModeLabelRef.current) {
            navModeLabelRef.current.textContent = "GV / " + targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1);
          }
          if (navBackRef.current) navBackRef.current.style.display = "inline-flex";
          gsap.to(flash, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => flash.remove() });
          initModeAnimations(targetTheme);
          window.scrollTo(0, 0);
          ScrollTrigger.refresh();
        },
      })
        .to(flash, { opacity: 1, duration: 0.35, ease: "power2.in" })
        .add(() => navLogoEngineRef.current?.playModeTransition(), 0);
    }

    function exitToSelector() {
      document.querySelectorAll(".mode-view").forEach((v) => v.classList.remove("is-active"));
      document.querySelectorAll(".portal").forEach((p) => (p.style.display = ""));
      stageRef.current?.setAttribute("data-mode", "");
      if (selectorRef.current) selectorRef.current.style.display = "flex";
      requestAnimationFrame(() => selectorRef.current?.classList.add("is-visible"));
      if (navModeLabelRef.current) navModeLabelRef.current.textContent = "GV — Select a Mode";
      if (navBackRef.current) navBackRef.current.style.display = "none";
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }

    function initModeAnimations(mode) {
      if (initedModes.current.has(mode)) {
        ScrollTrigger.refresh();
        return;
      }
      initedModes.current.add(mode);
      const root = document.getElementById("mode-" + mode);
      if (!root) return;
      const heroTitle = root.querySelector(".hero-mode__title");
      if (heroTitle) revealTitle(heroTitle);
      staggerIn(root.querySelectorAll(".hero-mode__lede, .hero-mode__meta"), { stagger: 0.1 });
      animateSkillBars(root.querySelectorAll(".skill-bar"));
      gsap.utils.toArray(root.querySelectorAll(".section-head, .project-row, .stat-card, .cert-card, .paper-row")).forEach((el) => {
        gsap.set(el, { opacity: 0, y: 14 });
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }),
        });
      });
    }

    document.querySelectorAll(".portal").forEach((portal) => {
      portal.addEventListener("click", () => enterMode(portal.dataset.target));
    });
    navBackRef.current?.addEventListener("click", exitToSelector);
    const navLogoEl = document.getElementById("nav-logo");
    const onNavLogoClick = () => {
      if (stageRef.current?.getAttribute("data-mode")) exitToSelector();
    };
    navLogoEl?.addEventListener("click", onNavLogoClick);

    initLenis();
    runIntro();

    return () => {
      lenisRef.current?.destroy();
      navLogoEl?.removeEventListener("click", onNavLogoClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
