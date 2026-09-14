import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import './FrameSequence.css';

// Canvas image-sequence renderer for scroll-scrubbing. Frames are plain
// images (see scripts/encode-pour.sh), so a "seek" is a synchronous
// drawImage of an already-decoded bitmap — no video seek latency, and it
// scrubs the same on iOS Safari. Frames load in two passes (every 8th frame
// first, then the rest) so coarse scrubbing works within a second while the
// full set fills in; `seek()` always draws the nearest *loaded* frame.
//
// Imperative API: ref.current.seek(progress 0..1).

const COARSE_STEP = 8;
const CONCURRENCY = 6;

// Below this viewport width the phone set is used. 820 rather than a phone
// width: a small tablet or a narrow desktop window gets a stage barely wider
// than a phone's, and at the capped 2x DPR the 960-wide frames still cover it.
const SMALL_VIEWPORT = 820;

// Which sequence this device should get, decided once at mount.
//
// The full set is 9.2 MB across 241 frames. Measured on a throttled 4G phone
// it was still arriving 45 seconds after load, competing the whole time with
// the content someone was actually trying to read. The phone set is the same
// pour at a third of the frame rate and half the width — 481 KB.
//
// Read once, not on resize. Re-picking mid-scroll would throw away every
// decoded frame to serve the case of a phone rotated into a tablet-width
// window, which is not a case anyone is in.
function pickSequence(full, small, force) {
  if (typeof window === 'undefined') return { url: full, posterOnly: force };
  const conn = navigator.connection;
  // saveData is the one unambiguous thing a person can say to a site about
  // their data, and 2g means the sequence would still be downloading after
  // they had given up and left. Either way they get the poster, which is a
  // still of the pour — the page looks finished, it just does not move.
  const posterOnly =
    force ||
    Boolean(conn?.saveData) ||
    /^(slow-)?2g$/.test(conn?.effectiveType || '');
  const narrow = window.innerWidth < SMALL_VIEWPORT;
  return { url: narrow && small ? small : full, posterOnly };
}
// Cap the canvas backing store at 2x the CSS size. This used to be 1.5,
// which made the pour visibly soft on every Retina screen: the compositor
// had to stretch the backing store the remaining 1.33x to fill a 2x display,
// so the image was resampled twice on its way to the glass. At 2 the canvas
// is 1:1 with a typical laptop and there is one resample instead of two.
//
// Still capped rather than using devicePixelRatio raw: a 3x phone would
// allocate a 1170x2532 store and rescale a 1440-wide bitmap into it on every
// scrub frame, and the frames themselves are only 1440 wide, so past 2x there
// is nothing left to reveal — only work. Scrub timings at 390x844 @3x were
// measured before and after this change; see the commit.
const MAX_DPR = 2;

