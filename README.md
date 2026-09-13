# dr.deepgridsemi.com — DG32 silicon site

Live site: https://dr.deepgridsemi.com/

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
| Page layout and copy around the data | `app/page.tsx` |
| Section styles and chart colours | `app/dr.css` (base tokens in `app/globals.css`, `app/ux.css`) |
| Interactive 3D package and die model | `app/silicon.tsx` |
| Images | `public/images/` |

## Sources

All figures come from five Deepgrid Semi documents (September 2026):

- `DG32-LITE_block_diagram_investor.pdf` — architecture, STM32G0 positioning, roadmap
- `DG32-LITE_block_diagram.pdf` — tape-in block diagram
- `DG32-LITE_Block_Architecture.pdf` — per-block rationale, loop budget, post-route fmax
- `DG32-LITE_Datasheet-3.pdf` — preliminary datasheet
- `DG32-2DOM_Datasheet-1.pdf` — preliminary datasheet, attention variant

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

`.github/workflows/pages.yml` type-checks, builds, verifies every entry asset and image, writes
`CNAME` and deploys to GitHub Pages on each push to `main`. Pull requests build without deploying.

The custom domain needs one DNS record at the `deepgridsemi.com` DNS host:
`CNAME dr → shekerkamma.github.io`.
