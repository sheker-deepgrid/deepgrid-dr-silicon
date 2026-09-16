# DeepGrid DG32-2DOM Silicon Architecture & Attention Variant Specification

**Document Reference**: DG32-2DOM System Architecture - Block Definition  
**Target Shuttle**: chipIgnite CI2612 · **Foundry & Node**: SkyWater sky130A 130 nm CMOS  
**Die Revision**: `dg32_2dom (A3)` · **Die Dimensions**: 3400 × 4500 µm (15.30 mm²)  
**Process/CPU**: 2× RV32IMC DGridRiscV Lockstep + INT8 Attention Engine  
**Clock Frequencies**: 50 MHz Core Domain (`clk_i`) / 114 MHz Fast Domain (`clk_fast_i`)  
**Classification**: DeepGrid Semi Technical Annex · Confidential Silicon Diligence Canon  

---

## Executive Summary & Architectural Scope

The **DG32-2DOM** is the dual-domain attention variant (`INCLUDE_ATTN=1`) of DeepGrid Semi's motor-control SoC family, carried on the chipIgnite CI2612 shuttle. It integrates the hardened, flight-control motor core of the DG32-LITE alongside a dedicated, hardware **INT8 attention engine** operating on a second, asynchronous 114 MHz clock domain (`clk_fast_i`).

Both variants share a unified RTL code tree; DG32-2DOM is instantiated via synthesis defines and clock crossing bridges rather than a separate repository fork.

---

## 1. Load-Bearing Design Premises & Hard Findings

Every subsystem in DG32-2DOM derives from physical silicon findings verified during bring-up:

1. **CPU PMA Whitelist**:
   The VexiiRiscv core enforces a strict hardware whitelist:
   $$\text{fault} = \neg(\text{addr}[31] \ | \ \text{addr}[31:28] == \text{0x1})$$
   Any address that does not set bit 31 or reside in `0x1xxxxxxx` generates a CPU load/store fault before reaching the bus. Placing main SRAM at `0x9000_0000` clears this rule; placing it at `0x2000_0000` results in immediate CPU exception faults.
2. **`ar_addr` Valid Only at Handshake**:
   The decoded AXI slave target is latched strictly at the AR handshake cycle (`arsel_q` / `arsel_v`) and held across the transaction. Live decoding from `ar_addr` misroutes read replies.
3. **Private DMEM for Lockstep Checker Core**:
   The redundant `CHECKER` core utilizes private 16 KB DMEM (8 macros) with outputs discarded. If DMEM were shared, a single physical memory defect could corrupt both cores identically. Because the checker cannot see external peripheral loads, firmware polling on asynchronous pads must be managed within the comparator window.
4. **Standalone OpenFrame Architecture**:
   OpenFrame provides no supervisory management core. The 64 KB baked Boot ROM plus QSPI-XIP NOR flash constitutes the entire boot path. Unmapped bus accesses complete with `SLVERR` to prevent bus hangs from permanently bricking the chip.
5. **Dual-Domain Timing Separation**:
   The lockstep CPU core achieves $f_{\max} \approx 55\text{–}62\text{ MHz}$ post-route on sky130A, setting the 50 MHz target (sign-off over-constrained to 54 MHz). Peripherals easily harden above 167 MHz. To prevent the heavy INT8 attention engine from disturbing the core's timing closure, the engine runs on its own 114 MHz clock (`clk_fast_i`) isolated behind 4-phase CDC bridges.

---

## 2. Complete 21-Slave Top-Level Memory Map

Decoded via `addr[31:28]` and sub-decoded on the `0xD` page via `addr[27:24]`:

| Base Address | Block Name | Domain | Bus Role & Description |
| :--- | :--- | :--- | :--- |
| `0x1000_0000` | `QSPI-XIP` | 50 MHz | External NOR flash read window for image staging into SRAM. |
| `0x9000_0000` | `SRAM` | 50 MHz | 32 KB main memory (16 macros, 512×32 each); idle port enables contention-free DMA. |
| `0xC000_0000` | `dgrid_dshot` | 50 MHz | 4-channel ESC engine, pad-muxed onto high-side PWM pins. |
| `0xD000_0000` | `UART0` | 50 MHz | 8N1 serial console; carries boot banner (115,200 baud @ 50 MHz = 434 clocks/bit). |
| `0xD100_0000` | `UART1` | 50 MHz | Dedicated telemetry link to companion processor. |
| `0xD200_0000` | `SPI Master` | 50 MHz | Up to 25 MHz full-duplex master SPI; 0.64 µs per 16-bit word. |
| `0xD300_0000` | `GPIO` | 50 MHz | 16-pin general I/O with 2-FF synchronizers and atomic `SET` / `CLR` registers. |
| `0xD400_0000` | `TIMER0` | 50 MHz | General-purpose down-counter for RTOS tick. |
| `0xD500_0000` | `TIMER1` | 50 MHz | General-purpose down-counter for control-loop periods. |
| `0xD600_0000` | `Fault CSR` | 50 MHz | Sticky-first poison latch (`cause 001 = DATA_MISMATCH`); MAGIC `0xDEAD_5AFE` inject. |
| `0xD700_0000` | `Supervisor` | 50 MHz | Windowed watchdog (`WDTMIN` / `WDTMAX`) and power rail deglitch monitor. |
| `0xD800_0000` | `PWM` | 50 MHz | 3-phase center-aligned complementary PWM; 5.1 µs dead-time; hardware brake ($\le 2$ cyc). |
| `0xD900_0000` | `I2C Master` | 50 MHz | 7-bit master at 100/400 kHz with clock stretching and true open-drain pad drive. |
| `0xDA00_0000` | `Encoder` | 50 MHz | Decodes quadrature A/B/Z and Hall states; 32-bit free-running timestamp for velocity. |
| `0xDB00_0000` | `SAR ADC` | 50 MHz | 8-bit differential OpenFASOC macro (~200 kSa/s); triggered at PWM current-ripple null. |
| `0xDC00_0000` | `DMA` | 50 MHz | Single-beat AXI block mover (~7.1 cyc/word) utilizing SRAM idle read port. |
| `0xDD00_0000` | `SYSCTL` | 50 MHz | Peripheral clock gating and chip revision ID registers. |
| `0xDE00_0000` | `CORDIC` | 50 MHz | Q1.31 rotation & vectoring engine (sin, cos, atan2, mag) in fixed 53–58 cycles. |
| `0xDF00_0000` | `IRQ Aggregator`| 50 MHz | 16-source masked interrupt controller (TMR0/1, PWM, ADC, DMA, I2C, Fault, SW, Attention). |
| `0xE000_0000` | `dgrid_int8_attn`| 114 MHz | Hardware INT8 attention engine running on `clk_fast_i` via CDC bridges. |

