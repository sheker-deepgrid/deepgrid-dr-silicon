// Detailed, investor-level explanation behind every section. Sources: the two block-architecture
// documents, both preliminary datasheets, the investor and tape-in block diagrams (see README.md).
// Excluded on purpose: register maps and addresses, boot magic values, board-design rules, internal
// module, people and shuttle names, open review items and negative slack. Edit here, not in the views.

export type Explained = {name: string; what: string; why: string; points?: string[]};
export type Step = [title: string, detail: string];

// ---------- Overview ----------

export const faultPath: Step[] = [
  ['A datapath fault', 'A transient or permanent error changes a value the MAIN core is about to commit.'],
  ['CHECKER disagrees', 'CHECKER runs the same instructions two cycles later on mirrored inputs and bus responses, so it commits the correct value.'],
  ['The comparator flags it', 'Every committed store is compared. The first mismatch is caught on that store, not at the next software self-test.'],
  ['The first cause is latched', 'A sticky fault latch holds the first cause, because later faults are usually its consequences. Firmware can read it after the fact.'],
  ['The bridge turns off', 'FAULT_N goes low within 39 cycles of an injected fault in simulation. Wired to the gate-driver enable, it stops the bridge without waiting for firmware.'],
];

export const evidenceLadder: {kind: string; means: string; examples: string}[] = [
  {kind: 'Simulated', means: 'Measured in simulation of the design as built', examples: 'Loop stage costs, ~100 kHz closed loop, 39-cycle fault-to-latch, lockstep under interrupts'},
  {kind: 'Post-route', means: 'Static timing on the placed-and-routed hardened design', examples: 'Per-block fmax, lockstep core ~55–62 MHz, DG32-2DOM slack at 50 and 114 MHz'},
  {kind: 'Analytic', means: 'Derived from the architecture, not yet run on a bench', examples: 'DG32-2DOM cost of ~3,242 cycles per query row'},
  {kind: 'Tool estimate', means: 'A vectorless power estimate from the implementation tools', examples: '~0.43 W at 50 MHz, 25 °C, 1.8 V'},
  {kind: 'Process nominal', means: 'The 130 nm process limits for each supply domain', examples: 'Operating and absolute-maximum voltages'},
];

export const notClaimed = [
  'No measured silicon results: first silicon is on the September 2026 multi-project shuttle and bring-up has not started.',
  'No functional-safety certification. Hardware lockstep is a mechanism, not a certificate.',
  'No sign-off result for the tape-in die: the four gates it must pass are listed, not reported as passed.',
  'No price or cost claims against any competitor.',
];

// ---------- Product family ----------

export const familyCompare: [row: string, lite: string, dom: string][] = [
  ['Control core', 'Two RV32IM cores in hardware lockstep', 'Identical, frozen and unchanged'],
  ['Boot and memory', '64 KB boot ROM, 32 KB dual-port SRAM, external QSPI flash', 'Identical'],
  ['Motor and sensing', 'PWM with brake, 4 × DShot, encoder and Hall, SAR ADC, CORDIC', 'Identical'],
  ['Connectivity', '2 × UART, SPI, I²C, GPIO, JTAG and scan', 'Identical'],
  ['Control-loop budget', '~300 hardware cycles per loop; ~100 kHz simulated ceiling', 'Identical; the engine cannot extend it'],
  ['Clocks', 'One 50 MHz domain', '50 MHz control domain plus a 114 MHz compute domain'],
  ['On-chip compute', 'None', 'INT8 attention engine, bit-exact to the software model'],
  ['Package and pinout', 'QFN-64, 9 × 9 mm, 44 signal pins', 'Identical; the engine adds no pads'],
  ['Supplies', '1.8 V core, 3.3 V I/O', 'Identical'],
  ['Power estimate', '~0.43 W at 50 MHz (tool estimate)', 'Same figure stated; no separate engine figure yet'],
  ['Die', '2.9 × 4.5 mm core block', 'Its own 3.4 × 4.5 mm die'],
  ['Status', 'First silicon, September 2026 shuttle', 'Design complete, in physical trials'],
];

export const operating: [param: string, min: string, typ: string, max: string, note: string][] = [
  ['Core supply', '1.71 V', '1.8 V', '1.89 V', '±5%; powers all logic, SRAM and the ADC'],
  ['I/O supply', '3.0 V', '3.3 V', '3.6 V', '3.3 V CMOS pad ring'],
  ['Core clock', '–', '50 MHz', '~55 MHz', 'Lockstep core reaches ~55–62 MHz post-route'],
  ['ADC input', '0 V', '–', '1.8 V', 'Differential, core-supply domain'],
  ['Junction temperature', '–', '25 °C', '–', 'Range set at characterisation'],
];

export const absoluteMax: [param: string, min: string, max: string][] = [
  ['Core supply', '−0.3 V', '1.95 V'],
  ['I/O supply', '−0.3 V', '3.63 V'],
  ['Any digital pad', '−0.3 V', 'I/O supply + 0.3 V'],
  ['Analog pad', '−0.3 V', 'core supply + 0.3 V'],
  ['Storage temperature', '−40 °C', '125 °C (target)'],
];

// ---------- Architecture: DG32-LITE ----------

