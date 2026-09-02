import { forwardRef } from 'react';
import './ScrollHighlightText.css';

// Splits text into per-word spans, dim by default. The scroll-scrub timeline
// that brightens them in reading order is wired up by the parent (via
// useScrollHighlightText, targeting the forwarded ref) — this component only
// owns the DOM structure so the animation hook can target
// `.scroll-highlight__word` reliably. Works on a body paragraph (`as="p"`,
// the default) or a headline (`as="h2"`) — same word-reveal mechanic either
// way, just a different tag/typography.
export const ScrollHighlightText = forwardRef(function ScrollHighlightText(
  { text, as: Tag = 'p', className = '' },
  ref
) {
  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`scroll-highlight ${className}`}>
      {words.map((word, i) => (
        <span className="scroll-highlight__word" key={`${word}-${i}`}>
          {word}{' '}
        </span>
      ))}
    </Tag>
  );
});
