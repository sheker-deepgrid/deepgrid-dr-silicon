# DeepGrid Three-Factory Sovereignty Roadmap Architecture Specification

**System**: DeepGrid Sequential Three-Foundry Sovereignty Topology  
**Classification**: Unclassified / Strategic Semiconductor Manufacturing Blueprint  
**Author**: DeepGrid Semi Pvt Ltd · Hyderabad, India  
**Foundry Partners**: SkyWater Technology (USA) · IHP Leibniz (Germany) · SCL Mohali (India)  
**Process Nodes**: 130nm Planar CMOS · 130nm SiGe:C BiCMOS · 180nm Military CMOS/BCD  
**Target Standards**: DAP-2020 Buy (Indian-IDDM), MIL-STD-883, JSS-55555, CEMILAC  
**Generated Via**: `/deepgrid-architecture` (Codified Compound Architecture Compiler)

---

## 1. Executive Strategy: One Method, Three Factories

### 1.1 The Geopolitical Semiconductor Dilemma
India imports over $9B annually in mature-node semiconductors (130nm to 180nm) powering defense avionics, missile guidance systems, and industrial infrastructure. A pure domestic fab dependency today is blocked by capacity constraints at Semi-Conductor Laboratory (SCL) Mohali, while relying entirely on foreign commercial foundries (TSMC, UMC, GlobalFoundries) leaves Indian military programs vulnerable to:
- **Foreign Export Controls & Sanctions**: Unannounced ITAR restrictions or supply chain embargoes during regional conflicts.
- **DAP-2020 Legal Disqualification**: Failure to achieve the mandated 50%+ Indigenous Content (IC) required under **Buy (Indian-IDDM)** defense tenders.
- **Prohibitive Multi-Million-Dollar EDA Taxes**: Traditional ASIC design cycles require $1M–$2M in proprietary Synopsys/Cadence tool licenses before touching silicon.

### 1.2 The DeepGrid Three-Factory Sequential Solution
DeepGrid resolves this impasse through an agile, three-stage sequential foundry migration:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PROVEN: SkyWater Technology (USA)                                        │
│ • Node: sky130 (130 nm Planar CMOS)                                         │
│ • Role: Rapid, low-cost digital & mixed-signal commercial prototyping       │
│ • Cost: $14,300 per MPW shuttle run vs $1M proprietary EDA                  │
│ • Status: DONE — Physical working silicon fabricated & validated            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. DIFFERENTIATED: IHP Leibniz Institute (Germany)                          │
│ • Node: SG13G2 (130 nm SiGe BiCMOS)                                         │
│ • Role: High-frequency transistors (350 GHz fT) for 77 GHz radar            │
│ • Capability: 4D MIMO Radar collision avoidance front-ends                  │
│ • Status: PLANNED — Target tapeout for SKU-7 radar front-end                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. SOVEREIGN: SCL Mohali (Punjab, India)                                    │
│ • Node: 180 nm Military-Qualified CMOS & High-Voltage BCD                   │
│ • Role: Buy(Indian-IDDM) compliance; complete domestic design & fab         │
│ • Moat: Unlocks absolute monopoly priority in sovereign military tenders    │
│ • Status: PLANNED — Strategic retargeting & defence qualification           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Foundry Process Physics & Electrical Capabilities

| Foundry & Node | Physical Substrate & Gate Geometry | Operating Frequencies / Power Rails | Strategic Architectural Function |
|---|---|---|---|
| **SkyWater SKY130** (USA) | 130 nm Bulk CMOS, 5-Metal Layer Stack | Fixed 200 MHz Digital Logic · 1.8V Core / 3.3V–5.0V I/O | Fast digital IP validation, DGridRiscV core proof, low-cost MPW loops. |
| **IHP SG13G2** (Germany) | 130 nm SiGe:C BiCMOS Heterojunction | $f_T = 350\text{ GHz}$, $f_{\max} = 450\text{ GHz}$ · 1.2V / 3.3V | Ultra-high frequency front-ends, 77 GHz automotive & airborne mmWave radar. |
| **SCL Mohali** (India) | 180 nm Military-Grade CMOS / BCD | 5V to 120V High-Voltage LDMOS · Rad-Hard by Design | Sovereign defense production, high-voltage PMICs, motor drivers, supervisors. |

---

## 3. The Porting Boundary: What Moves vs. What Must Be Redesigned

DeepGrid enforces strict architectural discipline regarding cross-foundry portability, separating digital abstractions from physical analog physics:

