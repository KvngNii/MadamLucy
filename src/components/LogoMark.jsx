import './LogoMark.css';

// TEMPORARY recreation of the "LUCY" 2x2 monogram lockup, built in CSS so the
// site has a working, on-brand logo today. Replace with the real
// /assets/logo.png (transparent) and /assets/logo-reversed.jpg (green field)
// as soon as their file paths are available — swap the <img> back in and
// delete this component, no other changes needed.
export function LogoMark({ variant = 'light', size = 44 }) {
  const isReversed = variant === 'reversed';
  return (
    <span
      className={`logo-mark logo-mark--${isReversed ? 'reversed' : 'light'}`}
      style={{ '--logo-size': `${size}px` }}
      role="img"
      aria-label="Lucy Perfect Enterprise logo"
    >
      <span className="logo-mark__cell">L</span>
      <span className="logo-mark__cell">U</span>
      <span className="logo-mark__cell">C</span>
      <span className="logo-mark__cell">Y</span>
    </span>
  );
}
