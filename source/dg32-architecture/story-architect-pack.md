# DG32-LITE architecture — story pack

Upstream of the client-ready deck and the narrated films. Sources: the five DG32 documents
(investor block diagram, tape-in block diagram, block architecture, LITE and 2DOM preliminary
datasheets) via `dg32-lite-architecture.md`. Publication level: investor (public site), so no
register maps, magic values, internal names or open review items.

**Storyline source (Rule 0).** No reference deck was supplied. The spine follows the block
architecture document's own order — design premises → top-level diagram → block internals →
performance and loop budget — bracketed by an executive summary up front and the investor
sheet's positioning and roadmap at the end.

## 1. BLUF

DG32-LITE puts hardware lockstep safety on an entry-level motor-control chip: two RISC-V cores
must agree on every write, the control loop runs in dedicated hardware at a fixed cost, and
first silicon on the September 2026 shuttle will measure what simulation predicts.

## 2. Audience decision

Motor-drive engineers and investors should believe the architecture is sound enough to evaluate
on first silicon, and treat the analog, flash and connectivity gaps as the roadmap, not surprises.

## 3. Tension

A silent CPU fault in a motor drive writes a wrong PWM edge, and a wrong edge can destroy a
bridge. Entry-level motor MCUs catch faults only periodically, in software; hardware lockstep has
been confined to automotive-class parts. Without a cheaper hardware option, safety-relevant drives
either over-buy silicon or accept the gap.

## 4. Argument arc

1. **Context** — what DG32-LITE is and the one-slide answer (slides 1–2).
2. **Tension** — why a silent fault matters in a power stage (3).
3. **Proof: structure** — six block groups on one bus, shaped by four hard constraints (4–5).
4. **Proof: safety** — lockstep chain, fault latch, hardware trip; self-sufficient boot (6–7).
5. **Proof: control** — dedicated signal chain, fixed loop cost, headroom by rate, timing (8–11).
6. **Implication** — package and the compute variant (12–13).
7. **Judgment** — honest comparison with the incumbent and the roadmap that closes the gaps (14–15).
8. **Action** — takeaways and what is not yet claimed (16).

## 5. Slide spine

| # | Title (assertion) | Role | Evidence | Visual treatment | Takeaway |
|---|---|---|---|---|---|
| 1 | Lockstep safety on an entry-level motor chip | Cover | investor sheet header; datasheet package | Dark L01; native QFN package motif; 4 proof KPIs | What this is, and that it is pre-silicon |
| 2 | One chip carries the MCU and its safety monitor | Exec summary | investor sheet; architecture §5 | L02: dark thesis panel + 2×2 KPI grid | The whole answer on one slide |
| 3 | A silent CPU fault can destroy a power bridge | Tension | architecture §4.1 rationale; investor p2 | L04 fault chain + 3 evidence cards | Why hardware lockstep matters |
| 4 | Six block groups share one deterministic bus | Architecture overview | block diagrams | L07 native block map + 4 bus facts | The system in one picture |
| 5 | Four hard constraints shaped every block | Design premises | architecture §2 | Constraint table, 4 rows | The shape follows from facts |
| 6 | Two cores must agree on every committed store | Safety deep dive | architecture §4.1, §4.4, §4.5 | Dark L08 chain + 3 cards | Fault → latch → hardware trip |
| 7 | The chip boots itself, even with blank flash | Boot path | architecture §4.2; datasheet §6.2 | L04 chain + fallback card + trade-off | No management core needed |
| 8 | The expensive steps of the loop run in hardware | Control signal chain | architecture §4.12–4.16, §5.1 | 6-node native chain + CPU callout | CPU keeps only the regulators |
| 9 | One current loop costs about 300 hardware cycles | Loop cost | architecture §5.1 | Cost table + to-scale proportion bar at 20 kHz | Fixed, known cost |
| 10 | At 20 kHz, 88% of each period is left for firmware | Headroom | architecture §5.2 | Vertical shape bars + what-fits cards | What firmware fits per rate |
| 11 | Only the lockstep core limits the clock | Timing | architecture §5.3 | Horizontal shape bars with 50 MHz marker | Peripherals are never the wall |
| 12 | 44 signals and a hardware trip in 9 × 9 mm | Package | datasheet §2–3, §10 | Pin-group table + package KPIs | Board-level integration |
| 13 | DG32-2DOM adds AI without slowing control | Variant | 2DOM datasheet §1, §6 | Two-domain native diagram + 4 cards | Condition monitoring, same footprint |
| 14 | DG32 leads on safety and trails on analog | Positioning | investor p2 | Comparison table, DG32 column highlighted | Honest win and limitation |
| 15 | The next spin closes the two largest gaps | Roadmap | investor p2 roadmap | Milestone rail + not-claimed card | Order of gap closure |
| 16 | Safety in the core, control in silicon | Close | synthesis of 2–15 | Dark L14: 3 takeaways + next-step band | What to remember and what's next |

