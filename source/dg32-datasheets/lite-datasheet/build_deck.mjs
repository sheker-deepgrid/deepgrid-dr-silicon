// DG32-LITE preliminary datasheet — client-ready deck (artifact-tool presentation JSX), investor level.
// DECK_RUN=<this dir> DECK_NAME=dg32-lite-datasheet DECK_FOOTER='…' node build_deck.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { P, K, SERIF, tx, rect, roundRect, ellipse, addSlide, PresentationFile, OUT, PREVIEW_DIR, RUN } from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, table, chain } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';
import { MUTED_DARK, CYAN_TXT, TEAL_DARK, srcLine, hdr, stack, kpiS } from '/home/sheke/content-ideas/runs/2026-09-13-dg32-architecture-package/dg32-deck-kit.mjs';
import { loadNotes, coverSlide, closeSlide, cardGrid, kpiRow, band } from '../ds-common.mjs';

const notes = await loadNotes(RUN);

// 01 · Cover
coverSlide({
  kicker: 'DEEPGRID SEMI  ·  DG32-LITE  ·  PRELIMINARY DATASHEET',
  title: 'A lockstep motor MCU in a QFN-64 package',
  subtitle: 'The preliminary datasheet at overview level, for hardware and firmware leads · design values and process nominals, pending first-silicon characterisation',
  strip: [['9 × 9 mm', 'QFN-64 body'], ['44', 'Signal pins'], ['1.8 / 3.3 V', 'Core / I/O rails'], ['50 MHz', 'One clock domain']],
  motifLabel: 'QFN-64  ·  ILLUSTRATIVE',
  note: 'Preliminary, pre-silicon. Register maps, the memory map and board-design rules are in the engineering datasheet, not this deck.',
  notes: notes(1),
});

// 02 · Four facts
addSlide([
  ...hdr('02 · Design-in', 'Four facts set every DG32-LITE design-in', 'Rails, clock and pins: the parts of the datasheet a design commits to first', 2),
  ...kpiRow(48, 172, 1184, 150, [
    ['1.8 V', 'Core rail', 'Logic, SRAM and the ADC · 1.71–1.89 V', { numPt: 32 }],
    ['3.3 V', 'I/O ring', 'Pads and ESD · 3.0–3.6 V', { numPt: 32, color: TEAL_DARK }],
    ['50 MHz', 'Clock', 'One domain, no on-die PLL', { numPt: 32, color: TEAL_DARK }],
    ['44 / 64', 'Signal pins', 'Twenty supplies and grounds', { numPt: 32, color: TEAL_DARK }],
  ]),
  ...band(48, 338, 1184, 116, 'Everything else in the datasheet follows from these four facts: which rails to provide, which clock to route, and which pins the drive, the flash and debug take.'),
  ...cardGrid(48, 472, 1184, 3, [
    ['Rails', 'Four required rails; unused rails tied to nominal.', K.teal],
    ['Clock', 'One 3.3 V CMOS input, no PLL; core ~55–62 MHz.', K.teal],
    ['Pins', '44 signals in eleven groups; 20 supplies and grounds.', K.paleBlue],
  ])[0],
  srcLine('Source: DG32-LITE preliminary datasheet §2, §4.1, §5, §6.1.'),
], { notes: notes(2) });

// 03 · Features
addSlide([
  ...hdr('03 · Features', 'Nine features, one self-booting safety SoC', 'The datasheet’s feature list, grouped as a design sees it', 3),
  ...cardGrid(48, 172, 1184, 3, [
    ['Lockstep cores', 'Two RV32IM cores, a fault comparator and a sticky fault register', K.cyan],
    ['Memory', '32 KB SRAM, 64 KB boot ROM and a window onto external flash', K.teal],
    ['3-phase PWM', 'Complementary, programmable dead-time, hardware brake', K.teal],
    ['DShot × 4', 'Four ESC channels, pin-muxed onto the PWM pads', K.teal],
    ['Position and math', 'Quadrature and Hall with timestamps; CORDIC for FOC', K.teal],
    ['On-die ADC', '8-bit differential SAR, triggered by the PWM', K.teal],
    ['Connectivity', 'Two UARTs, an SPI master, an I²C master and GPIO', K.paleBlue],
    ['Supervision', 'Two timers, a windowed watchdog and a supply supervisor', K.paleBlue],
    ['Self-boot', 'No management core; an unmapped access returns an error', K.cyan],
  ])[0],
  srcLine('Source: DG32-LITE preliminary datasheet §1, features.'),
], { notes: notes(3) });

