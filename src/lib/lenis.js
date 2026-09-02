import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

let lenis;

// Standard Lenis + GSAP ScrollTrigger integration recipe: drive Lenis off
// gsap's own ticker (instead of its internal rAF loop) so both stay in sync,
// and tell ScrollTrigger to re-measure on every Lenis scroll tick.
export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

// Anchor-nav and "skip" links call this instead of scrollIntoView so the
// scroll is Lenis-smoothed rather than fighting Lenis' own scroll hijacking.
export function scrollToEl(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, ...options });
  } else if (typeof target !== 'string') {
    target.scrollIntoView({ behavior: 'smooth' });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
}