---

## 3. Hardware INT8 Attention Engine Pipeline (`dgrid_int8_attn`)

The attention engine computes $QK^T$, row max, 256-entry u15 EXP, normalization $Z$, and $E \cdot V$ projection:

1. **Why INT8 Replaced INT4**:
   In early INT4 evaluations with $N_K \approx 400$ keys, uniform softmax weights ($\frac{1}{400} = 0.0025$) rounded identically to zero, causing mathematical collapse. The INT8 engine retains full **unsigned 15-bit integers (`u15`)** across the softmax pipeline, accumulating into a **40-bit signed numerator seat**.
2. **Why a 40-Bit Numerator is Required**:
   Standard 32-bit signed integers overflow at $2^{31}-1$, failing at $N_K = 512$. A 40-bit accumulator provides exact precision up to $N_K = 131,072$ keys.
3. **Hardware Division**:
   A dedicated 48-step restoring divider calculates the per-row reciprocal $\frac{1}{Z}$.
4. **On-Chip Buffer Residency**:
   K and V buffers are mapped to dedicated on-chip sky130 SRAM macros loaded once per kick via DMA. Re-reading locally per query row reduces bus traffic by **400×**, limiting bus occupancy to ~1%.
5. **Analytic Cycle Cost**:
   $$\text{Cycles per query row} = \frac{N_K \cdot K_D}{\text{LANES}} + \frac{N_K \cdot D_V}{\text{LANES}} + 48 + 11 \cdot D_V + \text{writeback} + \text{drain}$$
   At $\text{LANES}=16, K_D=32, D_V=64, N_K=400$, execution requires **3,242 cycles per row on `clk_fast_i` (114 MHz)**.

---

## 4. FOC Control-Loop Budget & Execution Headroom

All cycle counts are measured on the sky130A post-route silicon:
- **Phase Current Sampling**: On-die SAR ADC triggered at ripple null = **177 cycles** (~3.54 µs). Replaces ~1.9 µs external SPI read.
- **Clarke / Park Transform**: Hardware CORDIC = **53–58 cycles**.
- **PI Regulators**: VexiiRiscv CPU = **~8 cycles / instruction** (fetch-bound, int8 MAC takes 54 cycles vs 6 with I-cache).
- **Inverse Park Transform**: Hardware CORDIC = **53–58 cycles**.
- **Fixed Hardware Overhead**: $\approx \mathbf{300\text{ cycles}}$ (~6 µs).
- **Headroom at 10 kHz (5,000 cycles @ 50 MHz)**: Leaves **~4,700 cycles (>90% headroom)** for state observers, thermal models, and serial communication.
- **Closed-Loop Bandwidth**: ~5 µs acquisition + ~5 µs compute = **~100 kHz closed-loop control capability**.

---

## 5. Physical Silicon Area Breakdown (15.30 mm² Die)

Measured via Yosys synthesis against `sky130_fd_sc_hd` and LEF footprints:
- **Total Die Dimensions**: 3400 × 4500 µm = **15.30 mm²**.
- **Placed Cell + Macro Footprint**: **5.93 mm²**.
- **Standard-Cell Logic Subtotal**: **0.751 mm²** (CPU cores 0.33 mm², Attention logic 0.07 mm², Comparator 0.04 mm², CORDIC 0.02 mm²).
- **Hard Macros Subtotal**: **5.177 mm² (86% of placed area!)**:
  - 16× Main 2 KB SRAM macros: $4.5527\text{ mm}^2$.
  - Attention K buffer macro: $0.2845\text{ mm}^2$.
  - Attention V buffer macro: $0.2845\text{ mm}^2$.
  - SAR ADC macro: $0.0540\text{ mm}^2$.
  - Boot ROM: $0.0010\text{ mm}^2$.

---

## 6. Application: AVIP Multimodal Bearing-Fault Classifier

- **Model Topology**: Time-domain conv/GRU + FFT-domain conv/GRU fused by 2 self-attention blocks and 1 cross-attention block.
- **Inference Latency on `clk_fast_i` (114 MHz)**:
  - CWRU Shipped Model (47,076 parameters): **46.7 ms** at 94–95% accuracy (INT8 = FP32).
  - Full AVIP Model (478,277 parameters): **54.5 ms** (10× parameters but only 1.2× compute).
- **Stator Current Signature Analysis (CSA)**:
  - Phase-current SAR ADC sampled at PWM ripple null detects mechanical bearing fault frequencies: $f_{\text{fault}} = f_e \pm k \cdot f_{\text{defect}}$.
  - **Eliminates external accelerometers and vibration probes entirely**, reusing the motor's own electrical sensing.