## 6. Evidence map

**Direct evidence (source documents):** lockstep pair, 2-cycle checker, committed-store compare,
39-cycle inject latency; 64 KB ROM, 32 KB dual-port SRAM, boot sequence and UART monitor; PWM,
brake ≤2 cycles, DShot × 4; ADC 8-bit ~200 kSa/s, 177-cycle conversion; CORDIC 53–58 cycles;
~8 cycles per instruction; ~300-cycle fixed loop cost and the 10/20/50 kHz budget table; ~5 µs +
~5 µs ≈ 100 kHz loop; per-block post-route fmax; QFN-64 9 × 9 mm, 44 signal pins; ~0.43 W
estimate; 2DOM 114 MHz domain, bit-exact, 400 keys, timing closed; STM32G0 comparison rows and
roadmap.

**Fair synthesis:** 100 kHz budget row (500 cycles − 300 = ~200); 12% hardware share at 20 kHz
(300 / 2,500); pin-group counts summed to 44 from the pin table.

**Interpretation (kept soft or in notes):** "entry-level tier" positioning (the investor sheet's
own framing); "no functional-safety certification is claimed" (a statement about this deck, not
the product's future).

## 7. Content cuts

- Register maps, memory-map addresses, boot magic numbers, injection keys: confidential datasheet detail.
- Internal names, repositories, sign-off run history, open review items A–G: internal.
- Competitor prices or price multiples: banned claim class; the positioning argues capability only.
- Foundry, shuttle program and harness names: not needed for the argument.
- Negative timing slack and die-area figures: internal closure detail with no reader decision attached.

## 8. Rebuild instructions (for the deck builder)

- artifact-tool JSX with `deck-kit.mjs` primitives plus `kit-spec.mjs` type correction; cards `'auto'`.
- Titles ≤ 52 characters so they hold one line at full size; subtitles ≤ 105 characters.
- Dark slides: 1, 6, 16 (plus the dark thesis panel on 2). Everything else white.
- Every figure group carries the pre-silicon qualifier in a subtitle, card or source line.
- Speaker notes carry the narration below verbatim, so the deck and the films say the same thing.
- Architecture and flows are native shapes; no placed images in the deck.

## 9. Narration (speaker notes and film voiceover)

Chapters for the short films: **Why lockstep** (1–3) · **Inside the architecture** (4–8) ·
**The control-loop budget** (9–11) · **Package, variant and roadmap** (12–16).

1. DG32-LITE is Deepgrid Semi's motor-control chip, and it makes one argument: hardware lockstep safety no longer needs an automotive-class microcontroller. Two RISC-V cores check each other on every write, inside a nine-by-nine millimetre package. First silicon rides the September 2026 multi-project shuttle, so every figure you will see is a design value, verified in simulation and timing analysis.
2. Here is the whole story on one slide. One 130 nanometre chip carries the microcontroller, the motor-control peripherals and a hardware safety monitor. The two cores run in lockstep. The current loop reaches about one hundred kilohertz in simulation, and a CPU disagreement latches within thirty-nine cycles and drives a fault pin that can switch the power bridge off.
3. Why build it this way? A motor drive switches power transistors thousands of times a second. If the CPU silently computes a wrong value, it writes a wrong PWM edge, and a wrong edge can short a bridge leg. Entry-level motor MCUs catch faults with watchdogs and periodic software self-test. Hardware lockstep has lived in automotive parts such as AURIX, S32K and Hercules.
4. DG32-LITE is six block groups on one bus. The safety core, memory and supervision sit above it; motor drive, sensing, connectivity and test sit below. The bus has two masters, the CPU and a DMA, with deterministic latency. Any address that is unmapped or disabled answers with a bus error instead of hanging, which matters on a chip with no debugger halt.
5. Four hard constraints shaped every block. There is no debugger halt, so nothing may hang. The lockstep core tops out around fifty-five to sixty-two megahertz, so the die runs at fifty. The core costs about eight clock cycles per instruction, so the loop moves into hardware. And the memory macros have no spare bits, so the chip ships without ECC, and says so.
6. This is the safety core. MAIN runs the application. CHECKER runs the same instructions two cycles later, on the same inputs, and the comparator checks every committed store. On a mismatch, the first cause is latched and FAULT_N goes low. Route that pin to the gate-driver enable, and the bridge turns off in hardware, without waiting for firmware.
7. The chip boots itself. At power-on the mask ROM prints a banner, validates the flash image header, copies the application from external QSPI flash into SRAM, and jumps to it. If the flash is blank, the ROM starts a UART monitor instead, so a bare board can still be inspected. The trade-off is loading at boot instead of executing in place.
8. Every expensive step of field-oriented control runs in a dedicated block. Encoder and Hall inputs give position, with edge timestamps. The PWM fires the ADC at the centre of each period, where ripple is lowest. The CORDIC computes the Park transforms, the CPU runs only the two PI regulators, and the PWM block applies the new duty cycles, with a hardware brake behind it.
9. Here is what one loop costs. The current sample takes one hundred seventy-seven cycles. Each CORDIC operation takes fifty-three to fifty-eight. The regulators cost about eight cycles per instruction. Together the hardware part is about three hundred cycles, and it is the same at every loop rate. At twenty kilohertz, that is twelve percent of the period.
10. So the question becomes how much firmware fits. At ten kilohertz there are about forty-seven hundred cycles left: enough for a full current and speed loop with an observer. At twenty kilohertz, twenty-two hundred, enough for field-weakening. At fifty kilohertz, seven hundred, an inner current loop only. The simulated ceiling is about one hundred kilohertz.
11. Timing tells the same story. After place-and-route, the GPIO, DShot, QSPI and PWM blocks all run above one hundred sixty-five megahertz, and CORDIC and the supervisor above ninety. Only the lockstep core, at fifty-five to sixty-two megahertz, sets the clock. No peripheral is ever the timing wall.
12. All of this fits in a nine-by-nine millimetre QFN with sixty-four pins: forty-four signals, and the rest supplies and ground. Seven pins drive the bridge, six read position, two carry the analog current input, and one, FAULT_N, is the hardware trip. The compute variant, DG32-2DOM, uses exactly the same pinout.
13. DG32-2DOM keeps everything in DG32-LITE and adds an INT8 attention engine on its own one hundred fourteen megahertz clock. It reaches memory through clock-domain-crossing bridges, so it never stalls the fifty megahertz control core. Its output is bit-exact to the software model, and timing closes at both clocks. It is designed for bearing-fault and anomaly detection inside the drive.
14. Against the STM32G0, the entry-level incumbent, the comparison is honest. DG32 leads on hardware lockstep, native DShot, hardware CORDIC and the on-chip AI variant, with an open RISC-V core. The G0 leads clearly on its twelve-bit multi-channel ADC, embedded flash, USB and CAN-FD, and on production maturity.
15. The roadmap closes those gaps in order. First silicon on the September 2026 shuttle measures what simulation predicted. The second spin adds a twelve-bit multi-channel ADC and embedded flash. Then come CAN-FD and interactive CPU debug. DG32-2DOM runs in parallel, with its design complete and in physical trials.
16. Three things to take away. Safety is in the core: two CPUs must agree, in hardware. Control is in silicon: the loop cost is fixed and known. And the next milestone is measurement: first silicon turns these design values into measured ones. This deck claims no measured silicon results and no functional-safety certification yet.

## Quality gate

- Each slide has a reason to exist: yes — every row maps to one beat and one proof object.
- Readable without the raw source: yes — the architecture doc and narration stand alone.
- Examples specific: cycle counts, fmax values, pin counts, loop rates.
- Clear next action: evaluate on first silicon; watch the second-spin gap closure.
- Unsupported claims, internal terms, timestamps: scanned against the cuts list above.
