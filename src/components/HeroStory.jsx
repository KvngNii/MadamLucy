import { useRef } from 'react';
import { motion } from 'motion/react';
import './HeroStory.css';
import { useFlavor } from '../context/FlavorContext.jsx';
import { VideoWithFallback } from './VideoWithFallback.jsx';
import { ScrollHighlightText } from './ScrollHighlightText.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useStoryScrub } from '../hooks/useStoryScrub.js';
import { useScrollHighlightText } from '../hooks/useScrollHighlightText.js';
import { scrollToEl } from '../lib/lenis.js';

// The pinned "pour story": a full-bleed, scroll-scrubbed pour video stays
// stuck to the viewport while four text panels scroll past it, then a
// text-free hold where the pour finishes clean, then the next section
// curtains up over the frozen last frame. Copy hugs the edges (top band,
// bottom-left, right column) so the pour itself is never covered.
//
// Scroll budget (each panel = 100vh): hero → angle → unwrap → pour → hold →
// curtain → trailer. The trailer is an empty panel whose only job is to keep
// the stage stuck while the next section (pulled up 100vh by a negative
// margin on the story) slides over it.

const UNWRAP_ICONS = [
  { icon: '🫚', label: 'Ginger' },
  { icon: '🟣', label: 'Beetroot' },
  { icon: '🟡', label: 'Turmeric' },
];

// Module-level style objects (motion skill: don't recreate per render).
const copyStyle = { willChange: 'transform, opacity' };
const spring = { type: 'spring', stiffness: 120, damping: 20 };

