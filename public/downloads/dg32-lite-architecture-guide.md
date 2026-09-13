# DG32-LITE — Architecture Guide

Deepgrid Semi · dual-core lockstep RISC-V motor-control SoC · September 2026

> Pre-silicon. Figures are design values verified in simulation and static timing, or
> post-route measurements on the hardened die, unless marked otherwise. Nothing here has been
> measured on fabricated parts yet. First silicon rides the September 2026 multi-project shuttle.

## What is DG32-LITE?

DG32-LITE is a single chip for brushless motor drives. It combines a RISC-V microcontroller,
the peripherals a motor drive needs, and a hardware safety monitor. The monitor is a second,
identical CPU core that runs two cycles behind the first and compares every committed store.
If the two ever disagree, the chip latches the first cause and drives a FAULT pin that can shut
the power bridge off without waiting for firmware. Hardware lockstep of this kind has lived in
automotive MCUs such as Infineon AURIX, NXP S32K and TI Hercules; DG32-LITE brings it to the
entry-level motor-control tier. A follow-on variant, DG32-2DOM, adds an INT8 attention engine
for condition monitoring in the same 64-pin footprint.

---

## Architecture Overview

DG32-LITE is built from six block groups on one 50 MHz clock domain:

1. **Safety core** — MAIN and CHECKER cores in lockstep, comparator, fault latch, windowed watchdog, supply supervision.
2. **Memory and boot** — 64 KB mask ROM, 32 KB dual-port SRAM, QSPI flash controller.
3. **Motor drive** — 3-phase complementary PWM with dead-time and hardware brake, 4 × DShot, two timers.
4. **Sensing and math** — quadrature encoder and Hall decode, 8-bit differential SAR ADC, hardware CORDIC.
5. **Connectivity** — 2 × UART, SPI master, I²C master, GPIO.
6. **Bus, system and test** — two-master AXI-style bus with an error slave, 16-source interrupt controller, DMA, clock gating, JTAG and scan chains.

The chip ships in a 9 × 9 mm QFN-64 with 44 signal pins, on a 130 nm CMOS process.

---

## Component: Safety core

What it does: runs the application on MAIN while CHECKER executes the same instruction stream
two cycles later on identical inputs, and compares every committed store. A mismatch sets a
sticky poison bit with a cause code and asserts FAULT_N.

Why it exists: a motor drive switches power electronics. A silent CPU datapath fault produces a
wrong PWM edge, and a wrong edge can destroy a bridge. Two cores that must agree bit-for-bit turn
that fault into an observable, latched signal.

- **Delayed checker.** Interrupts and bus responses are mirrored to CHECKER, so firmware can branch on peripheral reads without the cores diverging.
- **First-cause latch.** The first fault is the diagnostic one; later faults are usually consequences, so the latch holds the first cause until reset.
- **Fault injection.** A locked register lets firmware fire the fault path deliberately, which is the only way to prove it works on real silicon. Inject-to-latch latency: 39 cycles in simulation.
- **Windowed watchdog.** A kick that arrives too early or too late both fault, catching runaway code as well as hangs. It arms only when firmware enables it, so it cannot deadlock a cold boot.
- **Supply supervision.** Two supply-good inputs with deglitching and reset sequencing.

## Component: Memory and boot

What it does: starts the chip with no external help and runs the application from SRAM.

Why it exists: the die has no management core and no debugger halt, so the boot path must be
self-sufficient. Keeping the die flash-less keeps the 130 nm process simple.

- **64 KB mask ROM** prints a boot banner, validates the flash image header, copies the application into SRAM and jumps to it.
- **UART monitor fallback** runs when the flash is blank, so a bare board can still be inspected.
- **32 KB SRAM** on 16 dual-port macros: one port for data, one dedicated to instruction fetch, so fetch never contends with data access.
- **QSPI controller** maps boot flash and PSRAM into memory. Code does not execute in place from flash.
- **No ECC on SRAM.** The memory macros have no spare bits; the chip states this rather than implying protection it does not have.

## Component: Motor drive

What it does: generates the gate signals for a 3-phase bridge, or digital ESC frames.

Why it exists: gate timing and the safe state are too important to leave to a firmware loop.

- **Centre-aligned complementary PWM** on six gate pins with programmable dead-time; shadow duty registers load on the period boundary.
- **Sample trigger** fires the ADC at the centre of the PWM period, where current ripple is lowest.
- **Hardware brake** forces all six outputs off within two clock cycles and latches, so firmware sees it happened.
- **4 × DShot** ESC channels share the PWM pads and are selected at boot, so the package does not spend pins on both.
- **Two 32-bit timers** with compare interrupts: typically one RTOS tick and one control-loop period.

## Component: Sensing and math

What it does: measures rotor position and phase current, and computes the field-oriented-control transforms.

Why it exists: the CPU core is fetch-bound at about 8 cycles per instruction, so the expensive
parts of the control loop are moved into dedicated hardware.

- **Encoder and Hall decode** with edge timestamps, which give velocity from time between edges and stay accurate at low speed.
- **8-bit differential SAR ADC** at ~200 kSa/s, triggered by the PWM. An external SPI ADC read would cost ~1.9 µs of a ~5 µs loop; on-die it is a start pulse and a poll.
- **Hardware CORDIC** computes sin/cos, atan2 and magnitude in 53–58 cycles per operation, a fixed and known cost.

## Component: Connectivity

