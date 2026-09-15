# DeepGrid Semi — DG32-LITE & DG32-2DOM Datasheet Engineering Specification
**Document Classification:** Confidential Preliminary Datasheet Specification (CI2609 & CI2612 Releases)  
**Corporate Entity:** DeepGrid Semi Pvt Ltd · CIN: U62099TS2024PTC183631 · T-Hub Phase 2, Hyderabad  
**Package:** 64-pin QFN ($9.0 \times 9.0\ \text{mm}$, 0.5 mm pitch, exposed paddle = VSS)  
**Process Technology:** SkyWater sky130A (130 nm CMOS)  

---

## 1. Product Family Overview

DeepGrid Semi's motor-control silicon family comprises two primary silicon variants sharing a common physical footprint, pad ring, and register base:

1. **DG32-LITE (chipIgnite CI2609 Shuttle):**
   - Single 50 MHz clock domain.
   - Dual RV32IMC DGridRiscV cores in cycle-by-cycle hardware lockstep.
   - 32 KB on-chip SRAM (16x sky130 macros, parity-none), 64 KB baked boot ROM, QSPI-XIP external NOR flash window.
   - 3-phase center-aligned complementary PWM with programmable dead-time, 4-channel DShot ESC engine (pad-muxed), quadrature + Hall encoder, CORDIC math unit, and on-die 8-bit differential SAR ADC.
   - Target power: ~0.43 W @ 50 MHz (tt 25 °C, 1.8 V core).

2. **DG32-2DOM (chipIgnite CI2612 Shuttle):**
   - Larger die ($3400 \times 4500\ \mu\text{m}$, $15.30\ \text{mm}^2$) accommodating the frozen lockstep motor-control core plus a hardware INT8 attention accelerator (`dgrid_int8_attn`).
   - Dual clock domains: 50 MHz CPU domain and 114 MHz fast domain (`clk_fast_i`), linked across 4-phase req/ack CDC bridges with 2-FF synchronizers.
   - Memory-mapped attention engine at `0xE000_0000`: executes full softmax, 256-entry u15 EXP table, and 40-bit accumulator numerator.
   - Identical external 64-pin QFN pinout: pin-compatible drop-in replacement for DG32-LITE carrier boards.

---

## 2. Complete 64-Pin QFN Physical Pin Map

Pin 1 is located at the top-left corner; numbering proceeds counter-clockwise around the package perimeter.

```
                  NORTH SIDE (Pins 49–64)
       +---------------------------------------------+
       | 64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49 |
  1    | [•]                                           | 48
  2    |                                               | 47
  3    |                                               | 46
  4    |                                               | 45
  5    |             DG32-LITE / 2DOM                  | 44
WEST   |                  QFN-64                       |    EAST
PINS   |                9 x 9 mm                       |    PINS
(1–16) |                0.5 mm                         |    (33–48)
       |           EXPOSED PADDLE (EP)                 |
  12   |                 = VSS                         | 37
  13   |                                               | 36
  14   |                                               | 35
  15   |                                               | 34
  16   |                                               | 33
       +---------------------------------------------+
         17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32
                  SOUTH SIDE (Pins 17–32)
```

### Complete Pin Table

