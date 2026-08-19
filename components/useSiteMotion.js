"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { revealHeroBlock, staggerIn, drawLineChart, animateSkillBars } from "./motion";

gsap.registerPlugin(ScrollTrigger);

const MODE_ACCENTS = {
  editor: "#a56ce8",
  analyst: "#33c7b0",
  developer: "#39ff88",
};

/**
 * Enhanced site motion controller featuring per-mode cinematic entry transitions,
 * 3D portal zooming, CLI terminal overlay, and buttery-smooth text slide-up animations.
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

    function runIntro() {
      if (selectorRef.current) selectorRef.current.classList.add("is-visible");
      if (navRef.current) navRef.current.classList.add("is-visible");
      if (navModeLabelRef.current) navModeLabelRef.current.textContent = "GV — Select a Mode";
      gsap.set(".selector__intro, .portal", { opacity: 1, y: 0, scale: 1 });
      drawPortalCues();
    }

    function drawPortalCues() {
      document.querySelectorAll('.portal[data-target="analyst"] .portal__cue svg').forEach((svg) => drawLineChart(svg));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Per-Mode Cinematic Transition Orchestration (Buttery Smooth & Responsive)
    // ──────────────────────────────────────────────────────────────────────────
    function enterMode(mode, e) {
      navLogoEngineRef.current?._onActivate?.();
      const targetTheme = mode;
      const accent = MODE_ACCENTS[targetTheme] || "#00f0ff";

      lenisRef.current?.stop();

      const clickedPortal = e?.currentTarget || document.querySelector(`.portal[data-target="${mode}"]`);

      // 3D Portal Deep-Zooming
      if (clickedPortal) {
        gsap.to(clickedPortal, {
          scale: 1.15,
          opacity: 0.9,
          duration: 0.45,
          ease: "power2.inOut",
        });
        document.querySelectorAll(".portal").forEach((p) => {
          if (p !== clickedPortal) {
            gsap.to(p, { opacity: 0, scale: 0.95, duration: 0.3, ease: "power2.out" });
          }
        });
        gsap.to(".selector__intro", { opacity: 0, y: -14, duration: 0.3, ease: "power2.out" });
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
        background: "transparent",
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

          document.querySelectorAll(".mode-view").forEach((v) => {
            v.classList.remove("is-active");
            gsap.set(v, { clearProps: "all" });
          });

          const targetEl = document.getElementById("mode-" + targetTheme);
          if (targetEl) {
            targetEl.classList.add("is-active");
            gsap.set(targetEl, { opacity: 1, scale: 1, clearProps: "opacity,transform" });
          }

          if (navModeLabelRef.current) {
            navModeLabelRef.current.textContent = "GV / " + targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1);
          }
          if (navBackRef.current) navBackRef.current.style.display = "inline-flex";

          window.scrollTo(0, 0);

          // Fade out custom overlay smoothly and trigger buttery text up animation
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
              overlay.remove();
              lenisRef.current?.start();
              lenisRef.current?.scrollTo(0, { immediate: true });
              requestAnimationFrame(() => ScrollTrigger.refresh());
            },
          });

          // Trigger smooth hero slide-up entrance synchronized with mode reveal
          initModeAnimations(targetTheme);
        },
      });

      // 🎬 Feature 1: Editor Mode — Anamorphic Film Letterbox Shutter Wipe
      if (targetTheme === "editor") {
        overlay.innerHTML = `
          <div class="trans-editor-bar trans-editor-bar--top" style="position:absolute;top:0;left:0;right:0;height:50vh;background:#06050a;border-bottom:1px solid ${accent};transform:translateY(-100%);"></div>
          <div class="trans-editor-bar trans-editor-bar--bottom" style="position:absolute;bottom:0;left:0;right:0;height:50vh;background:#06050a;border-top:1px solid ${accent};transform:translateY(100%);"></div>
          <div class="trans-editor-meta" style="position:relative;z-index:2;font-family:var(--font-mono);font-size:13px;color:${accent};letter-spacing:0.18em;opacity:0;background:rgba(6,5,10,0.92);padding:8px 20px;border-radius:6px;border:1px solid ${accent}66;box-shadow:0 0 25px ${accent}33;">
            REC ● CAM A // 24FPS // CUT 01
          </div>
        `;
        const topBar = overlay.querySelector(".trans-editor-bar--top");
        const btmBar = overlay.querySelector(".trans-editor-bar--bottom");
        const metaText = overlay.querySelector(".trans-editor-meta");

        tl.to([topBar, btmBar], { translateY: "0%", duration: 0.4, ease: "power3.inOut" }, 0.05)
          .to(metaText, { opacity: 1, duration: 0.25 }, 0.25)
          .to({}, { duration: 0.35 });
      }

      // 📊 Feature 2: Analyst Mode — Cyber Data Scanline & Binary Matrix Sweep
      else if (targetTheme === "analyst") {
        overlay.innerHTML = `
          <div class="trans-analyst-bg" style="position:absolute;inset:0;background:#06050a;opacity:0;"></div>
          <div class="trans-analyst-scanline" style="position:absolute;top:0;bottom:0;left:0;width:4px;background:${accent};box-shadow:0 0 25px ${accent};transform:translateX(-10vw);"></div>
          <div class="trans-analyst-data" style="position:relative;z-index:2;font-family:var(--font-mono);font-size:13px;color:${accent};letter-spacing:0.12em;opacity:0;text-align:center;background:rgba(6,5,10,0.92);padding:14px 24px;border-radius:8px;border:1px solid ${accent}66;box-shadow:0 0 30px ${accent}33;">
            <div style="font-weight:700;">[0100 1001 0100 1110 0100 1001]</div>
            <div style="font-size:11.5px;opacity:0.95;margin-top:6px;color:#ffffff;letter-spacing:0.08em;">INITIALIZING METRICS &amp; DATA PIPELINES...</div>
          </div>
        `;
        const bg = overlay.querySelector(".trans-analyst-bg");
        const scanline = overlay.querySelector(".trans-analyst-scanline");
        const dataText = overlay.querySelector(".trans-analyst-data");

        tl.to(bg, { opacity: 1, duration: 0.3 }, 0.05)
          .to(scanline, { translateX: "110vw", duration: 0.7, ease: "power2.inOut" }, 0.05)
          .to(dataText, { opacity: 1, duration: 0.25 }, 0.15)
          .to({}, { duration: 0.35 });
      }

      // 💻 Feature 3: Developer Mode — CLI Command Execution Modal
      else if (targetTheme === "developer") {
        overlay.innerHTML = `
          <div class="trans-dev-bg" style="position:absolute;inset:0;background:#06050a;opacity:0;"></div>
          <div class="trans-dev-terminal" style="position:relative;z-index:2;width:90%;max-width:480px;padding:18px;background:rgba(12,14,20,0.96);border:1px solid ${accent};border-radius:10px;box-shadow:0 0 40px ${accent}44;font-family:var(--font-mono);font-size:12.5px;color:${accent};transform:translateY(16px);opacity:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;opacity:0.75;font-size:11px;">
              <span style="width:9px;height:9px;border-radius:50%;background:#ff5f56;"></span>
              <span style="width:9px;height:9px;border-radius:50%;background:#ffbd2e;"></span>
              <span style="width:9px;height:9px;border-radius:50%;background:#27c93f;"></span>
              <span style="margin-left:8px;color:#aaa;">bash - gv@portfolio:~</span>
            </div>
            <div class="dev-line-1" style="opacity:0;">$ gv --init-mode developer</div>
            <div class="dev-line-2" style="color:#ffffff;margin-top:6px;opacity:0;">&gt; loading modules: React / Next.js / Python / AI...</div>
            <div class="dev-line-3" style="color:${accent};margin-top:6px;opacity:0;">&gt; launching environment [100%]</div>
          </div>
        `;
        const bg = overlay.querySelector(".trans-dev-bg");
        const terminal = overlay.querySelector(".trans-dev-terminal");
        const line1 = overlay.querySelector(".dev-line-1");
        const line2 = overlay.querySelector(".dev-line-2");
        const line3 = overlay.querySelector(".dev-line-3");

        tl.to(bg, { opacity: 1, duration: 0.3 }, 0.05)
          .to(terminal, { opacity: 1, translateY: "0px", duration: 0.35, ease: "back.out(1.2)" }, 0.1)
          .to(line1, { opacity: 1, duration: 0.15 }, 0.2)
          .to(line2, { opacity: 1, duration: 0.15 }, 0.35)
          .to(line3, { opacity: 1, duration: 0.15 }, 0.5)
          .to({}, { duration: 0.35 });
      } else {
        overlay.style.background = "#06050a";
        tl.to(overlay, { opacity: 1, duration: 0.3 });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Fluid Reverse Exit Transition back to Selector
    // ──────────────────────────────────────────────────────────────────────────
    function exitToSelector() {
      lenisRef.current?.stop();

      const activeView = document.querySelector(".mode-view.is-active");

      const tl = gsap.timeline({
        onComplete: () => {
          document.querySelectorAll(".mode-view").forEach((v) => {
            v.classList.remove("is-active");
            gsap.set(v, { clearProps: "all" });
          });

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
          gsap.to(".selector__intro", { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          gsap.to(".portal", {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.2)",
            stagger: 0.06,
            onComplete: () => {
              lenisRef.current?.start();
              lenisRef.current?.scrollTo(0, { immediate: true });
              requestAnimationFrame(() => ScrollTrigger.refresh());
            },
          });
        },
      });

      if (activeView) {
        tl.to(activeView, { opacity: 0, scale: 0.98, duration: 0.25, ease: "power2.in" });
      }
    }

    function initModeAnimations(mode) {
      const root = document.getElementById("mode-" + mode);
      if (!root) return;

      gsap.set(root, { opacity: 1, scale: 1, clearProps: "opacity,transform" });

      // Always play the buttery smooth hero block slide-up reveal
      revealHeroBlock(root);

      if (initedModes.current.has(mode)) {
        gsap.utils.toArray(root.querySelectorAll(".section-head, .project-row, .stat-card, .cert-card, .paper-row")).forEach((el) => {
          gsap.set(el, { opacity: 1, y: 0 });
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
      }

      initedModes.current.add(mode);
      animateSkillBars(root.querySelectorAll(".skill-bar"));

      gsap.utils.toArray(root.querySelectorAll(".section-head, .project-row, .stat-card, .cert-card, .paper-row")).forEach((el) => {
        gsap.set(el, { opacity: 0, y: 20, willChange: "transform, opacity", force3D: true });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", clearProps: "willChange" }),
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
