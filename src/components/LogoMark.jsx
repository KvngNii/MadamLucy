import './LogoMark.css';

// The brand's "lucy" monogram — the with-background artwork exactly as
// supplied, green field and all.
//
// Percent-encoded because the filename has spaces in it, matching how
// index.html already references the same file for og:image.
//
// This replaced Logo.png, the transparent version. That file's fully
// transparent pixels carried rgb(76,105,113) — a slate grey-blue — baked into
// palette index 0, and phones whose browsers composite the stored RGB instead
// of discarding it painted a grey tile behind the mark. Nothing in CSS could
// reach that colour; it was inside the image. The artwork below has no
// transparency for anything to get wrong.
const LOGO_SRC = '/assets/Logo%20With%20Background.jpg.jpg';

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
