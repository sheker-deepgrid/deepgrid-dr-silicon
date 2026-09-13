# DG32 datasheet and tape-in packages — source

Everything that produces the three document packages served from `public/`:

| Package | Source document | Deck builder | Story pack and narration |
| --- | --- | --- | --- |
| DG32-LITE datasheet (12 slides) | `DG32-LITE_Datasheet-3.pdf` | `lite-datasheet/build_deck.mjs` | `lite-datasheet/story-architect-pack.md` |
| DG32-2DOM datasheet (9 slides) | `DG32-2DOM_Datasheet-1.pdf` | `2dom-datasheet/build_deck.mjs` | `2dom-datasheet/story-architect-pack.md` |
| DG32-LITE tape-in block diagram (11 slides) | `DG32-LITE_block_diagram.pdf` | `tapein-diagram/build_deck.mjs` | `tapein-diagram/story-architect-pack.md` |

`ds-common.mjs` holds the shared cover, close, card grid, KPI row and band. The builders also import
the architecture packages' component kit (`../dg32-architecture/dg32-deck-kit.mjs`) and the vault
deck-kit with the point-size correction (`../dg32-architecture/vendor/kit-spec.mjs`). Each package
keeps its `visual-spec.json`, film timing (`video/*-film.json`) and narration report
(`video/audio/narration-report.json`); `qa/` holds the narration reports side by side.

Rebuild follows `../dg32-architecture/README.md`: build the deck, run the gates, export frames
through PowerPoint, narrate with `narrate_kokoro.py` (Holt profile), cut the film with
`make_film.py`. Per-slide speeds used: DG32-LITE datasheet `2:1.0,5:1.0,7:1.01,8:0.97,9:0.95,10:1.0`,
DG32-2DOM datasheet `1:0.99,2:0.98,3:1.0,4:0.98,5:0.99,6:0.99,7:0.96,8:1.01,9:0.99`, tape-in
`1:0.99,3:1.01,4:0.98,6:0.96,7:0.94,8:0.94,10:1.0,11:0.94`. Narration is gated before voicing with `narrated-deck-film/scripts/check_narration.py <narration.json> --deck <reviewed.pptx>`: at most 18% of any slide's narration may repeat the slide's own wording, and every line must make a point rather than list. 

Investor-level only: no register maps, memory map, magic values, board-design rules, internal names,
repository or sign-off run history. The tape-in deck lists the sign-off gates and makes no claim that
they have passed.
