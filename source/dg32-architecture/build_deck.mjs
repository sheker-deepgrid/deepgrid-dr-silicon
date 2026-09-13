// DG32-LITE architecture — client-ready deck (artifact-tool presentation JSX).
// Storyline: story-architect-pack.md. Content: dg32-lite-architecture.md.
// Kit: vault-presales-pptx-pipeline deck-kit.mjs + kit-spec.mjs type correction (pt -> px).
//
// DECK_RUN=<this dir> DECK_NAME=dg32-lite-architecture \
// DECK_FOOTER='DEEPGRID SEMI  ·  DG32-LITE ARCHITECTURE  ·  SEPTEMBER 2026  ·  PRE-SILICON' node build_deck.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  P, K, SERIF, tx, sh, rect, roundRect, ellipse, textH, addSlide,
  PresentationFile, OUT, PREVIEW_DIR, RUN,
} from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import {
  PX, T, footer, table, chain, rail,
} from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';

// Speaker notes = the film narration, verbatim, so deck and films say the same thing.
const pack = await readFile(`${RUN}/story-architect-pack.md`, 'utf8');
const narration = {};
for (const m of pack.split('## 9. Narration')[1].matchAll(/^(\d+)\. (.+)$/gm)) narration[Number(m[1])] = m[2].trim();
const notes = (n) => narration[n] || '';

const MUTED_DARK = '#A9BACD';
// Accessible text tones: cyan and teal fail 4.5:1 as small text on white, so text and filled labels use darker steps.
const CYAN_TXT = '#0077A3', TEAL_DARK = '#07686A';
const srcLine = (t, dark = false) => tx(t, 48, 656, 1100, 18, { size: T.foot, color: dark ? MUTED_DARK : K.gray, italic: true });
function hdr(kicker, title, subtitle, page, dark = false) {
  return [
    tx(kicker.toUpperCase(), 48, 24, 800, 22, { size: T.kicker, bold: true, color: dark ? K.cyan : CYAN_TXT }),
    tx(title, 48, 48, 1160, 56, { size: T.title, face: SERIF, bold: true, color: dark ? K.white : K.slate }),
    tx(subtitle, 48, 108, 1140, 30, { size: T.sub, color: dark ? MUTED_DARK : K.gray }),
    rect(48, 146, 1184, 2, dark ? K.cyan : K.slate),
    ...footer(page, dark),
  ];
}
// card body measured at 85% of the box width: the estimator under-counts wraps near a line boundary
const bodyH = (w, body) => textH(body, Math.floor((w - 48) * 0.85), T.body, 1.5);
function card2(x, y, w, title, body, accent = K.cyan, fill = K.white) {
  const H = 20 + 26 + 12 + bodyH(w, body) + 22;
  return [
    roundRect(x, y, w, H, fill, K.line, 1),
    rect(x, y, 6, H, accent),
    tx(title, x + 24, y + 20, w - 44, 28, { size: T.cardH, bold: true, color: K.slate }),
    tx(body, x + 24, y + 58, w - 48, bodyH(w, body) + 8, { size: T.body, color: K.gray }),
  ];
}
const PRE = 'Pre-silicon: figures are design values verified in simulation and static timing unless marked measured.';

// ── local components (built from kit primitives, sized in pt via PX) ─────────
const cardHeight = (w, body) => 20 + 26 + 12 + bodyH(w, body) + 22;

// stack auto-height cards vertically; returns [elements, nextY]
function stack(x, y, w, items, gap = 14) {
  const e = []; let cy = y;
  for (const [title, body, accent, fill] of items) {
    e.push(...card2(x, cy, w, title, body, accent, fill));
    cy += cardHeight(w, body) + gap;
  }
  return [e, cy];
}

function kpiS(x, y, w, h, num, label, note, { color = K.cyan, numPt = 30, dark = false } = {}) {
  const n = PX(numPt);
  if (!dark && color === K.cyan) color = CYAN_TXT;
  return [
    roundRect(x, y, w, h, dark ? '#12243A' : K.surface, dark ? '#23364C' : K.line, 1),
    tx(num, x + 12, y + 16, w - 24, n + 14, { size: n, face: SERIF, bold: true, color, align: 'center' }),
    tx(label.toUpperCase(), x + 12, y + 20 + n + 12, w - 24, 22, { size: PX(10), bold: true, color: dark ? K.white : K.slate, align: 'center' }),
    tx(note, x + 14, y + 20 + n + 38, w - 28, Math.max(24, h - (n + 64)), { size: PX(9.5), color: dark ? MUTED_DARK : K.gray, align: 'center' }),
  ];
}

// numbered fact: circle + title + body
function fact(x, y, w, n, title, body, color = TEAL_DARK) {
  return [
    ellipse(x, y, 34, 34, color),
    tx(String(n), x, y + 6, 34, 22, { size: PX(12), bold: true, color: K.white, align: 'center' }),
    tx(title, x + 48, y + 2, w - 48, 26, { size: PX(13), bold: true, color: K.slate }),
    tx(body, x + 48, y + 32, w - 48, 52, { size: PX(11.5), color: K.gray }),
  ];
}

