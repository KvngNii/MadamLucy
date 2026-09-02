import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Ties the hero's scroll progress (0-1 across the pin wrapper's own height,
// see HERO_PIN_VH in Hero.jsx) to the active video's currentTime and to the
// progress bar's width. Pinning itself is plain CSS `position: sticky` on
// `.hero` — ScrollTrigger here only measures progress against the wrapper,
// it never toggles position/pin styles itself, so nav clicks are never at
// risk of being intercepted by a GSAP-managed pin element.
export function useHeroScrollScrub({
  wrapperRef,
  videoRef,
  progressBarRef,
  activeFlavorId,
  reducedMotion,
}) {
  useLayoutEffect(() => {
    if (reducedMotion || !wrapperRef.current) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        const video = videoRef.current;
        if (video && video.duration && !Number.isNaN(video.duration)) {
          video.currentTime = self.progress * video.duration;
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${self.progress * 100}%`;
        }
      },
    });

    return () => trigger.kill();
    // Re-run when the flavor changes: the video element remounts (key=flavor
    // id), so the scrub needs to bind to the fresh element and re-measure.
  }, [wrapperRef, videoRef, progressBarRef, activeFlavorId, reducedMotion]);
}
