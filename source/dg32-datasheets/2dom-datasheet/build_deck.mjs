// DG32-2DOM preliminary datasheet — client-ready deck (artifact-tool presentation JSX), investor level.
// DECK_RUN=<this dir> DECK_NAME=dg32-2dom-datasheet DECK_FOOTER='…' node build_deck.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { P, K, tx, addSlide, PresentationFile, OUT, PREVIEW_DIR, RUN } from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, table, chain } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';
import { MUTED_DARK, TEAL_DARK, srcLine, hdr, stack, kpiS, tableCols } from '/home/sheke/content-ideas/runs/2026-09-13-dg32-architecture-package/dg32-deck-kit.mjs';
import { loadNotes, coverSlide, closeSlide, kpiRow, band, cardGrid } from '../ds-common.mjs';

const notes = await loadNotes(RUN);

// 01 · Cover
coverSlide({
  kicker: 'DEEPGRID SEMI  ·  DG32-2DOM  ·  PRELIMINARY DATASHEET',
  title: 'DG32-2DOM: DG32-LITE plus one engine',
  subtitle: 'What the DG32-2DOM preliminary datasheet adds and what it leaves unchanged · design values, process nominals and analytic estimates, each labelled',
  strip: [['0', 'Pads added'], ['114 MHz', 'Engine clock'], ['400', 'Keys per head'], ['QFN-64', 'Same package']],
  motif: 'two', motifLabel: 'TWO CLOCK DOMAINS  ·  ILLUSTRATIVE',
  note: 'Preliminary, pre-silicon. Register offsets, the memory map and board-design rules are in the engineering datasheet, not this deck.',
  notes: notes(1),
});

// 02 · Short version
addSlide([
  ...hdr('02 · Executive summary', 'Same pins, same rails, one added clock', 'DG32-2DOM against DG32-LITE, in the four numbers a design checks first', 2),
  ...kpiRow(48, 172, 1184, 160, [
    ['64 / 44', 'Pins / signals', 'Identical to DG32-LITE', { numPt: 26 }],
    ['1.8 / 3.3 V', 'Core / I/O', 'Identical rails and limits', { numPt: 26, color: TEAL_DARK }],
    ['50 + 114', 'MHz clocks', 'CPU domain + engine domain', { numPt: 26, color: TEAL_DARK }],
    ['~3,242', 'Cycles per row', 'Analytic, at 16 lanes', { numPt: 26, color: TEAL_DARK }],
  ]),
  ...cardGrid(48, 502, 1184, 3, [
    ['Board', 'Identical footprint, pin map, rails and boot flash.', K.cyan],
    ['Firmware', 'One memory-mapped engine, programmed in four steps.', K.teal],
    ['Limits', '400 keys, 64-byte values, ~3,242 cycles per row.', K.teal],
  ])[0],
  ...band(48, 352, 1184, 130, 'For a board, DG32-2DOM is a drop-in DG32-LITE. For firmware, it adds one memory-mapped engine that runs on its own clock and never stalls the control core.'),
  srcLine('Source: DG32-2DOM preliminary datasheet §1, §2, §4, §6.1.'),
], { notes: notes(2) });

