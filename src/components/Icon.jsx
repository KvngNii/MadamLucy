// The site's only icon source. Inline SVG rather than emoji: emoji render as
// a different typeface (and often a different colour) on every platform, so
// they never match the brand. Each icon is a 24-unit square drawn in
// currentColor, so it takes the colour and size of whatever it sits in.
const paths = {
  leaf: (
    <>
      <path d="M4.5 19.5C3 16 3.5 9 8 6c3-2 8-2.5 12-2.5 0 4.5-.5 9.5-3 12.5-3 3.5-9.5 4.5-12.5 3.5Z" />
      <path d="M4 20c2.5-4 6-7.5 10-10" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
};

export function Icon({ name, size = 24, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