| Pin | Name | Type | Domain | Description & PCB Connection Rule |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `vssa2` | Ground | Ground | Analog substrate ground |
| **2** | `ADC_VINN` | Analog | 1.8V vccd1 | SAR ADC negative differential input (0 to 1.8 V) |
| **3** | `PWM_AH` | Output | 3.3V vddio | Phase A High-Side PWM gate drive / DShot CH0 |
| **4** | `PWM_AL` | Output | 3.3V vddio | Phase A Low-Side PWM gate drive |
| **5** | `PWM_BH` | Output | 3.3V vddio | Phase B High-Side PWM gate drive / DShot CH1 |
| **6** | `PWM_BL` | Output | 3.3V vddio | Phase B Low-Side PWM gate drive |
| **7** | `PWM_CH` | Output | 3.3V vddio | Phase C High-Side PWM gate drive / DShot CH2 |
| **8** | `PWM_CL` | Output | 3.3V vddio | Phase C Low-Side PWM gate drive |
| **9** | `vdda2` | Power | 3.3V | User analog supply (unused; tie to 3.3 V) |
| **10** | `vssd2` | Ground | Ground | Digital ground |
| **11** | `PWM_TRIG` | Output | 3.3V vddio | Current sampling pulse (center-aligned ripple null) |
| **12** | `ENC_A` | Input | 3.3V vddio | Quadrature encoder channel A (2-flop sync) |
| **13** | `ENC_B` | Input | 3.3V vddio | Quadrature encoder channel B (2-flop sync) |
| **14** | `ENC_Z` | Input | 3.3V vddio | Quadrature encoder index Z (resets position counter) |
| **15** | `HALL_A` | Input | 3.3V vddio | Motor Hall sensor input A |
| **16** | `HALL_B` | Input | 3.3V vddio | Motor Hall sensor input B |
| **17** | `vddio` | Power | 3.3V | Main 3.3 V I/O and ESD supply (**REQUIRED**) |
| **18** | `vccd` | Power | 1.8V | OpenFrame harness core supply (**REQUIRED**) |
| **19** | `N/C` | N/C | — | No connect; leave floating |
| **20** | `vssa` | Ground | Ground | Substrate analog ground |
| **21** | `resetb` | Input | 3.3V vddio | Harness reset input, active low (ANDed on-die with pin 28) |
| **22** | `HALL_C` | Input | 3.3V vddio | Motor Hall sensor input C |
| **23** | `vssd` | Ground | Ground | Digital core ground |
| **24** | `TCK` | Input | 3.3V vddio | JTAG Clock (weak internal pull-down; idles safely) |
| **25** | `TMS` | Input | 3.3V vddio | JTAG Mode Select (weak internal pull-up) |
| **26** | `TDI` | Input | 3.3V vddio | JTAG Data In (weak internal pull-up) |
| **27** | `TDO` | Output | 3.3V vddio | JTAG Data Out (driven only while shifting) |
| **28** | `RST_N` | Input | 3.3V vddio | External chip reset, active low (ANDed with resetb) |
| **29** | `vssio` | Ground | Ground | I/O pad ring ground |
| **30** | `vdda` | Power | 3.3V | Harness analog & POR supply (**REQUIRED**) |
| **31** | `CLK` | Input | 3.3V vddio | System master clock, 50 MHz nominal |
| **32** | `QSPI_SCLK`| Output | 3.3V vddio | QSPI Flash Clock (SCLK = CLK/2 = 25 MHz) |
| **33** | `QSPI_CSN0`| Output | 3.3V vddio | QSPI Flash Chip Select 0 (Boot flash active low) |
| **34** | `QSPI_IO0` | Bidir | 3.3V vddio | QSPI Data Bit 0 (MOSI) |
| **35** | `QSPI_IO1` | Bidir | 3.3V vddio | QSPI Data Bit 1 (MISO) |
| **36** | `QSPI_IO2` | Bidir | 3.3V vddio | QSPI Data Bit 2 (WPn) |
| **37** | `QSPI_IO3` | Bidir | 3.3V vddio | QSPI Data Bit 3 (HOLDn) |
| **38** | `vssa1` | Ground | Ground | User area analog ground |
| **39** | `vssd1` | Ground | Ground | User area digital ground |
| **40** | `vdda1` | Power | 3.3V | User analog supply (unused; tie to 3.3 V) |
| **41** | `QSPI_CSN1`| Output | 3.3V vddio | QSPI Flash Chip Select 1 (Optional PSRAM / 2nd device)|
| **42** | `UART0_TX` | Output | 3.3V vddio | Boot console UART TX (emits banner @ 115200 8N1) |
| **43** | `UART0_RX` | Input | 3.3V vddio | Boot console UART RX (interactive monitor) |
| **44** | `UART1_TX` | Output | 3.3V vddio | Secondary telemetry UART TX |
| **45** | `UART1_RX` | Input | 3.3V vddio | Secondary telemetry UART RX |
| **46** | `SPI_SCLK` | Output | 3.3V vddio | SPI Master Clock (up to 25 MHz) |
| **47** | `vdda1` | Power | 3.3V | User analog supply (unused; tie to 3.3 V) |
| **48** | `SPI_MOSI` | Output | 3.3V vddio | SPI Master Data Out |
| **49** | `vccd1` | Power | 1.8V | User area core supply: all logic, SRAM, ADC (**REQUIRED**)|
| **50** | `SPI_MISO` | Input | 3.3V vddio | SPI Master Data In |
| **51** | `SPI_CSN` | Output | 3.3V vddio | SPI Master Chip Select (active low) |
| **52** | `vssa1` | Ground | Ground | User area analog ground |
| **53** | `I2C_SCL` | Bidir | 3.3V vddio | I2C Clock, open-drain (external pull-up required) |
| **54** | `I2C_SDA` | Bidir | 3.3V vddio | I2C Data, open-drain (external pull-up required) |
| **55** | `GPIO0` | Bidir | 3.3V vddio | General-Purpose I/O pin 0 (atomic SET/CLR) |
| **56** | `vssio` | Ground | Ground | I/O pad ring ground |
| **57** | `GPIO1` | Bidir | 3.3V vddio | General-Purpose I/O pin 1 |
| **58** | `GPIO2` | Bidir | 3.3V vddio | General-Purpose I/O pin 2 |
| **59** | `FAULT_N` | Output | 3.3V vddio | Hardware lockstep trip, active low ($\le 2$ cycles) |
| **60** | `RAIL_OK0` | Input | 3.3V vddio | Power rail supervisor input 0 |
| **61** | `RAIL_OK1` | Input | 3.3V vddio | Power rail supervisor input 1 |
| **62** | `ADC_VINP` | Analog | 1.8V vccd1 | SAR ADC positive differential input (0 to 1.8 V) |
| **63** | `vccd2` | Power | 1.8V | User digital supply (unused; tie to 1.8 V) |
| **64** | `vddio` | Power | 3.3V | Main 3.3 V I/O and ESD supply (**REQUIRED**) |
| **EP** | `VSS` | Ground | Ground | Center exposed die paddle; solder directly to GND |

