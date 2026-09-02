import './PlaceholderBlock.css';

// Stands in for any photo/video asset that hasn't been supplied yet. Reads
// intentionally unfinished (labeled, flavor-tinted pattern) rather than a
// broken image icon, and needs zero code changes once the real file lands —
// just add the file at the referenced path and swap this out.
export function PlaceholderBlock({
  label,
  aspect = '4 / 3',
  icon = '🌾',
  className = '',
}) {
  return (
    <div
      className={`placeholder-block ${className}`}
      style={{ aspectRatio: aspect }}
      role="img"
      aria-label={label}
    >
      <span className="placeholder-block__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="placeholder-block__label">{label}</span>
    </div>
  );
}