// 04 · Pin groups
{
  const groups = [['Motor PWM', 7], ['QSPI flash', 7], ['Position', 6], ['Serial', 4], ['SPI', 4], ['JTAG', 4], ['GPIO', 3], ['Safety', 3], ['Analog', 2], ['I²C', 2], ['Clock & reset', 2]];
  const x0 = 800, labelW = 140, trackW = 232;
  const bars = [tx('PINS PER GROUP, TO SCALE', x0, 172, 432, 22, { size: T.kicker, bold: true, color: K.slate })];
  groups.forEach(([label, v], i) => {
    const y = 204 + i * 38;
    bars.push(tx(label, x0, y + 6, labelW - 8, 24, { size: PX(11), color: K.slate }), rect(x0 + labelW, y + 8, trackW, 20, K.surface),
      rect(x0 + labelW, y + 8, (v / 7) * trackW, 20, TEAL_DARK), tx(String(v), x0 + labelW + trackW + 8, y + 4, 40, 26, { size: PX(13), face: SERIF, bold: true, color: K.slate }));
  });
  addSlide([
    ...hdr('04 · Pin groups', '44 signal pins in eleven functional groups', 'Every signal pin by function; the remaining 20 pins are supplies and grounds', 4),
    ...table(48, 170, 720, [{ t: 'Group', w: 200 }, { t: 'Signals', w: 420 }, { t: 'Pins', w: 100, a: 'right' }], [
      ['Motor PWM', 'AH, AL, BH, BL, CH, CL + ADC trigger', '7'],
      ['QSPI flash', 'Clock, 4 data, 2 chip selects', '7'],
      ['Position', 'Encoder A, B, Z · Hall A, B, C', '6'],
      ['Serial', 'UART0 TX/RX · UART1 TX/RX', '4'],
      ['SPI', 'SCLK, MOSI, MISO, CSN', '4'],
      ['JTAG', 'TCK, TMS, TDI, TDO', '4'],
      ['GPIO', 'GPIO0–2', '3'],
      ['Safety', 'FAULT_N · 2 × supply-good inputs', '3'],
      ['Analog', 'SAR ADC VINP, VINN (0–1.8 V)', '2'],
      ['I²C', 'SCL, SDA (open-drain)', '2'],
      ['Clock & reset', 'CLK, RST_N', '2'],
    ], { rowH: 36, headH: 38, highlight: 7 }),
    ...bars,
    srcLine('Source: DG32-LITE preliminary datasheet §3, §3.1 pins by function.'),
  ], { notes: notes(4) });
}

