// DG32-2DOM architecture — client-ready deck (artifact-tool presentation JSX).
// Storyline: story-architect-pack.md. Content: ../dg32-2dom-architecture.md.
//
// DECK_RUN=<this dir> DECK_NAME=dg32-2dom-architecture \
// DECK_FOOTER='DEEPGRID SEMI  ·  DG32-2DOM ARCHITECTURE  ·  SEPTEMBER 2026  ·  PRE-SILICON' node build_deck.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  P, K, SERIF, tx, sh, rect, roundRect, ellipse, addSlide,
  PresentationFile, OUT, PREVIEW_DIR, RUN,
} from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, footer, table, chain, rail } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';
import {
  MUTED_DARK, CYAN_TXT, TEAL_DARK, srcLine, hdr, stack, kpiS, fact, proportionBar, tableCols, block, closeFooter,
} from '../dg32-deck-kit.mjs';

const pack = await readFile(`${RUN}/story-architect-pack.md`, 'utf8');
const narration = {};
for (const m of pack.split('## 9. Narration')[1].matchAll(/^(\d+)\. (.+)$/gm)) narration[Number(m[1])] = m[2].trim();
const notes = (n) => narration[n] || '';

// ── 01 · Cover ───────────────────────────────────────────────────────────────
{
  const px0 = 850, py0 = 118, S = 320, pkg = [rect(px0, py0, S, S, '#12243A', K.cyan, 2)];
  for (let i = 0; i < 16; i++) {
    const t = py0 + 24 + i * ((S - 48) / 15) - 5, l = px0 + 24 + i * ((S - 48) / 15) - 5;
    pkg.push(rect(px0 - 16, t, 14, 10, '#8DB4D4'), rect(px0 + S + 2, t, 14, 10, '#8DB4D4'), rect(l, py0 - 16, 10, 14, '#8DB4D4'), rect(l, py0 + S + 2, 10, 14, '#8DB4D4'));
  }
  pkg.push(ellipse(px0 + 20, py0 + 20, 14, 14, K.cyan));
  const dx = px0 + 52, dy = py0 + 70, dw = 216, dh = 180;
  pkg.push(rect(dx, dy, dw, dh, '#1E3A55', K.paleBlue, 1));
  pkg.push(rect(dx + 10, dy + 10, 88, dh - 20, '#244A6B', K.cyan, 1), rect(dx + 118, dy + 10, 88, dh - 20, '#1F4F52', K.teal, 1));
  for (let r = 0; r < 3; r++) pkg.push(rect(dx + 102, dy + 40 + r * 40, 12, 18, K.paleBlue));
  pkg.push(rect(dx + 22, dy + 24, 64, 36, '#2B5277'), rect(dx + 22, dy + 70, 64, 10, K.cyan));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) pkg.push(rect(dx + 130 + c * 34, dy + 24 + r * 30, 28, 22, '#2E6B6D'));
  const strip = [['114 MHz', 'Compute clock'], ['Bit-exact', 'To the software model'], ['~3,242', 'Cycles per row, analytic'], ['Same pinout', 'As DG32-LITE, QFN-64']];
  const sw = 1184 / 4;
  addSlide([
    tx('DEEPGRID SEMI  ·  DG32-2DOM  ·  SEPTEMBER 2026', 48, 70, 760, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx('Condition monitoring on the motor-control chip', 48, 112, 760, 170, { size: PX(40), face: SERIF, bold: true, color: K.white }),
    rect(48, 292, 120, 4, K.cyan),
    tx('The DG32-LITE lockstep motor-control SoC plus an INT8 attention engine on a second, 114 MHz clock · 130 nm CMOS · design complete, in physical trials', 48, 314, 700, 64, { size: T.sub, color: MUTED_DARK }),
    ...pkg,
    tx('TWO CLOCK DOMAINS  ·  ILLUSTRATIVE', px0 - 20, py0 + S + 30, S + 40, 20, { size: PX(9), bold: true, color: MUTED_DARK, align: 'center' }),
    ...strip.flatMap(([n, l], i) => [
      i ? rect(48 + i * sw, 520, 1, 92, '#23364C') : rect(0, 0, 1, 1, K.midnight),
      tx(n, 48 + i * sw + (i ? 24 : 0), 520, sw - 32, 52, { size: PX(28), face: SERIF, bold: true, color: K.cyan }),
      tx(l.toUpperCase(), 48 + i * sw + (i ? 24 : 0), 578, sw - 32, 22, { size: PX(10), bold: true, color: K.white }),
    ]),
    tx('Pre-silicon: post-route, simulated and analytic values, each labelled where it appears.', 48, 640, 1000, 20, { size: T.foot, color: MUTED_DARK, italic: true }),
    ...footer(1, true),
  ], { background: K.midnight, notes: notes(1) });
}