export const litePremises: [constraint: string, meaning: string, response: string][] = [
  ['No debugger halt on the die', 'Nothing outside the chip can stop or inspect a hung CPU, and there is no management core to rescue it.', 'Every bad access returns a bus error instead of hanging; blank flash starts a UART monitor; the watchdog catches hangs and runaways.'],
  ['Lockstep core fmax ~55–62 MHz', 'The CPU pair is the slowest block on the die; every peripheral hardens above 90 MHz.', 'The whole die runs one 50 MHz clock domain, with margin under the core’s ceiling.'],
  ['~8 clock cycles per instruction', 'The core fetches every instruction over the bus, so control maths in plain C is slow: an int8 multiply-accumulate took 54 cycles, not the ~6 a cached core gives.', 'Sampling, the Park transforms and PWM edges move into dedicated blocks; the CPU keeps only the PI regulators.'],
  ['Memory macros have no spare bits', 'There is no room for parity or ECC in the 130 nm SRAM macros.', 'The chip ships without memory ECC and says so. The idle second read port becomes a feed for a DMA or accelerator.'],
];

export const liteDecisions: Explained[] = [
  {name: 'Freeze the control core', what: 'The lockstep pair, its boot path and the bus decode are closed until silicon test.', why: 'It is hardened, gate-level clean and simulated end to end. Reopening it for features risks the one part that must be right on a shuttle with no respin.'},
  {name: 'Give fetch its own path', what: 'Instruction fetch reads a private boot ROM and SRAM port; the shared bus carries only data.', why: 'Separating fetch from data traffic removes a whole class of arbitration bugs instead of patching them, and data traffic can never stall execution.'},
  {name: 'Error slave, not dead decode', what: 'Unmapped or clock-gated addresses complete with a bus error.', why: 'With no debugger and no halt, a hung bus would brick the chip. Firmware has to see a bad access and survive it.'},
  {name: 'Share the motor pads', what: 'DShot is multiplexed onto the PWM output pads and selected at boot.', why: 'An output is either a complementary PWM leg or a DShot line, never both. Duplicating pads would spend package pins for no added capability.'},
];

// Members of the six block groups, in the order the 3D die model indexes its regions.
export const groupMembers: Explained[][] = [
  [
    {name: 'Lockstep CPU pair', what: 'MAIN runs the application; CHECKER runs the same instructions two cycles later on mirrored inputs and bus responses.', why: 'Two cores that must agree bit for bit turn a silent datapath fault into an observable one. Mirroring the bus responses means firmware can branch on peripheral reads without the cores diverging.'},
    {name: 'Comparator and fault latch', what: 'Compares every committed store; the first mismatch sets a sticky latch with its cause and drives FAULT_N.', why: 'Comparing on the store gives a signature that does not depend on external timing, and the first cause is the diagnostic one. A locked injection register lets firmware fire the path on purpose, the only way to prove it on real silicon.'},
    {name: 'Supervisor and windowed watchdog', what: 'Two supply-good inputs with deglitching and reset sequencing, plus a watchdog that faults on a kick that is too early or too late.', why: 'A window catches runaway code as well as a hang. It arms only when firmware enables it, so it can never hold the chip in reset on a cold boot.'},
  ],
  [
    {name: 'Boot ROM', what: '64 KB of mask-programmed logic that prints a banner, checks the flash image, copies it into SRAM and jumps to it.', why: 'The die has no management core, so the ROM is the entire boot path. Built as logic rather than a memory macro, deepening it was measured as effectively free.'},
    {name: 'Dual-port SRAM', what: '32 KB on 16 macros: one port for CPU and DMA data, the other dedicated to instruction fetch.', why: 'Fetch never waits on data traffic. The spare read ports are also the natural contention-free feed for a DMA or accelerator.'},
    {name: 'QSPI controller', what: 'Maps external NOR flash and PSRAM into memory as a data window.', why: 'Keeping the die flash-less keeps the 130 nm process simple. The cost is loading code at boot instead of executing in place; embedded flash is on the roadmap.'},
  ],
  [
    {name: '3-phase PWM', what: 'Centre-aligned complementary outputs on six gate pins, programmable dead-time up to 5.1 µs, shadow duty registers and an ADC sample trigger.', why: 'Symmetric edges put the sampling instant at the current-ripple null. The hardware brake forces all six outputs off within two cycles and latches, because a firmware brake is only as fast as the loop.'},
    {name: 'DShot × 4', what: 'Encodes digital ESC frames for four channels onto the PWM pads.', why: 'Drones and eVTOL actuators speak DShot; generating it in hardware removes a bit-banging timing hazard from firmware.'},
    {name: 'Timers × 2', what: 'Two 32-bit timers with compare interrupts.', why: 'One is usually the RTOS tick; the other is free for a control-loop period or a one-shot without contention.'},
  ],
  [
    {name: 'Encoder and Hall decode', what: 'Quadrature A/B/Z with index and three Hall inputs, with edge timestamps.', why: 'At low speed a fixed-window count is coarse. Time between edges gives the velocity a smooth low-speed FOC loop needs.'},
    {name: 'SAR ADC', what: '8-bit differential converter at ~200 kSa/s, fired by the PWM.', why: 'An external SPI ADC read costs ~1.9 µs of a ~5 µs loop, its largest single cost. On-die it is a start pulse and a poll.'},
    {name: 'CORDIC', what: 'sin/cos, atan2 and magnitude in a fixed 53–58 cycles per operation.', why: 'Park and Clarke transforms need trigonometry every tick; a software call would dominate the loop. Fixed latency makes the transform a known cost.'},
  ],
  [
    {name: 'UART × 2', what: 'UART0 carries the boot banner and console; UART1 is free for telemetry.', why: 'Firmware can stream telemetry to a companion without taking over the console. Writes wait while busy, so a byte is never dropped.'},
    {name: 'SPI master', what: 'Up to 25 MHz, all four modes, 0.64 µs per 16-bit word.', why: 'Sensors, an external DAC or a radio are SPI; anything exotic is a firmware sequence, not silicon.'},
    {name: 'I²C master', what: '7-bit addressing at 100 or 400 kHz with clock stretching and true open-drain pads.', why: 'I²C is defined open-drain; doing it in the pad avoids a bit-banged implementation and its timing hazards.'},
    {name: 'GPIO', what: 'General-purpose pins with synchronised inputs and separate set and clear registers.', why: 'A read-modify-write races an interrupt handler touching another pin; atomic set and clear make single-pin control safe.'},
  ],
  [
    {name: 'On-chip bus and error slave', what: 'A lightweight AXI-style bus: two masters (CPU first, then DMA), one transaction at a time, every peripheral a 32-bit register slave.', why: 'Deterministic latency keeps the loop budget honest, and the error slave answers every unmapped or gated address so nothing hangs.'},
    {name: 'Interrupt controller', what: '16 sources plus a software interrupt, delivered identically to both cores.', why: 'Added once bring-up showed a purely polled die wastes the tick and makes encoder capture and ADC-done awkward.'},
    {name: 'DMA', what: 'A second bus master that moves memory blocks without CPU copy loops.', why: 'Bulk buffering would otherwise burn the cycles the regulators need.'},
    {name: 'System control', what: 'Part ID, pin multiplexing and eight software clock gates for idle peripherals.', why: 'Unused blocks stop toggling; test mode forces every gate open so production scan reaches them.'},
    {name: 'Test access', what: 'A JTAG port reaching 13 internal scan chains for production test.', why: 'Every manufactured part needs a structural test. Interactive CPU debug over JTAG is a roadmap item.'},
  ],
];

