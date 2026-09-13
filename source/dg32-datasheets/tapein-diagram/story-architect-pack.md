# DG32-LITE tape-in block diagram — story pack

Source: `DG32-LITE_block_diagram.pdf` (tape-in die, state 2026-09-10), with the investor block diagram
for the debug roadmap and the 3D walkthrough script as claim control (no tapeout-ready or LVS-clean
claim). Publication level: investor. Storyline (Rule 0): the diagram's own reading order — clocks and
reset → dual-core lockstep → fetch decoder, boot ROM and SRAM → bus → slave blocks → wrapper pad plan →
scan and JTAG → sign-off gates. Cut: repository name, run letters and run history, address map,
IDCODE and ID values, pad indices, the CORDIC cycle figure that conflicts with the datasheet.

## 1. BLUF
The tape-in diagram records DG32-LITE as built: one clock and reset, a lockstep pair that tolerates
interrupts and peripheral reads, a bus where nothing hangs, 44 pads with no spare, and four sign-off
gates that must all pass before tape-in.

## 2. Audience decision
Reviewers should see the die as a checked design record, and read the gate list as the bar the
die must clear, not as a claim that it has.

## 3. Tension
Block diagrams usually show intent; this one records the as-built die, including the check that
caught what standard checks miss. Without it, a clean DRC and LVS could be mistaken for a finished die.

## 4. Argument arc
1. What this is (1–2). 2. Clock and reset (3). 3. Lockstep behaviour (4). 4. Memory and fetch (5).
5. Bus rules (6). 6. The blocks (7). 7. Pads (8). 8. Test (9). 9. Gates (10). 10. Close (11).

## 5. Slide spine
| # | Title | Evidence | Visual |
|---|---|---|---|
| 1 | DG32-LITE as built for tape-in | header | Dark cover, package motif, 4 KPIs |
| 2 | One clock, 44 pads, and four gates before tape-in | whole diagram | KPI row + band |
| 3 | One clock and one reset drive the whole block | Clocks & reset panel | Two chains + card |
| 4 | The checker trails MAIN and sees its bus responses | DCLS panel | Chain + cards |
| 5 | Code runs from SRAM through a dedicated fetch port | Fetch decoder, boot ROM, SRAM | Chain + cards |
| 6 | One requester at a time, and no access hangs | AXI-lite bus panel | Chain + cards |
| 7 | Eighteen blocks sit around the bus | slave slots | 6 × 3 native tile grid |
| 8 | Every one of the 44 wrapper pads has a job | wrapper pad plan (rev 2) | To-scale pad bar + two tables |
| 9 | Production test reaches 13 scan chains via JTAG | Scan/DFT, JTAG TAP; investor p2 | Chain + cards |
| 10 | Four gates must all pass before tape-in | Signoff gates panel | Rail + cards |
| 11 | Built to be checked, not assumed. | synthesis | Close |

## 6. Evidence map
Direct: every block fact from the diagram. Generalised, not quoted: the reason for the connectivity
gate (DRC and LVS can pass while a pad pin floats) without run letters or history. Rulings: checker
two cycles behind with mirrored bus responses (this diagram is the newest source); CORDIC shown as
20 iterations, Q1.31, without a cycle count.

## 7. Content cuts
Repository name, run letters and results, address map and slot addresses, IDCODE and part ID values,
pad index numbers, module and testbench names.

## 8. Rebuild instructions
Same kit and gates; no claim that the gates have passed.

## 9. Narration

1. This is DG32-LITE as recorded in its tape-in block diagram: the die as built, block by block. It covers the clock and reset, the lockstep pair, memory and fetch, the bus and the eighteen blocks around it, the pad plan, production test, and the four sign-off gates the die must pass. It is a design record, not a measurement of silicon.
2. The short version. One fifty megahertz clock domain, with the lockstep core measured at fifty-five to sixty-two megahertz after place-and-route. A checker that runs two cycles behind and sees the main core's bus responses. Forty-four wrapper pads, every one of them allocated. And four sign-off gates that must all pass on the final die.
3. One clock and one reset drive the whole block. The clock arrives from a pad at fifty megahertz. Eight software clock gates switch off idle peripherals: both UARTs, SPI, I squared C, PWM, the timers, the DMA and the CORDIC. Test mode forces every gate open. Reset is asynchronous, the supervisor deglitches the supply-good inputs, and the checker leaves reset two cycles after the main core.
4. The lockstep pair is built to survive real firmware. The main core runs the code and owns the bus. The checker replays the same work two cycles later, with its inputs and bus responses mirrored, and the comparator checks every committed store. So interrupts are safe, firmware may branch on a peripheral read, and the pair has been verified under interrupts in simulation. A mismatch drives the fault pad.
5. Code runs from SRAM through a dedicated fetch port. The fetch decoder sends boot fetches to the ROM and application fetches to the SRAM's second port. Anything else is a bus error and an instruction fault. The ROM is sixteen thousand words of mask-programmed logic that prints the banner, checks the flash header, copies the application and jumps. Blank flash opens a UART monitor.
6. The bus serves one requester at a time. The CPU has priority over the DMA, and each read or write target is latched at the request and held until the response. Every peripheral is a thirty-two-bit register slave. A clock-gated or undecoded slot answers with an error instead of hanging, and the QSPI window serves data, not code.
7. Eighteen blocks sit around that bus. Six handle connectivity: the UARTs, SPI, I squared C, the QSPI window, GPIO and the timers. Six serve the motor: PWM, DShot, encoder and Hall, CORDIC, the ADC and interrupts. And six handle system, safety and test: system control, the watchdog, the fault register, the error slave, scan, and the JTAG port.
8. Every one of the forty-four wrapper pads has a job. Seven carry the QSPI flash, seven the PWM outputs and trigger, and six the encoder and Hall inputs. Four each go to the UARTs, SPI and JTAG. Three are GPIO. Two each carry I squared C, supply-good and the analog ADC inputs, and one each carry the clock, the reset and the fault output.
9. Production test reaches the logic through JTAG. A tester drives the four JTAG pins into a test access port in the wrapper, which selects scan enable, scan mode, a chain, or bypass, and reaches thirteen scan chains inside the hardened block. Test mode forces every clock gate open, so scan reaches every block. Interactive CPU debug over JTAG is a roadmap item.
10. Four gates must all pass before tape-in. The layout must be design-rule clean. Layout versus schematic must match uniquely, pins included. A connectivity check on the final layout must show every pad reaching logic, with no floating net. And a gate-level simulation of the routed netlist must boot and print the banner. The connectivity gate exists because the first two can pass while a pad pin floats.
11. Three things to take away. One clock and one reset, with eight clock gates and a checker released two cycles late. Nothing hangs and nothing floats: bad accesses return errors, and all forty-four pads are allocated. And four gates stand between the design and tape-in. The next milestone is first silicon, on the September twenty twenty-six shuttle.
