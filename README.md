# dr.deepgridsemi.com — DG32 silicon site

Live site: https://shekerkamma.github.io/deepgrid-dr-silicon/ (moves to https://dr.deepgridsemi.com/ once DNS is in place)

The public page for Deepgrid Semi's DG32 motor-control silicon: DG32-LITE (dual-core lockstep
RISC-V SoC) and DG32-2DOM (the same chip plus an INT8 attention engine). It is built from the
same React / Vinext / Three.js project as
[deepgrid-platform-showcase](https://github.com/shekerkamma/deepgrid-platform-showcase), with
all ADAS and platform content replaced.

## Run locally

Node 24:

```sh
npm ci --ignore-scripts
npm run dev
npm run typecheck
npm run build:pages   # static artifact in dist/pages, with CNAME
```

## Where to make changes

| Change | Edit |
| --- | --- |
| Every number, spec, block description, comparison row and roadmap item | `app/content.ts` |
| Detailed explanations: block rationale, design premises, data flows, engine, tape-in, electrical, positioning | `app/detail-content.ts` |
| Architecture view (DG32-LITE, DG32-2DOM and tape-in tabs) | `app/architecture.tsx`, layout primitives in `app/detail.tsx` |
| Page layout and copy around the data | `app/page.tsx` |
| Section styles and chart colours | `app/dr.css` (base tokens in `app/globals.css`, `app/ux.css`) |
| Interactive 3D package and die model | `app/silicon.tsx` |
| Images | `public/images/` |

## Decks & films

The **Decks & films** view links one package per source document: the two architecture documents, both datasheets and the tape-in block diagram. Every file is served
from this repository:

| Package | Deck | Film | Diagram | Guide |
| --- | --- | --- | --- | --- |
| DG32-LITE | `public/downloads/dg32-lite-architecture.pptx` (16 slides) | `public/media/dg32-lite-architecture.mp4` + `.vtt` | `public/diagrams/dg32-lite-architecture.svg`, source `public/downloads/*.drawio` | `public/downloads/dg32-lite-architecture-guide.md` |
| DG32-2DOM | `public/downloads/dg32-2dom-architecture.pptx` (13 slides) | `public/media/dg32-2dom-architecture.mp4` + `.vtt` | `public/diagrams/dg32-2dom-architecture.svg` | `public/downloads/dg32-2dom-architecture-guide.md` |
| DG32-LITE datasheet | `public/downloads/dg32-lite-datasheet.pptx` (12 slides) | `public/media/dg32-lite-datasheet.mp4` + `.vtt` | — | — |
| DG32-2DOM datasheet | `public/downloads/dg32-2dom-datasheet.pptx` (9 slides) | `public/media/dg32-2dom-datasheet.mp4` + `.vtt` | — | — |
| DG32-LITE tape-in block diagram | `public/downloads/dg32-lite-tapein.pptx` (11 slides) | `public/media/dg32-lite-tapein.mp4` + `.vtt` | — | — |

Slide images in `public/decks/` are PowerPoint's own 1920×1080 exports of the reviewed decks,
resized to 1600 px. Film chapter and slide timing lives in `app/data/*-film.json`, written by the
film assembler, so the deck viewer can follow the film. The builders, story packs, narration and
QA records are committed under `source/dg32-architecture/` and `source/dg32-datasheets/`.

To refresh a package: rebuild the deck there, export frames through PowerPoint, re-narrate
(Kokoro, Holt profile), reassemble the film, then copy the reviewed `.pptx`, `slide-NN.webp`,
`.mp4`, `.vtt`, poster and `*-film.json` here. `npm run build:pages` fails if any package's deck, film,
captions, poster or slide image is missing.

## Sources

All figures come from Deepgrid Semi's September 2026 documents:

- `DG32-LITE_block_diagram_investor.pdf` — architecture, STM32G0 positioning, roadmap
- `DG32-LITE_block_diagram.pdf` — tape-in block diagram
- `DG32-LITE_Block_Architecture.pdf` — per-block rationale, loop budget, post-route fmax
- `DG32-LITE_Datasheet-3.pdf` — preliminary datasheet
- `DG32-2DOM_Datasheet-1.pdf` — preliminary datasheet, attention variant
- `DG32-2DOM_Block_Architecture.pdf` — attention engine, clock bridges, analytic cost
- `DG32-LITE_3D_Walkthrough_Script_2026-09-11.pdf` — claim control only (no tapeout-ready or LVS-clean claims)

The full slide-by-source map is `source-map.md` in the run folder.

The source documents are marked confidential and are **not** in this repository. The site
publishes investor-level content only: no register maps, memory map, boot magic values,
board-design guidance, internal names or open review items. Keep it that way when editing.

DG32 is pre-silicon. Numbers are design values verified in simulation and static timing unless
the page says otherwise; the site states this beside every figure group.

### Where the sources disagree, and what the site uses

| Item | Sources say | Site uses |
| --- | --- | --- |
| Instruction set | datasheets: rv32imc · block diagrams: RV32IM | RV32IM (newer, investor-facing) |
| Accelerator clock | 2DOM datasheet: 114 MHz · investor sheet: 100 MHz | 114 MHz (silicon; 100 MHz is the FPGA build) |
| CORDIC latency | architecture & datasheet: 53–58 cycles/op · block diagram: ~16–24 | 53–58 (stated as measured) |
| Core clock pin | datasheet pin table: 48 MHz nominal · everywhere else: 50 MHz | 50 MHz |
| Lockstep checker | architecture: private memory, cycle-by-cycle · 2026-09-10 diagram: 2 cycles behind, mirrors bus | 2 cycles behind (newer) |

## Deployment

`.github/workflows/pages.yml` type-checks, builds, verifies every entry asset and image, and
deploys to GitHub Pages on each push to `main`. Pull requests build without deploying.

Two workflow variables decide where the site is served:

| Target | `PAGES_BASE` | `PAGES_DOMAIN` |
| --- | --- | --- |
| github.io project site (current) | `/deepgrid-dr-silicon/` | empty |
| dr.deepgridsemi.com | `/` | `dr.deepgridsemi.com` |

To move to the custom domain: add `CNAME dr → shekerkamma.github.io` (DNS only, no proxy) at the
`deepgridsemi.com` DNS host, switch both variables, push, then set the custom domain and
Enforce HTTPS under Settings → Pages. Switching before the DNS record resolves makes the
github.io address redirect to a domain that does not exist.
