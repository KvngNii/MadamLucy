import { forwardRef } from 'react';
import './ScrollHighlightText.css';

// Splits text into per-word spans, dim by default. The scroll-scrub timeline
// that brightens them in reading order is wired up by the parent (see
// MeetLucy.jsx) against the forwarded ref — this component only owns the DOM
// structure so the animation hook can target `.scroll-highlight__word`
// reliably.
export const ScrollHighlightText = forwardRef(function ScrollHighlightText(
  { text, className = '' },
  ref
) {
  const words = text.split(' ');

  return (
    <p ref={ref} className={`scroll-highlight ${className}`}>
      {words.map((word, i) => (
        <span className="scroll-highlight__word" key={`${word}-${i}`}>
          {word}{' '}
        </span>
      ))}
    </p>
  );
});
