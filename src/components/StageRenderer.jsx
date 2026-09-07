import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { FrameSequence } from './FrameSequence.jsx';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';

// The pour stage's renderer chain, best first:
//   1. FrameSequence (canvas image sequence)  — if the flavor has frames
//   2. <video> (H.264 mp4 + optional WebM)    — with a seek queue
//   3. PlaceholderBlock                        — nothing available yet
// Whichever is active, the parent drives it through one `seek(progress)`.
// Add `?noframes` to the URL to force the video path while developing.

export const StageRenderer = forwardRef(function StageRenderer(
  { flavor, className = '', autoPlayLoop = false },
  ref
) {
  const wantFrames =
    !!flavor.frames &&
    !autoPlayLoop &&
    !(typeof window !== 'undefined' && window.location.search.includes('noframes'));
  const [mode, setMode] = useState(wantFrames ? 'frames' : 'video');

  const framesRef = useRef(null);
  const videoRef = useRef(null);
  // Seek queue: never hand the browser a second seek while one is in
  // flight — keep only the latest target and apply it on `seeked`.
  const pending = useRef(null);
  const seeking = useRef(false);
  const guard = useRef(0);

  const applySeek = useCallback(() => {
    const v = videoRef.current;
    if (!v || seeking.current || pending.current == null) return;
    const t = pending.current;
    pending.current = null;
    seeking.current = true;
    clearTimeout(guard.current);
    // Safety: if `seeked` never fires (same-time seek, odd browsers), unstick.
    guard.current = setTimeout(() => {
      seeking.current = false;
      applySeek();
    }, 250);
    if (typeof v.fastSeek === 'function') v.fastSeek(t);
    else v.currentTime = t;
  }, []);

  const onSeeked = useCallback(() => {
    seeking.current = false;
    clearTimeout(guard.current);
    applySeek();
  }, [applySeek]);

  useImperativeHandle(
    ref,
    () => ({
      seek(p) {
        if (mode === 'frames') {
          framesRef.current?.seek(p);
          return;
        }
        const v = videoRef.current;
        if (!v || !v.duration || Number.isNaN(v.duration)) return;
        const t = p * v.duration;
        if (Math.abs(v.currentTime - t) < 1 / 48) return;
        pending.current = t;
        applySeek();
      },
    }),
    [mode, applySeek]
  );

  const toVideo = useCallback(() => setMode('video'), []);
  const label = `${flavor.label} gari pour — coming soon`;

  if (mode === 'frames') {
    return (
      <FrameSequence
        ref={framesRef}
        manifestUrl={flavor.frames}
        className={className}
        onUnavailable={toVideo}
      />
    );
  }

  if (mode === 'video') {
    return (
      <video
        ref={videoRef}
        className={className}
        muted
        playsInline
        loop={autoPlayLoop}
        autoPlay={autoPlayLoop}
        preload="auto"
        aria-label={label}
        onSeeked={onSeeked}
        onError={() => setMode('placeholder')}
      >
        {flavor.videoWebm && <source src={flavor.videoWebm} type="video/webm" />}
        <source src={flavor.videoSrc} type="video/mp4" />
      </video>
    );
  }

  return (
    <PlaceholderBlock label={label} aspect="4 / 5" icon="🎬" className={className} fill />
  );
});