---

## 3. Power Supplies, Sequencing & Electrical Limits

### Recommended Operating Conditions
- **Core Logic & SRAM (`vccd1`, pin 49):** 1.71 V to 1.89 V (Nominal: 1.8 V $\pm 5\%$).
- **Harness Core (`vccd`, pin 18):** 1.71 V to 1.89 V (Nominal: 1.8 V).
- **Pad Ring & ESD (`vddio`, pins 17, 64):** 3.0 V to 3.6 V (Nominal: 3.3 V $\pm 10\%$).
- **Harness Analog / POR (`vdda`, pin 30):** 3.0 V to 3.6 V (Nominal: 3.3 V).
- **Core Clock (`CLK`, pin 31):** 50 MHz design target ($f_{\max}$ post-route 55–62 MHz).
- **Differential ADC Input (`ADC_VINP`, `ADC_VINN`):** 0 to 1.8 V differential.

### Power Sequencing Protocol
1. **Ramp Order:** Bring up 3.3 V (`vddio`, `vdda`) **before or coincident with** 1.8 V (`vccd`, `vccd1`).
2. **Voltage Differential:** At no point during power-up, steady-state, or power-down may `vccd1` exceed `vddio` by $>0.3\ \text{V}$.
3. **Unused Rail Biasing:** Unused rails (`vdda1`, `vdda2`, `vccd2`) must be tied to nominal voltages (3.3V and 1.8V) to ensure the pad ring's domain-order ESD steering diodes remain properly reversed-biased.
4. **Current Dissipation:** Dynamic and leakage current is drawn entirely from `vccd1` (~0.43 W at 50 MHz, tt 25 °C).

---

## 4. Standalone Boot Sequence & Memory Map

The SoC has no external management core. At power-on reset, the 64 KB baked std-cell boot ROM executes autonomously:
1. **UART Banner:** Emits `DG32` boot banner on `UART0_TX` (pin 42) at 115,200 baud, 8N1 (divider = 434 @ 50 MHz).
2. **QSPI Flash Detection:** Reads external NOR flash header through the `0x1000_0000` window:
   - Validates 32-bit boot magic word: `0xD632_B007`.
   - Reads 32-bit payload length word.
