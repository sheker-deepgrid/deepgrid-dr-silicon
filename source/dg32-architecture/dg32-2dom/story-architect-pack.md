# DG32-2DOM architecture — story pack

Upstream of the DG32-2DOM client-ready deck and film. Sources: `DG32-2DOM_Block_Architecture.pdf`
(the second architecture document) and `DG32-2DOM_Datasheet-1.pdf`, via `dg32-2dom-architecture.md`,
with the investor positioning sheet for status and roadmap. Publication level: investor (public
site): no register maps, magic values, internal names, shuttle identifiers or open review items.

**Storyline source (Rule 0).** No reference deck was supplied. The spine follows the 2DOM block
architecture document's own order — scope (LITE plus additions) → design premises → top-level
diagram → shared base → the two added blocks (attention engine, clock bridges) → performance and
timing — bracketed by an executive summary and a close. It deliberately does not repeat the
DG32-LITE deck; it points to it for the shared base.

## 1. BLUF

DG32-2DOM runs condition-monitoring attention on the motor-control chip itself: an INT8 engine on
its own 114 MHz clock, bit-exact to the software model, added behind clock bridges so the
lockstep control core it shares with DG32-LITE is untouched.

## 2. Audience decision

Engineers and investors should see DG32-2DOM as a low-risk extension of DG32-LITE — additions
only, same pinout — whose engine cost is already known analytically and will be measured at bring-up.

## 3. Tension

Condition monitoring needs matrix math. On a fetch-bound control core at ~8 cycles per instruction
it would starve the control loop; on a second processor it adds cost and board space; on a naive
low-bit accelerator it can silently return zero.

## 4. Argument arc

1. **Context** — what DG32-2DOM is, and the one-slide answer (1–2).
2. **Tension resolved by design** — the three findings that forced two domains (3).
3. **Proof: structure** — two domains and bridges; what carries over unchanged (4–5).
4. **Proof: the engine** — pipeline, why INT8, memory traffic, bridges (6–9).
5. **Proof: cost and timing** — per-row cost, timing closure, die (10–11).
6. **Implication** — use in the drive, position and roadmap (12).
7. **Action** — takeaways (13).

## 5. Slide spine

| # | Title (assertion) | Role | Evidence | Visual treatment | Takeaway |
|---|---|---|---|---|---|
| 1 | Condition monitoring on the motor-control chip | Cover | 2DOM arch scope; investor status | Dark L01; native two-domain die motif; 4 KPIs | What this is; pre-silicon |
| 2 | DG32-2DOM adds an INT8 engine, not a new core | Exec summary | arch §1, §4.18; datasheet §1 | L02 dark thesis + 2×2 KPIs | The answer on one slide |
| 3 | Three findings forced a second clock domain | Design premises | arch §2 (three 2DOM rows) + locked decisions | Finding → consequence table | The shape follows from facts |
| 4 | The engine sits beside the core, behind bridges | Architecture | arch §3, §4.18–4.19, §7 | L07 native two-domain diagram + facts | The system in one picture |
| 5 | Everything proven on DG32-LITE carries over | Shared base | arch §1, §4.1–4.17, §5.1–5.2; datasheet §2 | Carry-over table + 3 KPIs | Low-risk extension |
| 6 | One kick computes a band of query rows | Engine pipeline | arch §4.18 | Dark L08 six-node chain + 3 cards | How the engine works |
| 7 | INT4 rounded every weight to zero | Precision decision | arch locked decisions, §4.18 rationale | 3 KPIs + explanation cards | Exactness by construction |
| 8 | Loading keys and values once cuts traffic 400× | Memory traffic | arch §4.18 rationale, §4.3, §4.17 | Two-bar comparison + cards | Engine does not fight the die |
| 9 | Rare crossings let a handshake replace a FIFO | Clock bridges | arch §4.19 | Native crossing chain + 3 bridge cards | Small, provably safe CDC |
| 10 | One query row costs about 3,242 cycles | Engine cost | arch §4.18 analytic cost | Cost table + to-scale proportion bar | Known before silicon |
| 11 | Both clocks close timing on a larger die | Timing & die | arch §5.3, datasheet §10 | 4 KPIs + honesty card | Timing is closed |
| 12 | The engine targets bearing faults in the drive | Use, position, roadmap | investor p1–p2 | Use cards + milestone rail | Where it fits |
| 13 | AI in the drive, control left untouched | Close | synthesis | Dark L14: 3 takeaways | What to remember |

## 6. Evidence map

**Direct evidence:** additions-only variant from one RTL tree; 114 MHz compute clock; 3.4 × 4.5 mm
own die; routing timed out on the DG32-LITE floorplan; INT4 zero-output finding; 15-bit weights into
a 40-bit numerator exact to 131,072 keys, 32-bit breaks at 512; pipeline stages; 16 lanes, 400 keys
max, key dim ≤32 bytes, value dim ≤64 bytes; ~3,242 cycles per row analytic (formula terms);
K/V resident ~1% bus occupancy, streaming ~400×; DMA plus idle SRAM read port; three bridges, 4-phase
handshake, 2-flop synchronisers, burst batching; slack +0.30 ns at 50 MHz and +0.19 ns at 114 MHz;
bit-exact to the golden model; same pinout, no added pads; design complete, in physical trials;
bearing-fault and anomaly detection; STM32G0 has no on-chip AI (NanoEdge software).

