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
const MAX_DPR = 1.5;

export const FrameSequence = forwardRef(function FrameSequence(
  { manifestUrl, className = '', onUnavailable },
  ref
) {
  const canvasRef = useRef(null);
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
        img.src = `${manifestUrl}${String(i + 1).padStart(4, '0')}.${ext}`;
      });

    const run = async () => {
      let manifest;
      try {
        const res = await fetch(`${manifestUrl}manifest.json`);
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        manifest = await res.json();
      } catch {
        if (!cancelled) onUnavailable?.();
        return;
      }
      if (cancelled) return;
      s.count = manifest.count;
      s.frames = new Array(manifest.count).fill(null);
      setPoster(`${manifestUrl}poster.${manifest.ext}`);

      // First frame, then coarse pass, then everything else — with a small
      // concurrency cap so the coarse pass isn't starved by the fine one.
      const order = [0];
      for (let i = COARSE_STEP; i < manifest.count; i += COARSE_STEP) order.push(i);
      for (let i = 1; i < manifest.count; i++) if (i % COARSE_STEP) order.push(i);

      const first = await load(0, manifest.ext);
      if (!first) {
        if (!cancelled) onUnavailable?.();
        return;
      }
      let next = 1;
      const worker = async () => {
        while (!cancelled && next < order.length) {
          const i = order[next++];
          await load(i, manifest.ext);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };
    run();

    const onResize = () => {
      s.drawn = -1;
      scheduleDraw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      if (s.raf) cancelAnimationFrame(s.raf);
    };
  }, [manifestUrl, onUnavailable, scheduleDraw]);

  return (
    <div className={`frame-seq ${className}`}>
      {poster && !firstFrameReady && (
        <img className="frame-seq__poster" src={poster} alt="" aria-hidden="true" />
      )}
      <canvas ref={canvasRef} className="frame-seq__canvas" aria-hidden="true" />
    </div>
  );
});