// 03 · New features
addSlide([
  ...hdr('03 · What is new', 'Five datasheet features are new in DG32-2DOM', 'Everything else in the feature list is DG32-LITE’s, unchanged', 3),
  ...table(48, 172, 1184, [{ t: 'New feature', w: 300 }, { t: 'What the datasheet states', w: 884 }], [
    ['Attention accelerator', 'One kick computes a band of query rows of one head, end to end, bit-exact to the golden model'],
    ['Shared datapath', 'One multiply array across lanes, a 256-entry 15-bit weight table and a 40-bit numerator exact to 131,072 keys'],
    ['Row cost', '~3,242 cycles per query row, analytic, at 16 lanes'],
    ['Second clock domain', 'The engine runs at 114 MHz and crosses to the 50 MHz CPU through two-flop bridges'],
    ['Its own die', '3.4 × 4.5 mm, with key and value buffers on SRAM macros beside the analog corner'],
  ], { rowH: 58, headH: 42, highlight: 0 }),
  tx('The engine is internal: it reaches memory over the on-chip bus and takes commands from the CPU through its register port.', 48, 548, 1184, 40, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Source: DG32-2DOM preliminary datasheet §1 features.'),
], { notes: notes(3) });

// 04 · Unchanged
addSlide([
  ...hdr('04 · What is unchanged', 'Pins, rails and limits are unchanged', 'Section by section against the DG32-LITE preliminary datasheet', 4),
  ...tableCols(48, 170, 1184, [{ t: 'Datasheet section', w: 300 }, { t: 'DG32-LITE', w: 430 }, { t: 'DG32-2DOM', w: 454 }], [
    ['Package', 'QFN-64, 9 × 9 mm, 0.5 mm pitch', 'Identical'],
    ['Signal pins', '44 in eleven groups', 'Identical; the engine adds no pads'],
    ['Core / I/O rails', '1.8 V (1.71–1.89) / 3.3 V (3.0–3.6)', 'Identical'],
    ['Absolute maximums', 'vccd1 1.95 V, vddio 3.63 V', 'Identical'],
    ['Power estimate', '~0.43 W at 50 MHz, tool estimate', 'Same figure repeated; no separate engine figure stated'],
    ['Boot flow', 'Self-boot from QSPI flash, UART monitor fallback', 'Identical'],
    ['Clocks', 'One 50 MHz domain', '50 MHz CPU + 114 MHz engine'],
  ], { rowH: 56, headH: 40, hotCol: 2 }),
  srcLine('Sources: DG32-2DOM preliminary datasheet §2–§6, §10; DG32-LITE preliminary datasheet.'),
], { notes: notes(4) });

// 05 · Second clock
addSlide([
  ...hdr('05 · Clocks', 'The engine runs on its own 114 MHz clock', 'Two domains on one die; the crossing is the only path between them', 5),
  ...chain(48, 180, 1184, [
    ['50 MHz domain', 'CPU, bus and every peripheral', K.cyan],
    ['Clock bridges', 'Two-flop synchronised crossings', K.teal],
    ['114 MHz domain', 'INT8 attention engine', K.teal],
  ]),
  ...stack(48, 330, 578, [['Why a second clock', 'The CPU and peripherals stay at 50 MHz, so the control core’s timing is untouched.', K.cyan]])[0],
  ...stack(654, 330, 578, [['Why it never stalls control', 'The engine reaches memory through the bridges, so it never stalls the control core.', K.teal]])[0],
  ...kpiRow(48, 494, 1184, 146, [
    ['+0.30 ns', 'Slack at 50 MHz', 'Post-route', { numPt: 26 }],
    ['+0.19 ns', 'Slack at 114 MHz', 'Post-route', { numPt: 26, color: TEAL_DARK }],
    ['3.4 × 4.5 mm', 'Die', 'Engine buffers beside the analog corner', { numPt: 24, color: TEAL_DARK }],
  ], 28),
  srcLine('Source: DG32-2DOM preliminary datasheet §1, §6.1, §10.'),
], { notes: notes(5) });

// 06 · Programming a kick (dark)
addSlide([
  ...hdr('06 · Programming the engine', 'Firmware programs a kick in four steps', 'Concept level: the datasheet’s register map is not reproduced here', 6, true),
  ...chain(48, 180, 1184, [
    ['Place buffers', 'Query, key, value and output locations', K.cyan],
    ['Set geometry', 'Rows, keys, key and value sizes', K.cyan],
    ['Start', 'Optionally reuse loaded buffers', K.cyan],
    ['Wait for done', 'Poll, or take the engine interrupt', K.teal],
  ]),
  ...stack(48, 330, 376, [['Reuse between kicks', 'A skip-load option reuses the weight table, keys and values from the previous kick.', K.cyan]])[0],
  ...stack(452, 330, 376, [['What it reports', 'Busy and done, plus a rejected geometry or an arithmetic overflow.', K.teal]])[0],
  ...stack(856, 330, 376, [['Memory-mapped', 'The engine sits on the CPU’s bus as one block and adds no pins.', K.teal]])[0],
  tx('The engine runs on the 114 MHz clock and reaches memory through the bridges, so the 50 MHz CPU keeps running.', 48, 560, 1184, 40, { size: T.body, color: MUTED_DARK }),
  srcLine('Source: DG32-2DOM preliminary datasheet §8 engine notes and interrupt sources (concept only).', true),
], { background: K.midnight, notes: notes(6) });

// 07 · Limits
addSlide([
  ...hdr('07 · Engine limits', 'Every engine limit is fixed in silicon', 'The geometry and arithmetic bounds firmware sizes a model against', 7),
  ...table(48, 172, 1184, [{ t: 'Parameter', w: 340 }, { t: 'Range', w: 300 }, { t: 'Note', w: 544 }], [
    ['Query rows per kick', '1 – 65,535', 'A band of rows of one head'],
    ['Keys per head', '1 – 400', 'Maximum set when the die was built'],
    ['Key dimension', 'Up to 32 bytes', 'A multiple of the lane count and of 4'],
    ['Value dimension', 'Up to 64 bytes', 'A multiple of the lane count and of 4'],
    ['Multiply lanes', '16', 'Width of the shared multiply array'],
    ['Weight table', '256 entries, 15-bit', 'Softmax weights are never quantised'],
    ['Numerator', '40-bit', 'Exact to 131,072 keys'],
    ['Cost per query row', '~3,242 cycles', 'Analytic, at 16 lanes, 400 keys, 32- and 64-byte vectors'],
  ], { rowH: 48, headH: 42, highlight: 1 }),
  srcLine('Source: DG32-2DOM preliminary datasheet §1 and §8 engine parameters.'),
], { notes: notes(7) });

// 08 · Board
addSlide([
  ...hdr('08 · On the board', 'A DG32-LITE board takes DG32-2DOM unchanged', 'The engine is internal, so the board sees the DG32-LITE footprint', 8),
  ...kpiS(48, 172, 376, 330, '0', 'Board signals added', 'The attention engine is internal to the die', { numPt: 60 }),
  ...stack(452, 172, 780, [
    ['Same footprint', 'QFN-64, 9 × 9 mm, with an identical pin map.', K.cyan],
    ['Same supplies', 'A 1.8 V core and a 3.3 V I/O ring, with the same sequencing.', K.teal],
    ['Same boot', 'External QSPI flash and the console UART, as on DG32-LITE.', K.teal],
  ], 14)[0],
  tx('Status: design complete, in physical trials.', 48, 540, 1184, 30, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Sources: DG32-2DOM preliminary datasheet §2, §5, §6, §9; DG32-LITE investor block diagram (status).'),
], { notes: notes(8) });

// 09 · Close
closeSlide({
  kicker: '09 · CLOSE', title: 'One footprint. Two chips.',
  body: 'Register offsets, the memory map and board-level rules live in the engineering datasheet, not in this overview.',
  takeaways: [
    ['1 · The board is a DG32-LITE board', 'Same package, pins, rails and boot flash; the engine adds no board signals.', K.cyan],
    ['2 · One engine on its own clock', 'A memory-mapped INT8 attention block at 114 MHz that cannot stall control.', K.teal],
    ['3 · Limits already fixed', '400 keys, 64-byte values and about 3,242 cycles per query row, by analysis.', K.cyan],
  ],
  label: 'DEEPGRID SEMI  ·  DG32-2DOM PRELIMINARY DATASHEET', page: 9, notes: notes(9),
});

await (await PresentationFile.exportPptx(P)).save(OUT);
await mkdir(PREVIEW_DIR, { recursive: true });
for (let i = 0; i < P.slides.count; i += 1) {
  const blob = await P.export({ format: 'png', slide: P.slides.getItem(i), scale: 1 });
  await writeFile(`${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(await blob.arrayBuffer()));
}
console.log(`wrote ${OUT} · ${P.slides.count} slides`);