**Fair synthesis:** per-term cost split — key pass 400×32/16 = 800, value pass 400×64/16 = 1,600,
divide 48, requantise 11×64 = 704, write-back and drain = 3,242 − 3,152 = 90. A 1/400 weight is
0.0025; at 15 bits that is ~82 of 32,767 levels (32,767 ÷ 400).

**Interpretation (kept soft):** "low-risk extension" framing (the source says additions only and
the frozen core is unchanged); "hardware differentiator" against a software-only incumbent (the
investor sheet's own framing).

## 7. Content cuts

- Register maps, addresses, parameter register names, internal RTL module names.
- Internal people, repository and shuttle identifiers; open review items A–I.
- Negative top-assembly slack and sign-off over-constraint detail.
- FPGA bring-up specifics (board, clock) — not needed for the argument.

## 8. Rebuild instructions

- Same method and kit as the DG32-LITE deck; reuse its local components with the accessible
  text-colour fixes (dark cyan and dark teal for text and filled labels on light surfaces).
- Titles ≤ 52 characters; card titles short enough for one line at card width.
- Dark slides: 1, 6, 13 (plus the thesis panel on 2).
- Label every number post-route, simulated, analytic or derived.
- Speaker notes carry the narration verbatim.

## 9. Narration (speaker notes and film voiceover)

1. DG32-2DOM is the attention variant of Deepgrid Semi's DG32-LITE motor-control chip. It keeps the dual-core lockstep controller and adds an INT8 attention engine on its own clock, so a drive can watch its own motor for faults. The design is complete and in physical trials. Every figure here is a post-route, simulated or analytic value, and each one is labelled.
2. Here is the answer on one slide. DG32-2DOM is DG32-LITE plus an attention engine, not a new core. The lockstep CPU pair, boot path, peripherals and sixty-four-pin pinout are identical. The engine runs at one hundred fourteen megahertz, its output is bit-exact to the software model, and one query row costs about thirty-two hundred cycles, by analysis.
3. Three findings forced the design. The lockstep core tops out around fifty-five to sixty-two megahertz, so the control domain has to stay at fifty. The engine is the throughput consumer, so it gets its own faster clock. And adding its memory to the DG32-LITE floorplan made routing time out, so the variant gets a larger die of its own.
4. This is the architecture. On the left, the fifty megahertz control domain: everything in DG32-LITE. On the right, the one hundred fourteen megahertz compute domain: the attention engine and its key and value buffers. Between them sit three clock-domain bridges. The engine reaches memory only through those bridges, so it can never stall the control core.
5. Everything proven on DG32-LITE carries over unchanged. The lockstep pair, fault latch, boot ROM, SRAM, motor drive, sensing and connectivity are the same blocks from the same design source. The control loop still costs about three hundred hardware cycles, and the package is the same nine-by-nine millimetre QFN, because the engine adds no pads.
6. One kick computes a band of query rows of one attention head, end to end. Firmware programs the shapes. A shared multiply array computes Q times K transpose. A row maximum indexes a table of softmax weights. The engine forms the weighted sum, divides once per row, saturates the result to INT8, and writes the output back to memory.
7. Why INT8, and not INT4? With about four hundred similar keys, each softmax weight is close to one four-hundredth. INT4 rounds that to zero, and the output came out identically zero. The engine keeps fifteen-bit weights all the way into a forty-bit numerator, which stays exact to more than one hundred thousand keys, and it saturates only the final output.
8. Memory traffic decides whether the engine fights the rest of the chip. Keys and values load once per kick and are re-read for every query row, which keeps one head's bus traffic around one percent. Streaming the values row by row would cost about four hundred times that. A DMA and the SRAM's idle read port can feed the engine without contending with the CPU.
9. Crossings between the two clocks are rare: keys and values load once, and outputs write back once. So the bridges use a small four-phase handshake through two-flop synchronisers instead of a FIFO. One bridge carries programming, one transaction at a time, and two burst bridges batch a whole read or a whole write into a single crossing.
10. Here is what one query row costs, by analysis, at sixteen lanes, four hundred keys, thirty-two-byte keys and sixty-four-byte values. The value pass is the largest share, at sixteen hundred cycles. The key pass takes eight hundred, requantisation about seven hundred, and the divide forty-eight. That totals about thirty-two hundred and forty cycles. The measured figure comes at bring-up.
11. Both domains close timing on the larger die. The fifty megahertz control domain closes with zero point three nanoseconds of slack, and the one hundred fourteen megahertz compute domain with zero point one nine. The die is three point four by four point five millimetres. These are post-route results; silicon measurements follow bring-up.
12. The engine is designed for condition monitoring inside the drive: bearing-fault and anomaly detection, on the chip that already turns the motor. Against the STM32G0, which runs AI in software, that is a hardware differentiator. It sits on the roadmap alongside DG32-LITE first silicon, with its own design complete and in physical trials.
13. Three things to take away. The engine is an addition, not a redesign: the safety core is untouched. Its arithmetic is exact: INT8 output, bit-exact to the model, with no weight rounded to zero. And its cost is known before silicon: about thirty-two hundred cycles per query row. First silicon turns these design values into measurements.

## Quality gate

- Every slide advances the argument; none repeats the DG32-LITE deck beyond the carry-over slide.
- Readable cold; numbers carry their status labels.
- Clear action: evaluate the engine cost at bring-up; treat the base as proven by DG32-LITE.
- Internal terms and identifiers scanned against the cuts list.
