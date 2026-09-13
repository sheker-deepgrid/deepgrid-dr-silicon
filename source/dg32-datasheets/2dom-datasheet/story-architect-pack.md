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
2. Here is the short version. The same sixty-four pins and forty-four signals. The same one point eight and three point three volt rails. One added clock: the engine runs at one hundred fourteen megahertz, beside the fifty megahertz control domain. For a board, DG32-2DOM is a drop-in DG32-LITE. For firmware, it adds one memory-mapped engine.
3. The datasheet lists five new features. An attention accelerator that computes a band of query rows in one kick, bit-exact to the golden model. A shared datapath with a weight table and a forty-bit numerator. A cost of about thirty-two hundred cycles per row, by analysis. A second clock domain. And a larger die of its own.
4. Everything else is unchanged. The package, the pin groups, the rails and their limits, and the boot flow are identical to DG32-LITE, because the engine is internal and adds no pads. The datasheet repeats the same zero point four three watt estimate at fifty megahertz, and it does not yet state a separate figure for the engine.
5. The engine runs on a second clock, at one hundred fourteen megahertz. The CPU, the bus and the peripherals stay at fifty, so the control core's timing is untouched. The engine reaches memory through two-flop clock bridges, so it never stalls the control core. Timing closes with positive slack at both clocks, on a die of three point four by four point five millimetres.
6. Firmware drives the engine in four steps. Tell it where the query, key, value and output buffers live. Set the geometry: rows, keys, and the key and value sizes. Set start, optionally reusing the buffers already loaded. Then poll for done, or take the engine's interrupt. The engine also reports a rejected geometry or an arithmetic overflow.
7. Its limits are fixed in the silicon. Up to sixty-five thousand five hundred thirty-five query rows per kick, and up to four hundred keys per head. Key vectors up to thirty-two bytes, and value vectors up to sixty-four. Sixteen multiply lanes, a two-hundred-fifty-six entry weight table, and a forty-bit numerator that stays exact to one hundred thirty-one thousand keys.
8. For the board, nothing changes. The footprint, the pin map, the supplies and their sequencing, and the boot flash and console are the same as DG32-LITE. The engine adds no board signals at all. The chip's status is design complete, and in physical trials.
9. Three things to take away. The board is a DG32-LITE board. The engine is one memory-mapped block on its own clock that cannot stall control. And its limits are already fixed: four hundred keys, sixty-four-byte values, and about thirty-two hundred cycles per row. First silicon turns these design values into measurements.
