# DG32-2DOM — Architecture Guide

Deepgrid Semi · the attention variant of DG32-LITE · September 2026

> Pre-silicon. Figures are post-route results on the hardened design, simulation results, or
> analytic estimates, and each is labelled. Nothing here is measured on fabricated parts. Status:
> design complete, in physical trials.

## What is DG32-2DOM?

DG32-2DOM is DG32-LITE — the dual-core lockstep RISC-V motor-control SoC — plus an INT8 attention
engine on a second, faster clock. The motor-control core, boot path, peripherals, control-loop
budget and 64-pin pinout are identical; both chips come from one RTL tree, and the variant is a
build option plus a second clock rather than a fork. The engine exists so a motor drive can run
condition monitoring, such as bearing-fault and anomaly detection, on the chip that already turns
the motor, without a second processor and without disturbing the safety-critical control core.

---

## Architecture Overview

DG32-2DOM has two clock domains on its own 3.4 × 4.5 mm die:

1. **50 MHz control domain** — everything in DG32-LITE: lockstep CPU pair, fault latch and supervision, boot ROM and SRAM, motor drive, sensing and math, connectivity and test.
2. **114 MHz compute domain** — the INT8 attention engine and its key/value buffers on SRAM macros.
3. **Clock-domain bridges** — three AXI bridges that carry programming and memory traffic between the two domains.

---

## Component: Shared base (identical to DG32-LITE)

What it does: runs the motor, protects it, boots the chip and talks to the outside world, exactly
as DG32-LITE does.

Why it exists unchanged: the lockstep CPU pair, its boot path and the bus that decodes to it are
closed and hardened. Reopening them to add the engine would risk the one part of the chip that
must be right, so the engine is an addition only.

- Dual RV32IM cores in lockstep, first-cause fault latch, FAULT_N hardware trip.
- 64 KB boot ROM, 32 KB dual-port SRAM, external QSPI flash, UART monitor on blank flash.
- 3-phase PWM with hardware brake, DShot × 4, encoder and Hall, 8-bit SAR ADC, CORDIC.
- The same field-oriented-control budget: ~300 hardware cycles per loop, ~100 kHz simulated ceiling.
- The same 9 × 9 mm QFN-64 pinout. The engine is internal and adds no pads.

## Component: INT8 attention engine

What it does: one kick computes a band of query rows of one attention head end to end, and writes
the INT8 output back to memory. The result is bit-exact to the golden software model.

Why it exists: condition monitoring needs matrix math that a fetch-bound CPU core, at about 8
cycles per instruction, cannot run without starving the control loop.

The pipeline per query row:

1. **Program** — firmware writes the shapes over an AXI-lite port: query, key, value and output locations, rows, keys and head dimensions.
2. **Multiply** — a shared multiply array computes QKᵀ, 16 lanes wide.
3. **Weight** — a row maximum indexes a 256-entry EXP table of 15-bit weights (softmax).
4. **Combine** — the weighted sum of values, divided by one reciprocal per row.
5. **Requantise** — saturate the result to INT8.
6. **Write back** — the output goes to memory over the engine's AXI master.

- Up to 400 keys per head; key dimension up to 32 bytes, value dimension up to 64 bytes.
- **Analytic cost:** ~3,242 cycles per query row at 16 lanes, 32-byte keys, 64-byte values and 400 keys. The measured steady-state figure is a bring-up item.

## Component: Key/value buffers

What it does: holds the keys and values on SRAM macros next to the engine, loaded once per kick
and re-read for every query row.

Why it exists: loading keys and values once and re-reading them keeps per-head bus traffic around
1% of occupancy. Streaming values per row would be about 400 times that and would make the engine
fight the rest of the die for memory.

- A DMA and the SRAM's idle second read port can feed the engine without contending with the CPU.

## Component: Clock-domain bridges

What it does: carries AXI transactions between the 50 MHz CPU domain and the 114 MHz engine
domain with a four-phase request/acknowledge handshake through two-flop synchronisers.

Why it exists: crossings are rare — keys and values load once, outputs write back once — so a
small, provably safe level handshake beats a FIFO with gray-coded pointers.

- **Lite bridge** — programming port, one transaction at a time.
- **Burst read bridge** — batches a whole read burst into one crossing.
- **Burst write bridge** — batches a whole write burst into one crossing.

---

## Key Data Flows

### One attention kick

1. Firmware on the lockstep CPU writes the geometry through the lite bridge.
2. Firmware sets start; the engine, on the 114 MHz clock, loads keys, values and the EXP table.
3. For each query row: multiply, weight, combine, requantise.
4. The engine writes the INT8 output back to memory through the burst write bridge.
5. The engine raises done; the interrupt controller delivers it to both cores.
6. A later kick can skip the load and reuse the resident keys, values and table.

### The control loop while the engine runs

1. The PWM fires the ADC sample at the period centre.
2. CORDIC, the PI regulators and the PWM update run in the 50 MHz domain as on DG32-LITE.
3. The engine's traffic crosses only through the bridges, so it cannot extend the control core's worst-case execution time.

---

## Timing and die

| Item | Value | Status |
|---|---|---|
| Control domain | 50 MHz, closed with +0.30 ns slack | post-route |
| Compute domain | 114 MHz, closed with +0.19 ns slack | post-route |
| Lockstep core fmax | ~55–62 MHz | post-route |
| Die | 3.4 × 4.5 mm | own die, not the DG32-LITE slot |
| Cost per query row | ~3,242 cycles | analytic |

---

## Design Decisions

- **A second clock, not an over-clocked die.** The lockstep core tops out around 55–62 MHz, so the control domain stays at 50 MHz and the engine runs at 114 MHz behind bridges. The core's timing closure is never disturbed.
- **INT8 with unquantised weights, not INT4.** With about 400 near-uniform keys, a 1/400 softmax weight rounds to zero in INT4 and the output came out identically zero. Keeping 15-bit weights all the way into a 40-bit numerator and saturating only the final output removes that failure structurally. A 32-bit numerator would break at 512 keys; 40 bits stays exact to 131,072.
- **Its own die.** Adding the engine's memory macros to the DG32-LITE floorplan made routing time out. A bigger design gets a bigger die rather than a congested one.
- **Additions only.** The frozen control core, boot path and bus decode are unchanged, so everything proven on DG32-LITE carries over.