```
+-------------------------------------------------------------------------------+
| THE HONEST SILICON PORTABILITY BOUNDARY                                       |
+===============================================================================+
| 1. PORTABLE VIA SCRIPTING (AUTOMATED):                                        |
|    • Digital Verilog / SystemVerilog RTL codebases                            |
|    • DGridRiscV Processor Core (RV32IM_Safety)                                |
|    • AXI4 Interconnect Matrices & Bus Arbiters                                |
|    • UVM Verification Testbenches & Functional Coverage Plans                 |
|    • Porting Method: Swap Liberty (.lib) files & re-run OpenROAD scripts      |
+-------------------------------------------------------------------------------+
| 2. REQUIRES MANUAL RE-ENGINEERING (PHYSICS-BOUND):                            |
|    • Bandgap Voltage References & Current Mirrors (12 ppm/°C calibration)    |
|    • High-Voltage BCD LDMOS Power Output Stages & Gate Drivers                |
|    • Non-Volatile Memory (NVM / EEPROM / OTP) Foundry Hard Macros             |
|    • ESD / EOS Input/Output Protection Pad Rings & Guard Rings                |
|    • Porting Method: 1 to 2 dedicated calibration shuttle cycles per node     |
+-------------------------------------------------------------------------------+
```

### 3.1 Scripted Digital Migration Flow
The DGridRiscV core and digital control logic are synthesized using **OpenLane, Yosys, and OpenROAD**. Moving from SkyWater 130nm to SCL Mohali 180nm requires zero RTL rewrites:
1. Load target foundry Liberty timing libraries (`scl180_stdcells.lib`).
2. Update physical design technology LEF files (metal layers, track pitch, DRC spacing).
3. Execute automated floorplanning, clock-tree synthesis (CTS), and detail routing in OpenROAD.
4. Verify timing closure at the target clock boundary (150–200 MHz).

### 3.2 Analog & BCD Recalibration Protocol
Because analog transistors are defined by physical foundry dopant profiles, gate oxide thickness, and thermal coefficients, analog IP blocks cannot be scripted:
- **Bandgap Reference Recalibration**: Brokaw cell resistors must be re-proportioned to zero-out temperature drift ($12\text{ ppm/}^\circ\text{C}$).
- **High-Voltage LDMOS Optimization**: Breakdown voltages ($BV_{DSS} > 120\text{V}$) must be empirically verified across fab corner lots (Slow-Slow, Fast-Fast).
- **ESD Pad Rings**: Clamping diodes must be resized to guarantee $\pm 15\text{ kV}$ Human Body Model (HBM) survivability on SCL silicon.

---

## 4. Sovereign Procurement Moats: DAP-2020 IDDM Category

India's **Defense Acquisition Procedure (DAP-2020)** establishes the legal hierarchy of military tenders:

| Procurement Category | Qualification Standard | DeepGrid Alignment & Competitive Advantage |
|---|---|---|
| **Buy (Indian-IDDM)** | $\ge 50\%$ Indigenous Content (IC) + Indian Design & Fab | **Achieved via SCL Mohali**: Absolute monopoly priority over foreign suppliers. Foreign bids are legally excluded. |
| **Buy (Indian)** | $\ge 60\%$ Indigenous Content (Design Indian-owned) | **Achieved via SkyWater & IHP**: DeepGrid owns 100% of RTL/GDSII, beating pure imports like STM32 or TI. |
| **Buy & Make (Indian)** | Licensed foreign manufacturing | Secondary tier; burdened by foreign technology transfer royalties. |
| **Buy (Global)** | Pure foreign import | Lowest priority; subject to Positive Indigenisation Lists (PIL) import bans. |

---

## 5. Post-Silicon Productization: Packaging, ATE, and MIL Screening

Fabrication is only step one of silicon sovereignty. DeepGrid completes the supply chain in Hyderabad:

1. **Heterogeneous Organic SiP Packaging**:
   - 4-layer organic laminate substrate (FR4/BT core) BGA $15 \times 15\text{ mm}$ to $25 \times 25\text{ mm}$.
   - Composes mature silicon from SkyWater/IHP/SCL into unified modules without expensive UCIe or silicon interposers.
2. **Dedicated ₹1.2 Cr Automated Test Equipment (ATE) Line**:
   - High-throughput wafer probe and packaged IC screening in Hyderabad.
   - Temperature chamber testing from $-55^\circ\text{C}$ to $+125^\circ\text{C}$.
3. **Defense Environmental Qualification**:
   - **MIL-STD-883K**: Method 1010.8 (Temperature Cycling), Method 1014.14 (Hermeticity/Seal), Method 2002.5 (Mechanical Shock).
   - **JSS-55555 / CEMILAC**: Complete airworthiness and flight safety compliance for Indian defense systems.