// ── 02 · Executive summary ───────────────────────────────────────────────────
addSlide([
  ...hdr('02 · Executive summary', 'DG32-2DOM adds an INT8 engine, not a new core', 'DG32-2DOM in one slide: what is added, what is untouched, and what the engine costs', 2),
  rect(48, 170, 560, 455, K.midnight),
  tx('THE ANSWER', 80, 196, 400, 22, { size: T.kicker, bold: true, color: K.cyan }),
  tx('DG32-2DOM is DG32-LITE plus an INT8 attention engine on its own clock, added behind bridges so the lockstep control core is untouched.', 80, 228, 496, 200, { size: PX(21), face: SERIF, bold: true, color: K.white }),
  tx('Both chips come from one design source. The variant is a build option plus a second clock, on its own 3.4 × 4.5 mm die.', 80, 440, 496, 110, { size: T.body, color: MUTED_DARK }),
  tx('Status: design complete, in physical trials', 80, 580, 496, 24, { size: PX(11), bold: true, color: K.cyan }),
  ...kpiS(640, 170, 284, 210, '114 MHz', 'Compute clock', 'The control domain stays at 50 MHz', { numPt: 28 }),
  ...kpiS(948, 170, 284, 210, '400 keys', 'Per attention head', 'Key dimension ≤ 32 bytes, value ≤ 64 bytes', { numPt: 28, color: K.teal }),
  ...kpiS(640, 400, 284, 225, '~3,242', 'Cycles per query row', 'Analytic, at 16 lanes and 400 keys', { numPt: 28, color: K.teal }),
  ...kpiS(948, 400, 284, 225, '0 pads', 'Added to the pinout', 'Same QFN-64 as DG32-LITE', { numPt: 28, color: K.teal }),
  srcLine('Sources: DG32-2DOM block architecture §1, §4.18; DG32-2DOM preliminary datasheet §1–2.'),
], { notes: notes(2) });

// ── 03 · Design premises ─────────────────────────────────────────────────────
addSlide([
  ...hdr('03 · Design premises', 'Three findings forced a second clock domain', 'Each finding came from hardening the design, and each one set the variant’s shape', 3),
  ...table(48, 172, 1184, [{ t: 'Finding', w: 330 }, { t: 'What it means', w: 400 }, { t: 'What the design does', w: 454 }], [
    ['Lockstep core fmax ~55–62 MHz', 'Raising the whole die clock would break the core’s timing', 'The control domain stays at 50 MHz'],
    ['The engine is the throughput consumer', 'It needs more speed than the control core can give', 'The engine runs on its own 114 MHz clock'],
    ['Engine memory congested the LITE floorplan', 'Adding its buffers made routing time out', 'DG32-2DOM gets its own 3.4 × 4.5 mm die'],
    ['INT4 output came out identically zero', 'A 1/400 softmax weight rounds to zero at 4 bits', '15-bit weights into a 40-bit numerator'],
  ], { rowH: 76, headH: 42, highlight: 1 }),
  ...stack(48, 534, 1184, [['Additions only', 'The frozen control core, boot path and bus decode are unchanged; the engine is added around them.', K.cyan]])[0],
  srcLine('Source: DG32-2DOM block architecture §2, design premises and locked decisions.'),
], { notes: notes(3) });