export const liteFlows: {title: string; lead: string; steps: Step[]}[] = [
  {title: 'One current-control loop', lead: 'About 300 hardware cycles, the same at every loop rate.', steps: [
    ['Sample trigger', 'The PWM period centre fires the ADC, where current ripple is lowest.'],
    ['Convert', 'The SAR ADC converts the phase current: 177 cycles.'],
    ['Transform', 'CORDIC runs the Clarke/Park transform with the encoder angle: 53–58 cycles per operation.'],
    ['Regulate', 'The CPU runs the d and q PI regulators in plain C at ~8 cycles per instruction.'],
    ['Rotate back', 'CORDIC runs the inverse Park rotation.'],
    ['Update', 'New duty cycles load into the PWM shadow registers at the next period boundary.'],
  ]},
  {title: 'Power-on boot', lead: 'No management core and no debugger: the ROM is the whole path.', steps: [
    ['Banner', 'The ROM prints a boot banner on UART0.'],
    ['Validate', 'It reads and checks the image header in external QSPI flash.'],
    ['Load', 'It copies the application into SRAM.'],
    ['Run', 'It jumps to SRAM; the application installs its trap handler and enables interrupts.'],
    ['Fallback', 'With no valid image, a UART monitor starts so a bare board can still be read, written and started.'],
  ]},
];

export const isolationInvariant = 'The frozen control core touches only its own fetch path, the decoded peripheral bus and the fault path. No peripheral transaction can extend the core’s worst-case execution time except through the bus it already masters.';

// ---------- Architecture: DG32-2DOM ----------

export const domPremises: [finding: string, meaning: string, response: string][] = [
  ['Lockstep core fmax ~55–62 MHz', 'Raising the whole die clock would break the frozen core’s timing closure.', 'The control domain stays at 50 MHz.'],
  ['The engine is the throughput consumer', 'Attention maths needs more speed than the control domain can give.', 'The engine runs on its own 114 MHz clock behind bridges.'],
  ['Engine memory congested the shared floorplan', 'Adding its buffers to the DG32-LITE slot made routing time out.', 'DG32-2DOM gets its own 3.4 × 4.5 mm die.'],
  ['INT4 output came out identically zero', 'With ~400 near-uniform keys each softmax weight is ~1/400, which INT4 rounds to zero.', 'Weights stay 15-bit through a 40-bit numerator; only the final output is saturated to INT8.'],
];

export const enginePipeline: Step[] = [
  ['Program', 'Firmware writes the job’s shapes over the programming port: buffer locations, rows, keys and head sizes.'],
  ['Multiply', 'A shared 16-lane multiply array computes Q·Kᵀ for the row.'],
  ['Weight', 'The row maximum indexes a 256-entry table of 15-bit softmax weights.'],
  ['Combine', 'The weighted sum of values is formed and divided once per row by a 48-step restoring divide.'],
  ['Requantise', 'The result saturates to INT8; an overflow is latched and reported.'],
  ['Write back', 'The output goes to memory, and a done interrupt reaches both cores.'],
];

export const engineParts: Explained[] = [
  {name: 'Key and value buffers', what: 'Keys and values sit in SRAM macros beside the engine, loaded once per kick and re-read for every query row.', why: 'Resident buffers keep one attention head near 1% bus occupancy. Streaming values per row would be ~400 times that and make the engine fight the rest of the die for memory.', points: ['A later kick can skip the load and reuse keys, values and the weight table.', 'A DMA and the SRAM’s idle read port can feed the engine without the CPU.']},
  {name: 'Shared datapath', what: 'One multiply array serves both the key pass and the value pass; a 40-bit numerator holds every weighted sum.', why: 'Sharing keeps the engine small. A 32-bit numerator breaks at 512 keys; 40 bits stays exact to 131,072, so the output is bit-exact to the software model for any geometry the engine accepts.'},
  {name: 'Clock-domain bridges', what: 'Three bridges carry traffic between 50 MHz and 114 MHz with a four-phase request/acknowledge handshake through two-flop synchronisers.', why: 'Crossings are rare (keys and values load once, outputs write back once), so a small, provably safe handshake beats a FIFO with gray-coded pointers.', points: ['Lite bridge: programming, one transaction at a time.', 'Burst read bridge: a whole read burst in one crossing.', 'Burst write bridge: a whole write burst in one crossing.']},
];