// zone box with title and short lines (architecture block group)
function zone(x, y, w, h, title, lines, stroke, fill) {
  return [
    rect(x, y, w, h, fill, stroke, 2),
    rect(x, y, w, 5, stroke),
    tx(title, x + 16, y + 16, w - 32, 26, { size: PX(13), bold: true, color: K.slate }),
    tx(lines.join('\n'), x + 16, y + 50, w - 32, h - 60, { size: PX(11), color: K.slate }),
  ];
}

// to-scale proportion bar with readable labels
function proportionBar(x, y, w, h, segs) {
  const total = segs.reduce((a, s) => a + s[1], 0);
  let cx = x; const e = [];
  for (const [label, val, color] of segs) {
    const sw = (val / total) * w;
    e.push(rect(cx, y, sw, h, color));
    e.push(tx(label, cx + 12, y + h / 2 - 12, Math.max(10, sw - 20), 24, { size: PX(12), bold: true, color: K.white }));
    cx += sw;
  }
  return e;
}

function tableCols(x, y, w, cols, rows, { rowH = 52, headH = 40, hotCol = -1 } = {}) {
  const e = [rect(x, y, w, headH, K.midnight)];
  let hx = x;
  cols.forEach((c, ci) => {
    if (ci === hotCol) e.push(rect(hx, y, c.w, headH, K.cyan));
    e.push(tx(c.t.toUpperCase(), hx + 14, y + 11, c.w - 20, 22, { size: PX(9.5), bold: true, color: ci === hotCol ? K.midnight : K.white }));
    hx += c.w;
  });
  rows.forEach((r, ri) => {
    const ry = y + headH + ri * rowH;
    e.push(rect(x, ry, w, rowH, ri % 2 ? K.surface : K.white, K.line, 1));
    let rx = x;
    r.forEach((cell, ci) => {
      const col = cols[ci];
      if (ci === hotCol) e.push(rect(rx, ry, col.w, rowH, K.softCyan, K.line, 1));
      e.push(tx(String(cell), rx + 14, ry + 8, col.w - 22, rowH - 12,
        { size: PX(11), bold: ci === 0 || ci === hotCol, color: ci === 0 || ci === hotCol ? K.slate : K.gray, anchor: 'middle' }));
      rx += col.w;
    });
  });
  return e;
}

// ── 01 · Cover ───────────────────────────────────────────────────────────────
{
  const pkg = [];
  const px0 = 850, py0 = 118, S = 320;
  pkg.push(rect(px0, py0, S, S, '#12243A', K.cyan, 2));
  for (let i = 0; i < 16; i++) {
    const t = py0 + 24 + i * ((S - 48) / 15) - 5;
    const l = px0 + 24 + i * ((S - 48) / 15) - 5;
    pkg.push(rect(px0 - 16, t, 14, 10, '#8DB4D4'), rect(px0 + S + 2, t, 14, 10, '#8DB4D4'));
    pkg.push(rect(l, py0 - 16, 10, 14, '#8DB4D4'), rect(l, py0 + S + 2, 10, 14, '#8DB4D4'));
  }
  pkg.push(ellipse(px0 + 20, py0 + 20, 14, 14, K.cyan));
  const dw = 132, dh = 205, dx = px0 + (S - dw) / 2, dy = py0 + (S - dh) / 2;
  pkg.push(rect(dx, dy, dw, dh, '#1E3A55', K.paleBlue, 1));
  pkg.push(rect(dx + 12, dy + 14, 50, 62, '#2B5277'), rect(dx + 70, dy + 14, 50, 62, '#2B5277'));
  pkg.push(rect(dx + 12, dy + 84, 108, 10, K.cyan));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) pkg.push(rect(dx + 12 + c * 28, dy + 104 + r * 22, 22, 16, '#35607F'));
  pkg.push(rect(dx + 12, dy + 174, 50, 20, K.teal), rect(dx + 70, dy + 174, 50, 20, '#2B5277'));

  const strip = [['2 × RV32IM', 'Cores in hardware lockstep'], ['~100 kHz', 'Current loop, simulated'], ['44', 'Signal pins in QFN-64'], ['39 cycles', 'Fault to latch, simulated']];
  const sw = 1184 / 4;
  const stripEls = strip.flatMap(([n, l], i) => [
    i ? rect(48 + i * sw, 520, 1, 92, '#23364C') : rect(0, 0, 1, 1, K.midnight),
    tx(n, 48 + i * sw + (i ? 24 : 0), 520, sw - 32, 52, { size: PX(30), face: SERIF, bold: true, color: K.cyan }),
    tx(l.toUpperCase(), 48 + i * sw + (i ? 24 : 0), 578, sw - 32, 22, { size: PX(10), bold: true, color: K.white }),
  ]);
  addSlide([
    tx('DEEPGRID SEMI  ·  DG32-LITE  ·  SEPTEMBER 2026', 48, 70, 760, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx('Lockstep safety on an entry-level motor chip', 48, 112, 760, 170, { size: PX(40), face: SERIF, bold: true, color: K.white }),
    rect(48, 292, 120, 4, K.cyan),
    tx('Dual-core lockstep RISC-V motor-control SoC · 130 nm CMOS · first silicon on the September 2026 multi-project shuttle', 48, 314, 700, 64, { size: T.sub, color: MUTED_DARK }),
    ...pkg,
    tx('QFN-64  ·  9 × 9 MM  ·  ILLUSTRATIVE', px0 - 20, py0 + S + 30, S + 40, 20, { size: PX(9), bold: true, color: MUTED_DARK, align: 'center' }),
    ...stripEls,
    tx(PRE, 48, 640, 1000, 20, { size: T.foot, color: MUTED_DARK, italic: true }),
    ...footer(1, true),
  ], { background: K.midnight, notes: notes(1) });
}