// ── 04 · Architecture ────────────────────────────────────────────────────────
addSlide([
  ...hdr('04 · Architecture', 'The engine sits beside the core, behind bridges', 'Two clock domains on one die; the engine reaches memory only through the clock bridges', 4),
  rect(48, 172, 330, 420, K.softCyan, K.cyan, 2), rect(48, 172, 330, 5, K.cyan),
  tx('50 MHz control domain', 64, 188, 300, 26, { size: PX(13), bold: true, color: K.slate }),
  ...['Lockstep CPU pair', 'Fault latch + supervision', 'Boot ROM + SRAM', 'DMA + interrupts', 'Motor drive + sensing', 'Connectivity + test']
    .flatMap((t, i) => block(66, 226 + i * 58, 294, 48, t, K.cyan)),
  rect(398, 172, 180, 420, K.surface, K.paleBlue, 2), rect(398, 172, 180, 5, K.paleBlue),
  tx('Clock bridges', 414, 188, 150, 26, { size: PX(13), bold: true, color: K.slate }),
  ...[['Lite', 'programming'], ['Burst read', 'keys, values in'], ['Burst write', 'output back']].flatMap(([t, s], i) => [
    roundRect(414, 240 + i * 112, 148, 84, K.white, K.slate, 1),
    tx(t, 424, 252 + i * 112, 128, 26, { size: PX(12), bold: true, color: K.slate, align: 'center' }),
    tx(s, 424, 280 + i * 112, 128, 32, { size: PX(10.5), color: K.gray, align: 'center' }),
  ]),
  rect(598, 172, 330, 420, K.softTeal, K.teal, 2), rect(598, 172, 330, 5, K.teal),
  tx('114 MHz compute domain', 614, 188, 300, 26, { size: PX(13), bold: true, color: K.slate }),
  roundRect(616, 226, 294, 150, K.white, K.teal, 2),
  tx('INT8 attention engine', 632, 242, 262, 28, { size: PX(14), bold: true, color: K.slate }),
  tx('Multiply · weight · combine · requantise · write back', 632, 278, 262, 80, { size: PX(11), color: K.gray }),
  ...block(616, 392, 294, 48, 'K buffer · SRAM macro', K.teal),
  ...block(616, 450, 294, 48, 'V buffer · SRAM macro', K.teal),
  ...block(616, 508, 294, 48, 'EXP table · 256 × 15-bit', K.teal),
  tx('One 3.4 × 4.5 mm die · same QFN-64 pinout · pre-silicon design', 48, 604, 880, 22, { size: PX(10), italic: true, color: K.gray }),
  ...fact(960, 176, 272, 1, 'One design source', 'A build option plus a second clock, not a fork.'),
  ...fact(960, 286, 272, 2, 'Bridges only', 'The engine reaches memory only through the bridges.'),
  ...fact(960, 396, 272, 3, 'Cannot stall', 'No engine transaction extends the core’s worst case.'),
  ...fact(960, 506, 272, 4, 'Done interrupt', 'Completion reaches both cores as an interrupt.'),
  srcLine('Sources: DG32-2DOM block architecture §3, §4.18–4.19, §7 communication matrix.'),
], { notes: notes(4) });

