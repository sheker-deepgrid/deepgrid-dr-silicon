# DG32-LITE preliminary datasheet — story pack

Source: `DG32-LITE_Datasheet-3.pdf` (preliminary, pre-silicon). Publication level: investor (public
site). Storyline (Rule 0): the datasheet's own order — features → pinout → pin description →
electrical → power → clock, reset and boot → package — with §7 memory map, §8 register map and
§9 board-design guidance cut. Bracketed by an executive summary and a close.

## 1. BLUF
DG32-LITE is a self-booting lockstep motor MCU in a 9 × 9 mm QFN-64 that a design plans around four
fixed facts — a 1.8 V core rail, a 3.3 V I/O ring, one 50 MHz clock and 44 signal pins — while every
electrical limit stays provisional until first-silicon characterisation.

## 2. Audience decision
Hardware and firmware leads can start planning a DG32-LITE design around the fixed facts, and should
treat electrical limits and the pin map as preliminary.

## 3. Tension
A preliminary datasheet mixes settled facts with nominals; planning on the wrong kind costs a
board respin.

## 4. Argument arc
1. Context: what the part is and the four facts (1–2). 2. What is inside (3). 3. Where the signals
come out (4–5). 4. Electrical and power envelope (6–7). 5. Clock, reset, boot (8–9). 6. Firmware-level
limits (10). 7. What is final versus preliminary (11). 8. Close (12).

## 5. Slide spine
| # | Title | Evidence | Visual |
|---|---|---|---|
| 1 | A lockstep motor MCU in a QFN-64 package | §1, §10 | Dark cover, package motif, 4 KPIs |
| 2 | Four facts set every DG32-LITE design-in | §2, §4.1, §5, §6.1 | KPI row + thesis band |
| 3 | Nine features, one self-booting safety SoC | §1 | 3 × 3 card grid |
| 4 | 44 signal pins in eleven functional groups | §3, §3.1 | Group table + to-scale bars |
| 5 | Each side of the package groups related signals | §2 pinout | Native package-side diagram |
| 6 | Every electrical limit is a nominal until silicon | §4.1–4.2 | Two tables + caveat card |
| 7 | All logic draws from one 1.8 V rail | §4.3, §5 | Rail table + KPI + cards |
| 8 | One clock pin, two resets and no PLL | §6.1, §4.1 | Two chains + cards |
| 9 | The ROM boots from flash or opens a monitor | §6.2 | Chain + cards + KPIs |
| 10 | Peripheral limits a firmware plan can rely on | §1, §8 block notes (capabilities only) | Table, ADC row highlighted |
| 11 | The package is final; the pin map is preliminary | §10, header notes | KPI grid + status cards |
| 12 | Fixed now. Measured at first silicon. | synthesis | Close |

## 6. Evidence map
Direct: all figures above from the datasheet. Rulings: clock 50 MHz (pin table's 48 MHz nominal
overruled by §4.1 and §6.1); instruction set shown as RV32IM per the block diagrams. Honest limits
kept: ADC runs untrimmed on this silicon; pin map awaiting bond-diagram confirmation.

## 7. Content cuts
Memory map and addresses, register bit maps, boot magic value and flash opcode detail, injection keys,
board-design rules (driver, pull-up, routing guidance), harness and shuttle identifiers.

## 8. Rebuild instructions
Same kit and gates as the architecture decks; titles ≤ 52 characters; source line on every content slide.

## 9. Narration

1. DG32-LITE is Deepgrid Semi's lockstep RISC-V motor-control chip, and this is its preliminary datasheet in twelve slides. Two cores run in lockstep inside a nine-by-nine millimetre, sixty-four-pin QFN. Everything here comes from the design as built for first silicon and from process nominals, not from measured parts, and each slide says which is which.
2. Four facts set every design-in. The core runs from a one point eight volt rail. The input and output ring runs at three point three volts. The whole chip runs from one fifty megahertz clock. And every signal comes out through forty-four pins of a sixty-four-pin package, with the other twenty pins given to supplies and ground.
3. The datasheet lists nine features. Two RISC-V cores in lockstep with a fault comparator. Thirty-two kilobytes of SRAM and a sixty-four kilobyte boot ROM. Three-phase PWM with a hardware brake, four DShot channels, encoder and Hall inputs, a CORDIC and an on-die ADC. Serial ports, SPI, I squared C and GPIO, with supervision. And it boots itself, with no management core.
4. Forty-four signal pins fall into eleven groups. Motor PWM and its sample trigger take seven, and so does the QSPI flash. Position sensing takes six. Serial, SPI, JTAG and GPIO take fifteen between them. Three carry safety signals, including the fault output, and the analog inputs, I squared C, and clock and reset take two each.
5. The pins are placed by job. One side carries the motor: all six gate outputs, the sample trigger, the encoder and two Hall inputs. The opposite side carries the boot flash and the serial ports. The bottom holds JTAG, the clock and the resets, and the top holds I squared C, GPIO, the fault output and the supply-good inputs.
6. Every electrical limit in this datasheet is a design target or a process nominal, and first-silicon characterisation will replace it. The core supply runs from one point seven one to one point eight nine volts, and the input and output supply from three to three point six. The analog inputs accept zero to one point eight volts, and absolute maximums sit just above the operating range.
7. Power is simple. All logic, memory and the ADC draw from the one point eight volt user rail. The other user rails are unused, and are tied to their nominal voltage only to keep protection structures biased. Bring up three point three volts before or together with one point eight. The tool estimate is about zero point four three watts at fifty megahertz.
8. Clocking is just as direct. One three point three volt clock input drives the whole chip at a fifty megahertz design target, and there is no on-die PLL. Two active-low resets are combined on the die with the power-on reset, so a board can use either one and pull the other high. The core itself reaches fifty-five to sixty-two megahertz after place-and-route.
9. The chip boots with no outside help. The ROM prints a banner on the console UART, reads and checks the flash image header, copies the image into SRAM over a quad-SPI read, and jumps to it. Code runs from SRAM, not in place from flash. If the flash is blank, a UART monitor starts instead, so a bare board can still be inspected.
10. These are the limits firmware can plan on. The UARTs run at one hundred fifteen thousand two hundred baud, SPI to twenty-five megahertz, and I squared C at one hundred or four hundred kilohertz. PWM dead-time reaches five point one microseconds, and the brake acts within two cycles. The ADC samples at about two hundred kilosamples per second, and on this silicon it runs untrimmed.
11. The package is settled: a nine-by-nine millimetre QFN with a half-millimetre pitch and an exposed ground paddle. Three things are still preliminary. The pin map waits on the foundry's bond-diagram confirmation, the electrical section waits on characterisation, and the control core stays frozen for feature work until silicon test.
12. So here is what is fixed and what is not. Fixed now: the package, the pin groups, the rails, the clock and the boot path. Measured at first silicon: every electrical limit, and the final pin map. The register-level detail lives in the engineering datasheet; this deck is the plan you build around.
