#!/usr/bin/env bash
# Copy the reviewed films, captions, posters and film timing into the dr.deepgridsemi.com site,
# rebuild the Pages artifact, and gate the result.
set -euo pipefail
R=/home/sheke/content-ideas/runs/2026-09-13-dg32-architecture-package
SITE=/home/sheke/deepgrid-dr-site
export PATH=/home/sheke/.nvm/versions/node/v24.18.1/bin:$PATH
mkdir -p "$SITE/public/media" "$SITE/app/data"
for pair in "$R:dg32-lite-architecture:dg32-lite-film" "$R/dg32-2dom:dg32-2dom-architecture:dg32-2dom-film"; do
  IFS=: read -r pkg slug data <<<"$pair"
  for f in "$slug.mp4" "$slug.vtt" "$slug-poster.jpg"; do cp "$pkg/video/$f" "$SITE/public/media/$f"; done
  cp "$pkg/video/$slug-film.json" "$SITE/app/data/$data.json"
  cp "$pkg/video/audio/narration-report.json" "$R/qa/${slug}-narration-report.json"
done
cd "$SITE"
npm run typecheck
PAGES_BASE=/deepgrid-dr-silicon/ PAGES_DOMAIN= npm run build:pages 2>&1 | tail -2
du -sh public/media public/decks public/downloads public/diagrams
