import { useRef } from 'react';
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

  return (
    <section
      id="top"
      className="hero-pin-wrapper"
      ref={pinWrapperRef}
      style={{ height: reducedMotion ? '100vh' : `${HERO_PIN_VH}vh` }}
      data-flavor={activeFlavorId}
    >
      <div className="hero grain-overlay" ref={heroContentRef}>
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
          <div className="hero__copy">
            <p className="hero__eyebrow">Fire-Roasted Ghanaian Gari</p>
            <h1 className="display-1 hero__headline">Gari, But Better</h1>
            <div className="dotted-line hero__dotted" />
            <p className="hero__flavor-name">{activeFlavor.label} gari mix</p>

            <p className="hero__subhead">
              Real cassava, real superfoods, real Ghana. Farm-to-table gari,
              reimagined for your health.
            </p>
            <a href="#notify-me" className="btn btn-primary hero__cta">
              Notify Me at Launch
            </a>

            <div
              className="hero__flavor-selector"
              role="group"
              aria-label="Choose a flavor"
            >
              {flavors.map((flavor) => (
                <button
                  key={flavor.id}
                  type="button"
                  className={`hero__flavor-pill${
                    flavor.id === activeFlavorId ? ' is-active' : ''
                  }`}
                  data-flavor={flavor.id}
                  aria-pressed={flavor.id === activeFlavorId}
                  onClick={() => setActiveFlavorId(flavor.id)}
                >
                  {flavor.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hero__visual">
            <VideoWithFallback
              ref={videoRef}
              src={activeFlavor.videoSrc}
              label={`${activeFlavor.label} gari pour — coming soon`}
              className="hero__video"
              key={activeFlavor.id}
              autoPlayLoop={reducedMotion}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