// ── 02 · Executive summary ───────────────────────────────────────────────────
addSlide([
  ...hdr('02 · Executive summary', 'One chip carries the MCU and its safety monitor', 'DG32-LITE in one slide: what it is, how it protects the drive, and what the control loop costs', 2),
  rect(48, 170, 560, 455, K.midnight),
  tx('THE ANSWER', 80, 196, 400, 22, { size: T.kicker, bold: true, color: K.cyan }),
  tx('One 130 nm chip carries the microcontroller, the motor-control peripherals and a hardware safety monitor.', 80, 228, 496, 180, { size: PX(22), face: SERIF, bold: true, color: K.white }),
  tx('Two RISC-V cores run in lockstep and must agree on every committed store. The expensive steps of field-oriented control run in dedicated blocks, so the cost of one loop is fixed and known.', 80, 420, 496, 130, { size: T.body, color: MUTED_DARK }),
  tx('First silicon: September 2026 multi-project shuttle', 80, 590, 496, 24, { size: PX(11), bold: true, color: K.cyan }),
  ...kpiS(640, 170, 284, 225, '2 × RV32IM', 'Lockstep cores', 'CHECKER runs the same instructions two cycles behind MAIN', { numPt: 28 }),
  ...kpiS(948, 170, 284, 225, '~100 kHz', 'Current loop', 'Simulated: ~5 µs acquisition plus ~5 µs compute', { numPt: 28, color: K.teal }),
  ...kpiS(640, 415, 284, 210, '39 cycles', 'Fault to latch', 'Simulated inject-to-latch latency, then FAULT_N drives low', { numPt: 28, color: K.teal }),
  ...kpiS(948, 415, 284, 210, '~0.43 W', 'Power at 50 MHz', 'Tool estimate at 25 °C and 1.8 V, not measured', { numPt: 28, color: K.teal }),
  srcLine('Sources: DG32-LITE block architecture (loop, fault latency); investor block diagram; LITE preliminary datasheet (power).'),
], { notes: notes(2) });

// ── 03 · The problem ─────────────────────────────────────────────────────────
addSlide([
  ...hdr('03 · Why lockstep', 'A silent CPU fault can destroy a power bridge', 'A motor drive turns every computed value into a gate command within one PWM period', 3),
  ...chain(48, 178, 1184, [
    ['CPU fault', 'A datapath error changes a computed value', K.gray],
    ['Wrong PWM edge', 'The bad value becomes a gate command', K.amber],
    ['Shoot-through', 'Both switches of one bridge leg conduct', K.red],
    ['Bridge damage', 'The power stage fails, not only the code', K.red],
  ]),
  ...stack(48, 330, 376, [['Today’s safeguards', 'Independent and window watchdogs, brown-out reset and periodic software self-test. The checks run between faults, not during them.', K.gray]])[0],
  ...stack(452, 330, 376, [['Where lockstep lives', 'Automotive microcontrollers such as Infineon AURIX, NXP S32K and TI Hercules compare two cores in hardware.', K.teal]])[0],
  ...stack(856, 330, 376, [['What DG32-LITE changes', 'Two RISC-V cores compare every committed store at a fixed latency, on an entry-level motor-control chip.', K.cyan]])[0],
  srcLine('Sources: DG32-LITE block architecture §4.1; investor block diagram p2 (STM32G0 column from public datasheet values).'),
], { notes: notes(3) });

