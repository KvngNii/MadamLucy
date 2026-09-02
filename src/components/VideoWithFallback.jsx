import { forwardRef, useState } from 'react';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';

// Renders a <video> for scroll-scrubbing; if the source 404s or otherwise
// fails to load (common right now, since only the beetroot clip exists),
// degrades to a labeled placeholder instead of a broken player. No changes
// needed as real clips are dropped into /public/assets — this just starts
// resolving instead of erroring.
export const VideoWithFallback = forwardRef(function VideoWithFallback(
  { src, label, className = '', autoPlayLoop = false, fill = false },
  ref
) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <PlaceholderBlock
        label={label}
        aspect="4 / 5"
        icon="🎬"
        className={className}
        fill={fill}
      />
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      playsInline
      loop={autoPlayLoop}
      autoPlay={autoPlayLoop}
      preload="metadata"
      aria-label={label}
      onError={() => setFailed(true)}
    />
  );
});
