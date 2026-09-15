# DeepGrid DG32 Silicon Specification: Hardware DShot Receive & Bidirectional Telemetry (dgrid_dshot_rx)

**Document Reference**: Block Spec for Review · DG32 · 13 Sep 2026 · Draft 1  
**Author**: DG32 Engineering (drafted with Claude) · **Reviewer**: Ayaz Khan  
**Classification**: DeepGrid Semi Technical Annex · Internal Silicon Diligence Canon  

---

## Executive Summary & Architectural Mandate

This specification details the RTL implementation, physical pad-ring modifications, and functional safety constraints required to support **DShot receive (RX) and bidirectional telemetry reply** on DeepGrid Semi's DG32 motor-control silicon.

### Why Firmware Cannot Execute This:
1. **The 5 µs FOC Loop Collision**:
   At 50 MHz (20 ns/cycle), DG32's 5 µs Field-Oriented Control (FOC) loop allows exactly 250 clock cycles. DShot600 (1.67 µs/bit) requires a decision window of 625 ns vs 1250 ns (31 vs 62 cycles), demanding ±15-cycle edge placement. This can only be achieved in software by a blocking busy-wait loop with interrupts disabled for the full 16-bit frame (~1,340 cycles at DShot600; ~2,700 cycles at DShot300). A single incoming DShot frame is **5.3× to 10.8× longer than the entire FOC control period**, causing catastrophic loss of field-oriented commutation.
2. **The 2-Cycle Lockstep False Divergence**:
   DG32 incorporates dual RV32IM cores in hardware lockstep (`dgrid_lockstep_check`). The checker core trails the main core by 2 cycles. Firmware bit-banging branches on asynchronous external pad reads, creating instruction timing and bus store commit jitter between the two cores. The hardware comparator flags this asynchronous store stream as a silicon fault and immediately asserts `FAULTn`.
3. **Physical Pad-Ring Direction**:
   Bidirectional telemetry requires the ESC to turn the pad from input to output within ~30 µs after the command frame ends and drive a 21-bit reply stream. The existing pad-ring configuration ties output enable to a constant level. Firmware cannot dynamically alter pad direction without dedicated hardware support.

**Conclusion**: Hardware decoding and telemetry reply in RTL are non-negotiable for DG32 to serve as an Electronic Speed Controller (ESC).

---

## 1. Protocol Parameters & Bit Timings (at 50 MHz / 20 ns Cycle)

| Protocol Class | Bit Period | High Time `0` (T0H) | High Time `1` (T1H) | Cycles @ 50 MHz (Period / T0H / T1H) | Decision Margin | Supported Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DShot150** | 6.67 µs | 2.50 µs | 5.00 µs | 333 / 125 / 250 cycles | 125 cycles (±1,250 ns) | Supported |
| **DShot300** | 3.33 µs | 1.25 µs | 2.50 µs | 167 / 62 / 125 cycles | 63 cycles (±630 ns) | Supported |
| **DShot600** | 1.67 µs | 0.625 µs | 1.25 µs | 83 / 31 / 62 cycles | 31 cycles (±310 ns) | **Supported Production Max** |
| **DShot1200**| 0.83 µs | 0.312 µs | 0.625 µs | 42 / 16 / 31 cycles | 15 cycles (±150 ns) | **Best-Effort Only** |

*Note*: DShot1200 has only a 15-cycle margin. The synchronizer's ±1-cycle sampling jitter plus Flight Controller (FC) clock drift consumes over 33% of the budget. DShot600 is therefore designated as the maximum reliable production rate.

---

## 2. Frame Formats & Telemetry Mathematics

### 2.1 Command Frame (FC $\to$ ESC, 16 bits)
- `[15:5]`: Throttle (11 bits, 0–2047)
- `[4]`: Telemetry Request bit
- `[3:0]`: CRC4 Checksum:
  - **Normal Mode**: $\text{crc} = n_0 \oplus n_1 \oplus n_2$ over the three 4-bit nibbles of `{throttle, telem}`.
  - **Bidirectional Mode**: $\text{crc} = \sim(n_0 \oplus n_1 \oplus n_2) \ \& \ \text{0xF}$. The inverted CRC and inverted line sense (idle high, low active pulses) identify bidirectional mode.

### 2.2 Telemetry Reply Frame (ESC $\to$ FC, 21 bits)
The reply cannot reuse the TX engine shifter unmodified:
1. **Raw Payload (16 bits)**:
   - `[15:4]`: eRPM period represented as 3-bit exponent $e$ and 9-bit mantissa $m$ ($\text{period}\_\mu\text{s} = m \ll e$).
   - `[3:0]`: Inverted CRC4: $\text{crc} = \sim(v \oplus (v \gg 4) \oplus (v \gg 8)) \ \& \ \text{0xF}$ over the 12-bit period field.
