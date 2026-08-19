/**
 * Shared motion system — mode-agnostic & ultra buttery smooth.
 * Masked split-word kinetic reveal, staggered hero entrance, portal ambient cues.
 * Engineered for 60fps/120fps ProMotion displays with zero layout thrashing.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Splits text into masked words with complete HTML/class preservation (e.g. <span class="accent">).
 * Each word is wrapped in an overflow:hidden mask.
 * When animated, words glide smoothly upward from below the baseline.
 */
function splitIntoMaskedWords(el) {
  if (!el) return [];
  if (el.dataset.splitReady === "true") {
    return el.querySelectorAll(".split-word-inner");
  }

  const nodes = Array.from(el.childNodes);

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      return words
        .map((word) => {
          if (!word) return "";
          if (/^\s+$/.test(word)) {
            return word; // preserve natural whitespace
          }
          return `<span class="split-word-mask" style="display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:0.06em; margin-bottom:-0.06em;"><span class="split-word-inner" style="display:inline-block; transform:translate3d(0, 115%, 0); opacity:0; will-change:transform, opacity;">${word}</span></span>`;
        })
        .join("");
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const inner = Array.from(node.childNodes).map(processNode).join("");
      const tag = node.tagName.toLowerCase();
      const attrs = Array.from(node.attributes)
        .map((attr) => ` ${attr.name}="${attr.value}"`)
        .join("");
      return `<${tag}${attrs}>${inner}</${tag}>`;
    }
    return "";
  }

  el.innerHTML = nodes.map(processNode).join("");
  el.dataset.splitReady = "true";
  return el.querySelectorAll(".split-word-inner");
}

/**
 * Ultra-smooth Title Split-Word Slide-Up Reveal
 */
function revealTitle(el) {
  if (!el) return;
  const words = splitIntoMaskedWords(el);
  if (!words || !words.length) return;

  gsap.killTweensOf(words);
  gsap.set(words, { y: "115%", opacity: 0 });

  return gsap.to(words, {
    y: "0%",
    opacity: 1,
    duration: 0.95,
    ease: "power4.out",
    stagger: 0.038,
    force3D: true,
  });
}

/**
 * Buttery smooth hero block entrance
 * Animates role, masked split title, lede, and meta items in a fluid sequence
 */
function revealHeroBlock(root) {
  if (!root) return;

  const role = root.querySelector(".hero-mode__role");
  const title = root.querySelector(".hero-mode__title");
  const lede = root.querySelector(".hero-mode__lede");
  const metaItems = root.querySelectorAll(".hero-mode__meta .meta-item");

  const tl = gsap.timeline({ defaults: { ease: "power4.out", force3D: true } });

  // 1. Role badge
  if (role) {
    gsap.killTweensOf(role);
    gsap.set(role, { opacity: 0, y: 16, willChange: "transform, opacity" });
    tl.to(role, { opacity: 1, y: 0, duration: 0.7, clearProps: "willChange" }, 0);
  }

  // 2. Masked kinetic title words
  if (title) {
    const words = splitIntoMaskedWords(title);
    if (words && words.length) {
      gsap.killTweensOf(words);
      gsap.set(words, { y: "115%", opacity: 0 });
      tl.to(
        words,
        {
          y: "0%",
          opacity: 1,
          duration: 0.95,
          ease: "power4.out",
          stagger: 0.038,
          force3D: true,
        },
        0.06
      );
    }
  }

  // 3. Hero lede description
  if (lede) {
    gsap.killTweensOf(lede);
    gsap.set(lede, { opacity: 0, y: 24, willChange: "transform, opacity" });
    tl.to(lede, { opacity: 1, y: 0, duration: 0.85, clearProps: "willChange" }, 0.22);
  }

  // 4. Meta chips
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

export { revealTitle, revealHeroBlock, staggerIn, drawLineChart, animateSkillBars };
