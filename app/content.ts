// Every figure on the site comes from the five DG32 source documents named in README.md.
// DG32 is pre-silicon: numbers are design values verified in simulation and static timing
// unless a row says otherwise. Edit here, not in page.tsx.

export const headline = [
  ['2 × RV32IM', 'CORES IN HARDWARE LOCKSTEP'],
  ['~100 kHz', 'CLOSED CURRENT LOOP, SIMULATED'],
  ['64-pin QFN', '9 × 9 MM · 44 SIGNAL PINS'],
  ['Sep 2026', 'FIRST-SILICON SHUTTLE'],
] as const;

export type Part = {
  id: string;
  name: string;
  tagline: string;
  status: string;
  summary: string;
  specs: [string, string][];
  adds: string[];
};

export const parts: Part[] = [
  {
    id: 'lite',
    name: 'DG32-LITE',
    tagline: 'Lockstep RISC-V motor-control SoC',
    status: 'First silicon · September 2026 multi-project shuttle',
    summary:
      'One chip carries the MCU, the motor-control peripherals and a hardware safety monitor. A second identical core checks the first on every committed store, so a datapath fault becomes a FAULT pin, not a wrong PWM edge.',
    specs: [
      ['CPU', '2 × DgridRiscv RV32IM, 32-bit, lockstep'],
      ['Clock', 'One 50 MHz domain; core measured at ~55–62 MHz post-route'],
      ['Memory', '64 KB boot ROM · 32 KB SRAM · external QSPI flash'],
      ['Motor', '3-phase PWM with dead-time and hardware brake · 4 × DShot'],
      ['Sensing', 'Encoder A/B/Z + 3 Hall · 8-bit differential SAR ADC, ~200 kSa/s'],
      ['Math', 'Hardware CORDIC: sin, cos, atan2, magnitude'],
      ['Interfaces', '2 × UART · SPI to 25 MHz · I²C 100/400 kHz · QSPI · GPIO · JTAG'],
      ['Package', 'QFN-64, 9 × 9 mm, 0.5 mm pitch, exposed ground paddle'],
      ['Supplies', '1.8 V core · 3.3 V I/O'],
      ['Power', '~0.43 W at 50 MHz (tool estimate, not measured)'],
      ['Process', '130 nm CMOS'],
    ],
    adds: [],
  },
  {
    id: '2dom',
    name: 'DG32-2DOM',
    tagline: 'DG32-LITE plus an INT8 attention engine',
    status: 'Design complete · in physical trials',
    summary:
      'The same lockstep core, boot path, peripherals and 64-pin footprint, with an attention accelerator on its own faster clock. The drive can run condition monitoring on the chip that turns the motor, without slowing the control core.',
    specs: [
      ['CPU', 'Same lockstep pair as DG32-LITE'],
      ['Clocks', '50 MHz control domain · 114 MHz accelerator domain'],
      ['Accelerator', 'INT8 attention: QKᵀ, softmax, weighted sum, requantise — one kick per band of query rows'],
      ['Accuracy', 'Bit-exact to the golden software model'],
      ['Keys', 'Up to 400 per head'],
      ['Isolation', 'Crosses to the CPU through clock-domain bridges; never stalls the control core'],
      ['Timing', 'Closed with positive slack at both 50 MHz and 114 MHz'],
      ['Pinout', 'Identical to DG32-LITE — the engine adds no pads'],
    ],
    adds: ['Bearing-fault detection in the drive', 'Anomaly detection on phase-current data', 'Predictive maintenance without a second processor'],
  },
];

export type Block = {
  code: string;
  name: string;
  short: string;
  what: string[];
  why: string;
};

