# DG32-2DOM preliminary datasheet — story pack

Source: `DG32-2DOM_Datasheet-1.pdf` (preliminary, pre-silicon), with the DG32-LITE investor block
diagram for status only. Publication level: investor. Storyline (Rule 0): the datasheet's order —
features → pinout → electrical and power → clocks → engine programming → board → package — told as the
delta from DG32-LITE, because the datasheet is DG32-LITE's plus one engine. Memory map, register
offsets, magic values, board-design rules and the open clock-source review item are cut.

## 1. BLUF
For a board DG32-2DOM is a drop-in DG32-LITE; for firmware it adds one memory-mapped INT8 attention
engine on its own 114 MHz clock, with limits already fixed in silicon.

## 2. Audience decision
Teams designing for DG32-LITE can plan DG32-2DOM on the same board, and size condition-monitoring
firmware against the engine's fixed limits.

## 3. Tension
A variant datasheet invites the question "what changed?"; answering it with a full re-read wastes
time and hides the few differences that matter.

## 4. Argument arc
1. What it is and the short version (1–2). 2. What is new (3). 3. What is unchanged (4). 4. The second
clock (5). 5. How firmware drives it (6). 6. Its limits (7). 7. The board (8). 8. Close (9).

## 5. Slide spine
| # | Title | Evidence | Visual |
|---|---|---|---|
| 1 | DG32-2DOM: DG32-LITE plus one engine | §1 | Dark cover, two-domain motif, 4 KPIs |
| 2 | Same pins, same rails, one added clock | §1, §2, §4, §6.1 | KPI row + thesis band |
| 3 | Five datasheet features are new in DG32-2DOM | §1 | Feature table |
| 4 | Pins, rails and limits are unchanged | §2–§6, §10 | LITE vs 2DOM table |
| 5 | The engine runs on its own 114 MHz clock | §1, §6.1, §10 | Chain + cards + KPIs |
| 6 | Firmware programs a kick in four steps | §8 engine notes (concept only), IRQ source list | Dark chain + cards |
| 7 | Every engine limit is fixed in silicon | §1, §8 engine parameters | Limits table |
| 8 | A DG32-LITE board takes DG32-2DOM unchanged | §2, §5, §9 (engine adds no board signals); investor sheet status | KPI + cards |
| 9 | One footprint. Two chips. | synthesis | Close |

## 6. Evidence map
Direct: every figure from the datasheet. The power figure is the datasheet's own repeat of the 50 MHz
estimate; the deck says no separate engine figure is stated. Status (design complete, physical
trials) from the investor block diagram.

## 7. Content cuts
Register offsets and names, status bit positions, memory addresses, clock-source review item,
board-design rules, shuttle and harness identifiers, die slack beyond the two post-route values.

## 8. Rebuild instructions
Same kit and gates; source line on every content slide.

## 9. Narration

1. DG32-2DOM is the attention variant of DG32-LITE, and its preliminary datasheet reads like DG32-LITE's with one addition: an INT8 attention engine on its own clock. This deck covers what the datasheet adds, and confirms what it leaves unchanged. Every figure is a design value, a process nominal or an analytic estimate, and each is labelled.
2. If you have designed with DG32-LITE, most of this is already familiar. The package, the sixty-four pins and the forty-four signals do not move, and neither do the one point eight and three point three volt supplies. What is new is a second clock at one hundred fourteen megahertz, driving the engine beside the fifty megahertz CPU. A board designer sees the same chip; only the firmware sees something extra.
3. Only five entries in the feature list are new, and all of them exist because of the engine. It computes a whole span of rows for an attention head each time it is started, and its results match the reference software exactly. One shared multiplier and a small weight table keep that hardware compact. Each row costs about thirty-two hundred cycles by analysis. And the engine brings its own faster clock, plus a larger die to hold its buffers.
4. Everything else is unchanged. The package, the pin groups, the rails and their limits, and the boot flow are identical to DG32-LITE, because the engine is internal and adds no pads. The datasheet repeats the same zero point four three watt estimate at fifty megahertz, and it does not yet state a separate figure for the engine.
5. Why give the engine a clock of its own? Speeding up the whole chip would push the lockstep core past its timing limit, so the processor, the bus and all of the peripherals stay at fifty megahertz while the engine runs at one hundred fourteen. The two sides meet only through synchronised bridges, which means the engine can never hold up control. After layout, both clocks meet timing with positive slack.
6. From firmware, running the engine takes four moves. Point it at the memory holding its inputs and where its results should go. Describe the shape of the job: how many rows and keys, and how wide each vector is. Start it, reusing anything still loaded from last time if that saves work. Then wait, by polling or with an interrupt. If the job is shaped wrongly or the arithmetic would overflow, the engine says so.
7. The engine's limits are set in silicon, so a model has to fit them rather than the other way round. One start covers up to sixty-five thousand five hundred thirty-five query rows, and each head can hold up to four hundred keys. Keys can be thirty-two bytes wide and values sixty-four. Sixteen multiply lanes, a two-hundred-fifty-six entry weight table and a forty-bit numerator keep the result exact up to one hundred thirty-one thousand keys.
8. For the board, nothing changes. The footprint, the pin map, the supplies and their sequencing, and the boot flash and console are the same as DG32-LITE. The engine adds no board signals at all. The chip's status is design complete, and in physical trials.
9. Here is what matters for a design team. Any board laid out for DG32-LITE already fits DG32-2DOM. The new engine runs from a separate, faster clock and can never hold up motor control. And its limits are settled today, at four hundred keys, values of sixty-four bytes and roughly thirty-two hundred cycles per row, by analysis. Real measurements arrive with first silicon.