- **2 × UART** — console and boot banner on one, telemetry on the other.
- **SPI master** up to 25 MHz for sensors, an external DAC or a radio.
- **I²C master** at 100/400 kHz with clock stretching and true open-drain pads.
- **GPIO** with atomic set and clear registers, so an interrupt handler cannot race a pin toggle.

## Component: Bus, system and test

- **Two-master AXI-style bus** (CPU first, DMA second) with single-outstanding, deterministic latency. Every peripheral is a 32-bit register slave.
- **Error slave.** Unmapped or disabled addresses complete with a bus error instead of hanging; on a chip with no debugger, a hung bus would be a brick.
- **Interrupt controller** with 16 sources delivered identically to both cores.
- **DMA** moves memory blocks while the CPU does control math.
- **System control** with part ID, eight software clock gates and pin multiplexing.
- **Test access** through a JTAG port and internal scan chains for production test.

---

## Key Data Flows

### One field-oriented-control current loop

1. The PWM period centre fires the sample trigger.
2. The SAR ADC converts the phase current (177 cycles).
3. CORDIC runs the Clarke/Park transform with the rotor angle from the encoder (53–58 cycles per operation).
4. The CPU runs the d and q PI regulators in plain C (~8 cycles per instruction).
5. CORDIC runs the inverse Park rotation (53–58 cycles per operation).
6. Firmware writes the new duty cycles to the PWM shadow registers; they load at the next period boundary.
7. The lockstep comparator checks every committed store throughout; a mismatch latches and drives FAULT_N.

The fixed hardware cost of one loop is about 300 cycles. At the 50 MHz clock:

| Loop rate | Cycles per period | Hardware | CPU budget | What fits |
|---|---|---|---|---|
| 10 kHz | 5,000 | ~300 | ~4,700 | Full FOC current and speed loop with an observer |
| 20 kHz | 2,500 | ~300 | ~2,200 | FOC with field-weakening and a state observer |
| 50 kHz | 1,000 | ~300 | ~700 | Inner current loop only; tight regulators |
| 100 kHz | 500 | ~300 | ~200 | Simulated ceiling: ~5 µs acquisition + ~5 µs compute |

### Power-on boot

1. Mask ROM prints the boot banner on UART0.
2. ROM reads and validates the flash image header through the QSPI data window.
3. ROM copies the application from flash into SRAM.
4. ROM jumps to SRAM; the application installs its trap vector and enables interrupts.
5. If no valid header is found, ROM starts the UART monitor instead.

### A CPU fault

1. A datapath fault changes a value MAIN commits.
2. CHECKER, two cycles behind on identical inputs, commits a different value.
3. The comparator flags the mismatch on that store.
4. The fault CSR latches the first cause; FAULT_N goes low.
5. FAULT_N, routed to the gate-driver enable, turns the bridge off in hardware.

---

## Timing headroom

Post-route maximum frequency per hardened block on the 130 nm process:

| Block | fmax (MHz) |
|---|---|
| GPIO | 173.6 |
| DShot | 172.9 |
| QSPI controller | 171.6 |
| PWM | 167.8 |
| Lockstep checker | 123.6 |
| CORDIC | 95.5 |
| Supervisor | 91.1 |
| Lockstep core | 55–62 |

Every peripheral clears 90 MHz. The lockstep core sets the die clock, which is why the chip runs at 50 MHz.

---

## DG32-2DOM — the compute variant

- Same lockstep core, boot path, peripherals and 64-pin pinout as DG32-LITE; the engine adds no pads.
- INT8 attention accelerator: one kick computes a band of query rows of one head (QKᵀ, softmax, weighted sum, requantise), bit-exact to the golden software model, up to 400 keys.
- Runs on its own 114 MHz clock and reaches memory through clock-domain-crossing bridges, so it never stalls the 50 MHz control core.
- Timing closed with positive slack at both clocks. Status: design complete, in physical trials.
- Intended for bearing-fault and anomaly detection inside the drive.

---

## Position against the incumbent

Against the STM32G0 series (Arm Cortex-M0+), the entry-level motor-control incumbent:

- **DG32-LITE leads on** hardware lockstep, native DShot, hardware CORDIC, the on-chip AI variant, and an open RISC-V instruction set with no core licence.
- **STM32G0 leads on** a 12-bit 2.5 MSa/s multi-channel ADC, embedded flash, USB and CAN-FD, package range, and production maturity.
- **Roadmap:** second spin adds a 12-bit multi-channel ADC and embedded flash; then CAN-FD and interactive CPU debug; DG32-2DOM runs in parallel.

---

## Design Decisions

- **Two cores and a comparator, not software self-test.** A second core that must agree bit-for-bit catches datapath faults as they happen, in hardware, at a fixed latency. Software self-test runs periodically and cannot see a fault between runs.
- **The loop runs in hardware.** The CPU core is fetch-bound at ~8 cycles per instruction, so current sampling, the Park transforms and PWM edge generation are dedicated blocks and the CPU keeps only the PI regulators. That makes one loop's cost fixed and known.
- **Faults are contained, never silent.** With no debugger halt on the die, every unmapped access returns a bus error, the watchdog catches both hangs and runaways, and the first fault cause is latched for later reading.
- **Flash-less die, boot from ROM.** Loading the application from external QSPI flash into SRAM keeps the 130 nm process simple. The cost is boot-time loading instead of execute-in-place; embedded flash is on the roadmap.
