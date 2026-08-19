/**
 * Shared motion system — mode-agnostic & ultra buttery smooth.
 * Staggered hero entrance, scroll-triggered section reveal, portal ambient cues.
 * Engineered for 60fps/120fps ProMotion displays with zero layout thrashing.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Buttery smooth hero block entrance
 * Animates role, lede, and meta items in a fluid sequence synchronized with KineticHeroTitle
 */
function revealHeroBlock(root) {
  if (!root) return;

  const role = root.querySelector(".hero-mode__role");
  const lede = root.querySelector(".hero-mode__lede");
  const metaItems = root.querySelectorAll(".hero-mode__meta .meta-item");

  const tl = gsap.timeline({ defaults: { ease: "power3.out", force3D: true } });

  // 1. Role badge
  if (role) {
    gsap.killTweensOf(role);
    gsap.set(role, { opacity: 0, y: 16, willChange: "transform, opacity" });
    tl.to(role, { opacity: 1, y: 0, duration: 0.7, clearProps: "willChange" }, 0);
  }

  // 2. Hero lede description
  if (lede) {
    gsap.killTweensOf(lede);
    gsap.set(lede, { opacity: 0, y: 24, willChange: "transform, opacity" });
    tl.to(lede, { opacity: 1, y: 0, duration: 0.85, clearProps: "willChange" }, 0.2);
  }

  // 3. Meta chips
  if (metaItems && metaItems.length > 0) {
    gsap.killTweensOf(metaItems);
    gsap.set(metaItems, { opacity: 0, y: 20, willChange: "transform, opacity" });
    tl.to(metaItems, { opacity: 1, y: 0, duration: 0.75, stagger: 0.05, clearProps: "willChange" }, 0.35);
  }

  return tl;
}

function staggerIn(selector, opts = {}) {
  const els = gsap.utils.toArray(selector);
  if (!els.length) return;

  gsap.killTweensOf(els);
  gsap.set(els, { opacity: 0, y: 20, willChange: "transform, opacity", force3D: true });

  return gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: opts.duration || 0.75,
    ease: "power3.out",
    stagger: opts.stagger || 0.05,
    delay: opts.delay || 0,
    clearProps: "willChange",
    scrollTrigger: opts.scroll
      ? {
          trigger: opts.trigger || els[0],
          start: "top 88%",
          once: true,
        }
      : undefined,
  });
}

/** Draws a simple line-chart cue once (Data Analyst ambient signature). */
function drawLineChart(svgEl) {
  const path = svgEl?.querySelector("path");
  if (!path) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  return gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" });
}

/** Skill bar fill animation (Developer / Analyst skill sections). */
function animateSkillBars(selector) {
  gsap.utils.toArray(selector).forEach((bar) => {
    const fill = bar.querySelector(".skill-bar__fill");
    const target = bar.dataset.level || "70";
    if (!fill) return;

    if (typeof window !== "undefined") {
      gsap.to(fill, {
        width: target + "%",
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: { trigger: bar, start: "top 92%", once: true },
      });
    } else {
      gsap.to(fill, { width: target + "%", duration: 0.85, ease: "power2.out" });
    }
  });
}

export { revealHeroBlock, staggerIn, drawLineChart, animateSkillBars };