export const engineCost: [term: string, scales: string, cycles: number][] = [
  ['Value pass', 'keys × value size ÷ lanes', 1600],
  ['Key pass', 'keys × key size ÷ lanes', 800],
  ['Requantise', '11 × value size', 704],
  ['Write back and drain', 'remainder', 90],
  ['Divide', '48-step restoring', 48],
];

export const engineLimits: [param: string, range: string, note: string][] = [
  ['Query rows per kick', '1 – 65,535', 'A band of rows of one attention head'],
  ['Keys per head', '1 – 400', 'Set when the die was built'],
  ['Key size', 'up to 32 bytes', 'A multiple of the lane count and of 4'],
  ['Value size', 'up to 64 bytes', 'A multiple of the lane count and of 4'],
  ['Multiply lanes', '16', 'Width of the shared multiply array'],
  ['Weight table', '256 entries, 15-bit', 'Softmax weights are never quantised'],
  ['Numerator', '40-bit', 'Exact to 131,072 keys'],
];

export const domFlows: {title: string; lead: string; steps: Step[]}[] = [
  {title: 'One attention kick', lead: 'Firmware starts it and waits; the engine does the rest on its own clock.', steps: [
    ['Program', 'Firmware on the lockstep CPU writes the geometry through the lite bridge.'],
    ['Start', 'The engine loads keys, values and the weight table through the burst read bridge, or reuses them.'],
    ['Compute', 'For each query row: multiply, weight, combine, requantise.'],
    ['Write back', 'The INT8 output goes to memory through the burst write bridge.'],
    ['Done', 'The engine raises done; the interrupt controller delivers it to both cores. It also reports a rejected geometry or an arithmetic overflow.'],
  ]},
  {title: 'The control loop while the engine runs', lead: 'Why condition monitoring cannot slow the drive.', steps: [
    ['Sample', 'The PWM still fires the ADC at the period centre in the 50 MHz domain.'],
    ['Regulate', 'CORDIC, the PI regulators and the PWM update run exactly as on DG32-LITE.'],
    ['Isolate', 'Engine traffic crosses only through the bridges, so it cannot extend the control core’s worst-case execution time.'],
  ]},
];

export const domTiming: [item: string, value: string, status: string][] = [
  ['Control domain', '50 MHz, +0.30 ns slack', 'post-route'],
  ['Compute domain', '114 MHz, +0.19 ns slack', 'post-route'],
  ['Lockstep core fmax', '~55–62 MHz', 'post-route'],
  ['Die', '3.4 × 4.5 mm', 'its own die'],
  ['Cost per query row', '~3,242 cycles', 'analytic'],
];

export const domDecisions: Explained[] = [
  {name: 'A second clock, not an over-clocked die', what: 'Control stays at 50 MHz; the engine runs at 114 MHz behind bridges.', why: 'The frozen core’s timing closure is never disturbed.'},
  {name: 'INT8 with unquantised weights', what: '15-bit weights run all the way into a 40-bit numerator; only the output is saturated.', why: 'INT4 rounded every weight to zero on realistic key counts. This removes the failure structurally rather than tuning around it.'},
  {name: 'Its own die', what: '3.4 × 4.5 mm instead of the shared slot.', why: 'A bigger design gets a bigger die rather than a congested one that will not route.'},
  {name: 'Additions only', what: 'The control core, boot path and bus decode are unchanged; both chips come from one design source.', why: 'Everything proven on DG32-LITE carries over, and the variant is a build option plus a second clock rather than a fork.'},
];

// ---------- Architecture: as built for tape-in ----------

export const tapeinStats: [value: string, label: string][] = [
  ['50 MHz', 'ONE CLOCK DOMAIN'], ['8', 'CLOCK GATES'], ['2 cycles', 'CHECKER DELAY'],
  ['44 / 44', 'PADS ALLOCATED'], ['13', 'SCAN CHAINS'], ['4', 'SIGN-OFF GATES'],
];

export const tapeinSections: Explained[] = [
  {name: 'Clocks and reset', what: 'One 50 MHz clock from a pad drives the whole block, with no PLL and no domain crossings. One asynchronous active-low reset; a supervisor deglitches the supply-good inputs, and CHECKER is released two cycles after MAIN.', why: 'A single domain is the simplest timing to close and verify on a first shuttle.', points: ['Eight software clock gates idle the UARTs, SPI, I²C, PWM, timers, DMA and CORDIC.', 'Test mode forces every gate open.']},
  {name: 'Lockstep as built', what: 'One interrupt register feeds both cores, with the checker’s inputs delayed to match, and CHECKER sees MAIN’s bus responses.', why: 'Interrupts and peripheral reads were the usual ways two lockstep cores diverge with nothing wrong. Mirroring them means ordinary firmware cannot split the pair. Verified under interrupts in simulation.'},
  {name: 'Memory and fetch', what: 'A fetch decoder sends boot fetches to the ROM and application fetches to SRAM’s dedicated port.', why: 'Anything else is a bus error followed by an instruction fault, so a wild jump is caught instead of executing whatever it finds.'},
  {name: 'Bus rules', what: 'One requester at a time; the read or write target is latched at the request and held until the response.', why: 'A gated or undecoded slot answers with an error; flash is a data window, and the ROM copies code into SRAM.'},
  {name: 'Production test', what: 'A tester drives four JTAG pins into a test access port that selects scan enable, scan mode, a chain or bypass, reaching 13 scan chains.', why: 'Scan is for manufacturing test. Interactive CPU debug over JTAG is a separate roadmap item.'},
];

