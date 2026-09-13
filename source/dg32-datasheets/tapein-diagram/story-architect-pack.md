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

1. Before a chip goes to the foundry, its block diagram is the most complete record of what will be built. This film walks DG32-LITE through that record: clocking and reset, the lockstep cores, memory, the bus and its peripherals, the pads, production test, and the checks that stand before tape-in. Everything here describes the intended die; nothing has yet been measured on silicon.
2. The short version. One fifty megahertz clock domain, with the lockstep core measured at fifty-five to sixty-two megahertz after place-and-route. A checker that runs two cycles behind and sees the main core's bus responses. Forty-four wrapper pads, every one of them allocated. And four sign-off gates that must all pass on the final die.
3. Timing starts simple on purpose. A single fifty megahertz input clocks everything, so there is no crossing between domains to verify. Software can shut off the clock to eight blocks it is not using, from the serial ports to the CORDIC, and in test mode all eight are forced on. Reset is asynchronous, a supervisor cleans up the supply-good signals, and the checker core leaves reset two cycles after the main core.
4. The hard part of lockstep is not comparing two cores; it is keeping them from disagreeing when nothing is wrong. Interrupts and peripheral reads are the usual culprits, because the second core would see them at a different moment. Here the checker gets a delayed copy of everything the main core saw, so normal code cannot split them. That behaviour has been checked in simulation, and a real mismatch trips the fault pin.
5. Instructions never compete with data. Each SRAM block has two ports: the processor fetches code through one while data moves through the other, so data traffic cannot stall execution. A fetch aimed anywhere but the ROM or that code port raises a fault instead of running whatever it finds. The ROM is hard-wired logic that checks the flash image, copies it into SRAM and hands over, or opens a serial monitor if the flash is blank.
6. The bus is built so that no access can hang the chip. Only two things can drive it, the processor and the DMA, and the processor wins any tie. Once a transfer starts, its destination is locked until the reply comes back. If software touches an address with nothing behind it, or a peripheral whose clock is switched off, it gets an error instead of a hang. Flash is visible only as data; code always runs from SRAM.
7. Eighteen blocks share that bus, in three groups of six. Six connect the chip to the outside world: the UARTs, SPI, I squared C, the QSPI window, GPIO and the timers. Six serve the motor: PWM, DShot, encoder and Hall, CORDIC, the ADC and interrupts. The last six are there so the chip can be trusted and tested: system control, the watchdog, the fault register, the error slave, scan and JTAG.
8. Every one of the forty-four wrapper pads has a job. Seven carry the QSPI flash, seven the PWM outputs and trigger, and six the encoder and Hall inputs. Four each go to the UARTs, SPI and JTAG. Three are GPIO. Two each carry I squared C, supply-good and the analog ADC inputs, and one each carry the clock, the reset and the fault output.
9. Every manufactured part needs a production test, and the JTAG port is how DG32-LITE gets one. A tester switches the chip into scan mode and shifts patterns through thirteen chains of flip-flops. Because test mode turns every gated clock back on, no block is hidden from those patterns. The same pins do not offer interactive CPU debugging yet; that is a later roadmap item.
10. Tape-in waits on four checks. The layout must obey every manufacturing rule. It must describe exactly the circuit that was designed, down to its pins. Every pad must be wired through to logic. And the routed netlist, simulated gate by gate, must boot and print its banner. The third check is there because a layout can clear the first two and still leave a pad unconnected. What this film states is the bar, not whether it has been cleared.
11. If you keep three points from this, make them these. The die has one clock, so its timing has no domain crossings to go wrong. No access can hang it, and no pad is left without a job. And nothing goes to the foundry until four checks all pass. What comes next is first silicon, via the September twenty twenty-six shuttle, where these design records meet measurement.