2. **GCR 4b$\to$5b Encoding (20 bits)**:
   Hardware encodes each 4-bit nibble via the standard lookup table:
   `19 1B 12 13 1D 15 16 17 1A 09 0A 0B 1E 0D 0E 0F`
3. **Transition Encoding (21 bits)**:
   $\text{out}[0] = 0$; $\text{out}[i] = \text{out}[i-1] \oplus G[i-1]$. A '1' bit creates a level transition on the wire.
4. **Transmission**:
   Transmitted inverted at $\frac{5}{4}$ the command bit rate (e.g., at DShot600: 750 kbit/s = 1.33 µs/bit = 66.7 cycles at 50 MHz), starting `TURNAROUND` cycles (~30 µs / 1500 cycles) after the command's trailing edge.
   The FC decodes using $G = s \oplus (s \gg 1)$ (Betaflight / Bluejay / AM32 convention).

---

## 3. Peripheral Architecture (Slot 0xC Extension)

Slot 0xC (`dgrid_dshot`, `rtl/dgrid_dshot.sv`) is extended in-place to avoid touching the frozen AXI-lite address decoder and error-slave logic.

### 3.1 Sub-Module Partitioning:
- **`dgrid_dshot_rx`**: Per-channel RX decoder (4 instances).
  - Synchronizer (2-FF) + 2-sample glitch filter (adds fixed 3-cycle / 60 ns latency to both edges, preserving measured width).
  - 12-bit high-time counter compared to `RXTHRESH`.
  - 16-bit shift register with 4-bit bit counter.
  - `RXTIMEOUT` idle cycle counter (resets bit counter after ~2× `BITPERIOD` to prevent permanent desynchronization from lost edges).
  - CRC4 verification engine; sets `VALID`, `CRC_ERR`, or `OVERRUN`.
- **`dgrid_dshot_tel`**: Per-channel reply engine (4 instances).
  - Armed when `TELEM_EN=1` and incoming frame has `telem=1`, or when `TELEM_ALWAYS=1` (Betaflight bidirectional standard).
  - Waits `TURNAROUND` cycles, asserts `pad_oe`, shifts 21 bits at `TELEMPERIOD` (67 cycles for DShot600), deasserts `pad_oe`.
  - Firmware only writes `{e, m}` once per commutation period; hardware calculates CRC, GCR, and transition encoding.
  - **Early Abort**: If a new command edge arrives while driving a reply, OE is released within 1 cycle, and `TEL_ABORT` is set (never fight the FC for the wire).
- **Direction Ownership Mux**:
  $$\text{pad}\_\text{oe}[\text{ch}] = \text{TX}\_\text{BUSY} \ | \ \text{dgrid}\_\text{dshot}\_\text{tel}\_\text{driving}$$
  When `PINMUX[0]=0` (PWM mode), `pad_oe` is forced high.

---

## 4. Register Map (Slot 0xC, Base `0x...C00`)

Existing registers `0x00–0x20` remain unchanged.

| Address | Name | Bits | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `0x24` | `RXCTRL` | `[0]`<br>`[1]`<br>`[2]`<br>`[3]`<br>`[4]`<br>`[5]` | RW | `RX_EN` (enable all 4 receivers)<br>`INVERT` (bidirectional mode inverted line sense)<br>`TELEM_EN` (arm reply on telem=1)<br>`TELEM_ALWAYS` (reply on every valid frame)<br>`IRQ_FRAME_EN` (interrupt on any channel `VALID`)<br>`IRQ_ERR_EN` (interrupt on error) |
| `0x28` | `RXTHRESH` | `[11:0]` | RW | High-time cycle threshold distinguishing 1 from 0. Defaults to `(T0H + T1H) / 2`. |
| `0x2C` | `RXTIMEOUT` | `[11:0]` | RW | Idle cycle count terminating partial frames. Defaults to `2 * BITPERIOD`. |
| `0x30` | `RXFRAME0` | `[10:0]`<br>`[11]`<br>`[12]`<br>`[13]`<br>`[14]`<br>`[15]` | RO<br>RO<br>RO/W1C<br>RO/W1C<br>RO/W1C<br>RO/W1C | Channel 0 Received `THROTTLE`<br>`TELEM` request bit<br>`VALID` (frame received, CRC good)<br>`CRC_ERR` (checksum bad)<br>`OVERRUN` (frame arrived before previous read)<br>`TEL_ABORT` (reply aborted by incoming FC edge) |
| `0x34` | `RXFRAME1` | `[15:0]` | — | Channel 1 frame and status |
| `0x38` | `RXFRAME2` | `[15:0]` | — | Channel 2 frame and status |
| `0x3C` | `RXFRAME3` | `[15:0]` | — | Channel 3 frame and status |
| `0x40` | `TURNAROUND` | `[15:0]` | RW | Command-to-reply delay in cycles (1500 cycles = 30 µs @ 50 MHz). |
| `0x44` | `TELEMPERIOD`| `[11:0]` | RW | Reply bit period in cycles (default `BITPERIOD * 4 / 5` = 67 cycles). |
| `0x48` | `TELEM0` | `[11:0]` | RW | Channel 0 eRPM period `{e[2:0], m[8:0]}`. Hardware handles CRC, GCR, transitions. |
| `0x4C` | `TELEM1` | `[11:0]` | RW | Channel 1 eRPM period |
| `0x50` | `TELEM2` | `[11:0]` | RW | Channel 2 eRPM period |
| `0x54` | `TELEM3` | `[11:0]` | RW | Channel 3 eRPM period |
| `0x58` | `RXSTATUS` | `[19:0]` | RO | Snapshot: `VALID[3:0]`, `CRC_ERR[3:0]`, `OVERRUN[3:0]`, `TEL_BUSY[3:0]`, `PAD_DIR[3:0]` |
| `0x5C` | `RXIRQ` | `[1:0]` | RO/W1C | `FRAME` (bit 0), `ERR` (bit 1) interrupt pending flags. |