export function HeroStory() {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();
  const reducedMotion = useReducedMotion();

  const storyRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const angleHeadlineRef = useRef(null);
  const pourHeadlineRef = useRef(null);

  useStoryScrub({
    storyRef,
    videoRef,
    progressBarRef,
    activeFlavorId,
    reducedMotion,
  });
  useScrollHighlightText(angleHeadlineRef, { reducedMotion, onDark: true });
  useScrollHighlightText(pourHeadlineRef, { reducedMotion, onDark: true });

  const handleSkip = () => {
    const target = document.getElementById('ingredients');
    if (target) scrollToEl(target);
  };

  // Copy blocks fade/slide in as their panel scrolls into view; gestures on
  // the CTA and pills. Both collapse to instant under reduced motion.
  const reveal = reducedMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { amount: 0.35 },
        transition: spring,
      };
  const tap = reducedMotion
    ? {}
    : {
        whileHover: { scale: 1.04 },
        whileTap: { scale: 0.96 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      };

  return (
    <section
      id="top"
      ref={storyRef}
      className={`story${reducedMotion ? ' story--static' : ''}`}
      data-flavor={activeFlavorId}
    >
      {/* Progress bar + skip live in a zero-height sticky layer above the
          panels so they stay clickable/visible for the whole story. */}
      {!reducedMotion && (
        <div className="story__ui">
          <div className="story__progress-track" aria-hidden="true">
            <div className="story__progress-fill" ref={progressBarRef} />
          </div>
          <button type="button" className="story__skip" onClick={handleSkip}>
            Skip intro ↓
          </button>
        </div>
      )}

      <div className="story__stage">
        <VideoWithFallback
          ref={videoRef}
          src={activeFlavor.videoSrc}
          label={`${activeFlavor.label} gari pour — coming soon`}
          className="story__video"
          key={activeFlavor.id}
          autoPlayLoop={reducedMotion}
          fill
        />
        <div className="story__vignette" />
      </div>

      <div className="story__panels">
        {/* 1 — hero: headline band at the top, paragraph + CTA bottom-left,
            flavor pills bottom-right. Middle stays clear. */}
        <div className="story__panel story__panel--hero">
          <motion.div
            className="story__block story__block--top"
            style={copyStyle}
            {...reveal}
          >
            <p className="story__eyebrow">Fire-Roasted Ghanaian Gari</p>
            <h1 className="story__headline on-dark">Gari, But Better</h1>
            <div className="dotted-line story__dotted" />
            <p className="story__flavor-name">{activeFlavor.label} gari mix</p>
          </motion.div>

          <motion.div
            className="story__block story__block--bottom-left"
            style={copyStyle}
            {...reveal}
          >
            <p className="story__small on-dark">
              Real cassava, real superfoods, real Ghana. Farm-to-table gari,
              reimagined for your health.
            </p>
            <motion.a href="#notify-me" className="btn btn-primary" {...tap}>
              Notify Me at Launch
            </motion.a>
          </motion.div>

          <motion.div
            className="story__block story__block--bottom-right"
            style={copyStyle}
            {...reveal}
          >
            <div
              className="story__flavor-selector"
              role="group"
              aria-label="Choose a flavor"
            >
              {flavors.map((flavor) => (
                <motion.button
                  key={flavor.id}
                  type="button"
                  className={`story__pill${
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

        {/* 2 — angle: word-reveal headline bottom-left with its paragraph. */}
        <div className="story__panel story__panel--angle">
          <div className="story__block story__block--bottom-left story__block--wide">
            <ScrollHighlightText
              ref={angleHeadlineRef}
              as="h2"
              text="A New Angle on Gari"
              className="story__h2 scroll-highlight--on-dark"
            />
            <motion.p
              className="story__small on-dark"
              style={copyStyle}
              {...reveal}
            >
              More than just food packed with carbs — a healthier, more
              flavorful experience, infused with powerful superfoods chosen
              for their health-boosting properties, rich nutrients, and
              unique taste.
            </motion.p>
          </div>
        </div>

        {/* 3 — unwrap: textured headline centered at the top, icon row +
            paragraph centered at the bottom. */}
        <div className="story__panel story__panel--unwrap">
          <motion.div
            className="story__block story__block--top"
            style={copyStyle}
            {...reveal}
          >
            <h2 className="story__h2 story__h2--textured">Unwrap the Goodness</h2>
          </motion.div>
          <motion.div
            className="story__block story__block--bottom-center"
            style={copyStyle}
            {...reveal}
          >
            <div className="story__icons">
              {UNWRAP_ICONS.map((item) => (
                <span className="story__icon-circle" key={item.label} title={item.label}>
                  <span aria-hidden="true">{item.icon}</span>
                </span>
              ))}
            </div>
            <p className="story__small on-dark">
              Tear open a sachet of Lucy&apos;s Gari and you&apos;re met with
              vivid color and bold aroma — earthy beetroot, warm ginger,
              golden turmeric. Rich, fragrant, and ready to transform any
              meal.
            </p>
          </motion.div>
        </div>

        {/* 4 — pour: big word-reveal headline bottom-left; paragraph + CTA
            top-right. The pour itself lands in this panel and the hold. */}
        <div className="story__panel story__panel--pour">
          <motion.div
            className="story__block story__block--top-right"
            style={copyStyle}
            {...reveal}
          >
            <p className="story__small on-dark">
              Bold color, smooth crunch, and a timeless taste of Ghanaian
              tradition — all in one sachet.
            </p>
            <motion.a href="#notify-me" className="btn btn-primary" {...tap}>
              Notify Me
            </motion.a>
          </motion.div>
          <div className="story__block story__block--bottom-left story__block--wide">
            <ScrollHighlightText
              ref={pourHeadlineRef}
              as="h2"
              text="A New Perspective on Taste"
              className="story__h2 story__h2--big scroll-highlight--on-dark"
            />
          </div>
        </div>

        {/* 5 — hold: text-free, the pour finishes clean full-screen.
            6 — curtain: the next section starts rising over the stage.
            7 — trailer: keeps the stage stuck until it's fully covered. */}
        {!reducedMotion && (
          <>
            <div className="story__panel story__panel--hold" aria-hidden="true" />
            <div className="story__panel story__panel--curtain" aria-hidden="true" />
            <div className="story__panel story__panel--trailer" aria-hidden="true" />
          </>
        )}
      </div>
    </section>
  );
}
