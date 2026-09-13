// DG32-LITE tape-in block diagram — client-ready deck (artifact-tool presentation JSX), investor level.
// DECK_RUN=<this dir> DECK_NAME=dg32-lite-tapein DECK_FOOTER='…' node build_deck.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { P, K, tx, rect, roundRect, addSlide, PresentationFile, OUT, PREVIEW_DIR, RUN } from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, table, chain, rail } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';
import { CYAN_TXT, TEAL_DARK, srcLine, hdr, stack, proportionBar } from '/home/sheke/content-ideas/runs/2026-09-13-dg32-architecture-package/dg32-deck-kit.mjs';
import { loadNotes, coverSlide, closeSlide, kpiRow, band, cardGrid } from '../ds-common.mjs';

const notes = await loadNotes(RUN);

// 01 · Cover
coverSlide({
  kicker: 'DEEPGRID SEMI  ·  DG32-LITE  ·  TAPE-IN BLOCK DIAGRAM',
  title: 'DG32-LITE as built for tape-in',
  subtitle: 'The die as recorded in its tape-in block diagram · one clock domain, 130 nm CMOS · a design record, not a measurement of silicon',
  strip: [['2.9 × 4.5', 'mm core block'], ['44', 'Pads, all allocated'], ['18', 'Blocks on the bus'], ['4', 'Sign-off gates']],
  motifLabel: 'QFN-64  ·  ILLUSTRATIVE',
  note: 'Design state September 2026. This deck lists the sign-off gates; it makes no claim that they have passed.',
  notes: notes(1),
});

// 02 · Short version
addSlide([
  ...hdr('02 · Executive summary', 'One clock, 44 pads, and four gates before tape-in', 'What the tape-in diagram records about the die as built', 2),
  ...kpiRow(48, 172, 1184, 160, [
    ['50 MHz', 'One clock domain', 'Core ceiling ~55–62 MHz, post-route', { numPt: 30 }],
    ['2 cycles', 'Checker delay', 'CHECKER sees MAIN’s bus responses', { numPt: 30, color: TEAL_DARK }],
    ['44 / 44', 'Pads allocated', 'Every wrapper pad has a job', { numPt: 30, color: TEAL_DARK }],
    ['4', 'Sign-off gates', 'All must pass on the final die', { numPt: 30, color: TEAL_DARK }],
  ]),
  ...cardGrid(48, 502, 1184, 3, [
    ['Safety', 'Lockstep pair with mirrored bus responses and a fault pad.', K.cyan],
    ['Bus', 'Two masters; gated or undecoded slots answer with an error.', K.teal],
    ['Test', '13 scan chains through JTAG; four gates before tape-in.', K.teal],
  ])[0],
  ...band(48, 352, 1184, 130, 'A single clock and reset, a lockstep pair that tolerates interrupts and peripheral reads, a two-master bus where nothing hangs, and a pad plan with no spare pin.'),
  srcLine('Source: DG32-LITE tape-in block diagram (state 2026-09-10).'),
], { notes: notes(2) });

// 03 · Clock and reset
addSlide([
  ...hdr('03 · Clocks and reset', 'One clock and one reset drive the whole block', 'Eight clock gates idle unused peripherals; test mode overrides them all', 3),
  ...chain(48, 178, 1184, [
    ['Clock pad', '50 MHz, one domain', K.cyan],
    ['Eight clock gates', 'Idle peripherals switched off', K.teal],
    ['Test mode', 'Forces every gate open', K.teal],
  ]),
  ...chain(48, 322, 1184, [
    ['Reset pad', 'Asynchronous, active low', K.cyan],
    ['Supervisor', 'Deglitches supply-good inputs', K.teal],
    ['MAIN, then CHECKER', 'Checker released two cycles later', K.teal],
  ]),
  ...stack(48, 466, 1184, [['Which peripherals can be gated', 'UART0, UART1, SPI, I²C, PWM, the timers, the DMA and the CORDIC.', K.cyan]])[0],
  srcLine('Source: DG32-LITE tape-in block diagram, clocks and reset.'),
], { notes: notes(3) });

