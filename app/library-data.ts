// The DG32 packages the site links to: a client-ready deck and a narrated film per source document,
// plus a draw.io diagram and guide for the two architecture packages. Film timing comes from
// make_film.py (app/data/<slide dir>-film.json).
import liteFilm from './data/dg32-lite-film.json';
import domFilm from './data/dg32-2dom-film.json';
import liteDsFilm from './data/dg32-lite-datasheet-film.json';
import domDsFilm from './data/dg32-2dom-datasheet-film.json';
import tapeinFilm from './data/dg32-lite-tapein-film.json';

export type Chapter = { title: string; slides: number[]; start: number; end: number };
export type Segment = { slide: number; start: number; duration: number };
export type Pkg = {
  id: string; kind: 'architecture' | 'datasheet'; name: string; doc: string; headline: string; summary: string;
  deck: string; film: string; captions: string; poster: string; slideDir: string;
  diagram: string | null; drawio: string | null; guide: string | null;
  duration: number; chapters: Chapter[]; segments: Segment[];
  slides: string[]; sources: string[];
};

const media = (slug: string) => ({
  deck: `./downloads/${slug}.pptx`, film: `./media/${slug}.mp4`, captions: `./media/${slug}.vtt`, poster: `./media/${slug}-poster.jpg`,
});