// ── 04 · Architecture overview ───────────────────────────────────────────────
{
  const arrows = [173, 439, 710].flatMap((cx) => [
    sh('upDownArrow', cx - 9, 324, 18, 28, K.slate, K.slate, 1),
    sh('upDownArrow', cx - 9, 408, 18, 28, K.slate, K.slate, 1),
  ]);
  addSlide([
    ...hdr('04 · Architecture', 'Six block groups share one deterministic bus', 'DG32-LITE on one 50 MHz clock domain: safety, memory and supervision above the bus; the drive below', 4),
    ...zone(48, 172, 250, 150, 'Safety core', ['MAIN + CHECKER cores', 'Lockstep comparator', 'Fault latch → FAULT_N'], K.cyan, K.softCyan),
    ...zone(314, 172, 250, 150, 'Memory & boot', ['Boot ROM, 64 KB', 'SRAM, 32 KB dual-port', 'QSPI controller · DMA'], K.paleBlue, K.surface),
    ...zone(580, 172, 260, 150, 'Supervision', ['Windowed watchdog', 'Supply supervisor', 'Interrupts, 16 sources'], K.paleBlue, K.surface),
    rect(48, 352, 792, 54, K.midnight),
    tx('On-chip bus · two masters · deterministic · bus error, never a hang', 64, 359, 760, 40, { size: PX(12), bold: true, color: K.white, align: 'center', anchor: 'middle' }),
    ...arrows,
    ...zone(48, 436, 250, 150, 'Motor drive', ['3-phase PWM + brake', 'DShot × 4', 'Timers × 2'], K.teal, K.softTeal),
    ...zone(314, 436, 250, 150, 'Sensing & math', ['SAR ADC, 8-bit', 'Encoder + Hall', 'CORDIC'], K.teal, K.softTeal),
    ...zone(580, 436, 260, 150, 'Connectivity & test', ['UART × 2 · SPI · I²C', 'GPIO, atomic set/clear', 'JTAG + scan chains'], K.paleBlue, K.surface),
    tx('DG32-LITE block groups · 130 nm CMOS · pre-silicon design', 48, 600, 792, 22, { size: PX(10), italic: true, color: K.gray }),
    ...fact(880, 176, 352, 1, 'Two masters', 'The CPU and a DMA share the bus; the CPU always has priority.'),
    ...fact(880, 280, 352, 2, 'Deterministic latency', 'One outstanding request at a time keeps timing predictable.'),
    ...fact(880, 384, 352, 3, 'Faults contained', 'Unmapped or disabled addresses return a bus error instead of hanging.'),
    ...fact(880, 488, 352, 4, 'Register slaves', 'Every peripheral is a 32-bit register block on the same bus.'),
    srcLine('Sources: DG32-LITE investor block diagram p1; tape-in block diagram; block architecture §3.'),
  ], { notes: notes(4) });
}

// ── 05 · Design premises ─────────────────────────────────────────────────────
addSlide([
  ...hdr('05 · Design premises', 'Four hard constraints shaped every block', 'Each constraint is a finding from bringing up the hardened design, and each one sets a block’s shape', 5),
  ...table(48, 172, 1184, [
    { t: 'Constraint', w: 300 }, { t: 'What it means', w: 390 }, { t: 'What the design does', w: 494 },
  ], [
    ['No debugger halt on the die', 'Nothing outside the chip can stop or inspect a hung CPU', 'Bad accesses return a bus error; blank flash starts a UART monitor'],
    ['Lockstep core fmax ~55–62 MHz', 'The core is the slowest block; peripherals exceed 90 MHz', 'The whole die runs one 50 MHz clock domain'],
    ['CPU costs ~8 cycles per instruction', 'Control math in plain C is slow and variable', 'Sampling, transforms and PWM edges move into hardware'],
    ['Memory macros have no spare bits', 'The 32-bit SRAM macros leave no room for parity or ECC', 'The chip ships without ECC and states it plainly'],
  ], { rowH: 76, headH: 42, highlight: 2 }),
  ...stack(48, 534, 1184, [['Why the third constraint matters most', 'Every step that would dominate a control loop on this core became a dedicated block.', K.cyan]])[0],
  srcLine('Source: DG32-LITE block architecture §2, design premises. fmax is post-route on the hardened design.'),
], { notes: notes(5) });

// ── 06 · Safety core (dark) ──────────────────────────────────────────────────
addSlide([
  ...hdr('06 · Safety core', 'Two cores must agree on every committed store', 'The fault path runs from a datapath error to a hardware trip without firmware in the loop', 6, true),
  ...chain(48, 180, 1184, [
    ['MAIN core', 'Runs the application', K.cyan],
    ['CHECKER core', 'Same inputs, two cycles behind', K.cyan],
    ['Comparator', 'Checks every committed store', K.cyan],
    ['Fault latch', 'Holds the first cause', K.red],
    ['FAULT_N pin', 'Trips the gate driver', K.red],
  ]),
  ...stack(48, 330, 376, [['Fault injection', 'A locked register fires the fault path on purpose, the only way to prove it works on real silicon. Inject to latch: 39 cycles, simulated.', K.cyan]])[0],
  ...stack(452, 330, 376, [['Windowed watchdog', 'A kick that arrives too early or too late both fault, so it catches runaway code as well as a hang. Firmware arms it after boot.', K.teal]])[0],
  ...stack(856, 330, 376, [['Supply supervision', 'Two supply-good inputs are deglitched and drive reset sequencing. Status and fault counts stay readable by firmware.', K.teal]])[0],
  tx('Interrupts and bus responses reach both cores identically, so firmware can branch on peripheral reads without the cores diverging.', 48, 560, 1184, 50, { size: T.body, color: MUTED_DARK }),
  srcLine('Sources: DG32-LITE block architecture §4.1, §4.4–4.5; tape-in block diagram (checker timing, mirrored bus responses).', true),
], { background: K.midnight, notes: notes(6) });