// 04 · Lockstep
addSlide([
  ...hdr('04 · Dual-core lockstep', 'The checker trails MAIN and sees its bus responses', 'The pair is arranged so ordinary firmware cannot make the two cores disagree', 4),
  ...chain(48, 178, 1184, [
    ['MAIN', 'Runs firmware, owns the bus', K.cyan],
    ['Two-cycle delay', 'Inputs and bus responses mirrored', K.teal],
    ['CHECKER', 'Replays the same work', K.cyan],
    ['Compare stores', 'A mismatch sets a sticky fault', K.red],
  ]),
  ...stack(48, 330, 376, [['Interrupts are safe', 'One interrupt register feeds both cores, with the checker’s inputs delayed to match.', K.cyan]])[0],
  ...stack(452, 330, 376, [['Peripheral reads are safe', 'Firmware may branch on a peripheral read; the checker sees the same response.', K.teal]])[0],
  ...stack(856, 330, 376, [['Verified in simulation', 'The lockstep pair is verified under interrupts in simulation.', K.teal]])[0],
  tx('A mismatch drives the FAULTn pad, so the fault reaches the board without firmware.', 48, 560, 1184, 30, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Source: DG32-LITE tape-in block diagram, dual-core lockstep.'),
], { notes: notes(4) });

// 05 · Memory and fetch
addSlide([
  ...hdr('05 · Memory and fetch', 'Code runs from SRAM through a dedicated fetch port', 'The fetch path is separate from the data bus, so fetch never waits on data traffic', 5),
  ...chain(48, 178, 1184, [
    ['Fetch decoder', 'Routes each fetch by region', K.cyan],
    ['ROM or SRAM', 'Boot to ROM; application to SRAM port 1', K.teal],
    ['Anything else', 'Bus error, then instruction fault', K.red],
  ]),
  ...stack(48, 330, 578, [['Boot ROM', '16,384 words of mask-programmed logic. Prints the banner, checks the flash header, copies the application and jumps.', K.teal]])[0],
  ...stack(654, 330, 578, [['SRAM, 32 KB', '16 × 2 KB dual-port macros: port 0 for CPU and DMA data, port 1 for instruction fetch.', K.cyan]])[0],
  tx('No valid flash header opens a UART monitor. The application installs its trap vector and enables interrupts.', 48, 520, 1184, 30, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Source: DG32-LITE tape-in block diagram, fetch decoder, boot ROM, SRAM and boot flow.'),
], { notes: notes(5) });

// 06 · Bus
addSlide([
  ...hdr('06 · On-chip bus', 'One requester at a time, and no access hangs', 'An AXI-lite bus with two masters and an error slave for every unanswered address', 6),
  ...chain(48, 178, 1184, [
    ['Two masters', 'CPU first, DMA second', K.cyan],
    ['Target latched', 'Held from request to response', K.teal],
    ['32-bit slaves', 'Every block is a register slave', K.teal],
    ['Error slave', 'Answers gated or undecoded slots', K.red],
  ]),
  ...stack(48, 330, 578, [['Gated means absent', 'A clock-gated peripheral decodes to the error slave, except in test mode.', K.cyan]])[0],
  ...stack(654, 330, 578, [['Flash is a data window', 'The QSPI window serves data; the ROM copies code into SRAM.', K.teal]])[0],
  ...kpiRow(48, 494, 1184, 140, [
    ['2', 'Bus masters', 'The CPU has priority over the DMA', { numPt: 26 }],
    ['32-bit', 'Register slaves', 'Every peripheral on the bus', { numPt: 26, color: TEAL_DARK }],
    ['Error', 'For unanswered slots', 'By design, no access hangs', { numPt: 26, color: TEAL_DARK }],
  ], 28),
  srcLine('Source: DG32-LITE tape-in block diagram, AXI-lite bus.'),
], { notes: notes(6) });

// 07 · Eighteen blocks
{
  const rows = [
    [K.paleBlue, [['UART0 · UART1', '115,200 baud; UART0 is the console'], ['SPI master', 'Up to 25 MHz'], ['I²C master', '100 / 400 kHz, 1–4 bytes'], ['QSPI + window', 'NOR flash and PSRAM'], ['GPIO × 3', 'In, out and enable per pin'], ['Timers × 2', '32-bit, compare interrupt']]],
    [TEAL_DARK, [['3-phase PWM', 'Dead-time, sample trigger, brake'], ['DShot × 4', 'Steered onto the PWM pads'], ['Encoder + Hall', '4× quadrature, index, 3 Hall'], ['CORDIC', '20 iterations, Q1.31'], ['ADC → SAR', '8-bit differential, ~200 kSa/s'], ['Interrupts', '16 sources, software interrupt']]],
    [K.slate, [['System control', 'Part ID, 8 clock gates, pin mux'], ['Watchdog', 'Windowed; supply-good deglitch'], ['Fault register', 'Lockstep fault to FAULTn'], ['Error slave', 'Undecoded or gated slots'], ['Scan / DFT', '13 scan chains'], ['JTAG TAP', 'In the wrapper; reaches scan']]],
  ];
  const w = 186, step = (1184 - w) / 5, e = [];
  rows.forEach(([color, tiles], r) => tiles.forEach(([t, b], i) => {
    const x = 48 + i * step, y = 172 + r * 128;
    e.push(roundRect(x, y, w, 114, K.white, K.line, 1), rect(x, y, w, 5, color),
      tx(t, x + 12, y + 16, w - 24, 24, { size: PX(11.5), bold: true, color: K.slate }), tx(b, x + 12, y + 46, w - 24, 60, { size: PX(10), color: K.gray }));
  }));
  const legend = [['Connectivity', K.paleBlue], ['Motor and sensing', TEAL_DARK], ['System, safety and test', K.slate]].flatMap(([l, c], i) => [
    rect(48 + i * 260, 566, 14, 14, c), tx(l, 70 + i * 260, 561, 230, 24, { size: PX(11), color: K.slate })]);
  addSlide([
    ...hdr('07 · Blocks on the bus', 'Eighteen blocks sit around the bus', 'Every peripheral is a 32-bit register slave on the same AXI-lite bus', 7),
    ...e, ...legend,
    srcLine('Source: DG32-LITE tape-in block diagram, slave slots.'),
  ], { notes: notes(7) });
}

// 08 · Pad plan
addSlide([
  ...hdr('08 · Pad plan', 'Every one of the 44 wrapper pads has a job', 'The wrapper’s pad plan (rev 2), grouped by function', 8),
  tx('ALL 44 WRAPPER PADS, BY GROUP, TO SCALE', 48, 160, 1184, 22, { size: T.kicker, bold: true, color: K.slate }),
  ...proportionBar(48, 188, 1184, 64, [
    ['QSPI 7', 7, '#35607F'], ['PWM 7', 7, TEAL_DARK], ['ENC + HALL 6', 6, '#0A7C7E'], ['UART 4', 4, CYAN_TXT], ['SPI 4', 4, '#2B5277'],
    ['JTAG 4', 4, '#4B5563'], ['GPIO 3', 3, '#5B6B7F'], ['', 2, '#6B7280'], ['', 2, '#475569'], ['', 2, '#0E7490'], ['', 1, K.midnight], ['', 1, K.red], ['', 1, K.slate],
  ]),
  ...table(48, 272, 578, [{ t: 'Group', w: 190 }, { t: 'Pads', w: 70, a: 'right' }, { t: 'Carries', w: 318 }], [
    ['Clock', '1', '50 MHz clock in'], ['QSPI flash', '7', 'Clock, 4 data, 2 selects'], ['UART0 / UART1', '4', 'Console and telemetry'],
    ['SPI', '4', 'Master clock, data, select'], ['I²C', '2', 'Clock and data, open-drain'], ['GPIO', '3', 'General-purpose pins'], ['FAULTn', '1', 'Lockstep fault output'],
  ], { rowH: 40, headH: 36 }),
  ...table(654, 272, 578, [{ t: 'Group', w: 190 }, { t: 'Pads', w: 70, a: 'right' }, { t: 'Carries', w: 318 }], [
    ['Supply-good', '2', 'Supervisor inputs'], ['ADC', '2', 'Differential analog inputs'], ['PWM + trigger', '7', 'Six gate outputs, ADC trigger'],
    ['Encoder + Hall', '6', 'A, B, Z and three Hall inputs'], ['JTAG', '4', 'TCK, TMS, TDI, TDO'], ['Reset', '1', 'Active-low reset in'],
  ], { rowH: 40, headH: 36 }),
  tx('The wrapper also holds the JTAG TAP and the power connections; the block and the wrapper are hardened in separate flows.', 48, 610, 1184, 26, { size: PX(11), color: K.gray }),
  srcLine('Source: DG32-LITE tape-in block diagram, wrapper pad plan (rev 2).'),
], { notes: notes(8) });

// 09 · Test
addSlide([
  ...hdr('09 · Production test', 'Production test reaches 13 scan chains via JTAG', 'Scan serves manufacturing test; interactive CPU debug is a separate roadmap item', 9),
  ...chain(48, 178, 1184, [
    ['Tester', 'Drives the four JTAG pins', K.teal],
    ['JTAG TAP', 'Scan enable, mode, chain select, bypass', K.cyan],
    ['13 scan chains', 'Through the hardened block', K.teal],
  ]),
  ...stack(48, 330, 578, [['Test mode opens every gate', 'Clock gates are forced open and gated slots decode normally, so scan reaches every block.', K.cyan]])[0],
  ...stack(654, 330, 578, [['Separate from debug', 'Scan is for production test; interactive CPU debug over JTAG is on the roadmap.', K.amber]])[0],
  ...kpiRow(48, 494, 1184, 140, [
    ['13', 'Scan chains', 'Inside the hardened block', { numPt: 26 }],
    ['4', 'JTAG pins', 'TCK, TMS, TDI, TDO', { numPt: 26, color: TEAL_DARK }],
    ['All', 'Clock gates open', 'In test mode', { numPt: 26, color: TEAL_DARK }],
  ], 28),
  srcLine('Sources: DG32-LITE tape-in block diagram (scan/DFT, JTAG TAP); investor block diagram p2 (debug roadmap).'),
], { notes: notes(9) });

// 10 · Sign-off gates
addSlide([
  ...hdr('10 · Sign-off gates', 'Four gates must all pass before tape-in', 'Every gate runs on the final hardened die; passing three is not enough', 10),
  ...rail(48, 188, 1184, [
    ['Gate 1', 'DRC clean', 'Every design rule, the whole die', TEAL_DARK, false],
    ['Gate 2', 'LVS match', 'Circuits match uniquely, pins included', TEAL_DARK, false],
    ['Gate 3', 'Connectivity', 'Every pad reaches logic; no floating net', TEAL_DARK, false],
    ['Gate 4', 'Boot simulation', 'Routed netlist prints the banner', CYAN_TXT, false],
  ]),
  ...stack(48, 390, 578, [['Why a connectivity gate', 'Design-rule and layout-versus-schematic checks can both pass while a pad pin floats. Only a pin-level check on the final layout catches it.', K.cyan]])[0],
  ...stack(654, 390, 578, [['What this deck states', 'The gates the die must pass, not their results. It makes no tapeout-ready claim.', K.amber]])[0],
  srcLine('Source: DG32-LITE tape-in block diagram, sign-off gates.'),
], { notes: notes(10) });

// 11 · Close
closeSlide({
  kicker: '11 · CLOSE', title: 'Built to be checked, not assumed.',
  body: 'Next milestone: first silicon on the September 2026 multi-project shuttle.',
  takeaways: [
    ['1 · One clock, one reset', 'A single 50 MHz domain with eight clock gates and a checker released two cycles after MAIN.', K.cyan],
    ['2 · Nothing hangs, nothing floats', 'Gated or undecoded slots answer with an error, and all 44 pads are allocated.', K.teal],
    ['3 · Four gates before tape-in', 'DRC, LVS, pin connectivity and a gate-level boot simulation must all pass.', K.cyan],
  ],
  label: 'DEEPGRID SEMI  ·  DG32-LITE TAPE-IN BLOCK DIAGRAM', page: 11, notes: notes(11),
});

await (await PresentationFile.exportPptx(P)).save(OUT);
await mkdir(PREVIEW_DIR, { recursive: true });
for (let i = 0; i < P.slides.count; i += 1) {
  const blob = await P.export({ format: 'png', slide: P.slides.getItem(i), scale: 1 });
  await writeFile(`${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(await blob.arrayBuffer()));
}
console.log(`wrote ${OUT} · ${P.slides.count} slides`);