3. **Image Transfer:** Copies executable binary from NOR flash into 32 KB SRAM using QSPI quad-output-fast-read opcode `0x6B` (1-1-4 mode, 8 dummy cycles, SCLK = 25 MHz).
4. **Execution Jump:** Branches execution to SRAM (`0x9000_0000`).
5. **Fallback:** If flash is blank or invalid, ROM drops to an interactive UART monitor (`r` read, `w` write, `j` jump, `i` info) so bare boards remain inspectable without JTAG.

### Memory Map & PMA Whitelist Logic
The CPU core enforces a hardwired Physical Memory Attribute (PMA) whitelist:
$$\text{fault} = \neg(\text{addr}[31] \lor \text{addr}[31:28] == \text{0x1})$$

| Base Address | Block Name | Description |
| :--- | :--- | :--- |
| `0x1000_0000` | **QSPI-XIP** | External NOR flash data read window (loads only; fetch is ROM-only) |
| `0x9000_0000` | **AXI SRAM** | 32 KB main data memory (16 sky130 macros, 1rw1r) |
| `0xC000_0000` | **DShot ESC** | 4-channel digital DShot engine, pin-muxed onto PWM pads |
| `0xD000_0000` | **UART0** | Console UART (emits boot banner) |
| `0xD100_0000` | **UART1** | Secondary telemetry UART |
| `0xD200_0000` | **SPI Master** | Master SPI up to 25 MHz (0.64 µs per 16-bit word) |
| `0xD300_0000` | **GPIO** | 14 pins with atomic SET/CLR registers |
| `0xD400_0000` | **TIMER0** | General-purpose down-counter with compare interrupt |
| `0xD500_0000` | **TIMER1** | Secondary control loop timer |
| `0xD600_0000` | **Fault CSR** | Poison + cause latch (001 DATA_MISMATCH, INJECT `0xDEAD_5AFE`) |
| `0xD700_0000` | **Supervisor** | Windowed watchdog (`0xA5A5` kick) and rail supervision |
| `0xD800_0000` | **PWM** | 3-phase center-aligned complementary PWM (hardware brake $\le 2$ cyc)|
| `0xD900_0000` | **I2C Master** | 7-bit, 100/400 kHz, open-drain with clock stretching |
| `0xDA00_0000` | **Encoder** | Quadrature A/B/Z + Hall state with 32-bit cycle timestamps |
| `0xDB00_0000` | **SAR ADC** | 8-bit differential SAR ADC (~200 kSa/s @ reset divider) |
| `0xDC00_0000` | **DMA** | Single-beat AXI block mover (~7.1 cycles/word) |
| `0xDD00_0000` | **SYSCTL** | Device ID and peripheral clock gating |
| `0xDE00_0000` | **CORDIC** | Q1.31 rotation/vectoring ($N=20$, 53–58 cycles/op) |
| `0xDF00_0000` | **IRQ Aggregator**| 16 interrupt sources (TMR0/1, PWM trig, ADC done, DMA, I2C, FAULT, ATTN)|
| `0xE000_0000` | **Attention** | INT8 Attention Engine (DG32-2DOM only; returns `SLVERR` on LITE) |

---

## 5. Hardware / PCB Layout Guidelines
1. **Differential Current Sense Routing:**
   - `ADC_VINP` (pin 62) and `ADC_VINN` (pin 2) must be routed as a 100 $\Omega$ differential microstrip pair with matched lengths ($<0.5\ \text{mm}$ skew).
   - Shield the analog traces from high-frequency PWM switching lines (pins 3–8) using ground guard traces.
2. **PWM Gate Drive Outputs:**
   - Pins 3–8 drive complementary gate signals with programmable dead-time. The active-low hardware brake combinatorially forces all 6 gate signals low in $\le 2$ clock cycles upon fault assertion.
3. **I2C Bus Pull-Ups:**
   - `I2C_SCL` (pin 53) and `I2C_SDA` (pin 54) are true open-drain pads on silicon. The carrier PCB must provide external pull-up resistors (2.2 k$\Omega$ to 4.7 k$\Omega$ to 3.3 V).
4. **JTAG Invariance:**
   - `TMS` (pin 25) and `TDI` (pin 26) feature internal weak pull-ups; `TCK` (pin 24) features an internal weak pull-down. An unconnected JTAG header will not cause floating state toggling.
