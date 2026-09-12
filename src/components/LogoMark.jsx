import './LogoMark.css';

// The brand's "lucy" monogram. One transparent PNG serves both places it
// appears: the mark is pale yellow-green, so it sits directly on a dark
// ground (the footer, and the nav while that is over the pour) and gets a
// deep-green tile behind it on the cream nav bar, which is how the brand's
// own with-background artwork is built.
const LOGO_SRC = '/assets/Logo.png';

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
