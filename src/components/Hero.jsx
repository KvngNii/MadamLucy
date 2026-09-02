import { useRef } from 'react';
import { motion } from 'motion/react';
import './Hero.css';
import { useFlavor } from '../context/FlavorContext.jsx';
import { VideoWithFallback } from './VideoWithFallback.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useHeroScrollScrub } from '../hooks/useHeroScrollScrub.js';
import { scrollToEl } from '../lib/lenis.js';

// Total scroll distance the pinned hero occupies. Kept well inside the
// 150-250vh requirement — see useHeroScrollScrub for how this height becomes
// the actual ScrollTrigger start/end range.
export const HERO_PIN_VH = 200;

export function Hero() {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();
  const videoRef = useRef(null);
  const pinWrapperRef = useRef(null);
  const heroContentRef = useRef(null);
  const progressBarRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useHeroScrollScrub({
    wrapperRef: pinWrapperRef,
    videoRef,
    progressBarRef,
    activeFlavorId,
    reducedMotion,
  });

  const handleSkip = () => {
    const target = document.getElementById('about-lucy');
    if (target) scrollToEl(target);
  };

  // Entrance/gesture transitions collapse to instant when reduced motion is
  // preferred — the copy still appears, it just doesn't animate in.
  const fadeUp = reducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: 'easeOut' },
      };
  const tap = reducedMotion ? {} : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 } };

  return (
    <section
      id="top"
      className="hero-pin-wrapper"
      ref={pinWrapperRef}
      style={{ height: reducedMotion ? '100vh' : `${HERO_PIN_VH}vh` }}
      data-flavor={activeFlavorId}
    >
      <div className="hero grain-overlay" ref={heroContentRef}>
        {/* Full-bleed pour video, scroll-scrubbed by useHeroScrollScrub —
            the video itself fills the entire hero viewport, with copy
            overlaid on top of a dark scrim for legibility. */}
        <div className="hero__video-layer">
          <VideoWithFallback
            ref={videoRef}
            src={activeFlavor.videoSrc}
            label={`${activeFlavor.label} gari pour — coming soon`}
            className="hero__video"
            key={activeFlavor.id}
            autoPlayLoop={reducedMotion}
            fill
          />
          <div className="hero__scrim" />
        </div>

        {!reducedMotion && (
          <>
            <div className="hero__progress-track" aria-hidden="true">
              <div className="hero__progress-fill" ref={progressBarRef} />
            </div>

            <button type="button" className="hero__skip" onClick={handleSkip}>
              Skip intro ↓
            </button>
          </>
        )}

        <div className="container hero__inner">
          <motion.div className="hero__copy" {...fadeUp}>
            <p className="hero__eyebrow">Fire-Roasted Ghanaian Gari</p>
            <h1 className="display-1 on-dark hero__headline">Gari, But Better</h1>
            <div className="dotted-line dotted-line--pale hero__dotted" />
            <p className="hero__flavor-name">{activeFlavor.label} gari mix</p>

            <p className="hero__subhead on-dark">
              Real cassava, real superfoods, real Ghana. Farm-to-table gari,
              reimagined for your health.
            </p>
            <motion.a
              href="#notify-me"
              className="btn btn-primary hero__cta"
              {...tap}
            >
              Notify Me at Launch
            </motion.a>

            <div
              className="hero__flavor-selector"
              role="group"
              aria-label="Choose a flavor"
            >
              {flavors.map((flavor) => (
                <motion.button
                  key={flavor.id}
                  type="button"
                  className={`hero__flavor-pill${
                    flavor.id === activeFlavorId ? ' is-active' : ''
                  }`}
                  data-flavor={flavor.id}
                  aria-pressed={flavor.id === activeFlavorId}
                  onClick={() => setActiveFlavorId(flavor.id)}
                  {...tap}
                >
                  {flavor.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