export const padPlan: [group: string, pads: number][] = [
  ['QSPI flash', 7], ['PWM + trigger', 7], ['Encoder + Hall', 6], ['UART × 2', 4], ['SPI', 4], ['JTAG', 4],
  ['GPIO', 3], ['I²C', 2], ['Supply-good', 2], ['ADC (analog)', 2], ['Clock', 1], ['Reset', 1], ['FAULT_N', 1],
];

export const signoffGates: Step[] = [
  ['Design rules', 'The layout is clean against every design rule, across the whole die.'],
  ['Layout versus schematic', 'Circuits match uniquely, with pin correspondence included.'],
  ['Pin connectivity', 'On the final layout, every pad pin reaches logic and no net floats.'],
  ['Boot simulation', 'A gate-level simulation of the routed netlist boots and prints the banner.'],
];

export const whyConnectivityGate = 'Design-rule and layout-versus-schematic checks can both pass while a pad pin floats. Only a pin-level check on the final layout catches it, which is why it is a gate of its own.';

// ---------- Control loop ----------

export const fetchBound = [
  ['~8', 'CLOCK CYCLES PER INSTRUCTION', 'Every instruction is fetched over the bus; there is no instruction cache.'],
  ['54 vs ~6', 'CYCLES FOR AN INT8 MULTIPLY-ACCUMULATE', 'Measured in plain C on this core, against a core with an instruction cache.'],
  ['~1.9 µs', 'OF A ~5 µS LOOP FOR AN SPI ADC READ', 'Why the converter moved on-die: it was the largest single cost.'],
  ['~5 + ~5 µs', 'ACQUISITION + COMPUTE', 'The full sensor-to-PWM loop in simulation: about a 100 kHz closed loop.'],
] as const;

export const controlNotes: Explained[] = [
  {name: 'Why sample at the PWM centre', what: 'Centre-aligned PWM makes the switching edges symmetric, so the middle of each period sits at the current-ripple null.', why: 'Sampling there reads true phase current without the delay of an analog filter. That is why the sample trigger comes from the PWM block, not a timer.'},
  {name: 'The loop is not carrier-limited', what: 'A ~25 kHz carrier was measured as 100 sample triggers in 4 ms, and the ADC clock is sized for loops up to ~100 kHz.', why: 'The carrier and the converter both have headroom; the budget below, not the peripherals, sets the practical loop rate.'},
  {name: 'The first lever for more CPU maths', what: 'An instruction cache or fetch buffer.', why: 'The fetch-bound core is the one constant the peripheral set is designed around. If firmware ever needs more maths than two regulators and an observer, that is where the cycles come from.'},
  {name: 'Safety runs alongside, not after', what: 'The lockstep comparator checks every committed store continuously, at no cost to the loop budget.', why: 'Software self-test runs periodically and cannot see a fault between runs; the comparator sees it on the store it happens.'},
];

export const peripheralLimits: [block: string, limit: string, note: string][] = [
  ['UART × 2', '115,200 baud, 8N1', 'Writes wait while busy; a byte is never dropped'],
  ['SPI master', 'Up to 25 MHz', '0.64 µs per 16-bit word'],
  ['I²C master', '100 / 400 kHz, 7-bit', 'Clock stretching; a 2-byte read takes ~72 µs at 400 kHz'],
  ['3-phase PWM', 'Dead-time up to 5.1 µs', 'Hardware brake forces all six outputs off in ≤ 2 cycles'],
  ['DShot × 4', '16-bit frames with CRC', 'All four channels share one bit-time counter'],
  ['Encoder + Hall', '4× quadrature, index, 3 Hall', 'Edge timestamps for low-speed velocity'],
  ['SAR ADC', '8-bit differential, ~200 kSa/s', 'Fired by the PWM sample trigger'],
  ['CORDIC', '20 iterations', '53–58 cycles per operation, fixed'],
  ['DMA', 'Block moves', '~7.1 cycles per word'],
];

// ---------- Pinout ----------

export const packageSides: {side: string; pins: string; groups: string; signals: string}[] = [
  {side: 'left', pins: '1–16', groups: 'Motor and position', signals: 'PWM AH, AL, BH, BL, CH, CL · PWM trigger · Encoder A, B, Z · Hall A, B · ADC −'},
  {side: 'bottom', pins: '17–32', groups: 'Debug, clock and reset', signals: 'JTAG × 4 · CLK · RST_N and resetb · Hall C · QSPI clock'},
  {side: 'right', pins: '33–48', groups: 'Flash and serial', signals: 'QSPI CSN0, IO0–3, CSN1 · UART0 TX/RX · UART1 TX/RX · SPI SCLK, MOSI'},
  {side: 'top', pins: '49–64', groups: 'I²C, GPIO and safety', signals: 'SPI MISO, CSN · I²C · GPIO0–2 · FAULT_N · supply-good × 2 · ADC +'},
];

