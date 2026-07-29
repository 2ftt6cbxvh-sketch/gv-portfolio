/**
 * Shared motion system — mode-agnostic.
 * Split-text reveal, stagger reveal, portal ambient cues.
 * Reused by every mode; only CSS tokens differ, not this logic.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function wrapWordChars(word) {
  return word.split('').map((ch) => `<span class="char">${ch}</span>`).join('');
}

// Splits into per-character spans for a stagger reveal while preserving any
// inline markup (e.g. <span class="accent">) and natural word wrapping.
function splitChars(el) {
  const ariaLabel = el.textContent;
  el.setAttribute('aria-label', ariaLabel);

  function renderNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent
        .split(' ')
        .map((word) => (word ? `<span class="word">${wrapWordChars(word)}</span>` : ''))
        .join(' ');
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const inner = Array.from(node.childNodes).map(renderNode).join('');
      const cls = node.className ? ` class="${node.className}"` : '';
      return `<${node.tagName.toLowerCase()}${cls}>${inner}</${node.tagName.toLowerCase()}>`;
    }
    return '';
  }

  el.innerHTML = Array.from(el.childNodes).map(renderNode).join('');
  return el.querySelectorAll('.char');
}

function revealTitle(el) {
  const chars = splitChars(el);
  gsap.set(chars, { opacity: 0, y: '0.4em' });
  gsap.to(chars, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
    stagger: 0.018,
  });
}

function staggerIn(selector, opts = {}) {
  const els = gsap.utils.toArray(selector);
  gsap.set(els, { opacity: 0, y: 14 });
  gsap.to(els, {
    opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
    stagger: opts.stagger || 0.06,
    scrollTrigger: opts.scroll ? {
      trigger: opts.trigger || els[0],
      start: 'top 85%',
      once: true,
    } : undefined,
  });
}

/** Draws a simple line-chart cue once (Data Analyst ambient signature). */
function drawLineChart(svgEl) {
  const path = svgEl.querySelector('path');
  if (!path) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  return gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' });
}

/** Skill bar fill animation (Developer / Analyst skill sections). */
function animateSkillBars(selector) {
  gsap.utils.toArray(selector).forEach((bar) => {
    const fill = bar.querySelector('.skill-bar__fill');
    const target = bar.dataset.level || '70';
    if (typeof window !== 'undefined') {
      gsap.to(fill, {
        width: target + '%', duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: bar, start: 'top 90%', once: true },
      });
    } else {
      gsap.to(fill, { width: target + '%', duration: 0.8, ease: 'power2.out' });
    }
  });
}

export { revealTitle, staggerIn, drawLineChart, animateSkillBars, splitChars };
