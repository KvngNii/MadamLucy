import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Drives the pinned pour video from scroll position across the story
// section. A proxy tween with `scrub: 0.6` gives the smoothed "plays with
// each scroll" inertia (raw ScrollTrigger progress would step); on every
// tick we seek the video and size the progress bar.
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
  videoRef,
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
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
      onUpdate() {
        const video = videoRef.current;
        if (video && video.duration && !Number.isNaN(video.duration)) {
          const t = proxy.p * video.duration;
          // Skip sub-frame seeks — every seek is a decode, so only move
          // when it would actually change the displayed frame.
          if (Math.abs(video.currentTime - t) > 1 / 60) {
            video.currentTime = t;
          }
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${proxy.p * 100}%`;
        }
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // Re-run on flavor change: the <video> remounts (key=flavor id), so the
    // scrub needs to bind to the fresh element.
  }, [storyRef, videoRef, progressBarRef, activeFlavorId, reducedMotion]);
}
