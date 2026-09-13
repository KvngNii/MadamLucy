import { useState } from 'react';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';

// A real photograph that degrades to a labeled placeholder: when no `src`
// has been supplied yet, and when one has but fails to load. Photography is
// arriving a shot at a time, so most slots on the page are still waiting —
// this keeps "not yet" and "broken" looking the same deliberate way, and
// makes dropping a file in a one-line change.
//
// `label` describes the missing photo (shown in the placeholder); `alt`
// describes the real one (read by screen readers when it loads).
export function Photo({
  src,
  alt = '',
  label,
  aspect = '4 / 3',
  className = '',
  fill = false,
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <PlaceholderBlock
        label={label}
        aspect={aspect}
        className={className}
        fill={fill}
      />
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
