import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Drives the pinned pour from scroll position across the story section. A
// proxy tween with `scrub: 0.8` gives the smoothed "plays with each scroll"
// inertia (raw ScrollTrigger progress would step); on every tick we hand the
// progress to whatever renderer is active (canvas frame sequence, <video>
// with a seek queue, or nothing) and size the progress bar.
//
// The scrub ends two viewports before the story's bottom edge: the last
// viewport is the trailer that keeps the stage stuck while the next section
// curtains up over it, and the one before that is the text-free "hold" where
// the pour finishes clean. So the clip lands on its final frame exactly as
// the hold ends, then stays frozen for the whole curtain.
//
// Pinning itself is plain CSS `position: sticky` on the stage — ScrollTrigger
// only measures here, it never toggles pin styles, so nav clicks are never
// swallowed by a GSAP-managed pin element.
export function useStoryScrub({
  storyRef,
  rendererRef,
  progressBarRef,
  activeFlavorId,
  reducedMotion,
}) {
  useLayoutEffect(() => {
    const story = storyRef.current;
    if (reducedMotion || !story) return undefined;

    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: story,
        start: 'top top',
        end: () => `+=${story.offsetHeight - window.innerHeight * 2}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
      onUpdate() {
        rendererRef.current?.seek(proxy.p);
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${proxy.p * 100}%`;
        }
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // Re-run on flavor change: the renderer remounts (key=flavor id), so the
    // scrub needs to bind to the fresh one.
  }, [storyRef, rendererRef, progressBarRef, activeFlavorId, reducedMotion]);
}