// Six groups, in the order the 3D die model indexes its regions.
export const blocks: Block[] = [
  {
    code: 'SAFE',
    name: 'Safety core',
    short: 'Lockstep pair, fault latch, windowed watchdog',
    what: [
      'MAIN and CHECKER cores run identical inputs; CHECKER trails by two cycles',
      'Every committed store is compared; a mismatch latches the first cause and drives FAULT',
      'Fault injection lets firmware prove the path works on real silicon',
      'Windowed watchdog faults on a kick that is too early or too late',
      'Supply-good monitoring with deglitching and reset sequencing',
    ],
    why: 'Motor control drives power electronics. A silent CPU fault can destroy a bridge; a second core that must agree bit-for-bit turns that fault into an observable signal.',
  },
  {
    code: 'MEM',
    name: 'Memory & boot',
    short: '64 KB ROM, 32 KB SRAM, QSPI flash',
    what: [
      '64 KB mask ROM boots the chip with no external help',
      'Validates the flash image header, copies the application into SRAM and runs it',
      'Blank flash drops to a UART monitor, so a bare board is still inspectable',
      '32 KB SRAM on 16 dual-port macros: one port for data, one for instruction fetch',
      'QSPI controller maps boot flash and PSRAM into memory',
    ],
    why: 'A flash-less die keeps the 130 nm process simple. The cost is loading at boot instead of executing in place; embedded flash is on the roadmap.',
  },
  {
    code: 'MTR',
    name: 'Motor drive',
    short: '3-phase PWM, DShot × 4, timers',
    what: [
      'Centre-aligned complementary PWM on six gate pins with programmable dead-time',
      'Shadow duty registers update on the period boundary',
      'Hardware brake forces all six outputs off within two clock cycles',
      'Four DShot ESC channels share the PWM pads, selected at boot',
      'Two 32-bit timers with compare interrupts',
    ],
    why: 'A firmware brake is only as fast as the loop. A bridge fault needs the safe state now, so the brake path goes straight to the gates.',
  },
  {
    code: 'SNS',
    name: 'Sensing & math',
    short: 'Encoder + Hall, SAR ADC, CORDIC',
    what: [
      'Quadrature encoder with index and three Hall inputs, decoded in hardware',
      'Edge timestamps give velocity from time between edges, accurate at low speed',
      '8-bit differential SAR ADC, ~200 kSa/s, triggered by the PWM',
      'Hardware CORDIC computes sin/cos, atan2 and magnitude in a fixed cycle count',
    ],
    why: 'An external SPI ADC read costs ~1.9 µs of a ~5 µs loop, the largest single cost. On-die it becomes a start pulse and a poll.',
  },
  {
    code: 'COM',
    name: 'Connectivity',
    short: 'UART × 2, SPI, I²C, QSPI, GPIO',
    what: [
      'Two UARTs: one console and boot banner, one free for telemetry',
      'SPI master up to 25 MHz for sensors, an external DAC or a radio',
      'I²C master at 100/400 kHz with clock stretching and open-drain pads',
      'GPIO with atomic set and clear, so an interrupt cannot race a pin toggle',
    ],
    why: 'The set a motor drive needs, done in silicon where timing matters. CAN-FD is a roadmap item.',
  },
  {
    code: 'SYS',
    name: 'Bus, system & test',
    short: 'Two-master bus, interrupts, DMA, JTAG',
    what: [
      'Lightweight AXI-style bus with two masters, CPU first, deterministic latency',
      'Unmapped or disabled addresses answer with a bus error; they never hang',
      'Interrupt controller: 16 sources delivered identically to both cores',
      'DMA moves memory blocks while the CPU does control math',
      'Eight software clock gates for idle peripherals · JTAG and scan chains for production test',
    ],
    why: 'There is no debugger halt on this die. A hung bus would be a brick, so every bad access has to be visible and survivable.',
  },
];

export const loopStages = [
  ['01', 'Sample current', 'On-die SAR ADC, fired by the PWM at the ripple null', '177 cycles'],
  ['02', 'Clarke / Park', 'CORDIC sin/cos and rotation', '53–58 cycles per op'],
  ['03', 'PI regulators', 'Two regulators in plain C on the CPU', '~8 cycles per instruction'],
  ['04', 'Inverse Park', 'CORDIC rotation', '53–58 cycles per op'],
  ['05', 'Update PWM', 'Shadow registers load at the next period boundary', 'next reload'],
  ['06', 'Check for faults', 'Lockstep comparator, continuously', '39-cycle inject-to-latch'],
] as const;

// Loop rates published in the architecture document; 100 kHz is the simulated closed-loop figure.
export const CLOCK_HZ = 50_000_000;
export const HW_FIXED_CYCLES = 300;
export const CYCLES_PER_INSTRUCTION = 8;
export const loopRates = [
  {khz: 10, fits: 'Full FOC current and speed loop with an observer'},
  {khz: 20, fits: 'FOC with field-weakening and a state observer'},
  {khz: 50, fits: 'Inner current loop only; regulators must be tight'},
  {khz: 100, fits: 'The simulated ceiling: ~5 µs acquisition plus ~5 µs compute'},
] as const;