// ── 05 · Carry-over ──────────────────────────────────────────────────────────
addSlide([
  ...hdr('05 · Shared base', 'Everything proven on DG32-LITE carries over', 'The same blocks from the same design source; only the clocks change', 5),
  ...table(48, 172, 1184, [{ t: 'Block group', w: 300 }, { t: 'On DG32-LITE', w: 420 }, { t: 'On DG32-2DOM', w: 464 }], [
    ['Lockstep safety core', 'MAIN + CHECKER, fault latch, FAULT_N', 'Identical'],
    ['Boot and memory', '64 KB ROM, 32 KB SRAM, external QSPI flash', 'Identical; the SRAM idle read port can feed the engine'],
    ['Motor drive and sensing', 'PWM + brake, DShot × 4, encoder, ADC, CORDIC', 'Identical'],
    ['Control-loop budget', '~300 hardware cycles, ~100 kHz simulated', 'Identical'],
    ['Package and pinout', 'QFN-64, 44 signal pins', 'Identical; the engine adds no pads'],
    ['Clocks', 'One 50 MHz domain', '50 MHz control + 114 MHz compute'],
  ], { rowH: 58, headH: 42, highlight: 5 }),
  tx('The DG32-LITE deck and film cover the shared base in depth. This deck covers only what DG32-2DOM adds.', 48, 580, 1184, 30, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Sources: DG32-2DOM block architecture §1, §4.1–4.17, §5.1–5.2; DG32-2DOM preliminary datasheet §2.'),
], { notes: notes(5) });

// ── 06 · Engine pipeline (dark) ──────────────────────────────────────────────
addSlide([
  ...hdr('06 · Attention engine', 'One kick computes a band of query rows', 'Every stage runs on the 114 MHz clock; firmware only programs the shapes and waits for done', 6, true),
  ...chain(48, 180, 1184, [
    ['Program', 'Shapes over AXI-lite', K.cyan],
    ['Multiply', 'QKᵀ, 16 lanes', K.cyan],
    ['Weight', 'Row max → EXP table', K.cyan],
    ['Combine', 'Sum ÷ one reciprocal', K.cyan],
    ['Requantise', 'Saturate to INT8', K.cyan],
    ['Write back', 'Output to memory', K.teal],
  ], { nodeW: 170, nodeH: 116 }),
  ...stack(48, 330, 376, [['Bit-exact', 'Every output matches the golden software model, for any geometry the engine accepts.', K.cyan]])[0],
  ...stack(452, 330, 376, [['Reuse between kicks', 'A later kick can skip the load and reuse resident keys, values and the weight table.', K.teal]])[0],
  ...stack(856, 330, 376, [['One multiply array', 'The same array serves the key pass and the value pass, keeping the datapath small.', K.teal]])[0],
  tx('Up to 400 keys per head  ·  key dimension up to 32 bytes  ·  value dimension up to 64 bytes', 48, 560, 1184, 30, { size: T.body, color: MUTED_DARK }),
  srcLine('Sources: DG32-2DOM block architecture §4.18; DG32-2DOM preliminary datasheet §1, §8.', true),
], { background: K.midnight, notes: notes(6) });

// ── 07 · Why INT8 ────────────────────────────────────────────────────────────
addSlide([
  ...hdr('07 · Precision', 'INT4 rounded every weight to zero', 'With about 400 near-uniform keys, each softmax weight is close to 1/400', 7),
  ...kpiS(48, 172, 376, 184, '1/400', 'One softmax weight', 'About 0.0025 with ~400 near-uniform keys', { numPt: 32 }),
  ...kpiS(452, 172, 376, 184, '0', 'What INT4 kept', 'The weight rounded to zero; the output came out identically zero', { numPt: 32, color: K.red }),
  ...kpiS(856, 172, 376, 184, '~82 levels', 'What 15 bits keep', 'Derived: 32,767 ÷ 400', { numPt: 32, color: TEAL_DARK }),
  ...stack(48, 380, 578, [['Weights stay unquantised', 'Fifteen-bit weights run all the way into the numerator; only the final output is saturated to INT8.', K.teal]])[0],
  ...stack(654, 380, 578, [['A 40-bit numerator', 'A 32-bit numerator breaks at 512 keys. Forty bits stays exact to 131,072 keys, so bit-exactness holds.', K.cyan]])[0],
  srcLine('Source: DG32-2DOM block architecture, locked decisions and §4.18 rationale. Level count derived.'),
], { notes: notes(7) });

// ── 08 · Memory traffic ──────────────────────────────────────────────────────
{
  const trackW = 680, x0 = 48;
  addSlide([
    ...hdr('08 · Memory traffic', 'Loading keys and values once cuts traffic 400×', 'Bus traffic per attention head, drawn to scale: resident buffers against streaming values per row', 8),
    tx('KEYS AND VALUES RESIDENT, RE-READ PER ROW', x0, 196, trackW, 22, { size: T.kicker, bold: true, color: K.slate }),
    rect(x0, 226, trackW, 44, K.surface), rect(x0, 226, Math.max(10, trackW / 400), 44, TEAL_DARK),
    tx('~1% bus occupancy', x0 + 24, 234, 300, 28, { size: PX(14), face: SERIF, bold: true, color: K.slate }),
    tx('VALUES STREAMED FOR EVERY ROW', x0, 316, trackW, 22, { size: T.kicker, bold: true, color: K.slate }),
    rect(x0, 346, trackW, 44, K.red),
    tx('~400× the traffic', x0 + 16, 354, 400, 28, { size: PX(14), face: SERIF, bold: true, color: K.white }),
    tx('Relative scale: both bars share one axis, so the resident case is a sliver.', x0, 410, trackW, 22, { size: PX(10), italic: true, color: K.gray }),
    ...stack(780, 172, 452, [
      ['Load once, re-read per row', 'Keys and values sit in SRAM macros beside the engine and are re-read for every query row.', K.teal],
      ['A contention-free feed', 'A DMA and the SRAM’s idle second read port can move data to the engine without the CPU.', K.cyan],
      ['Why it matters', 'Streaming would make the engine fight the rest of the die for memory.', K.amber],
    ], 14)[0],
    srcLine('Source: DG32-2DOM block architecture §4.18 rationale, §4.3, §4.17.'),
  ], { notes: notes(8) });
}

// ── 09 · Clock bridges ───────────────────────────────────────────────────────
addSlide([
  ...hdr('09 · Clock bridges', 'Rare crossings let a handshake replace a FIFO', 'Every transaction between 50 MHz and 114 MHz crosses a four-phase level handshake', 9),
  ...chain(48, 178, 1184, [
    ['50 MHz side', 'CPU and DMA traffic', K.cyan],
    ['Request', 'Payload held stable', K.teal],
    ['2-flop sync', 'Metastability guard', K.teal],
    ['Acknowledge', '4-phase handshake', K.teal],
    ['114 MHz side', 'Attention engine', K.teal],
  ]),
  ...stack(48, 330, 376, [['Lite bridge', 'Carries programming, with one transaction outstanding at a time.', K.cyan]])[0],
  ...stack(452, 330, 376, [['Burst read bridge', 'Batches a whole read burst into a single crossing.', K.teal]])[0],
  ...stack(856, 330, 376, [['Burst write bridge', 'Batches a whole write burst into a single crossing.', K.teal]])[0],
  ...stack(48, 490, 1184, [['Why not a FIFO', 'Keys and values load once and outputs write back once, so a small, provably safe handshake needs no gray-coded pointers.', K.slate]])[0],
  srcLine('Source: DG32-2DOM block architecture §4.19.'),
], { notes: notes(9) });

// ── 10 · Engine cost ─────────────────────────────────────────────────────────
addSlide([
  ...hdr('10 · Engine cost', 'One query row costs about 3,242 cycles', 'Analytic, at 16 lanes, 400 keys, 32-byte keys and 64-byte values; the bench figure comes at bring-up', 10),
  ...table(48, 170, 640, [{ t: 'Term', w: 210 }, { t: 'How it scales', w: 270 }, { t: 'Cycles', w: 160, a: 'right' }], [
    ['Value pass', 'keys × value dim ÷ lanes', '1,600'],
    ['Key pass', 'keys × key dim ÷ lanes', '800'],
    ['Requantise', '11 × value dim', '704'],
    ['Write back + drain', 'remainder', '~90'],
    ['Divide', '48-step restoring', '48'],
  ], { rowH: 46, headH: 40 }),
  ...kpiS(720, 170, 512, 176, '~3,242 cycles', 'Per query row', 'Analytic; the steady-state bench measurement is a bring-up item', { numPt: 32 }),
  ...stack(720, 366, 512, [['The value pass dominates', 'Half of each row is the weighted sum over the values; the key pass is a quarter.', K.teal]])[0],
  tx('ONE QUERY ROW, DRAWN TO SCALE (~3,242 CYCLES)', 48, 512, 1184, 20, { size: T.kicker, bold: true, color: K.slate }),
  ...proportionBar(48, 540, 1184, 64, [['Values 49%', 1600, TEAL_DARK], ['Keys 25%', 800, CYAN_TXT], ['Requantise 22%', 704, '#35607F'], ['', 138, K.gray]]),
  srcLine('Source: DG32-2DOM block architecture §4.18, analytic cost. Term split and shares derived; write back + drain = 3,242 − 3,152.'),
], { notes: notes(10) });

// ── 11 · Timing and die ──────────────────────────────────────────────────────
addSlide([
  ...hdr('11 · Timing and die', 'Both clocks close timing on a larger die', 'Post-route results on the 130 nm process; silicon measurements follow bring-up', 11),
  ...kpiS(48, 176, 280, 196, '+0.30 ns', 'Slack at 50 MHz', 'Control domain, post-route', { numPt: 28 }),
  ...kpiS(349, 176, 280, 196, '+0.19 ns', 'Slack at 114 MHz', 'Compute domain, post-route', { numPt: 28, color: TEAL_DARK }),
  ...kpiS(650, 176, 280, 196, '3.4 × 4.5 mm', 'Die', 'Its own die, not the DG32-LITE slot', { numPt: 24, color: TEAL_DARK }),
  ...kpiS(952, 176, 280, 196, '55–62 MHz', 'Lockstep core fmax', 'Why control stays at 50 MHz', { numPt: 24, color: TEAL_DARK }),
  ...stack(48, 396, 578, [['What is closed', 'Post-route timing at both clocks, and an engine that is bit-exact against the software model.', K.teal]])[0],
  ...stack(654, 396, 578, [['What is still to measure', 'Steady-state cycles per query row on a bench, and every figure on fabricated silicon.', K.amber]])[0],
  srcLine('Sources: DG32-2DOM block architecture §5.3; DG32-2DOM preliminary datasheet §10.'),
], { notes: notes(11) });

// ── 12 · Use, position, roadmap ──────────────────────────────────────────────
addSlide([
  ...hdr('12 · Use and roadmap', 'The engine targets bearing faults in the drive', 'Condition monitoring on the chip that already turns the motor, and where it sits on the roadmap', 12),
  ...stack(48, 172, 578, [
    ['Bearing-fault detection', 'Runs in the drive itself, on the chip that already turns the motor.', K.teal],
    ['Anomaly detection', 'Flags abnormal drive behaviour without adding a second processor to the board.', K.cyan],
  ], 14)[0],
  ...tableCols(654, 172, 578, [{ t: 'Dimension', w: 170 }, { t: 'DG32-2DOM', w: 204 }, { t: 'STM32G0', w: 204 }], [
    ['On-chip AI', 'INT8 attention engine in hardware', 'None; NanoEdge AI runs in software'],
    ['Control core', 'Lockstep RISC-V pair, untouched', 'Single Cortex-M0+'],
  ], { rowH: 72, headH: 40, hotCol: 1 }),
  ...rail(48, 462, 1184, [
    ['Now', 'DG32-LITE first silicon', 'September 2026 shuttle', CYAN_TXT, true],
    ['Now', 'DG32-2DOM', 'Design complete, in physical trials', TEAL_DARK, true],
    ['At bring-up', 'Measure the engine', 'Cycles per query row on a bench', TEAL_DARK, false],
    ['Next spin', 'Close the gaps', '12-bit ADC and embedded flash', TEAL_DARK, false],
  ]),
  srcLine('Sources: DG32-LITE investor block diagram p1–p2; DG32-2DOM block architecture §4.18.'),
], { notes: notes(12) });

// ── 13 · Close ───────────────────────────────────────────────────────────────
{
  const [takeaways] = stack(560, 108, 672, [
    ['1 · An addition, not a redesign', 'The engine and bridges are added around the frozen lockstep core, boot path and bus decode.', K.cyan],
    ['2 · Exact arithmetic', 'INT8 output, bit-exact to the software model, with no weight rounded to zero.', K.teal],
    ['3 · Cost known before silicon', 'About 3,242 cycles per query row by analysis, with timing closed at 50 MHz and 114 MHz.', K.cyan],
  ], 16);
  addSlide([
    rect(0, 0, 512, 720, K.midnight),
    tx('13 · CLOSE', 48, 64, 400, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx('AI in the drive. Control left untouched.', 48, 104, 420, 200, { size: PX(34), face: SERIF, bold: true, color: K.white }),
    rect(48, 318, 120, 4, K.cyan),
    tx('Next milestone: bring-up measures the engine’s cycles per query row and turns these design values into measurements.', 48, 344, 420, 130, { size: T.body, color: MUTED_DARK }),
    tx('THREE THINGS TO REMEMBER', 560, 64, 672, 22, { size: T.kicker, bold: true, color: K.slate }),
    ...takeaways,
    ...closeFooter('DEEPGRID SEMI  ·  DG32-2DOM ARCHITECTURE', 13),
  ], { notes: notes(13) });
}

await (await PresentationFile.exportPptx(P)).save(OUT);
await mkdir(PREVIEW_DIR, { recursive: true });
for (let i = 0; i < P.slides.count; i += 1) {
  const blob = await P.export({ format: 'png', slide: P.slides.getItem(i), scale: Number(process.env.RENDER_SCALE || 1) });
  await writeFile(`${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(await blob.arrayBuffer()));
}
console.log(`wrote ${OUT} · ${P.slides.count} slides · renders in ${PREVIEW_DIR}`);
