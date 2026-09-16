# DeepGrid Semi — Mature-Node Silicon System Architecture & Operational Specification
**Document Classification:** Confidential Diligence Whitepaper Specification (Plain-Language Edition v3, Sept 2026)  
**Corporate Entity:** DeepGrid Semi Pvt Ltd · CIN: U62099TS2024PTC183631 · DPIIT: DIPP194870 · T-Hub Phase 2, Hyderabad  
**Round Context:** Angel / Seed Round · ₹10 Crore ($1.2M) · Managing Director: Aravind Prasad (+91 74163 19944)

---

## 1. Executive Summary & The $9 Billion Import Funnel
India imports roughly **$23.4 billion of semiconductor chips per year** (UN COMTRADE HS 8542). Approximately 70% of these originate from China and Taiwan. Within this volume, **$9 billion annually** represents mature-node silicon ($ \ge 130\ \text{nm} $): power controllers, small microcontrollers, gate drivers, voltage supervisors, and transceiver ICs.

### The 5-Level Funnel Walkdown
1. **Total IC Imports:** $23.4 Billion (UN COMTRADE HS 8542).
2. **Mature-Node Silicon ($ \ge 130\ \text{nm} $):** $9.0 Billion (divided by 2.6; newer sub-28nm processes excluded).
3. **DeepGrid 9 Core Chip Classes:** $0.46 Billion (~₹4,300 Cr addressable market; factor of 19 reduction).
4. **FY31 Target Revenue:** ₹1,000 Crore (~$105M; ~23% capture of addressable classes).
5. **Live Pre-ASIC Contracted Revenue:** ₹2.88 Crore (Indian Army MCEME ₹1.01 Cr, Infinis Agritech ₹1.25 Cr, Axitech Solar ₹0.62 Cr).

---

## 2. 10x Cost Dismantling & Unit Economics

| Cost Item | Conventional Chip Company | DeepGrid Semi Method | Cost Savings / Source |
| :--- | :--- | :--- | :--- |
| **Physical Layout** | $1,000,000 – $2,000,000 sent outside | In-house engineering time on free PDKs | Staff time only (OpenLane/OpenROAD) |
| **EDA Licences** | $500,000 – $1,000,000 annually | Free open-source toolchain (Yosys, Magic, KLayout) | ~₹0 recurring license overhead |
| **Design Cycle** | 12 – 18 months per chip | Automated digital flow in <30 days | Rapid parameterized generators |
| **Prototype Masks** | $500,000 – $1,000,000 full mask set | Shared MPW factory runs | **₹14.3 Lakhs ($14,950)** on sky130; **₹34–80 Lakhs** on IHP |
| **Testing & Approval** | Rolled into project overhead | Explicitly budgeted per SKU | **₹40–80 Lakhs** per SKU (MIL-883/JSS/CEMILAC) |
| **Total All-In Cost** | **$2,000,000 – $5,000,000** | **₹0.60 – 1.20 Crore ($70K–$140K)** | **~10× Reduction in NRE** |

---

## 3. The 198-Day Dual-Clock Silicon Loop
Progress is governed strictly by factory windows rather than calendar milestones:
$$\text{Total Loop Duration} = 30\ \text{Days (Digital Sprint)} + 168\ \text{Days (Physical Silicon Leg)} = 198\ \text{Days}$$

### Verified Factory Calendars (ChipIgnite / SkyWater 130 nm)
- **Shuttle CI2609:** Tapeout 16 September 2026 $\rightarrow$ Packaged Parts Delivery **3 March 2027** (168 days).
- **Shuttle CI2612:** Tapeout 7 December 2026 $\rightarrow$ Packaged Parts Delivery **25 May 2027** (168 days).

### Two-Speed Development Reality
- **Digital Blocks (Chips 1, 2, 4, 8, 9):** Automated flow completes in 30 days; verified on computer; 1 silicon run to prove.
- **Analogue & HV Blocks (Chips 3, 5, 6, 7):** Cannot be verified purely on a computer. Requires **2–3 silicon cycles (198 days + 6–9 months)** to confirm bandgaps, high-voltage LDMOS breakdown, and ESD protection rings.

---

## 4. The Three-Factory Sovereignty Architecture