// ── 07 · Boot path ───────────────────────────────────────────────────────────
addSlide([
  ...hdr('07 · Boot path', 'The chip boots itself, even with blank flash', 'No management core and no debugger: the mask ROM is the whole boot path', 7),
  ...chain(48, 178, 1184, [
    ['Power on', 'ROM prints the boot banner on UART0', K.teal],
    ['Validate', 'Reads and checks the flash image header', K.teal],
    ['Load', 'Copies the application into SRAM', K.teal],
    ['Run', 'Jumps to SRAM; firmware enables interrupts', K.cyan],
  ]),
  ...stack(48, 326, 578, [['Blank flash still talks', 'With no valid image header, the ROM starts a UART monitor, so a bare board can be read, written and started without a debugger.', K.amber]])[0],
  ...stack(654, 326, 578, [['The trade-off', 'Code does not execute in place from flash. It runs from 32 KB of SRAM through a dedicated fetch port. Embedded flash is on the roadmap.', K.gray]])[0],
  ...kpiS(48, 494, 376, 146, '64 KB', 'Boot ROM', 'Mask-programmed; starts the chip alone', { numPt: 26 }),
  ...kpiS(452, 494, 376, 146, '32 KB', 'SRAM', '16 dual-port macros: data and fetch', { numPt: 26, color: K.teal }),
  ...kpiS(856, 494, 376, 146, '0', 'Management cores', 'Nothing else is needed to start the chip', { numPt: 26, color: K.teal }),
  srcLine('Sources: DG32-LITE preliminary datasheet §6 (clock, reset, boot); block architecture §4.2–4.3.'),
], { notes: notes(7) });

// ── 08 · Control signal chain ────────────────────────────────────────────────
addSlide([
  ...hdr('08 · Control signal chain', 'The expensive steps of the loop run in hardware', 'One field-oriented-control tick, left to right; only step 4 runs on the CPU', 8),
  ...chain(48, 178, 1184, [
    ['1 Position', 'Encoder + Hall, edge timestamps', K.teal],
    ['2 Sample', 'SAR ADC at PWM centre', K.teal],
    ['3 Transform', 'CORDIC Clarke / Park', K.teal],
    ['4 Regulate', 'Two PI loops on the CPU', K.cyan],
    ['5 Rotate back', 'CORDIC inverse Park', K.teal],
    ['6 Drive', 'PWM, dead-time, brake', K.teal],
  ], { nodeW: 170, nodeH: 116 }),
  ...stack(48, 330, 578, [['Only step 4 runs on the CPU', 'The core costs about 8 clock cycles per instruction, so it keeps the two PI regulators and nothing else. Every other step is a dedicated block with a fixed cost.', K.cyan]])[0],
  ...stack(654, 330, 578, [['Why sample at the PWM centre', 'Centre-aligned PWM puts the sampling instant at the current-ripple null, so the ADC reads true phase current without analog filter delay.', K.teal]])[0],
  ...kpiS(48, 500, 376, 140, '≤ 2 cycles', 'Hardware brake', 'All six gate outputs forced off', { numPt: 24, color: K.red }),
  ...kpiS(452, 500, 376, 140, '~200 kSa/s', 'SAR ADC', '8-bit differential, on-die', { numPt: 24, color: K.teal }),
  ...kpiS(856, 500, 376, 140, '53–58', 'Cycles per CORDIC op', 'Fixed latency, simulated', { numPt: 24, color: K.teal }),
  srcLine('Sources: DG32-LITE block architecture §4.12–4.16; LITE preliminary datasheet (brake, ADC, CORDIC).'),
], { notes: notes(8) });

// ── 09 · Loop cost ───────────────────────────────────────────────────────────
addSlide([
  ...hdr('09 · Loop cost', 'One current loop costs about 300 hardware cycles', 'Cycle costs per stage at the 50 MHz clock, where one cycle is 20 ns', 9),
  ...table(48, 170, 640, [
    { t: 'Stage', w: 210 }, { t: 'Block', w: 220 }, { t: 'Cost', w: 210 },
  ], [
    ['Sample current', 'SAR ADC', '177 cycles'],
    ['Clarke / Park', 'CORDIC', '53–58 per op'],
    ['PI regulators', 'CPU, plain C', '~8 per instruction'],
    ['Inverse Park', 'CORDIC', '53–58 per op'],
    ['Update PWM', 'Shadow registers', 'next reload'],
    ['Fault check', 'Comparator', 'continuous'],
  ], { rowH: 46, headH: 40 }),
  ...kpiS(720, 170, 512, 176, '~300 cycles', 'Hardware cost per loop', 'ADC sample + two CORDIC operations + PWM write, the same at every loop rate', { numPt: 32 }),
  ...stack(720, 366, 512, [['At 20 kHz', 'One period is 2,500 cycles. Hardware takes about 300 of them, 12%. The other ~2,200 cycles belong to firmware.', K.teal]])[0],
  tx('ONE 20 KHZ PERIOD, DRAWN TO SCALE (2,500 CYCLES)', 48, 512, 1184, 20, { size: T.kicker, bold: true, color: K.slate }),
  ...proportionBar(48, 540, 1184, 64, [['HW 12%', 300, CYAN_TXT], ['Firmware budget: ~2,200 cycles, 88%', 2200, TEAL_DARK]]),
  srcLine('Source: DG32-LITE block architecture §5.1. Cycle costs measured in simulation. Derived: 300 ÷ 2,500 = 12%.'),
], { notes: notes(9) });

