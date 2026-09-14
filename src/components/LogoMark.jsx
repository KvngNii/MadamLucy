import './LogoMark.css';

// The brand's "lucy" monogram. One transparent image serves both places it
// appears: the mark is pale yellow-green, so it sits directly on a dark
// ground (the footer, and the nav while that is over the pour) and gets a
// deep-green tile behind it on the cream nav bar, which is how the brand's
// own with-background artwork is built.
//
// 144px WebP, not the 1080px PNG it was: 48px, the largest slot, at 3x. It renders at 40 and 48, so the PNG
// was decoding 1.17 million pixels into a 40px box — about 4.6 MB of bitmap,
// twice per page, for something the size of a fingernail. The WebP is also
// half the bytes and keeps the alpha channel the mark needs.
//
// Logo.png still exists at 180px and is still the right file for the favicon
// and apple-touch-icon in index.html: Safari does not reliably take a WebP
// for those, and a favicon link has no fallback mechanism to give it one.
const LOGO_SRC = '/assets/Logo.webp';

export function LogoMark({ variant = 'light', size = 44 }) {
  return (
    <img
      className={`logo-mark logo-mark--${variant === 'reversed' ? 'reversed' : 'light'}`}
      style={{ '--logo-size': `${size}px` }}
      src={LOGO_SRC}
      width={size}
      height={size}
      // Decorative: both call sites already carry the brand name in text
      // beside it, so an alt here would just be read out twice.
      alt=""
    />
  );
}