// 05 · Package sides
{
  const sq = { x: 500, y: 270, s: 280 }, side = [];
  side.push(rect(sq.x, sq.y, sq.s, sq.s, K.midnight, K.slate, 2), ellipse(sq.x + 16, sq.y + 16, 14, 14, K.cyan));
  for (let i = 0; i < 16; i++) {
    const p = 20 + i * (sq.s - 40) / 15;
    side.push(rect(sq.x - 14, sq.y + p - 4, 12, 8, TEAL_DARK), rect(sq.x + p - 4, sq.y + sq.s + 2, 8, 12, K.slate),
      rect(sq.x + sq.s + 2, sq.y + p - 4, 12, 8, '#35607F'), rect(sq.x + p - 4, sq.y - 14, 8, 12, CYAN_TXT));
  }
  side.push(tx('DG32-LITE', sq.x, sq.y + 108, sq.s, 34, { size: PX(18), face: SERIF, bold: true, color: K.white, align: 'center' }),
    tx('QFN-64  ·  TOP VIEW  ·  PIN 1 ●', sq.x, sq.y + 150, sq.s, 20, { size: PX(9), bold: true, color: MUTED_DARK, align: 'center' }));
  const box = (x, y, w, h, title, body, color) => [rect(x, y, w, h, K.white, color, 2), rect(x, y, w, 5, color),
    tx(title, x + 16, y + 12, w - 32, 24, { size: PX(12), bold: true, color: K.slate }), tx(body, x + 16, y + 38, w - 32, h - 42, { size: PX(11), color: K.gray })];
  addSlide([
    ...hdr('05 · Pin placement', 'Each side of the package groups related signals', 'Supplies and grounds sit between the groups on every side; pin 1 is upper left, numbered counter-clockwise', 5),
    ...side,
    ...box(380, 160, 520, 92, 'Top · pins 49–64 · I²C, GPIO and safety', 'SPI MISO and CSN · I²C · GPIO0–2\nFAULT_N · supply-good × 2 · ADC +', CYAN_TXT),
    ...box(48, 320, 420, 176, 'Left · pins 1–16 · Motor and position', 'PWM AH, AL, BH, BL, CH, CL\nPWM trigger\nEncoder A, B, Z · Hall A, B\nADC −', TEAL_DARK),
    ...box(812, 320, 420, 176, 'Right · pins 33–48 · Flash and serial', 'QSPI CSN0, IO0–3, CSN1\nUART0 TX/RX · UART1 TX/RX\nSPI SCLK and MOSI', '#35607F'),
    ...box(380, 566, 520, 84, 'Bottom · pins 17–32 · Debug, clock and reset', 'JTAG × 4 · CLK · RST_N and resetb · Hall C · QSPI clock', K.slate),
    srcLine('Source: DG32-LITE preliminary datasheet §2–3. Pin map awaiting the foundry’s bond-diagram confirmation.'),
  ], { notes: notes(5) });
}

// 06 · Electrical
addSlide([
  ...hdr('06 · Electrical', 'Every electrical limit is a nominal until silicon', 'Recommended operating conditions and absolute maximums, before characterisation', 6),
  ...table(48, 170, 1184, [{ t: 'Parameter', w: 250 }, { t: 'Symbol', w: 130 }, { t: 'Min', w: 110, a: 'right' }, { t: 'Typ', w: 110, a: 'right' }, { t: 'Max', w: 110, a: 'right' }, { t: 'Unit', w: 90 }, { t: 'Note', w: 384 }], [
    ['Core supply', 'vccd1', '1.71', '1.8', '1.89', 'V', '±5%; logic, SRAM and the ADC'],
    ['I/O supply', 'vddio', '3.0', '3.3', '3.6', 'V', '3.3 V CMOS pad ring and ESD'],
    ['Core clock', 'CLK', '–', '50', '~55', 'MHz', 'fmax ~55–62 MHz post-route'],
    ['ADC input', 'VINP / VINN', '0', '–', '1.8', 'V', 'Differential, core domain'],
    ['Junction temp', 'TJ', '–', '25', '–', '°C', 'Range set at characterisation'],
  ], { rowH: 40, headH: 38 }),
  ...table(48, 430, 760, [{ t: 'Absolute maximum', w: 330 }, { t: 'Min', w: 120, a: 'right' }, { t: 'Max', w: 200, a: 'right' }, { t: 'Unit', w: 110 }], [
    ['Core supply vccd1', '−0.3', '1.95', 'V'],
    ['I/O supply vddio', '−0.3', '3.63', 'V'],
    ['Any digital pad', '−0.3', 'vddio + 0.3', 'V'],
    ['Analog pad', '−0.3', 'vccd1 + 0.3', 'V'],
    ['Storage temperature (target)', '−40', '125', '°C'],
  ], { rowH: 34, headH: 36 }),
  ...stack(836, 430, 396, [['Why every row is provisional', 'These are process nominals for this die’s supply domains. First-silicon characterisation replaces the section.', K.amber]])[0],
  srcLine('Source: DG32-LITE preliminary datasheet §4.1–4.2. Absolute maximums are process limits, pre-characterisation.'),
], { notes: notes(6) });

