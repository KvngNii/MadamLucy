#!/usr/bin/env bash
# Prepare a pour clip for scroll-scrubbing.
#
#   scripts/encode-pour.sh <input.mp4> <flavorId>
#   e.g. scripts/encode-pour.sh ~/Downloads/ginger-pour.mp4 ginger
#
# Produces, under public/assets/:
#   pour-<flavor>.mp4            H.264 8-bit, 1080p, short GOP  (fallback renderer)
#   pour-<flavor>.webm           VP9 copy, if this ffmpeg has libvpx-vp9
#   frames/<flavor>/0001.webp…   every frame, for the canvas renderer
#   frames/<flavor>/poster.webp  first frame (instant first paint)
#   frames/<flavor>/manifest.json {count,width,height,ext}
#   frames/<flavor>-sm/…         the same pour, phone-sized (see below)
#
# Two sets, because one does not fit both. The full set is 9.2 MB — fine over
# a laptop's wifi, and most of a minute of a phone's mobile data for a
# decoration above the fold. The -sm set samples the same clip at a third of
# the frame rate and half the width, which lands near 1 MB. FrameSequence.jsx
# picks between them by viewport width.
#
# Needs ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg). Tunables:
#   FRAME_WIDTH (default 1920)   FRAME_QUALITY (webp, default 70)
#   SMALL_WIDTH (default 960)    SMALL_FPS (default 8)
#   SKIP_FULL=1 / SKIP_SMALL=1   regenerate only one set
set -euo pipefail

IN="${1:?input video}"; FLAVOR="${2:?flavor id, e.g. beetroot}"
FFMPEG="${FFMPEG:-ffmpeg}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/public/assets"
FRAMES="$ASSETS/frames/$FLAVOR"
# 1920, not 1440. The frames are what the canvas actually draws, and 1440 was
# throwing away 18% of the detail a 1080p master holds — measured, not guessed.
# It also makes a 1080p monitor pixel-perfect (1.00x) instead of 1.33x.
W="${FRAME_WIDTH:-1920}"
Q="${FRAME_QUALITY:-70}"
# 960 and 8fps: a 390px phone at the capped 2x DPR wants 780px, so 960 still
# has headroom, and 8fps over this clip is ~81 frames — enough that a scrub
# reads as a pour rather than a flipbook. Both were checked by watching the
# result, not by arithmetic alone.
SW="${SMALL_WIDTH:-960}"
SFPS="${SMALL_FPS:-8}"
FRAMES_SM="$ASSETS/frames/$FLAVOR-sm"

# Encoder list captured once: piping straight into `grep -q` would trip
# `pipefail` (grep closes the pipe early → ffmpeg exits 141 → false negative).
ENCODERS="$("$FFMPEG" -hide_banner -encoders 2>/dev/null || true)"
has_enc() { grep -q " $1 " <<<"$ENCODERS"; }

echo "▶ $FLAVOR ← $IN"

# 1) H.264 8-bit fallback video. Written to a temp file so the input may be
#    the same path we are replacing.
TMP="$ASSETS/.pour-$FLAVOR.tmp.mp4"
"$FFMPEG" -y -hide_banner -loglevel error -i "$IN" -an \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -preset slow -crf 22 \
  -g 12 -keyint_min 12 -sc_threshold 0 \
  -vf "scale=-2:1080" -movflags +faststart "$TMP"
mv -f "$TMP" "$ASSETS/pour-$FLAVOR.mp4"
echo "  mp4  $(du -h "$ASSETS/pour-$FLAVOR.mp4" | cut -f1)"

# 2) VP9 copy (optional).
if has_enc libvpx-vp9; then
  "$FFMPEG" -y -hide_banner -loglevel error -i "$ASSETS/pour-$FLAVOR.mp4" -an \
    -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -g 12 -pix_fmt yuv420p \
    "$ASSETS/pour-$FLAVOR.webm"
  echo "  webm $(du -h "$ASSETS/pour-$FLAVOR.webm" | cut -f1)"
else
  echo "  webm skipped (no libvpx-vp9 in this ffmpeg)"
fi

# 3) Frame sequences — straight from the master, NOT from the mp4 written
#    above. Going via that intermediate put the frames through a second lossy
#    generation and measured 7.5% less detail for no benefit; the mp4 exists
#    only as the <video> fallback, so nothing needs it as a source.
#
#    Both sets come from the same master for the same reason: downscaling the
#    full set into the small one would be that second generation by another
#    name.
extract() {
  local dir="$1" width="$2" fps="$3" label="$4"
  local ext filter
  mkdir -p "$dir"
  rm -f "$dir"/[0-9]*.webp "$dir"/[0-9]*.jpg "$dir"/poster.* "$dir"/manifest.json

  # An empty fps means every frame of the input, which is what the full set
  # has always done. Anything else resamples first, then scales — in that
  # order, so the scaler only touches frames that survive.
  filter="scale=$width:-2"
  [ -n "$fps" ] && filter="fps=$fps,$filter"

  if has_enc libwebp; then
    ext=webp
    "$FFMPEG" -y -hide_banner -loglevel error -i "$IN" \
      -vf "$filter" -c:v libwebp -quality "$Q" -compression_level 6 \
      "$dir/%04d.webp"
  else
    ext=jpg
    "$FFMPEG" -y -hide_banner -loglevel error -i "$IN" \
      -vf "$filter" -q:v 3 "$dir/%04d.jpg"
  fi
  cp "$dir/0001.$ext" "$dir/poster.$ext"

  local count dims fw fh
  count=$(find "$dir" -maxdepth 1 -name "[0-9]*.$ext" | wc -l | tr -d ' ')
  # `ffmpeg -i` with no output exits non-zero by design; don't let pipefail
  # turn that into a script abort.
  dims=$({ "$FFMPEG" -hide_banner -i "$dir/0001.$ext" 2>&1 || true; } | grep -oE '[0-9]{3,4}x[0-9]{3,4}' | head -1)
  fw=${dims%x*}; fh=${dims#*x}
  printf '{ "count": %s, "width": %s, "height": %s, "ext": "%s" }\n' "$count" "$fw" "$fh" "$ext" > "$dir/manifest.json"
  echo "  $label $count × ${fw}x${fh} .$ext — $(du -sh "$dir" | cut -f1)"
}

[ -n "${SKIP_FULL:-}" ]  || extract "$FRAMES"    "$W"  ""      "frames"
[ -n "${SKIP_SMALL:-}" ] || extract "$FRAMES_SM" "$SW" "$SFPS" "frames-sm"
echo "✔ done"