// ── 10 · Headroom ────────────────────────────────────────────────────────────
{
  const series = [['10 kHz', 4700, '~4,700'], ['20 kHz', 2200, '~2,200'], ['50 kHz', 700, '~700'], ['100 kHz', 200, '~200']];
  const bx = 70, base = 590, maxH = 320, step = 160, bw = 96;
  const bars = [rect(48, base, 660, 1, K.line), tx('FIRMWARE BUDGET PER LOOP, CLOCK CYCLES AT 50 MHZ', 48, 176, 660, 20, { size: T.kicker, bold: true, color: K.slate })];
  series.forEach(([label, val, text], i) => {
    const h = Math.max(8, (val / 4700) * maxH), x = bx + i * step;
    const color = i === 1 ? K.cyan : K.paleBlue;
    bars.push(roundRect(x, base - h, bw, h, color, color, 1));
    bars.push(tx(text, x - 30, base - h - 44, bw + 60, 36, { size: PX(18), face: SERIF, bold: true, color: K.slate, align: 'center' }));
    bars.push(tx(label, x - 30, base + 10, bw + 60, 24, { size: PX(12), bold: true, color: K.slate, align: 'center' }));
  });
  const [fits] = stack(740, 172, 492, [
    ['10 kHz · ~4,700 cycles', 'Full current and speed loop, with an observer', K.paleBlue],
    ['20 kHz · ~2,200 cycles', 'FOC with field-weakening and an observer', K.cyan],
    ['50 kHz · ~700 cycles', 'Inner current loop only; tight regulators', K.paleBlue],
    ['100 kHz · ~200 cycles', 'Simulated ceiling: ~5 µs + ~5 µs', K.paleBlue],
  ], 10);
  addSlide([
    ...hdr('10 · Headroom', 'At 20 kHz, 88% of each period is left for firmware', 'Budget = cycles per period minus the ~300 fixed hardware cycles', 10),
    ...bars, ...fits,
    srcLine('Source: DG32-LITE block architecture §5.2. 100 kHz row derived: 500 − 300 cycles.'),
  ], { notes: notes(10) });
}

// ── 11 · Timing headroom ─────────────────────────────────────────────────────
{
  const rows = [['GPIO', 173.6], ['DShot', 172.9], ['QSPI controller', 171.6], ['PWM', 167.8], ['Lockstep checker', 123.6], ['CORDIC', 95.5], ['Supervisor', 91.1], ['Lockstep core', 55]];
  const x0 = 48, labelW = 210, trackX = x0 + labelW, trackW = 520, y0 = 196, rowH = 52;
  const e = [];
  rows.forEach(([label, v], i) => {
    const y = y0 + i * rowH, core = label === 'Lockstep core';
    e.push(tx(label, x0, y + 8, labelW - 12, 26, { size: PX(12), bold: core, color: K.slate }));
    e.push(rect(trackX, y + 10, trackW, 24, K.surface));
    e.push(rect(trackX, y + 10, (v / 180) * trackW, 24, core ? K.cyan : K.paleBlue));
    e.push(tx(core ? '55–62' : v.toFixed(1), trackX + trackW + 12, y + 6, 90, 30, { size: PX(14), face: SERIF, bold: true, color: K.slate }));
  });
  const mx = trackX + (50 / 180) * trackW;
  e.push(rect(mx, 186, 2, rows.length * rowH + 10, K.slate));
  e.push(tx('50 MHz die clock', mx - 70, 164, 140, 20, { size: PX(10), bold: true, color: K.slate, align: 'center' }));
  addSlide([
    ...hdr('11 · Timing', 'Only the lockstep core limits the clock', 'Post-route maximum frequency per hardened block, MHz', 11),
    ...e,
    ...kpiS(900, 176, 332, 190, '50 MHz', 'Die clock', 'Set by the lockstep core at ~55–62 MHz, not by any peripheral', { numPt: 32 }),
    ...stack(900, 388, 332, [['Peripherals have room', 'Every peripheral hardens above 90 MHz, more than 1.8× the die clock, so timing closure rests on one block.', K.teal]])[0],
    srcLine('Source: DG32-LITE block architecture §5.3, post-route. The lockstep-core bar is drawn at 55 MHz, the low end of its range.'),
  ], { notes: notes(11) });
}

