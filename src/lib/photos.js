// Which photos have a phone-sized sibling, and how wide the full-size file
// actually is.
//
// Every entry here has a `-500.webp` next to it in public/assets. The number
// is the full file's real pixel width, measured with ffprobe — not rounded,
// not assumed. A srcset descriptor that lies about a file's width makes the
// browser pick the wrong one, and it picks silently, so the bug looks like
// "the photo is a bit soft" rather than like a bug.
//
// Worth the bookkeeping: on a phone these nine photos are 1.3 MB at full size
// and 380 KB at 500px, for boxes that are never wider than about 350 CSS px.
const FULL_WIDTH = {
  '/assets/tradition-01-rooted.webp': 1000,
  '/assets/tradition-02-cultivated.webp': 1000,
  '/assets/tradition-03-hand-fermented.webp': 1000,
  '/assets/meet-lucy.webp': 1600,
  '/assets/no-fillers.webp': 1200,
  '/assets/unlock.webp': 1448,
  '/assets/recipe-eba.webp': 900,
  '/assets/recipe-gari-foto.webp': 900,
  '/assets/recipe-soakings.webp': 900,
};

const SMALL_WIDTH = 500;

// The srcset for a photo, or null if it has no small sibling. Photo.jsx calls
// this so no call site has to know the convention; a photo that gains a
// variant later becomes responsive by adding one line above.
export function srcSetFor(src) {
  const full = FULL_WIDTH[src];
  if (!full) return null;
  const small = src.replace(/\.webp$/, `-${SMALL_WIDTH}.webp`);
  return `${small} ${SMALL_WIDTH}w, ${src} ${full}w`;
}
