import { useLayoutEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap.js';

// While the sticky nav sits over the pinned pour story it drops its cream
// bar and goes transparent with pale links (the reference nav has no bar
// over the hero). The class flips back to the solid bar once the curtain
// section has risen up under the nav.
export function useNavOverStory(navRef, storySelector = '#top') {
  useLayoutEffect(() => {
    const nav = navRef.current;
    const story = document.querySelector(storySelector);
    if (!nav || !story) return undefined;

    const navHeight = () => nav.offsetHeight || 68;
    const trigger = ScrollTrigger.create({
      trigger: story,
      start: 'top bottom',
      // The story's last viewport is the curtain trailer: the next section
      // has already covered the stage by then, so hand the bar back once the
      // story's bottom edge is one viewport + nav-height above the fold.
      end: () => `bottom top+=${window.innerHeight + navHeight()}`,
      toggleClass: { targets: nav, className: 'nav--over-story' },
      invalidateOnRefresh: true,
    });

    return () => trigger.kill();
  }, [navRef, storySelector]);
}
