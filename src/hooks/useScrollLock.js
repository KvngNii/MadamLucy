import { useEffect } from 'react';
import { getLenis } from '../lib/lenis.js';

// Holds the page still while a modal is open.
//
// `document.body.style.overflow = 'hidden'` on its own does NOT do this on
// this site, which is what both modals used to do. Lenis reads wheel and touch
// events and drives the scroll position in JavaScript — it never consults the
// overflow property, so the page kept scrolling behind an open modal.
// Measured: 1313px of drift from six wheel ticks over the backdrop.
//
// Four things, because no single one covers every case:
//
//   1. lenis.stop()          — the actual fix for wheel and trackpad.
//   2. body overflow hidden  — still needed for the reduced-motion path, where
//                              Lenis never boots and native scroll is live.
//   3. touch-action: none    — on the backdrop, so dragging it on a phone does
//                              not scroll the document underneath. Lenis does
//                              not intercept touch by default, so stop() alone
//                              leaves touch scrolling native.
//   4. overscroll-behavior   — on the panel, so reaching the end of the recipe
//                              does not chain the remaining momentum to the page.
//
// (3) and (4) live in the modals' CSS; this hook does (1) and (2).
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const lenis = getLenis();
    const y = window.scrollY;
    const previousOverflow = document.body.style.overflow;

    lenis?.stop();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      // Lenis caches its own target position. Without this it resumes from
      // wherever it thought it was and animates the page there — which is the
      // close-time jump, not the open-time one.
      lenis?.scrollTo(y, { immediate: true, force: true });
    };
  }, [active]);
}
