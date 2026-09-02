import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Brightens a ScrollHighlightText paragraph word-by-word in reading order as
// the user scrolls past it. Not pinned — the scroll distance is whatever the
// paragraph's own position gives it (start/end are viewport-relative, a few
// hundred vh at most for a paragraph this size).
export function useScrollHighlightText(textRef, { reducedMotion } = {}) {
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;

    if (reducedMotion) {
      el.classList.add('is-static');
      return undefined;
    }

    const words = el.querySelectorAll('.scroll-highlight__word');
    // GSAP's color interpolation needs a resolved color, not a raw var()
    // reference — this hex must match --color-green-darker in global.css.
    const tween = gsap.to(words, {
      color: '#1d421d',
      stagger: 0.04,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 45%',
        scrub: 0.5,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [textRef, reducedMotion]);
}
