// Real trust signal from the packaging, recreated as inline SVG (circular
// text on a path) so it renders crisply at any size while we wait on the
// final seal artwork to swap in as /assets/seal-made-in-ghana.svg.
export function MadeInGhanaSeal({ size = 120 }) {
  const id = 'seal-circle-path';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Made in Ghana — Premium Quality seal"
    >
      <defs>
        <path id={id} d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="var(--color-green-deep)" />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="var(--color-pale)"
        strokeWidth="2"
        strokeDasharray="2 6"
      />
      <text fill="var(--color-pale)" fontSize="13" fontWeight="700" letterSpacing="2">
        <textPath href={`#${id}`} startOffset="2%">
          MADE IN GHANA • PREMIUM QUALITY •
        </textPath>
      </text>
      <g transform="translate(100,100)">
        <circle r="38" fill="var(--color-pale)" />
        <path
          d="M -16,0 L -5,12 L 18,-14"
          fill="none"
          stroke="var(--color-green-deep)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