// ── 12 · Package and pinout ──────────────────────────────────────────────────
addSlide([
  ...hdr('12 · Package', '44 signals and a hardware trip in 9 × 9 mm', 'QFN-64 top to bottom: 44 signal pins, 20 supplies and grounds, one exposed ground paddle', 12),
  ...table(48, 170, 700, [
    { t: 'Function', w: 190 }, { t: 'Signals', w: 410 }, { t: 'Pins', w: 100, a: 'right' },
  ], [
    ['Motor PWM', 'AH, AL, BH, BL, CH, CL + ADC trigger', '7'],
    ['Position sensing', 'Encoder A, B, Z · Hall A, B, C', '6'],
    ['Analog', 'SAR ADC VINP, VINN (0–1.8 V)', '2'],
    ['QSPI flash', 'Clock, 4 data, 2 chip selects', '7'],
    ['Serial', 'UART0 TX/RX · UART1 TX/RX', '4'],
    ['SPI', 'SCLK, MOSI, MISO, CSN', '4'],
    ['I²C', 'SCL, SDA (open-drain)', '2'],
    ['GPIO', 'GPIO0–2', '3'],
    ['Safety', 'FAULT_N · 2 × supply-good inputs', '3'],
    ['JTAG', 'TCK, TMS, TDI, TDO', '4'],
    ['Clock & reset', 'CLK, RST_N', '2'],
  ], { rowH: 36, headH: 38, highlight: 8 }),
  ...kpiS(780, 170, 214, 156, '9 × 9 mm', 'QFN-64 body', '0.5 mm pitch, ground paddle', { numPt: 22 }),
  ...kpiS(1018, 170, 214, 156, '44', 'Signal pins', 'Plus 20 supplies and grounds', { numPt: 22, color: K.teal }),
  ...kpiS(780, 342, 214, 156, '1.8 V', 'Core supply', 'I/O pad ring at 3.3 V', { numPt: 22, color: K.teal }),
  ...kpiS(1018, 342, 214, 156, 'Identical', 'DG32-2DOM pinout', 'The engine adds no pads', { numPt: 22, color: K.teal }),
  ...stack(780, 514, 452, [['FAULT_N is the hardware trip', 'Route it to the gate-driver enable so a CPU disagreement turns the bridge off.', K.red]])[0],
  srcLine('Sources: DG32-LITE preliminary datasheet §2–3, §5, §10; DG32-2DOM preliminary datasheet §2 (identical pinout).'),
], { notes: notes(12) });

// ── 13 · DG32-2DOM ───────────────────────────────────────────────────────────
{
  const block = (x, y, w, t, c) => [roundRect(x, y, w, 52, K.white, c, 1), tx(t, x + 14, y + 13, w - 28, 26, { size: PX(11.5), bold: true, color: K.slate })];
  addSlide([
    ...hdr('13 · Compute variant', 'DG32-2DOM adds AI without slowing control', 'The same chip plus an INT8 attention engine on its own clock, in the same 64-pin footprint', 13),
    rect(48, 176, 300, 300, K.softCyan, K.cyan, 2), rect(48, 176, 300, 5, K.cyan),
    tx('50 MHz control domain', 64, 194, 268, 26, { size: PX(13), bold: true, color: K.slate }),
    ...block(68, 240, 260, 'Lockstep CPU pair', K.cyan),
    ...block(68, 306, 260, 'Motor peripherals', K.cyan),
    ...block(68, 372, 260, 'Boot ROM · SRAM · bus', K.cyan),
    sh('leftRightArrow', 362, 300, 126, 60, K.teal, K.teal, 1),
    tx('Clock-domain bridges', 350, 370, 150, 44, { size: PX(10.5), bold: true, color: K.slate, align: 'center' }),
    rect(502, 176, 258, 300, K.softTeal, K.teal, 2), rect(502, 176, 258, 5, K.teal),
    tx('114 MHz compute domain', 518, 194, 230, 26, { size: PX(13), bold: true, color: K.slate }),
    ...block(520, 240, 222, 'INT8 attention engine', K.teal),
    ...block(520, 306, 222, 'K/V buffers on SRAM', K.teal),
    ...block(520, 372, 222, 'Memory via bridges', K.teal),
    tx('Same QFN-64 pinout: the engine adds no pads', 48, 496, 712, 26, { size: PX(12), bold: true, color: K.slate }),
    tx('Status: design complete, in physical trials. DG32-2DOM has its own architecture deck and film.', 48, 530, 712, 60, { size: T.body, color: K.gray }),
    ...stack(790, 176, 442, [
      ['Bit-exact', 'Each kick computes QKᵀ, softmax, the weighted sum and requantisation for a band of query rows, matching the software model exactly.', K.teal],
      ['Up to 400 keys per head', 'One reciprocal per row keeps the INT8 datapath narrow enough to share one multiply array.', K.teal],
      ['Never stalls control', 'Timing closed with positive slack at both 50 MHz and 114 MHz.', K.cyan],
    ], 14)[0],
    srcLine('Sources: DG32-2DOM block architecture §1, §4.18–4.19; DG32-2DOM preliminary datasheet. Pre-silicon design values.'),
  ], { notes: notes(13) });
}