export const packages: Pkg[] = [
  {
    id: 'lite', kind: 'architecture', name: 'DG32-LITE', doc: 'Architecture',
    headline: 'Lockstep safety on an entry-level motor chip',
    summary: 'The motor-control SoC: two lockstep RISC-V cores, a fixed-cost control loop in hardware, and a 44-signal QFN-64.',
    ...media('dg32-lite-architecture'), slideDir: './decks/dg32-lite',
    diagram: './diagrams/dg32-lite-architecture.svg', drawio: './downloads/dg32-lite-architecture.drawio', guide: './downloads/dg32-lite-architecture-guide.md',
    duration: liteFilm.duration, chapters: liteFilm.chapters, segments: liteFilm.segments,
    slides: [
      'Lockstep safety on an entry-level motor chip', 'One chip carries the MCU and its safety monitor',
      'A silent CPU fault can destroy a power bridge', 'Six block groups share one deterministic bus',
      'Four hard constraints shaped every block', 'Two cores must agree on every committed store',
      'The chip boots itself, even with blank flash', 'The expensive steps of the loop run in hardware',
      'One current loop costs about 300 hardware cycles', 'At 20 kHz, 88% of each period is left for firmware',
      'Only the lockstep core limits the clock', '44 signals and a hardware trip in 9 × 9 mm',
      'DG32-2DOM adds AI without slowing control', 'DG32 leads on safety and trails on analog',
      'The next spin closes the two largest gaps', 'Safety in the core. Control in silicon.',
    ],
    sources: [
      'DG32-LITE block architecture (design premises, block internals, loop budget, post-route fmax)',
      'DG32-LITE preliminary datasheet (pinout, supplies, boot, power estimate)',
      'DG32-LITE investor block diagram (applications, STM32G0 positioning, roadmap)',
      'DG32-LITE tape-in block diagram (checker timing, mirrored bus responses)',
      'DG32-2DOM preliminary datasheet (identical pinout)',
    ],
  },
  {
    id: '2dom', kind: 'architecture', name: 'DG32-2DOM', doc: 'Architecture',
    headline: 'Condition monitoring on the motor-control chip',
    summary: 'DG32-LITE plus an INT8 attention engine on its own 114 MHz clock, added behind bridges so the control core is untouched.',
    ...media('dg32-2dom-architecture'), slideDir: './decks/dg32-2dom',
    diagram: './diagrams/dg32-2dom-architecture.svg', drawio: './downloads/dg32-2dom-architecture.drawio', guide: './downloads/dg32-2dom-architecture-guide.md',
    duration: domFilm.duration, chapters: domFilm.chapters, segments: domFilm.segments,
    slides: [
      'Condition monitoring on the motor-control chip', 'DG32-2DOM adds an INT8 engine, not a new core',
      'Three findings forced a second clock domain', 'The engine sits beside the core, behind bridges',
      'Everything proven on DG32-LITE carries over', 'One kick computes a band of query rows',
      'INT4 rounded every weight to zero', 'Loading keys and values once cuts traffic 400×',
      'Rare crossings let a handshake replace a FIFO', 'One query row costs about 3,242 cycles',
      'Both clocks close timing on a larger die', 'The engine targets bearing faults in the drive',
      'AI in the drive. Control left untouched.',
    ],
    sources: [
      'DG32-2DOM block architecture (premises, attention engine, clock bridges, analytic cost, timing)',
      'DG32-2DOM preliminary datasheet (clocks, engine programming model, package)',
      'DG32-LITE investor block diagram (status, positioning, roadmap)',
    ],
  },
  {
    id: 'lite-datasheet', kind: 'datasheet', name: 'DG32-LITE', doc: 'Datasheet',
    headline: 'A lockstep motor MCU in a QFN-64 package',
    summary: 'The preliminary datasheet at overview level: pin groups and placement, electrical limits, power, clock, boot and peripheral limits.',
    ...media('dg32-lite-datasheet'), slideDir: './decks/dg32-lite-datasheet',
    diagram: null, drawio: null, guide: null,
    duration: liteDsFilm.duration, chapters: liteDsFilm.chapters, segments: liteDsFilm.segments,
    slides: [
      'A lockstep motor MCU in a QFN-64 package', 'Four facts set every DG32-LITE design-in',
      'Nine features, one self-booting safety SoC', '44 signal pins in eleven functional groups',
      'Each side of the package groups related signals', 'Every electrical limit is a nominal until silicon',
      'All logic draws from one 1.8 V rail', 'One clock pin, two resets and no PLL',
      'The ROM boots from flash or opens a monitor', 'Peripheral limits a firmware plan can rely on',
      'The package is final; the pin map is preliminary', 'Fixed now. Measured at first silicon.',
    ],
    sources: ['DG32-LITE preliminary datasheet (features, pinout, electrical, power, clock, reset, boot, block notes, package)'],
  },
  {
    id: '2dom-datasheet', kind: 'datasheet', name: 'DG32-2DOM', doc: 'Datasheet',
    headline: 'DG32-2DOM: DG32-LITE plus one engine',
    summary: 'What the DG32-2DOM preliminary datasheet adds (one attention engine on its own clock) and everything it leaves unchanged.',
    ...media('dg32-2dom-datasheet'), slideDir: './decks/dg32-2dom-datasheet',
    diagram: null, drawio: null, guide: null,
    duration: domDsFilm.duration, chapters: domDsFilm.chapters, segments: domDsFilm.segments,
    slides: [
      'DG32-2DOM: DG32-LITE plus one engine', 'Same pins, same rails, one added clock',
      'Five datasheet features are new in DG32-2DOM', 'Pins, rails and limits are unchanged',
      'The engine runs on its own 114 MHz clock', 'Firmware programs a kick in four steps',
      'Every engine limit is fixed in silicon', 'A DG32-LITE board takes DG32-2DOM unchanged',
      'One footprint. Two chips.',
    ],
    sources: ['DG32-2DOM preliminary datasheet (features, pinout, electrical, clocks, engine parameters, package)', 'DG32-LITE investor block diagram (status)'],
  },
  {
    id: 'lite-tapein', kind: 'datasheet', name: 'DG32-LITE', doc: 'Tape-in block diagram',
    headline: 'DG32-LITE as built for tape-in',
    summary: 'The tape-in block diagram, block by block: clock and reset, lockstep, fetch and bus, 18 blocks, the 44-pad plan, scan test and four sign-off gates.',
    ...media('dg32-lite-tapein'), slideDir: './decks/dg32-lite-tapein',
    diagram: null, drawio: null, guide: null,
    duration: tapeinFilm.duration, chapters: tapeinFilm.chapters, segments: tapeinFilm.segments,
    slides: [
      'DG32-LITE as built for tape-in', 'One clock, 44 pads, and four gates before tape-in',
      'One clock and one reset drive the whole block', 'The checker trails MAIN and sees its bus responses',
      'Code runs from SRAM through a dedicated fetch port', 'One requester at a time, and no access hangs',
      'Eighteen blocks sit around the bus', 'Every one of the 44 wrapper pads has a job',
      'Production test reaches 13 scan chains via JTAG', 'Four gates must all pass before tape-in',
      'Built to be checked, not assumed.',
    ],
    sources: ['DG32-LITE tape-in block diagram (state 2026-09-10)', 'DG32-LITE investor block diagram (debug roadmap)'],
  },
];

export const pkgById = (id: string) => packages.find(p => p.id === id);
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