export const fmax = [
  ['GPIO', 173.6],
  ['DShot', 172.9],
  ['QSPI controller', 171.6],
  ['PWM', 167.8],
  ['Lockstep checker', 123.6],
  ['CORDIC', 95.5],
  ['Supervisor', 91.1],
  ['Lockstep core', 55],
] as const;

export const pinGroups = [
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
] as const;

export const comparison = [
  ['CPU', '2 × RV32IM in hardware lockstep, 50 MHz', '1 × Arm Cortex-M0+, up to 64 MHz', 'Comparable single-thread class. DG32 spends its second core on error detection.'],
  ['Safety hardware', 'Lockstep comparator, fault latch and FAULT pin, windowed watchdog, supply monitoring, bus-error responses', 'Independent and window watchdogs, brown-out reset, clock security system; software self-test libraries', 'Hardware lockstep is otherwise found in automotive MCUs such as Infineon AURIX, NXP S32K and TI Hercules.'],
  ['Program memory', '64 KB mask ROM + external QSPI flash; application runs from SRAM', '16–512 KB embedded flash', 'G0 executes in place. Embedded flash is on the DG32 roadmap.'],
  ['RAM', '32 KB dual-port SRAM', '8–144 KB SRAM', 'Enough for control loops; G0B1 has more for communication stacks.'],
  ['Motor PWM', '3-phase with dead-time, centre-aligned ADC trigger, hardware brake; 4 × DShot in hardware', 'TIM1 advanced timer with dead-time and break; DShot in software', 'Equivalent 3-phase capability. DShot is native on DG32.'],
  ['Analog', '8-bit differential SAR, ~200 kSa/s, 2 pins', '12-bit, 2.5 MSa/s, up to 16 channels', 'G0 leads clearly. A 12-bit multi-channel ADC is the first roadmap item.'],
  ['Math', 'Hardware CORDIC', 'None (CORDIC appears on STM32G4)', 'FOC transforms run in hardware on DG32.'],
  ['On-chip AI', 'DG32-2DOM: INT8 attention engine', 'None; NanoEdge AI runs in software', 'Condition monitoring inside the drive itself.'],
  ['Communications', '2 × UART, SPI, I²C, QSPI, 3 × GPIO', 'Up to 6 × USART, 3 × SPI, 3 × I²C, USB FS, 2 × FDCAN', 'G0 has the broader catalogue. CAN-FD is on the DG32 roadmap.'],
  ['Process & status', '130 nm; first silicon September 2026', '90 nm; in volume production since 2018', 'DG32-LITE proves the architecture; it is not yet a production part.'],
] as const;

export const leads = ['Hardware lockstep at the entry-level tier', 'Native DShot', 'CORDIC in hardware', 'On-chip AI variant for condition monitoring', 'Open RISC-V instruction set, no core licence'];
export const gaps = ['12-bit, 2.5 MSa/s multi-channel ADC', 'Embedded flash', 'USB and CAN-FD', 'Package range', 'Production maturity and ecosystem'];

export const roadmap = [
  ['NOW', 'DG32-LITE first silicon', 'On the September 2026 multi-project shuttle. Bring-up measures what simulation predicted.'],
  ['NEXT', 'Second spin', '12-bit multi-channel ADC and embedded flash close the two largest gaps against the incumbent.'],
  ['THEN', 'CAN-FD and CPU debug', 'Interactive debug over JTAG and the vehicle bus a traction or steering drive expects.'],
  ['PARALLEL', 'DG32-2DOM', 'The two-clock-domain compute variant with the INT8 attention engine: design complete, in physical trials.'],
] as const;

export const applications = [
  ['E-mobility', 'Light-EV traction and steering drives'],
  ['Aerial', 'Drone motors and eVTOL actuators'],
  ['Industrial', 'Servo drives and robot joints'],
  ['Battery tools', 'Cordless tools and appliances'],
] as const;

export const bootFlow = [
  ['01', 'POWER ON', 'Mask ROM prints the DG32 banner on UART0'],
  ['02', 'VALIDATE', 'Reads and checks the flash image header'],
  ['03', 'LOAD', 'Copies the application from QSPI flash into SRAM'],
  ['04', 'RUN', 'Jumps to SRAM; the application enables interrupts'],
] as const;