export const FrameSequence = forwardRef(function FrameSequence(
  { manifestUrl, smallManifestUrl, staticOnly = false, className = '', onUnavailable },
  ref
) {
  const canvasRef = useRef(null);
  // useState with an initialiser, not useMemo: this must be decided exactly
  // once for the life of the component, and useMemo is a performance hint the
  // runtime is allowed to discard.
  const [{ url: activeUrl, posterOnly }] = useState(() =>
    pickSequence(manifestUrl, smallManifestUrl, staticOnly)
  );
  const state = useRef({
    frames: [], // HTMLImageElement | null, per index
    count: 0,
    progress: 0,
    drawn: -1,
    raf: 0,
  });
  const [poster, setPoster] = useState(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  const nearestLoaded = (idx) => {
    const { frames, count } = state.current;
    if (frames[idx]) return idx;
    for (let d = 1; d < count; d++) {
      if (idx - d >= 0 && frames[idx - d]) return idx - d;
      if (idx + d < count && frames[idx + d]) return idx + d;
    }
    return -1;
  };

  const draw = useCallback(() => {
    const s = state.current;
    s.raf = 0;
    const canvas = canvasRef.current;
    if (!canvas || !s.count) return;
    const target = Math.round(s.progress * (s.count - 1));
    const idx = nearestLoaded(target);
    if (idx < 0 || idx === s.drawn) return;

    const img = s.frames[idx];
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }
    const ctx = canvas.getContext('2d');
    // Default is 'low'. Every device upscales these frames to some degree, so
    // the better resampling kernel is doing real work here, and it is free.
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // object-fit: cover
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    s.drawn = idx;
    canvas.dataset.frame = String(idx);
  }, []);

  const scheduleDraw = useCallback(() => {
    const s = state.current;
    if (!s.raf) s.raf = requestAnimationFrame(draw);
  }, [draw]);

  useImperativeHandle(
    ref,
    () => ({
      seek(p) {
        state.current.progress = Math.min(1, Math.max(0, p));
        scheduleDraw();
      },
    }),
    [scheduleDraw]
  );

  useEffect(() => {
    let cancelled = false;
    const s = state.current;
    s.frames = [];
    s.count = 0;
    s.drawn = -1;

    const load = (i, ext) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (cancelled) return resolve(false);
          s.frames[i] = img;
          if (i === 0) setFirstFrameReady(true);
          // Redraw if this frame is closer to the target than what's shown.
          const target = Math.round(s.progress * (s.count - 1));
          if (s.drawn < 0 || Math.abs(i - target) < Math.abs(s.drawn - target)) {
            s.drawn = -1;
            scheduleDraw();
          }
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = `${activeUrl}${String(i + 1).padStart(4, '0')}.${ext}`;
      });

    // Pull a list of indices with a small concurrency cap, so one pass cannot
    // starve the next.
    const pull = async (order, ext) => {
      let next = 0;
      const worker = async () => {
        while (!cancelled && next < order.length) {
          await load(order[next++], ext);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };

    const run = async () => {
      let manifest;
      try {
        const res = await fetch(`${activeUrl}manifest.json`);
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        manifest = await res.json();
      } catch {
        if (!cancelled) onUnavailable?.();
        return;
      }
      if (cancelled) return;
      s.count = manifest.count;
      s.frames = new Array(manifest.count).fill(null);
      setPoster(`${activeUrl}poster.${manifest.ext}`);
      // A seek can land before the manifest does (the scrub binds to this
      // renderer in the layout phase, we load in a passive effect), and that
      // draw bailed on `!s.count`. Now that we have a count, ask again.
      scheduleDraw();

      // Save-Data, or a connection slow enough that the sequence would still
      // be arriving after they had gone. The poster stays up — firstFrameReady
      // never flips — so the stage shows a still of the pour rather than a
      // hole, and seek() is harmless because there is nothing to draw.
      if (posterOnly) return;

      const first = await load(0, manifest.ext);
      if (!first) {
        if (!cancelled) onUnavailable?.();
        return;
      }

      // Coarse pass: every 8th frame. This is what makes scrubbing work at
      // all, so it runs now, at full priority.
      const coarse = [];
      for (let i = COARSE_STEP; i < manifest.count; i += COARSE_STEP) coarse.push(i);
      await pull(coarse, manifest.ext);
      if (cancelled) return;

      // Everything else, once the browser is idle. These only smooth a scrub
      // that already works, and holding them back keeps them from competing
      // with the images, fonts and copy someone is actually looking at — which
      // measured as the page still downloading 45 seconds in on 4G.
      const fine = [];
      for (let i = 1; i < manifest.count; i++) if (i % COARSE_STEP) fine.push(i);
      const startFine = () => {
        if (!cancelled) pull(fine, manifest.ext);
      };
      if (typeof requestIdleCallback === 'function') {
        // The timeout is the point: on a page that never goes idle this still
        // runs, just late.
        idle = requestIdleCallback(startFine, { timeout: 4000 });
      } else {
        idle = setTimeout(startFine, 1200);
      }
    };
    let idle = 0;
    run();

    // Watch the canvas itself, not just the window: the stage is sticky and
    // can be laid out at zero size for a tick, and a draw that measured zero
    // must repaint once the real size arrives.
    const onResize = () => {
      s.drawn = -1;
      scheduleDraw();
    };
    window.addEventListener('resize', onResize);
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
    if (observer && canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      // Either kind of handle: whichever scheduler the branch above used, the
      // other's canceller is a no-op on an id it does not own.
      if (idle) {
        if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
        clearTimeout(idle);
      }
      if (s.raf) {
        cancelAnimationFrame(s.raf);
        // Must clear the id, not just cancel the frame: `scheduleDraw` skips
        // when `raf` is set, so a stale id here would silently kill every
        // future draw on this instance. That bit exactly once — on a flavor
        // switch, where a seek schedules a frame before this effect's first
        // (StrictMode) cleanup, leaving the remounted canvas blank forever.
        s.raf = 0;
      }
    };
  }, [activeUrl, posterOnly, onUnavailable, scheduleDraw]);

  return (
    <div className={`frame-seq ${className}`}>
      {poster && !firstFrameReady && (
        <img className="frame-seq__poster" src={poster} alt="" aria-hidden="true" />
      )}
      <canvas ref={canvasRef} className="frame-seq__canvas" aria-hidden="true" />
    </div>
  );
});
