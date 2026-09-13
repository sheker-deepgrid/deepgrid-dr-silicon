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
`make_film.py`. Per-slide speeds used: DG32-LITE datasheet `8:0.96,9:0.96,12:0.98`, DG32-2DOM
datasheet `4:0.98`, tape-in `1:0.91,8:0.94`.

Investor-level only: no register maps, memory map, magic values, board-design rules, internal names,
repository or sign-off run history. The tape-in deck lists the sign-off gates and makes no claim that
they have passed.
