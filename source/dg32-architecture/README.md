# DG32 architecture packages — source

Everything that produces the decks, films and diagrams served from `public/` on this site. The
working copy lives in `content-ideas/runs/2026-09-13-dg32-architecture-package/`; this folder is
its committed record. Generated media (narration audio, film segments, slide frames) is left out
and rebuilds from these files.

| Stage | DG32-LITE | DG32-2DOM |
| --- | --- | --- |
| Architecture guide | `dg32-lite-architecture.md` | `dg32-2dom-architecture.md` |
| Story pack (spine, evidence map, narration) | `story-architect-pack.md` | `dg32-2dom/story-architect-pack.md` |
| Diagram source | `diagram/dg32-lite-architecture.drawio` | `dg32-2dom/diagram/dg32-2dom-architecture.drawio` |
| Deck builder | `build_deck.mjs` | `dg32-2dom/build_deck.mjs` (+ `dg32-deck-kit.mjs`) |
| Visual spec | `visual-spec.json` | `dg32-2dom/visual-spec.json` |
| Film timing | `video/dg32-lite-architecture-film.json` | `dg32-2dom/video/dg32-2dom-architecture-film.json` |
| Narration report | `video/audio/narration-report.json` | `dg32-2dom/video/audio/narration-report.json` |

Shared: `narrate_kokoro.py` (Holt voice profile), `make_film.py`, `publish_to_site.sh`,
`source-map.md` (slide-by-document traceability and conflict rulings), `qa/gate-record.md`.

## Rebuild

Paths in the scripts are absolute to the working copy above; run them from there.

1. **Deck** — artifact-tool presentation JSX on the vault `vault-presales-pptx-pipeline` kit
   (`~/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs`) with the point-size
   correction in `vendor/kit-spec.mjs` (a copy of `runs/2026-08-22-design-video-brief/kit-spec.mjs`):
   `DECK_RUN=<dir> DECK_NAME=<slug> DECK_FOOTER='…' node build_deck.mjs`
2. **Gates** — `pptx_toolkit.py validate`, `officecli view <deck> issues`, `overflow_scan.py`,
   `verify_deck.py`, `validate_visual_spec.py`; promote `*-draft.pptx` to `*-reviewed.pptx` only
   when all pass (`qa/gate-record.md`).
3. **Frames** — export the reviewed deck through PowerPoint at 1920×1080 into `frames/slide-NN.png`.
4. **Narration gate** — before voicing, `python3 check_narration.py` on the pack narration against the reviewed
   deck; fix flagged lines in the story pack with `python3 rewrite_narration.py rewrites.json --write` (it gates the
   merged text and refuses to write while any slide repeats more than 18% of its slide or reads as a list), then
   rebuild the deck so its speaker notes match. Copied from `content-ideas/skills/narrated-deck-film/scripts/`.
5. **Narration** — `~/.venvs/kokoro/bin/python narrate_kokoro.py <pkg dir>`; Kokoro `bm_george`,
   gated on 135–160 spoken-word wpm (Holt target 140–155). Slides off the target take `SLIDE_SPEEDS`
   (`python3 tune_slide_speeds.py video/audio/narration-report.json` prints them; voice again and gate that pass)
   (measured speed × 150 ÷ measured wpm): DG32-LITE `4:0.95,5:0.99,12:0.96,14:0.98`, DG32-2DOM
   `1:0.96,2:1.01,3:0.94,5:1.01,7:0.99,8:0.96,12:1.0,13:0.99`. Narration is gated before voicing with `narrated-deck-film/scripts/check_narration.py <narration.json> --deck <reviewed.pptx>`: at most 18% of any slide's narration may repeat the slide's own wording, and every line must make a point rather than list. 
6. **Film** — `python3 make_film.py <pkg dir> <slug> "<chapters>"`.
7. **Publish** — `publish_to_site.sh` copies films, captions, posters and timing into this repo and
   builds; copy slide images and reviewed decks per the site README.

Investor-level only: no register maps, magic values, internal names or open review items. The
confidential source PDFs are not in this repository.
