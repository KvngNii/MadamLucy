import './LogoMark.css';

// The brand's "lucy" monogram, in two files, because which one is right
// depends on what is behind it.
//
// On a ground that is already green — the footer, and the nav while it is
// over the pour — the transparent PNG, so the mark sits straight on that
// green with no edge of its own.
//
// On the cream nav bar there is no green to sit on, so the with-background
// artwork supplies its own field.
//
// A note on that PNG, since it caused a real bug: its fully transparent
// pixels used to carry rgb(76,105,113), a slate grey-blue, in palette index
// 0. Alpha 0 makes that invisible by spec and desktop Chromium discards it,
// but a phone painted it as a solid grey tile behind the mark. Index 0 is now
// #116935 — the same green it sits on — so a browser that composites the
// stored RGB anyway shows green rather than slate. Not a cosmetic change to
// the artwork: every pixel with any opacity is byte-identical.
const LOGO_ON_GREEN = '/assets/Logo.png';
// Percent-encoded for the spaces, matching how index.html references the same
// file for og:image.
const LOGO_OWN_FIELD = '/assets/Logo%20With%20Background.jpg.jpg';

export function LogoMark({ variant = 'light', size = 44 }) {
  const style = { '--logo-size': `${size}px` };
  // Decorative: both call sites carry the brand name in text beside it, so an
  // alt here would just be read out twice.
  const shared = { width: size, height: size, alt: '' };

  // The footer's ground is green and stays green.
  if (variant === 'reversed') {
    return (
      <img
        className="logo-mark logo-mark--reversed"
        style={style}
        src={LOGO_ON_GREEN}
        {...shared}
      />
    );
  }

  // The nav's ground changes as you scroll, and it changes by a CSS class that
  // GSAP toggles (useNavOverStory), not by React state. Rendering both and
  // letting CSS choose leaves that one mechanism in charge; mirroring it into
  // React state would be a second source of truth to keep in sync, and one
  // more thing to get wrong on a fast scroll.
  return (
    <span className="logo-mark__pair" style={style}>
      <img className="logo-mark logo-mark--field" src={LOGO_OWN_FIELD} {...shared} />
      <img className="logo-mark logo-mark--plain" src={LOGO_ON_GREEN} {...shared} />
    </span>
  );
}