// 07 · Power
addSlide([
  ...hdr('07 · Power', 'All logic draws from one 1.8 V rail', 'Which rails are required, which are tie-offs, and the order they come up', 7),
  ...table(48, 172, 700, [{ t: 'Rail', w: 150 }, { t: 'Pins', w: 160 }, { t: 'Voltage', w: 110 }, { t: 'Role', w: 280 }], [
    ['vccd1', '49', '1.8 V', 'Logic, SRAM, ADC · required'],
    ['vddio', '17, 64', '3.3 V', 'Pad ring and ESD · required'],
    ['vccd', '18', '1.8 V', 'Wrapper core · required'],
    ['vdda', '30', '3.3 V', 'Analog, POR · required'],
    ['vdda1, vdda2', '9, 40, 47', '3.3 V', 'Unused · tie to 3.3 V'],
    ['vccd2', '63', '1.8 V', 'Unused · tie to 1.8 V'],
    ['Grounds', '8 pins + paddle', '0 V', 'Every vss pin and the paddle'],
  ], { rowH: 44, headH: 38, highlight: 0 }),
  tx('Every milliamp of dynamic and leakage current is drawn from vccd1.', 48, 540, 700, 30, { size: PX(12), bold: true, color: K.slate }),
  ...kpiS(780, 172, 452, 176, '~0.43 W', 'At 50 MHz', 'Tool estimate at 25 °C and 1.8 V, not measured', { numPt: 32 }),
  ...stack(780, 366, 452, [
    ['Sequencing', '3.3 V comes up before or together with 1.8 V.', K.teal],
    ['Why unused rails are tied', 'Nominal voltage keeps the pad ring’s protection structures biased.', K.paleBlue],
  ], 14)[0],
  srcLine('Source: DG32-LITE preliminary datasheet §4.3, §5 power supplies and sequencing.'),
], { notes: notes(7) });

// 08 · Clock and reset
addSlide([
  ...hdr('08 · Clock and reset', 'One clock pin, two resets and no PLL', 'The whole die runs from one clock as delivered; any reset input resets the core', 8),
  ...chain(48, 178, 1184, [
    ['CLK pin', '3.3 V CMOS, 50 MHz target', K.teal],
    ['No PLL', 'Clock used as delivered', K.teal],
    ['One domain', 'CPU and every peripheral', K.cyan],
  ]),
  ...chain(48, 326, 1184, [
    ['resetb', 'Active low, 3.3 V', K.teal],
    ['RST_N', 'Active low, external', K.teal],
    ['Power-on reset', 'From the wrapper', K.teal],
    ['Combined on die', 'Any one resets the core', K.cyan],
  ]),
  ...stack(48, 470, 578, [['Use either reset', 'Both are combined on the die; pull the unused input high.', K.cyan]])[0],
  ...stack(654, 470, 578, [['Measured ceiling', 'The lockstep core reaches ~55–62 MHz post-route, so 50 MHz is the target.', K.teal]])[0],
  srcLine('Source: DG32-LITE preliminary datasheet §6.1, §4.1.'),
], { notes: notes(8) });

// 09 · Boot
addSlide([
  ...hdr('09 · Boot', 'The ROM boots from flash or opens a monitor', 'Standalone boot: no management core, no external help', 9),
  ...chain(48, 178, 1184, [
    ['Banner', 'UART0 at 115,200 baud, 8N1', K.teal],
    ['Check header', 'Reads the flash image header', K.teal],
    ['Copy', 'Quad-SPI read into SRAM', K.teal],
    ['Run', 'Jumps to the copied image', K.cyan],
  ]),
  ...stack(48, 330, 578, [['Blank flash', 'A UART monitor with read, write, jump and info commands starts instead.', K.amber]])[0],
  ...stack(654, 330, 578, [['Code runs from SRAM', 'Nothing executes in place from external flash; executable code belongs in SRAM.', K.slate]])[0],
  ...kpiRow(48, 494, 1184, 146, [
    ['64 KB', 'Boot ROM', 'Runs with no external help', { numPt: 26 }],
    ['115,200', 'Console baud', 'Divider fixed for 50 MHz', { numPt: 26, color: TEAL_DARK }],
    ['Quad SPI', 'Flash read', 'Image copied into SRAM', { numPt: 26, color: TEAL_DARK }],
  ], 28),
  srcLine('Source: DG32-LITE preliminary datasheet §6.2 boot flow.'),
], { notes: notes(9) });

