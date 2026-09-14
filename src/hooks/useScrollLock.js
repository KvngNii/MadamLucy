import { useEffect } from 'react';
import { getLenis } from '../lib/lenis.js';

// Holds the page still while a modal is open, without freezing the modal.
//
// `document.body.style.overflow = 'hidden'` on its own does nothing here, which
// is what both modals used to do. Lenis reads wheel and touch events and drives
// scroll in JavaScript; it never consults the overflow property. Measured:
// 1313px of drift from six wheel ticks over the backdrop.
//
// The non-obvious part is what stop() actually does. From Lenis' own handler:
//
//     if (composedPath.find(node => node.hasAttribute("data-lenis-prevent")))
//       return;
//     if (this.isStopped || this.isLocked) {
//       if (event.cancelable) event.preventDefault();
//       return;
//     }
//
// stop() does not idle Lenis — it makes Lenis preventDefault every cancelable
// wheel and touch event, so native scrolling dies everywhere, the open modal
// included. Stopping alone therefore trades "the page scrolls behind the modal"
// for "nothing scrolls at all", which is exactly what the first attempt did.
//
// `data-lenis-prevent` is tested BEFORE that branch and returns early, so
// events inside a marked element never reach the preventDefault and scroll
// natively even while Lenis is stopped. The two compose: the marked panel
// scrolls, everything else is swallowed. That attribute lives on the modal
// panels; this hook owns the stop/start and the reduced-motion fallback.
//
//   lenis.stop()          locks the page for wheel, trackpad and touch
//   body overflow hidden  still needed on the reduced-motion path, where Lenis
//                         never boots and native scroll is live
//   overscroll-behavior   on the panel (in CSS), so reaching the end of a
//                         recipe does not chain the momentum to the document
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