export const powerNotes: Explained[] = [
  {name: 'One rail powers all logic', what: 'Every milliamp of dynamic and leakage current for the logic, SRAM and ADC comes from the 1.8 V core rail. The 3.3 V ring supplies the pads and their protection.', why: 'The other user supply domains are unused and held at nominal only to keep the pad ring’s protection structures biased.'},
  {name: 'Sequencing', what: '3.3 V comes up before, or together with, 1.8 V.', why: 'The pad ring must be powered before the core drives it.'},
  {name: 'Clock and reset', what: 'One 3.3 V CMOS clock input at the 50 MHz design target, used as delivered: there is no on-die PLL. Two active-low reset inputs are combined on the die with the power-on reset.', why: 'Any one of them resets the core, so a design can use either input.'},
];

export const fixedVsPreliminary: {state: string; items: string[]}[] = [
  {state: 'Fixed now', items: ['QFN-64 body, 9 × 9 mm, 0.5 mm pitch, exposed ground paddle', 'Pin 1 upper left, numbered counter-clockwise', '44 signals in eleven functional groups', '1.8 V core and 3.3 V I/O supplies, one 50 MHz clock, self-boot from flash']},
  {state: 'Preliminary', items: ['The pin map, awaiting the foundry’s bond-diagram confirmation', 'Every electrical limit: process nominals until first-silicon characterisation', 'Junction-temperature range, set at characterisation']},
];

// ---------- Position & roadmap ----------

export const positionNotes: Explained[] = [
  {name: 'Why the second core is the point', what: 'Against the G0, DG32-LITE is a comparable single-thread part that spends its second core on error detection.', why: 'Hardware lockstep is otherwise found in automotive microcontrollers such as Infineon AURIX, NXP S32K and TI Hercules. DG32 brings the mechanism to the entry-level motor-control tier.'},
  {name: 'Why the ADC is small on first silicon', what: 'An 8-bit, two-input converter against the G0’s 12-bit, 2.5 MSa/s, many-channel ADC.', why: 'First silicon carries a small converter to prove the analog integration path. The G0 is clearly ahead here, which is why a 12-bit multi-channel ADC is the first roadmap item.'},
  {name: 'Why the application loads at boot', what: 'The G0 executes in place from embedded flash; DG32-LITE copies its application from external flash into SRAM.', why: 'A flash-less die keeps the 130 nm process simple for a first spin. Embedded flash comes with the second spin.'},
  {name: 'Why the roadmap runs in this order', what: 'Analog and program memory first, then CAN-FD and interactive CPU debug.', why: 'The analog front end and program memory are where the incumbent leads most clearly, so they close first. Connectivity and debug follow, while DG32-2DOM proceeds in parallel.'},
];

export const roadmapDetail: [when: string, title: string, what: string, proves: string][] = [
  ['NOW', 'DG32-LITE first silicon', 'On the September 2026 multi-project shuttle.', 'Bring-up measures what simulation and static timing predicted: loop costs, fault latency, fmax and power.'],
  ['NEXT', 'Second spin', '12-bit multi-channel ADC and embedded flash.', 'Closes the two largest gaps against the incumbent.'],
  ['THEN', 'Connectivity and debug', 'CAN-FD and interactive CPU debug over JTAG.', 'The vehicle bus a traction or steering drive expects, and the debug path a production team needs.'],
  ['PARALLEL', 'DG32-2DOM', 'The two-clock-domain variant with the INT8 attention engine.', 'Design complete and in physical trials; bring-up will measure the engine’s cycles per query row.'],
];

// ---------- Strategic Executive Deliverables & Procurement Scorecard ----------

export interface ExecutivePillar {
  kpi: string;
  metric: string;
  title: string;
  summary: string;
  businessImpact: string;
  citation: string;
}

export const executivePillars: ExecutivePillar[] = [
  {
    kpi: 'UNIT ECONOMICS',
    metric: '60% Lower BOM',
    title: 'Sub-$3.10 Unit Target vs. Imported Legacy Parts',
    summary: 'Directly substitutes imported $6.80–$11.40 Western microcontrollers (STM32G0, TI Hercules, Infineon AURIX) while delivering higher hardware integration.',
    businessImpact: 'Saves $3.70–$8.30 per drive inverter board, lowering motor control BOM across high-volume automotive and drone platforms.',
    citation: 'Doc #5: Master Whitepaper v3, §5.2: Unit Cost & BOM Economics'
  },
  {
    kpi: 'SUPPLY CONTINUITY',
    metric: 'Dual-Foundry Sovereign',
    title: 'Immune to Export Controls & Fab Spikes',
    summary: 'Manufactured on mature 130 nm / 180 nm CMOS & BCD processes (SkyWater and SCL Mohali). Completely bypasses leading-edge Taiwanese fabs and foreign export licenses.',
    businessImpact: 'Fulfills Indian Defence Acquisition Procedure (DAP-2020 Make-II) domestic content mandates and secures multi-year production stability.',
    citation: 'Doc #5: Master Whitepaper v3, §4.3: Sovereign Silicon Moats'
  },
  {
    kpi: 'TIME TO MARKET',
    metric: '198-Day Loop',
    title: 'Rapid Tapeout-to-Silicon Shuttle Velocity',
    summary: 'Standardized multi-project wafer (MPW) runs and automated open-source verification pipelines replace rigid $20M+ custom silicon NRE lock-in.',
    businessImpact: 'Enables agile vehicle platform iterations and custom spin delivery in under 7 months rather than 2–3 years.',
    citation: 'Doc #2: DG32-LITE Architecture & MPW Shuttle Record'
  },
  {
    kpi: 'WARRANTY PROTECTION',
    metric: '< 1 µs Fail-Safe',
    title: 'Zero Firmware Recall Liability',
    summary: 'Autonomous hardware fault isolation disengages the power bridge in 39 clock cycles (780 ns) without waiting for software interrupt handlers.',
    businessImpact: 'Eliminates motor-stall and power bridge shoot-through hazards, directly reducing OEM warranty reserves and recall exposure.',
    citation: 'Doc #1 & #2: Dual-Core Lockstep Invariant & ASIL-D Proofs'
  }
];