// 10 · Peripheral limits
addSlide([
  ...hdr('10 · Peripherals', 'Peripheral limits a firmware plan can rely on', 'Capability and timing per block, from the datasheet’s block notes', 10),
  ...table(48, 170, 1184, [{ t: 'Block', w: 210 }, { t: 'Limit', w: 400 }, { t: 'Note', w: 574 }], [
    ['UART × 2', '115,200 baud, 8N1 at 50 MHz', 'Writes wait while busy; a byte is never dropped'],
    ['SPI master', 'Up to 25 MHz', '0.64 µs per 16-bit word'],
    ['I²C master', '100 / 400 kHz, 7-bit addressing', 'Clock stretching; a 2-byte read takes ~72 µs at 400 kHz'],
    ['3-phase PWM', 'Dead-time up to 5.1 µs at 50 MHz', 'Hardware brake forces all six outputs off in ≤ 2 cycles'],
    ['DShot × 4', '16-bit frames with CRC4', 'All four channels share one bit-time counter'],
    ['Encoder + Hall', '4× quadrature, index, 3 Hall inputs', 'Edge timestamps give velocity at low speed'],
    ['SAR ADC', '8-bit differential, ~200 kSa/s', 'Trim taps unrouted: runs untrimmed on this silicon'],
    ['CORDIC', 'sin, cos, atan2, magnitude', '20 iterations, ~53–58 cycles per operation'],
    ['DMA', '~7.1 cycles per word moved', 'The CPU keeps bus priority'],
  ], { rowH: 44, headH: 38, highlight: 6 }),
  srcLine('Source: DG32-LITE preliminary datasheet §1 and §8 block notes (capabilities only, no register detail).'),
], { notes: notes(10) });

// 11 · Package and status
addSlide([
  ...hdr('11 · Package and status', 'The package is final; the pin map is preliminary', 'What a design can lock now, and what waits for first silicon', 11),
  ...kpiS(48, 172, 282, 160, '9 × 9 mm', 'QFN-64 body', '64 pins', { numPt: 26 }),
  ...kpiS(354, 172, 282, 160, '0.5 mm', 'Pitch', 'Standard QFN lead pitch', { numPt: 26, color: TEAL_DARK }),
  ...kpiS(48, 352, 282, 160, 'Ground', 'Exposed paddle', 'Solder to the ground plane', { numPt: 26, color: TEAL_DARK }),
  ...kpiS(354, 352, 282, 160, 'Pin 1', 'Upper left', 'Numbered counter-clockwise', { numPt: 26, color: TEAL_DARK }),
  ...stack(666, 172, 566, [
    ['Preliminary: pin map', 'Awaiting the foundry’s bond-diagram confirmation.', K.amber],
    ['Preliminary: electrical limits', 'Process nominals until first-silicon characterisation.', K.amber],
    ['Frozen: the control core', 'Closed for feature work until silicon test.', K.cyan],
  ], 14)[0],
  tx('130 nm CMOS  ·  QFN-64  ·  first silicon on the September 2026 multi-project shuttle', 48, 548, 1184, 26, { size: PX(12), bold: true, color: K.slate }),
  srcLine('Source: DG32-LITE preliminary datasheet §10 package and header notes.'),
], { notes: notes(11) });

// 12 · Close
closeSlide({
  kicker: '12 · CLOSE', title: 'Fixed now. Measured at first silicon.',
  body: 'Register maps, the memory map and board-level rules live in the engineering datasheet, not in this overview.',
  takeaways: [
    ['1 · Fixed: package and pins', 'QFN-64, 9 × 9 mm, with 44 signals in eleven groups and pin 1 upper left.', K.cyan],
    ['2 · Fixed: rails, clock, boot', 'A 1.8 V core, a 3.3 V I/O ring, one 50 MHz clock and self-boot from flash.', K.teal],
    ['3 · Measured next', 'Every electrical limit, and the final pin map, at first-silicon characterisation.', K.cyan],
  ],
  label: 'DEEPGRID SEMI  ·  DG32-LITE PRELIMINARY DATASHEET', page: 12, notes: notes(12),
});

await (await PresentationFile.exportPptx(P)).save(OUT);
await mkdir(PREVIEW_DIR, { recursive: true });
for (let i = 0; i < P.slides.count; i += 1) {
  const blob = await P.export({ format: 'png', slide: P.slides.getItem(i), scale: 1 });
  await writeFile(`${PREVIEW_DIR}/slide-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(await blob.arrayBuffer()));
}
console.log(`wrote ${OUT} · ${P.slides.count} slides`);
