# Gate record — DG32 architecture decks

Status: **reviewed** for both decks (2026-09-13). Method: vault-presales-pptx-pipeline, artifact-tool
presentation JSX, deck-kit primitives with the kit-spec type correction; story-architect upstream.

| Gate | DG32-LITE (16 slides) | DG32-2DOM (13 slides) |
|---|---|---|
| Canvas | 13.333 × 7.5 in | 13.333 × 7.5 in |
| Structural (`pptx_toolkit.py validate`) | valid, 0 problems | valid, 0 problems |
| OfficeCLI `view issues` | 0 issues | 0 issues |
| Overflow (`overflow_scan.py`, defRPr-aware) | 0 shapes (was 10) | 0 shapes (was 1) |
| Bounds, collision, occlusion, contrast (`verify_deck.py`) | PASS (was 28 findings) | PASS (was 2) |
| Native objects | 805 shapes, 0 pictures | 588 shapes, 0 pictures |
| Speaker notes | 16 / 16 (narration verbatim) | 13 / 13 |
| Visual spec (`validate_visual_spec.py`) | valid | valid |
| Contact sheet reviewed by eye | yes | yes |
| Internal-term scan (names, shuttle ids, register terms, tapeout/LVS) | clean | clean |
| Source footer on every content slide | yes | yes |

Waived with reason: `lint_pptx.py` TEXT_TOO_SMALL (flat 14 pt floor is stricter than the design
system's 7–10 pt footers and kickers), SLIDE_WORD_COUNT on close slides, DECK_COLOR_COUNT (design
system palette plus accessible text tones).

Fixes made during QA: cyan kickers, KPI numbers and filled labels moved to #0077A3 / #07686A to
clear 4.5:1; card bodies measured at 85% width so the estimator stops under-counting wraps; slide
10 cards shortened to stay inside the canvas; slide 5 card cleared the source line; draw-order
occlusion of the slide-10 page number removed.

Reviewed copies: `dg32-lite-architecture-reviewed.pptx`, `dg32-2dom/dg32-2dom-architecture-reviewed.pptx`,
also in `content-ideas/Decks/outputs/` and the site's `public/downloads/` (SHA-256 identical, three copies each).
