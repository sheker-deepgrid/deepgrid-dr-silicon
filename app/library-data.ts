// The architecture packages the site links to: client-ready deck, narrated film, draw.io diagram
// and architecture guide per chip. Film timing comes from make_film.py (app/data/*-film.json).
import liteFilm from './data/dg32-lite-film.json';
import domFilm from './data/dg32-2dom-film.json';

export type Chapter = { title: string; slides: number[]; start: number; end: number };
export type Segment = { slide: number; start: number; duration: number };
export type Pkg = {
  id: string; name: string; headline: string; summary: string;
  deck: string; film: string; captions: string; poster: string;
  diagram: string; drawio: string; guide: string; slideDir: string;
  duration: number; chapters: Chapter[]; segments: Segment[];
  slides: string[]; sources: string[];
};

export const packages: Pkg[] = [
  {
    id: 'lite',
    name: 'DG32-LITE',
    headline: 'Lockstep safety on an entry-level motor chip',
    summary: 'The motor-control SoC: two lockstep RISC-V cores, a fixed-cost control loop in hardware, and a 44-signal QFN-64.',
    deck: './downloads/dg32-lite-architecture.pptx',
    film: './media/dg32-lite-architecture.mp4',
    captions: './media/dg32-lite-architecture.vtt',
    poster: './media/dg32-lite-architecture-poster.jpg',
    diagram: './diagrams/dg32-lite-architecture.svg',
    drawio: './downloads/dg32-lite-architecture.drawio',
    guide: './downloads/dg32-lite-architecture-guide.md',
    slideDir: './decks/dg32-lite',
    duration: liteFilm.duration, chapters: liteFilm.chapters, segments: liteFilm.segments,
    slides: [
      'Lockstep safety on an entry-level motor chip', 'One chip carries the MCU and its safety monitor',
      'A silent CPU fault can destroy a power bridge', 'Six block groups share one deterministic bus',
      'Four hard constraints shaped every block', 'Two cores must agree on every committed store',
      'The chip boots itself, even with blank flash', 'The expensive steps of the loop run in hardware',
      'One current loop costs about 300 hardware cycles', 'At 20 kHz, 88% of each period is left for firmware',
      'Only the lockstep core limits the clock', '44 signals and a hardware trip in 9 × 9 mm',
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
    id: '2dom',
    name: 'DG32-2DOM',
    headline: 'Condition monitoring on the motor-control chip',
    summary: 'DG32-LITE plus an INT8 attention engine on its own 114 MHz clock, added behind bridges so the control core is untouched.',
    deck: './downloads/dg32-2dom-architecture.pptx',
    film: './media/dg32-2dom-architecture.mp4',
    captions: './media/dg32-2dom-architecture.vtt',
    poster: './media/dg32-2dom-architecture-poster.jpg',
    diagram: './diagrams/dg32-2dom-architecture.svg',
    drawio: './downloads/dg32-2dom-architecture.drawio',
    guide: './downloads/dg32-2dom-architecture-guide.md',
    slideDir: './decks/dg32-2dom',
    duration: domFilm.duration, chapters: domFilm.chapters, segments: domFilm.segments,
    slides: [
      'Condition monitoring on the motor-control chip', 'DG32-2DOM adds an INT8 engine, not a new core',
      'Three findings forced a second clock domain', 'The engine sits beside the core, behind bridges',
      'Everything proven on DG32-LITE carries over', 'One kick computes a band of query rows',
      'INT4 rounded every weight to zero', 'Loading keys and values once cuts traffic 400×',
      'Rare crossings let a handshake replace a FIFO', 'One query row costs about 3,242 cycles',
      'Both clocks close timing on a larger die', 'The engine targets bearing faults in the drive',
      'AI in the drive. Control left untouched.',
    ],
    sources: [
      'DG32-2DOM block architecture (premises, attention engine, clock bridges, analytic cost, timing)',
      'DG32-2DOM preliminary datasheet (clocks, engine programming model, package)',
      'DG32-LITE investor block diagram (status, positioning, roadmap)',
    ],
  },
];

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
