import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion.js';
import { initLenis, scrollToEl } from '../lib/lenis.js';

// Boots Lenis once for the whole app and makes every in-page `href="#id"`
// link (nav, footer, CTAs) scroll through Lenis instead of the native
// instant jump, via one delegated click listener rather than touching each
// link component individually.
export function useLenisScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;

    const lenis = initLenis();

    const handleClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      // Deferred a frame on purpose. The mobile menu lives inside the sticky
      // header and closes on the same click, which shortens the header and
      // shifts the whole page up. Scrolling synchronously would measure the
      // target against the pre-close layout and overshoot by the menu's
      // height. One frame lets React commit the close first.
      requestAnimationFrame(() => scrollToEl(target));
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
