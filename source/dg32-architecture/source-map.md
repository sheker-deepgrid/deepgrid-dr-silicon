# DG32 architecture package — source map

Every slide in both decks traces to the documents below. The same line appears, in short form,
as the source footer on each slide. Where two documents disagree, the newer or more specific one
governs; the rulings are listed at the end.

## The seven documents

| Code | Document | Date | What it contributes |
|---|---|---|---|
| A-LITE | `DG32-LITE_Block_Architecture.pdf` | 2026-09 | Design premises, block rationale, loop budget, per-block fmax — the spine of the LITE deck |
| A-2DOM | `DG32-2DOM_Block_Architecture.pdf` | 2026-09-12 | Two-domain premises, attention engine, clock bridges, analytic row cost, slack — the spine of the 2DOM deck |
| D-LITE | `DG32-LITE_Datasheet-3.pdf` | preliminary | Pinout and pin groups, supplies, boot sequence, power estimate, brake/ADC/CORDIC specifics |
| D-2DOM | `DG32-2DOM_Datasheet-1.pdf` | preliminary | 114 MHz clock, engine programming model limits (400 keys, dims), identical pinout, timing slack |
| B-INV | `DG32-LITE_block_diagram_investor.pdf` | 2026-09 | Target applications, STM32G0 positioning, roadmap, first-silicon status, 2DOM status |
| B-TAPE | `DG32-LITE_block_diagram.pdf` | 2026-09-10 | Newest safety-core behaviour (checker two cycles behind, mirrored bus responses), clock gates, scan/JTAG |
| S-3D | `DG32-LITE_3D_Walkthrough_Script_2026-09-11.pdf` | 2026-09-11 | Claim control only: DRC clean, LVS in progress — do not say "tapeout-ready" or "LVS clean" |

S-3D is an internal screen-recording script for a 3D layout viewer
(`docs/DG32-LITE_3D_View_2026-09-09.html`) that is not on this machine, so it could not drive a film.

## DG32-LITE deck (16 slides)

| # | Title | Sources |
|---|---|---|
| 1 | Lockstep safety on an entry-level motor chip | B-INV header; D-LITE §1, §10 |
| 2 | One chip carries the MCU and its safety monitor | A-LITE §5 (loop, fault latency); B-INV; D-LITE §4.3 (power) |
| 3 | A silent CPU fault can destroy a power bridge | A-LITE §4.1 rationale; B-INV p2 (STM32G0 column) |
| 4 | Six block groups share one deterministic bus | B-INV p1; B-TAPE; A-LITE §3 |
| 5 | Four hard constraints shaped every block | A-LITE §2 |
| 6 | Two cores must agree on every committed store | A-LITE §4.1, §4.4–4.5; B-TAPE (checker timing) |
| 7 | The chip boots itself, even with blank flash | D-LITE §6; A-LITE §4.2–4.3 |
| 8 | The expensive steps of the loop run in hardware | A-LITE §4.12–4.16; D-LITE §8 (brake, ADC, CORDIC) |
| 9 | One current loop costs about 300 hardware cycles | A-LITE §5.1 |
| 10 | At 20 kHz, 88% of each period is left for firmware | A-LITE §5.2 (100 kHz row derived) |
| 11 | Only the lockstep core limits the clock | A-LITE §5.3 |
| 12 | 44 signals and a hardware trip in 9 × 9 mm | D-LITE §2–3, §5, §10; D-2DOM §2 |
| 13 | DG32-2DOM adds AI without slowing control | A-2DOM §1, §4.18–4.19; D-2DOM |
| 14 | DG32 leads on safety and trails on analog | B-INV p2 |
| 15 | The next spin closes the two largest gaps | B-INV p2 roadmap |
| 16 | Safety in the core. Control in silicon. | synthesis of 2–15 |

## DG32-2DOM deck (13 slides)

| # | Title | Sources |
|---|---|---|
| 1 | Condition monitoring on the motor-control chip | A-2DOM scope; B-INV status |
| 2 | DG32-2DOM adds an INT8 engine, not a new core | A-2DOM §1, §4.18; D-2DOM §1–2 |
| 3 | Three findings forced a second clock domain | A-2DOM §2 and locked decisions |
| 4 | The engine sits beside the core, behind bridges | A-2DOM §3, §4.18–4.19, §7 |
| 5 | Everything proven on DG32-LITE carries over | A-2DOM §1, §4.1–4.17, §5.1–5.2; D-2DOM §2 |
| 6 | One kick computes a band of query rows | A-2DOM §4.18; D-2DOM §1, §8 |
| 7 | INT4 rounded every weight to zero | A-2DOM locked decisions, §4.18 (level count derived) |
| 8 | Loading keys and values once cuts traffic 400× | A-2DOM §4.18, §4.3, §4.17 |
| 9 | Rare crossings let a handshake replace a FIFO | A-2DOM §4.19 |
| 10 | One query row costs about 3,242 cycles | A-2DOM §4.18 (term split derived) |
| 11 | Both clocks close timing on a larger die | A-2DOM §5.3; D-2DOM §10 |
| 12 | The engine targets bearing faults in the drive | B-INV p1–p2; A-2DOM §4.18 |
| 13 | AI in the drive. Control left untouched. | synthesis of 2–12 |

## Rulings where documents disagree

| Item | Conflict | Ruling |
|---|---|---|
| Instruction set | D-LITE/D-2DOM: rv32imc · B-INV/B-TAPE: RV32IM | RV32IM (block diagrams are newer and investor-facing) |
| Checker memory and timing | A-LITE: private memory, compares cycle by cycle · B-TAPE (09-10): two cycles behind, mirrors bus responses | B-TAPE (newer) |
| Compute clock | D-2DOM/A-2DOM: 114 MHz · B-INV: 100 MHz domain | 114 MHz for silicon (100 MHz is the FPGA build) |
| CORDIC latency | A-LITE/D-LITE: 53–58 cycles · B-TAPE: ~16–24 | 53–58 (stated as measured) |
| Clock pin | D-LITE pin table: 48 MHz nominal · all else: 50 MHz | 50 MHz |
| SAR ADC trim | A-LITE: per-die trim is a bring-up step · D-LITE: trim taps unrouted, runs untrimmed | Not claimed either way in the decks |
| DMA feed for the engine | A-2DOM: idle SRAM read port is the natural feed; attachment still under review | "can feed", never "feeds" |
| Tapeout status | D-LITE: "taped-out RTL" · S-3D (09-11): DRC clean, LVS in progress | "first silicon on the September 2026 shuttle"; no tapeout-ready or LVS-clean claim |

## Excluded at investor level

Register maps and addresses, boot magic values and injection keys, internal module and people
names, shuttle and harness identifiers, open review items, negative top-assembly slack.