export const procurementScorecard: [dimension: string, deepgrid: string, incumbents: string, executiveTakeaway: string][] = [
  ['BOM Unit Cost', '$2.60 – $3.10 target', '$6.80 – $11.40 (STM32G0 / TI Hercules)', '60% cost reduction per actuator or traction inverter'],
  ['Geopolitical & Export Risk', 'Dual-foundry sovereign (SkyWater + SCL Mohali)', 'Vulnerable to foreign export controls & Taiwan tensions', 'Guaranteed domestic supply continuity for critical infrastructure'],
  ['Defense Procurement (DAP-2020)', '100% compliant with Make-II domestic content', 'Disqualified or requires special waivers', 'Fast-tracks government tenders and defense offsets'],
  ['Silicon Turnaround Cycle', '198-day tapeout-to-shuttle iteration', '18 – 36 month custom ASIC design cycle', 'Lowers NRE risk and speeds product time-to-market'],
  ['Functional Safety Mechanism', 'Autonomous 39-cycle hardware lockstep trip', 'Software watchdog or costly external monitor MCU', 'Guaranteed fail-safe protection with zero software overhead'],
  ['Inventory Flexibility', 'One PCB footprint supports basic & AI variants', 'Requires redesign across MCU families', 'Reduces inventory carrying costs and requalification overhead']
];

// ---------- Platform Section Directory Gateway for Landing Page ----------

export interface PlatformSectionHub {
  num: string;
  tag: string;
  chip: string;
  title: string;
  summary: string;
  action: string;
  hash: string;
  sub: string;
}

export const platformSections: PlatformSectionHub[] = [
  {
    num: '02',
    tag: '02 / PRODUCT FAMILY',
    chip: 'ONE FOOTPRINT · TWO SoCs',
    title: 'DG32-LITE & DG32-2DOM',
    summary: 'Drop-in pin-compatible SoCs sharing 44 signals. A single board layout serves standard drives or on-chip bearing-fault condition monitoring.',
    action: 'Explore Product Family',
    hash: 'family',
    sub: 'Compare specifications, die sizes & inventory economics'
  },
  {
    num: '03',
    tag: '03 / ARCHITECTURE',
    chip: 'LOCKSTEP SAFETY CORE',
    title: 'Two Chips, One Frozen Core & 3D Die Explorer',
    summary: 'Dual RV32IM cores in lockstep, SkyWater 130 nm CMOS tape-in specifications, and an interactive 3D silicon package die explorer.',
    action: 'Inside the Architecture',
    hash: 'architecture',
    sub: 'Inspect block diagrams, scan chains & die floorplan'
  },
  {
    num: '04',
    tag: '04 / CONTROL LOOP',
    chip: '100 kHz DETERMINISM',
    title: 'Hardware Control Loop & Waveform Scrubber',
    summary: 'Constant ~300 hardware cycles (70 ADC + 160 CORDIC + 70 PWM). Zero loop jitter for high-RPM drone ESCs and EV traction drives.',
    action: 'Scrub 100 kHz Loop',
    hash: 'control',
    sub: 'Interact with the 500-cycle timeline & firmware headroom'
  },
  {
    num: '05',
    tag: '05 / PINOUT & PACKAGE',
    chip: 'QFN-64 · 9 × 9 MM',
    title: '44 Signals, Supplies & Electrical Limits',
    summary: 'Complete pin allocation, exposed ground paddle, 1.8 V core & 3.3 V I/O supply sequencing, and absolute maximum ratings.',
    action: 'Review QFN-64 Pinout',
    hash: 'pinout',
    sub: 'Inspect signal allocations, sequencing & thermal limits'
  },
  {
    num: '06',
    tag: '06 / POSITION & ROADMAP',
    chip: '198-DAY SHUTTLE',
    title: 'Competitive Benchmark & Procurement Scorecard',
    summary: 'Measured against STM32G0, TI Hercules, and Infineon AURIX. Multi-spin roadmap, domestic content compliance, and sovereign moats.',
    action: 'View Procurement Scorecard',
    hash: 'roadmap',
    sub: 'Evaluate unit BOM costs & 6-year multi-spin scaling'
  },
  {
    num: '07',
    tag: '07 / DOCUMENTS & MEDIA',
    chip: 'WHITEPAPERS & FILMS',
    title: 'Authoritative Documents, Decks & Media',
    summary: 'Complete publication PDFs, official datasheets, client-ready PowerPoint decks, and narrated video walkthroughs across the DG32 platform.',
    action: 'Browse Media Library',
    hash: 'library',
    sub: 'Download 71-page Master Whitepaper & official slides'
  },
  {
    num: '08',
    tag: '08 / ASK DEEPGRID',
    chip: 'GROUNDED INTELLIGENCE',
    title: 'Verified Silicon Intelligence Console',
    summary: 'Query DeepGrid technology, manufacturing qualifications, sovereign supply chains, and safety architecture with primary source citations.',
    action: 'Ask Grounded Intelligence',
    hash: 'ask',
    sub: 'Get verified answers with downloadable primary whitepapers'
  }
];

