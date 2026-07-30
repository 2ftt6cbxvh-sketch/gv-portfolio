"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { revealTitle, staggerIn, drawLineChart, animateSkillBars } from "./motion";

gsap.registerPlugin(ScrollTrigger);

const MODE_ACCENTS = {
  editor: "#a56ce8",
  analyst: "#33c7b0",
  developer: "#39ff88",
};

/**
 * Enhanced site motion controller featuring per-mode cinematic entry transitions,
 * 3D portal zooming, cursor radial shockwaves, CLI terminal overlay, and fluid reverse exits.
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
        scale: 1,
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

    // ──────────────────────────────────────────────────────────────────────────
    // Feature 1, 2, 3, 4, 5: Per-Mode Cinematic Transition Orchestration
    // ──────────────────────────────────────────────────────────────────────────
    function enterMode(mode, e) {
      navLogoEngineRef.current?._onActivate?.();
      const targetTheme = mode;
      const accent = MODE_ACCENTS[targetTheme] || "#00f0ff";

      lenisRef.current?.stop();

      // Determine click coordinates for shockwave pulse
      let clickX = window.innerWidth / 2;
      let clickY = window.innerHeight / 2;
      const clickedPortal = e?.currentTarget || document.querySelector(`.portal[data-target="${mode}"]`);
      if (e?.clientX && e?.clientY) {
        clickX = e.clientX;
        clickY = e.clientY;
      } else if (clickedPortal) {
        const rect = clickedPortal.getBoundingClientRect();
        clickX = rect.left + rect.width / 2;
        clickY = rect.top + rect.height / 2;
      }

      // Feature 5: Cursor Shockwave Ring
      const shockwave = document.createElement("div");
      Object.assign(shockwave.style, {
        position: "fixed",
        left: `${clickX}px`,
        top: `${clickY}px`,
        width: "20px",
        height: "20px",
        marginTop: "-10px",
        marginLeft: "-10px",
        borderRadius: "50%",
        border: `2px solid ${accent}`,
        background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
        zIndex: "9998",
        pointerEvents: "none",
        transform: "scale(1)",
        willChange: "transform, opacity",
      });
      document.body.appendChild(shockwave);

      gsap.to(shockwave, {
        scale: 45,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        onComplete: () => shockwave.remove(),
      });

      // Feature 4: 3D Portal Deep-Zooming
      if (clickedPortal) {
        gsap.to(clickedPortal, {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.5,
          ease: "power3.inOut",
        });
        document.querySelectorAll(".portal").forEach((p) => {
          if (p !== clickedPortal) {
            gsap.to(p, { opacity: 0, scale: 0.9, duration: 0.35, ease: "power2.out" });
          }
        });
        gsap.to(".selector__intro", { opacity: 0, y: -20, duration: 0.35, ease: "power2.out" });
      }

      // Custom Per-Mode Transition Overlay Container
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9990",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      });
      document.body.appendChild(overlay);

      const tl = gsap.timeline({
        onComplete: () => {
          stageRef.current?.setAttribute("data-mode", targetTheme);
          document.querySelectorAll(".portal").forEach((p) => {
            p.style.display = "none";
            gsap.set(p, { scale: 1, opacity: 1 });
          });
          selectorRef.current?.classList.remove("is-visible");
          if (selectorRef.current) selectorRef.current.style.display = "none";

          document.querySelectorAll(".mode-view").forEach((v) => v.classList.remove("is-active"));
          const targetEl = document.getElementById("mode-" + targetTheme);
          if (targetEl) targetEl.classList.add("is-active");

          if (navModeLabelRef.current) {
            navModeLabelRef.current.textContent = "GV / " + targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1);
          }
          if (navBackRef.current) navBackRef.current.style.display = "inline-flex";

          window.scrollTo(0, 0);

          // Fade out custom overlay and restore smooth scroll
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              overlay.remove();
              lenisRef.current?.start();
              lenisRef.current?.scrollTo(0, { immediate: true });
              requestAnimationFrame(() => ScrollTrigger.refresh());
            },
          });
          initModeAnimations(targetTheme);
        },
      });

      // 🎬 Feature 1: Editor Mode — Anamorphic Film Letterbox Shutter Wipe
      if (targetTheme === "editor") {
        overlay.innerHTML = `
          <div className="trans-editor-bar trans-editor-bar--top" style="position:absolute;top:0;left:0;right:0;height:50vh;background:#06050a;border-bottom:1px solid ${accent};transform:translateY(-100%);"></div>
          <div className="trans-editor-bar trans-editor-bar--bottom" style="position:absolute;bottom:0;left:0;right:0;height:50vh;background:#06050a;border-top:1px solid ${accent};transform:translateY(100%);"></div>
          <div className="trans-editor-meta" style="position:relative;z-index:2;font-family:var(--font-mono);font-size:12px;color:${accent};letter-spacing:0.15em;opacity:0;">
            REC ● CAM A // 24FPS // CUT 01
          </div>
        `;
        const topBar = overlay.querySelector(".trans-editor-bar--top");
        const btmBar = overlay.querySelector(".trans-editor-bar--bottom");
        const metaText = overlay.querySelector(".trans-editor-meta");

        tl.to([topBar, btmBar], { translateY: "0%", duration: 0.35, ease: "power3.inOut" }, 0.1)
          .to(metaText, { opacity: 1, duration: 0.2 }, 0.25);
      }

      // 📊 Feature 2: Analyst Mode — Cyber Data Scanline & Binary Matrix Sweep
      else if (targetTheme === "analyst") {
        overlay.innerHTML = `
          <div className="trans-analyst-bg" style="position:absolute;inset:0;background:#06050a;opacity:0;"></div>
          <div className="trans-analyst-scanline" style="position:absolute;top:0;bottom:0;left:0;width:3px;background:${accent};box-shadow:0 0 15px ${accent};transform:translateX(-10vw);"></div>
          <div className="trans-analyst-data" style="position:relative;z-index:2;font-family:var(--font-mono);font-size:13px;color:${accent};letter-spacing:0.1em;opacity:0;text-align:center;">
            <div>[0100 1001 0100 1110 0100 1001]</div>
            <div style="font-size:11px;opacity:0.8;margin-top:4px;">INITIALIZING METRICS & DATA PIPELINES...</div>
          </div>
        `;
        const bg = overlay.querySelector(".trans-analyst-bg");
        const scanline = overlay.querySelector(".trans-analyst-scanline");
        const dataText = overlay.querySelector(".trans-analyst-data");

        tl.to(bg, { opacity: 1, duration: 0.25 }, 0.1)
          .to(scanline, { translateX: "110vw", duration: 0.45, ease: "power2.inOut" }, 0.1)
          .to(dataText, { opacity: 1, duration: 0.2 }, 0.2);
      }

      // 💻 Feature 3: Developer Mode — CLI Command Execution Modal
      else if (targetTheme === "developer") {
        overlay.innerHTML = `
          <div className="trans-dev-bg" style="position:absolute;inset:0;background:#06050a;opacity:0;"></div>
          <div className="trans-dev-terminal" style="position:relative;z-index:2;width:90%;max-width:540px;padding:20px;background:rgba(12,14,20,0.9);border:1px solid ${accent};border-radius:8px;box-shadow:0 0 30px ${accent}33;font-family:var(--font-mono);font-size:13px;color:${accent};transform:translateY(20px);opacity:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;opacity:0.6;font-size:11px;">
              <span style="width:10px;height:10px;border-radius:50%;background:#ff5f56;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#27c93f;"></span>
              <span style="margin-left:8px;">bash - gv@portfolio:~</span>
            </div>
            <div>$ gv --init-mode developer</div>
            <div style="color:#ffffff;margin-top:6px;">&gt; loading modules: React / Next.js / Python / AI... [100%]</div>
            <div style="color:${accent};margin-top:6px;">&gt; launching environment...</div>
          </div>
        `;
        const bg = overlay.querySelector(".trans-dev-bg");
        const terminal = overlay.querySelector(".trans-dev-terminal");

        tl.to(bg, { opacity: 1, duration: 0.25 }, 0.1)
          .to(terminal, { opacity: 1, translateY: "0px", duration: 0.35, ease: "back.out(1.4)" }, 0.15);
      } else {
        overlay.style.background = "#06050a";
        tl.to(overlay, { opacity: 1, duration: 0.3 });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Feature 6: Fluid Reverse Exit Transition back to Selector
    // ──────────────────────────────────────────────────────────────────────────
    function exitToSelector() {
      lenisRef.current?.stop();

      const activeView = document.querySelector(".mode-view.is-active");
      
      const tl = gsap.timeline({
        onComplete: () => {
          document.querySelectorAll(".mode-view").forEach((v) => v.classList.remove("is-active"));
          document.querySelectorAll(".portal").forEach((p) => {
            p.style.display = "";
            gsap.set(p, { opacity: 0, scale: 0.95 });
          });
          stageRef.current?.setAttribute("data-mode", "");
          if (selectorRef.current) {
            selectorRef.current.style.display = "flex";
            selectorRef.current.classList.add("is-visible");
          }

          if (navModeLabelRef.current) navModeLabelRef.current.textContent = "GV — Select a Mode";
          if (navBackRef.current) navBackRef.current.style.display = "none";
          window.scrollTo(0, 0);

          // Stagger animate portals back into landing view
          gsap.to(".selector__intro", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          gsap.to(".portal", {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: "back.out(1.2)",
            stagger: 0.08,
            onComplete: () => {
              lenisRef.current?.start();
              lenisRef.current?.scrollTo(0, { immediate: true });
              requestAnimationFrame(() => ScrollTrigger.refresh());
            },
          });
        },
      });

      if (activeView) {
        tl.to(activeView, { opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.in" });
      }
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
      portal.addEventListener("click", (e) => enterMode(portal.dataset.target, e));
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