```
[Phase 1: SkyWater 130 nm (USA)]
   ├── Proven test die on TinyTapeout-6 (15 × 15 mm sky130)
   ├── 5–120V BCD integration (Native high-voltage transistors)
   └── Rapid MPW prototyping ($14,950 per slot)
            │
            ▼
[Phase 2: IHP SG13G2 130 nm SiGe BiCMOS (Germany)]
   ├── 350 GHz fT/fmax heterojunction bipolar transistors (HBT)
   ├── 77 GHz and 24 GHz 4D Radar RF Front-End (SKU-7)
   └── Completely non-ITAR unencumbered European supply chain
            │
            ▼
[Phase 3: SCL Mohali 180 nm (India)]
   ├── Sovereign Indian military-approved fabrication facility
   ├── 100% DAP-2020 Buy(Indian-IDDM) compliance
   └── Domestic packaging, screening, and MIL-STD-883 qualification
```

---

## 5. Canonical Processor Architecture: DGridRiscV
Seven of the ten chips share a single, hardened, parameter-locked RISC-V processor generated from the VexiiRiscv core generator:

- **ISA & Privilege:** `RV32IM_Zicsr` (`misa = 0x40001100`), Machine mode only (`PrivilegedPlugin`).
- **Pipeline:** Single in-order issue (`lane0`), 2 fetch stages (`fetch_logic_ctrls_0..1`), 6 execute stages (`execute_ctrl0..5`).
- **Math Datapath:** Hardware `MulPlugin` and `DivPlugin`, single-cycle full barrel shifter (`BarrelShifterPlugin`).
- **Memory Protection:** Physical Memory Protection (`PmpPlugin`).
- **Off-Core Buses:** Cacheless 32-bit AXI4 fetch and LSU ports (`FetchCachelessAxi4Plugin`, `LsuCachelessAxi4Plugin`).
- **Architectural Omissions as Decisions:**
  - *No Caches:* Guarantees sub-1 µs deterministic interrupt response without cache-miss jitter.
  - *No Branch Predictor:* Eliminates pipeline flush penalties and saves silicon area in data-dominated FOC loops.
  - *No FPU:* Enforces bit-exact integer/fixed-point parity between commercial and screened defence parts.
  - *No RVC (Compressed Instructions):* Eliminates instruction alignment traps on the fetch interface.

---

## 6. Defence Procurement Framework: "Boxes, Not Chips"
DeepGrid conducted a line-by-line OCR audit of the Indian Ministry of Defence's **5th Positive Indigenisation List (PIL-5: 346 items)** and DMA lists 1, 2, 3, and 5:

- **The Critical Finding:** Government lists never specify chip-level part numbers. They enumerate **Line-Replaceable Units (LRUs), assemblies, valves, actuators, and sensor boxes**.
- **DeepGrid's Wedge:** Enter **one level down** by providing the domestic silicon inside the mandated LRU:
  - *PIL-5 BLDC motor with encoder for anti-tank missile (Dec 2025):* $\rightarrow$ **Chip 1 (BLDC Motor Controller)**
  - *PIL-5 DC-DC converter 4A, 16–40V for BEL Tank (Dec 2026):* $\rightarrow$ **Chip 3 (28V Hi-Rel PMIC)**
  - *PIL-5 17" rugged display from BEL Defence Electronics (Dec 2027):* $\rightarrow$ **Chip 8 (High-Voltage Display Driver)**
  - *PIL-5 Digital Receiver / Synthesizer for Electronic Warfare (Dec 2026):* $\rightarrow$ **Chip 7 Family (SiGe RF + CMOS)**
- **Statutory Stack:** `DAP-2020 Buy(Indian-IDDM)` $\rightarrow$ `Positive Indigenisation Lists (PIL)` $\rightarrow$ `SRIJAN Portal (37,696 items)` $\rightarrow$ `Make-II Prototype Procedure`.

---

## 7. Ten-Chip Portfolio & Anchor Customers