// ---------- Industrial Use Cases & Product Essence (Doc #1 & Compendium) ----------

export interface UseCaseDomain {
  id: string;
  title: string;
  subtitle: string;
  standards: string;
  tasksCount: string;
  examples: string[];
  timing: string;
  businessBenefit: string;
}

export const useCaseDomains: UseCaseDomain[] = [
  {
    id: 'rotating',
    title: 'Rotating Machinery & Bearings',
    subtitle: 'Vibration envelope demodulation & severity grading',
    standards: 'ISO 13373 · ISO 20816',
    tasksCount: '8 Mission-Critical Tasks',
    examples: [
      'Bearing race fault classification (BPFI/BPFO at 890 Hz)',
      'Gearbox gear mesh wear & tooth spalling detection',
      'Pump impeller cavitation & hydraulic turbulence',
      'Shaft unbalance, misalignment & mechanical looseness'
    ],
    timing: '0.06 – 0.89 ms inference',
    businessBenefit: 'Detects mechanical wear weeks before motor seizure, eliminating catastrophic production downtime.'
  },
  {
    id: 'electrical',
    title: 'Electrical & Current Signature (MCSA)',
    subtitle: 'Stator, rotor & winding insulation health tracking',
    standards: 'ISO 20958 · IEC 60034',
    tasksCount: '8 Mission-Critical Tasks',
    examples: [
      'Broken rotor bar detection via Goertzel filter (replaces 8MB FFT)',
      'Stator winding inter-turn short-circuit detection',
      'Static & dynamic air-gap eccentricity tracking',
      'Arc-fault discharge & DC-bus power quality analysis'
    ],
    timing: 'Continuous 10 kHz – 100 kHz sample rate',
    businessBenefit: 'Identifies electrical insulation breakdown from phase current without needing external accelerometers.'
  },
  {
    id: 'motion',
    title: 'Precision Motion & Control',
    subtitle: 'Zero-jitter vector transforms & adaptive dynamics',
    standards: 'AEC-Q100 · DShot-bidir',
    tasksCount: '8 Mission-Critical Tasks',
    examples: [
      'Sensorless Extended Kalman Filter (EKF) position (0.05 ms)',
      'Learned sensor plausibility & cross-core signal voting',
      'Dynamic friction feedforward & anti-cogging torque suppression',
      'Motor stall, rotor lock & runaway speed trip'
    ],
    timing: 'Deterministic 300 cycles (~6 µs)',
    businessBenefit: 'Delivers microsecond-exact control for agile drone ESCs, collaborative robots, and EV traction inverters.'
  },
  {
    id: 'degradation',
    title: 'Degradation & Remaining Useful Life',
    subtitle: 'Temporal drift regression & fleet condition monitoring',
    standards: 'CWRU Audited · IEEE PHM',
    tasksCount: '6 Mission-Critical Tasks',
    examples: [
      'Remaining Useful Life (RUL) degradation regression',
      'Autoencoder baseline drift & thermal runaway warning',
      'Lightweight GRU temporal forecasting (270 Hz)',
      '1D-CNN raw vibration pattern classification (79 Hz)'
    ],
    timing: 'Executes in 82% free CPU headroom',
    businessBenefit: 'Transforms reactive warranty costs into profitable predictive maintenance service level agreements (SLAs).'
  }
];

// ---------- Executive Product Essence (Gist of Everything) ----------

export interface ProductEssence {
  label: string;
  headline: string;
  detail: string;
  metric: string;
  reference: string;
  targetView: string;
}

export const productEssence: ProductEssence[] = [
  {
    label: 'HARDWARE LOCKSTEP SAFETY',
    headline: 'Sub-Microsecond Fail-Safe Protection',
    detail: 'A trailing checker core audits every committed CPU store with 2-cycle latency. Mismatches disengage the PWM bridge in 39 cycles (780 ns) without waiting for software interrupt handlers.',
    metric: '< 1 µs Fault Trip',
    reference: 'Doc #1 & #6: ASIL-D Dual-Core Lockstep Specification',
    targetView: 'architecture'
  },
  {
    label: 'DETERMINISTIC 100 kHz LOOP',
    headline: 'Hardwired Vector Control Acceleration',
    detail: 'ADC sampling, Clarke/Park vector transforms, and PWM generation execute in dedicated hardware blocks (~300 cycles total), leaving 82% of core CPU cycles free for user diagnostics.',
    metric: '82% Free Headroom',
    reference: 'Doc #3: 100 kHz Deterministic Control Loop Timing',
    targetView: 'control'
  },
  {
    label: 'SINGLE-PCB DUAL-SoC PLATFORM',
    headline: 'Zero-Redesign Upgrade Architecture',
    detail: 'DG32-LITE and DG32-2DOM share the identical 9 × 9 mm QFN-64 footprint and 44 signal pins. Upgrade from standard motor control to on-chip condition monitoring on the exact same PCB.',
    metric: '100% Pin Compatible',
    reference: 'Doc #4 & #6: QFN-64 Electrical & Packaging Datasheet',
    targetView: 'family'
  },
  {
    label: 'SOVEREIGN MATURE SUPPLY',
    headline: 'Domestic Supply Chain & Geopolitical Security',
    detail: 'Fabricated on mature 130 nm/180 nm CMOS with dual-foundry qualification (SkyWater + SCL Mohali). Completely insulated from export bans, meeting DAP-2020 Make-II defense mandates.',
    metric: '198-Day Shuttle',
    reference: 'Doc #2 & #5: Sovereign Silicon Roadmap & Import Substitution',
    targetView: 'roadmap'
  }
];
