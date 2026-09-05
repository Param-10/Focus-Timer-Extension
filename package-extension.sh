#!/bin/bash
# Creates a Chrome Web Store ZIP with only the files Chrome needs to run Focus.
set -euo pipefail
cd "$(dirname "$0")"
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('manifest.json','utf8')).version")
OUTPUT="focus-v${VERSION}.zip"
rm -f "$OUTPUT"
zip -r "$OUTPUT" \
  manifest.json \
  background.js \
  popup \
  options \
  offscreen \
  icons/*.png \
  sounds/chime.wav \
  LICENSE \
  PRIVACY.md \
  -x "*/.DS_Store"
echo "Packaged: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