// ── 14 · Positioning ─────────────────────────────────────────────────────────
addSlide([
  ...hdr('14 · Positioning', 'DG32 leads on safety and trails on analog', 'DG32-LITE against the STM32G0 series, the incumbent entry-level motor-control MCU', 14),
  ...tableCols(48, 168, 1184, [
    { t: 'Dimension', w: 190 }, { t: 'DG32-LITE', w: 330 }, { t: 'STM32G0 series', w: 330 }, { t: 'What it means', w: 334 },
  ], [
    ['CPU', '2 × RV32IM, hardware lockstep, 50 MHz', '1 × Cortex-M0+, up to 64 MHz', 'Same class; DG32 spends core two on checking'],
    ['Safety hardware', 'Lockstep comparator, fault latch, FAULT pin', 'Watchdogs, brown-out, software self-test', 'Lockstep otherwise means automotive MCUs'],
    ['Motor PWM', '3-phase + brake; 4 × DShot in hardware', 'Advanced timer; DShot in software', 'Equivalent PWM; DShot native on DG32'],
    ['Math', 'Hardware CORDIC', 'None (appears on STM32G4)', 'FOC transforms run in hardware'],
    ['On-chip AI', 'DG32-2DOM INT8 attention engine', 'None; AI runs in software', 'Condition monitoring inside the drive'],
    ['Analog', '8-bit SAR, ~200 kSa/s, 2 pins', '12-bit, 2.5 MSa/s, up to 16 channels', 'G0 leads clearly; first roadmap item'],
    ['Program memory', '64 KB ROM + external QSPI flash', '16–512 KB embedded flash', 'G0 leads; embedded flash on roadmap'],
    ['Communications', '2 × UART, SPI, I²C, QSPI', 'Up to 6 USART, USB FS, 2 × FDCAN', 'G0 leads; CAN-FD on roadmap'],
  ], { rowH: 52, headH: 40, hotCol: 1 }),
  srcLine('Source: DG32-LITE investor block diagram p2. STM32G0 column: public datasheet values (G0x1 / G0B1). DG32-LITE: design values, not measured.'),
], { notes: notes(14) });

// ── 15 · Roadmap ─────────────────────────────────────────────────────────────
addSlide([
  ...hdr('15 · Roadmap', 'The next spin closes the two largest gaps', 'Where the incumbent leads most clearly is where the second spin starts', 15),
  ...rail(48, 188, 1184, [
    ['Now', 'First silicon', 'September 2026 shuttle measures what simulation predicted', CYAN_TXT, true],
    ['Next', 'Second spin', '12-bit multi-channel ADC and embedded flash', TEAL_DARK, false],
    ['Then', 'Connectivity and debug', 'CAN-FD and interactive CPU debug', TEAL_DARK, false],
    ['Parallel', 'DG32-2DOM', 'INT8 attention variant: design complete, physical trials', TEAL_DARK, false],
  ]),
  ...stack(48, 390, 578, [['Gaps closed first', 'The analog front end and program memory are where the STM32G0 leads most clearly, so the second spin targets both before adding connectivity.', K.teal]])[0],
  ...stack(654, 390, 578, [['What this deck does not claim', 'No measured silicon results and no functional-safety certification. Every figure is a design value until first-silicon bring-up.', K.amber]])[0],
  srcLine('Source: DG32-LITE investor block diagram p2, roadmap to close the gap.'),
], { notes: notes(15) });

// ── 16 · Close (L14) ─────────────────────────────────────────────────────────
{
  const [takeaways] = stack(560, 108, 672, [
    ['1 · Safety is in the core', 'Two RISC-V cores must agree on every committed store. A disagreement latches and drives FAULT_N within 39 simulated cycles.', K.cyan],
    ['2 · Control is in silicon', 'Sampling, transforms and PWM run in dedicated blocks, so one loop costs about 300 hardware cycles at any rate.', K.teal],
    ['3 · The gaps are on the roadmap', 'A 12-bit ADC and embedded flash come first, then CAN-FD and debug. DG32-2DOM adds on-chip AI in the same footprint.', K.cyan],
  ], 16);
  addSlide([
    rect(0, 0, 512, 720, K.midnight),
    tx('16 · CLOSE', 48, 64, 400, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx('Safety in the core. Control in silicon.', 48, 104, 420, 200, { size: PX(34), face: SERIF, bold: true, color: K.white }),
    rect(48, 318, 120, 4, K.cyan),
    tx('Next milestone: first-silicon bring-up on the September 2026 shuttle turns these design values into measurements.', 48, 344, 420, 130, { size: T.body, color: MUTED_DARK }),
    tx('THREE THINGS TO REMEMBER', 560, 64, 672, 22, { size: T.kicker, bold: true, color: K.slate }),
    ...takeaways,
    rect(48, 681, 420, 1, '#23364C'), rect(560, 681, 672, 1, K.line),
    tx('DEEPGRID SEMI  ·  DG32-LITE ARCHITECTURE', 48, 690, 440, 20, { size: T.foot, bold: true, color: '#8FA2B7' }),
    tx('16', 1160, 690, 72, 20, { size: T.foot, bold: true, color: K.gray, align: 'right' }),
  ], { notes: notes(16) });
}

// ── export ───────────────────────────────────────────────────────────────────
await (await PresentationFile.exportPptx(P)).save(OUT);
const scale = Number(process.env.RENDER_SCALE || 1);
await mkdir(PREVIEW_DIR, { recursive: true });
for (let i = 0; i < P.slides.count; i += 1) {
  const blob = await P.export({ format: 'png', slide: P.slides.getItem(i), scale });
  await writeFile(`${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(await blob.arrayBuffer()));
}
console.log(`wrote ${OUT} · ${P.slides.count} slides · renders in ${PREVIEW_DIR}`);