| Chip # | Product Name | Target Process | Voltage / Nodes | Anchor Customer & Legal Hook |
| :--- | :--- | :--- | :--- | :--- |
| **Chip 1** | BLDC Motor Controller | 130 nm BCD | 5V – 120V Native | **Airgap Technology** (EV Motors); PIL-5 Anti-Tank Missile |
| **Chip 2** | Smart-Meter SoC | 130 nm CMOS | 24-bit 6-ch AFE | **Ripple Metering** (250M National Smart Meter Tender) |
| **Chip 3** | High-Reliability PMIC | 180 nm BCD | 28V Avionics Bus | **BEL Tanks / Aircraft**; SRIJAN NSG-5962; DO-160G |
| **Chip 4** | Lockstep Safety MCU | 130 nm CMOS | 1.8V / 3.3V | **Indian Army MCEME** (₹1.01 Cr Contracted); ISO 26262 ASIL-D |
| **Chip 5** | Robust Transceiver | 130 nm HV | ±15 kV ESD, 5V | Replaces discontinued TI/ADI RS-485 / CAN-FD |
| **Chip 6** | Voltage Supervisor | sky130 $\rightarrow$ SCL | 4-rail, 8 µs filter | **SCL MIL-883 Pathfinder**; Simplest chip through qual first |
| **Chip 7** | 4D MIMO Radar | IHP SiGe + CMOS | 77 GHz / 350 GHz | BEL EW Suites, Su-30 MKI Radar Warning Receiver |
| **Chip 8** | Rugged Display Driver | 130 nm HV CMOS | 0–12V, 3,840 cols | **BEL 17" Cockpit Display** (PIL-5 Item #5, Dec 2027) |
| **Chip 9** | SDV Zonal Gateway | 130 nm + 180 nm | 16 e-Fuses, TSN | Vehicle Zonal Controller; Replaces mechanical relay boxes |
| **Track B** | D100 Drone SoC | TSMC 28 nm | Multi-Die SiP | **Chakravayu CPDL** (Tactical Drones); Separate ₹50 Cr Round |

---

## 8. Financial Model, Capital Waterfall & Stop Rules

### ₹10 Crore ($1.2M) Seed Round Allocation
- **Factory Runs & Mask Sets (₹3.60 Cr / 36%):** ₹0.86 Cr for 6 sky130 MPW runs + ₹0.48 Cr for IHP SiGe run (₹1.34 Cr prototype total); ₹2.26 Cr for two production mask sets & first wafer batches (Chips 1 & 2).
- **Engineering Payroll (₹2.40 Cr / 24%):** 5–7 engineers over 24 months (1 Senior, 3 Mid-level, 2 Junior, 2 Analogue) at Hyderabad cost base (₹1.2 Cr/year).
- **Qualification & Approval (₹1.80 Cr / 18%):** 4 product qualifications (MIL-STD-883, JSS, CEMILAC, Chip 6 pathfinder).
- **ATE Testing Line (₹1.20 Cr / 12%):** Automated test equipment, custom load boards, and wafer sort testing.
- **Sales & Working Capital (₹1.00 Cr / 10%):** Evaluation kits, datasheets, distributor onboarding, customer engineering.

### FY31 Revenue Buildup & Chinese Price Crash Stress-Test
$$\text{Target FY31 Revenue} = ₹1,000\ \text{Crore}\ (\text{Meters } ₹480\text{Cr} + \text{Motors } ₹220\text{Cr} + \text{Defence } ₹200\text{Cr} + \text{Drones } ₹100\text{Cr})$$

If Chinese state-subsidized silicon floods the open Indian market:
- **Smart Meters:** ₹480 Cr $\rightarrow$ **₹340 Cr** (-30% tender price squeeze).
- **Motor Controllers:** ₹220 Cr $\rightarrow$ **₹130 Cr** (-40% commercial price pressure).
- **Defence (Screened):** ₹200 Cr remains **₹200 Cr** (**100% immune** due to statutory PIL import bans).
- **Drone Brain:** ₹65 Cr $\rightarrow$ **₹55 Cr** (Army origin inspection protects domestic platforms).
- **Vehicle Gateway:** ₹35 Cr $\rightarrow$ **₹25 Cr** (-30% open automotive market).
- **Stressed Total:** **₹750 Crore** $\rightarrow$ *The business survives, remains profitable at 60–75% margins, and triggers the next financing round.*

### The Pre-Committed Stop Rules (S1–S4)
- **S1 (Meter Signature Gate):** If Ripple Metering has not executed a binding letter by the factory-order cutoff date for Chip 2, Chip 2 is paused for one cycle and its capital reallocated to Chips 1 and 3.
- **S2 (Screening Failure):** If Chip 6 fails military screening twice, all forward defence revenue projections are deferred by 12 months across all materials within 30 days.
- **S3 (Commercial Exit Gate):** In FY29, evaluate delivered Chinese component pricing. If it drops below DeepGrid's bare manufacturing cost, immediately exit ceiling fan drivers and focus solely on two-wheelers and proprietary modules.
- **S4 (SCL Mohali Lateness):** If SCL Mohali slips by more than two manufacturing cycles, publicly declare the delay and execute production runs exclusively at SkyWater and IHP.