**Lockstep Invariance (W1C Rule)**: All flags use Write-1-to-Clear (W1C). Read-to-clear is forbidden because the lockstep checker mirrors bus reads to the `CHECKER` core 2 cycles late; read side-effects would break core synchronization.

---

## 5. Physical Pad-Ring & Bridge Safety Preservation

The DG32 QFN-64 package has 44/44 dedicated signals with 0 spare pads. The DShot RX path reuses the 4 PWM high-side pads:

| Pad Name | Index | Original Class | Modified Class | Mode Settings | Safety Constraint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `P_PWM_AH` | `io[26]` | `PC_OUT` | `PC_BIDIR` | `gpio_dm=110`, `gpio_inp_dis=0` | Reused for DShot Ch 0 |
| `P_PWM_AL` | `io[27]` | `PC_OUT` | **`PC_OUT` (Untouched)** | `gpio_dm=110`, `gpio_inp_dis=1` | **Never muxed; prevents bridge shoot-through** |
| `P_PWM_BH` | `io[28]` | `PC_OUT` | `PC_BIDIR` | `gpio_dm=110`, `gpio_inp_dis=0` | Reused for DShot Ch 1 |
| `P_PWM_BL` | `io[29]` | `PC_OUT` | **`PC_OUT` (Untouched)** | `gpio_dm=110`, `gpio_inp_dis=1` | **Never muxed; prevents bridge shoot-through** |
| `P_PWM_CH` | `io[30]` | `PC_OUT` | `PC_BIDIR` | `gpio_dm=110`, `gpio_inp_dis=0` | Reused for DShot Ch 2 |
| `P_PWM_CL` | `io[31]` | `PC_OUT` | **`PC_OUT` (Untouched)** | `gpio_dm=110`, `gpio_inp_dis=1` | **Never muxed; prevents bridge shoot-through** |
| `P_PWM_TRIG`| `io[32]` | `PC_OUT` | `PC_BIDIR` | `gpio_dm=110`, `gpio_inp_dis=0` | Reused for DShot Ch 3 |

- **External Pull-Up Mandate**: `PC_BIDIR` has no internal weak pull-up resistors in OpenFrame. The board must supply an external 1kΩ–4.7kΩ pull-up to 3.3V.
- **Reset Invariance**: `pad_oe` deasserts during `rst_n_i` low, ensuring the chip floats as an input during reset and never drives the FC line.

---

## 6. SRAM Architecture: 28 KB vs 32 KB Floorplan Lever Analysis

- **The Firmware Constraint**: Ayaz notes 28 KB is the absolute bare minimum, and 32 KB provides necessary safety margins; the reusable buffer optimization recovers only 2 KB.
- **The Physical Floorplan Lever**:
  - The 28 KB proposal was introduced as a **geometric macro placement lever** for the dual-domain 2DOM variant inside the 2,900 µm OpenFrame wrapper slot.
  - 32 KB (16 macros + 1 auxiliary = 17 macros) forces a **3 columns × 7 rows** grid, compressing the central full-width logic strip to **1.75 mm²** and causing placement routing congestion failure.
  - 28 KB (14 macros + 1 auxiliary) enables a **3 columns × 6 rows** layout, deleting an entire macro row and expanding the logic area to **3.40 mm²** (nearly double).
- **Empirical Resolution**:
  - Test run `2dom/13` evaluates whether a keep-32 KB spread-floorplan closes timing. If `2dom/13` closes, 32 KB is retained.
  - If only reduced-macro runs close (`2dom/12`), the 28 KB floorplan is adopted with the 2 KB firmware buffer.
  - **DG32-LITE base die is unaffected and strictly retains 32 KB SRAM**.
