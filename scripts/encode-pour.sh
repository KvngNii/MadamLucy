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
#
# Needs ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg). Tunables:
#   FRAME_WIDTH (default 1440)   FRAME_QUALITY (webp, default 70)
set -euo pipefail

IN="${1:?input video}"; FLAVOR="${2:?flavor id, e.g. beetroot}"
FFMPEG="${FFMPEG:-ffmpeg}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/public/assets"
FRAMES="$ASSETS/frames/$FLAVOR"
W="${FRAME_WIDTH:-1440}"
Q="${FRAME_QUALITY:-70}"

# Encoder list captured once: piping straight into `grep -q` would trip
# `pipefail` (grep closes the pipe early → ffmpeg exits 141 → false negative).
ENCODERS="$("$FFMPEG" -hide_banner -encoders 2>/dev/null || true)"
has_enc() { grep -q " $1 " <<<"$ENCODERS"; }

echo "▶ $FLAVOR ← $IN"
mkdir -p "$FRAMES"
rm -f "$FRAMES"/[0-9]*.webp "$FRAMES"/[0-9]*.jpg "$FRAMES"/poster.* "$FRAMES"/manifest.json

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

# 3) Frame sequence.
if has_enc libwebp; then
  EXT=webp
  "$FFMPEG" -y -hide_banner -loglevel error -i "$ASSETS/pour-$FLAVOR.mp4" \
    -vf "scale=$W:-2" -c:v libwebp -quality "$Q" -compression_level 6 \
    "$FRAMES/%04d.webp"
else
  EXT=jpg
  "$FFMPEG" -y -hide_banner -loglevel error -i "$ASSETS/pour-$FLAVOR.mp4" \
    -vf "scale=$W:-2" -q:v 3 "$FRAMES/%04d.jpg"
fi
cp "$FRAMES/0001.$EXT" "$FRAMES/poster.$EXT"

COUNT=$(find "$FRAMES" -maxdepth 1 -name "[0-9]*.$EXT" | wc -l | tr -d ' ')
# `ffmpeg -i` with no output exits non-zero by design; don't let pipefail
# turn that into a script abort.
DIMS=$({ "$FFMPEG" -hide_banner -i "$FRAMES/0001.$EXT" 2>&1 || true; } | grep -oE '[0-9]{3,4}x[0-9]{3,4}' | head -1)
FW=${DIMS%x*}; FH=${DIMS#*x}
printf '{ "count": %s, "width": %s, "height": %s, "ext": "%s" }\n' "$COUNT" "$FW" "$FH" "$EXT" > "$FRAMES/manifest.json"
echo "  frames $COUNT × ${FW}x${FH} .$EXT — $(du -sh "$FRAMES" | cut -f1)"
echo "✔ done"
