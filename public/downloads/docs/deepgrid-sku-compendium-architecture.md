# DeepGrid Semi — SKU Architecture Compendium Engineering Specification (Technical Annex v3)

## 1. Executive Summary & Physical Process Boundary
The SKU Architecture Compendium (Technical Annex v3, 2026) defines the silicon implementation, timing behavior, characteristic curves, and packaging boundaries for DeepGrid Semi's foundational portfolio:
- **Nine Core Peripheral SKUs (SKU-1 through SKU-9)**
- **Track B: D100 Tactical Drone SoC**
- **DeepGrid SDV Central Reference Architecture**
- **Sheet 13: Multi-Die Organic Substrate System-in-Package (SiP)**
- **Sheet 14: Three-Phase Node & SKU Scaling Roadmap with Self-Correcting Arithmetic Audit**

### The Mature-Node Physical Imperative
Sub-10nm silicon is physically incapable of withstanding 28V–120V transient power rails, lacks integrated 24-bit high-dynamic-range analog front ends, and fails automotive/military harsh temperature screening (-55 °C to +125 °C) without external support. DeepGrid anchors the physical interfaces of modern vehicles, drones, and grid infrastructure on **130 nm and 180 nm BCD / CMOS**, capturing the satellite sockets that surround sub-10nm central computing cores.

---

## 2. Complete 14-Sheet Portfolio Matrix

| Sheet | SKU / Subsystem | Process Node | Voltage Rails | Key Architectural Highlight | Target Sockets & Policy Moats |
|---|---|---|---|---|---|
| **01** | **Scope Overview** | 130nm / 180nm | 5V – 120V | Scope boundary: Mature satellites surrounding sub-10nm HPC | 9 SKUs + D100 + DG SDV Platform |
| **02** | **SKU-1: BLDC Motor** | 130nm BCD | 5V – 120V B/B | DGridRiscV @ 200MHz, HW PID <1 µs, CORDIC FOC, PWM×7 | BEE 5-Star Fans (₹250–550 Cr/yr), EV 2W/3W |
| **03** | **SKU-2: Smart Meter** | 130nm CMOS | 3.3V / <2µW RTC | DG-AFE6 6-ch 24-bit $\Sigma\Delta$, sinc³ OSR-256, P/Q/S + THD-15 | 250M National Meter Rollout ($2–5 ASP) |
| **04** | **SKU-3: Hi-Rel PMIC** | 180nm BCD | 4.5V – 40V (28V Mil) | Pre-buck regulator, 4 sequenced rails, Brokaw bandgap (12 ppm/°C) | DO-160, MIL-STD-461, SRIJAN NSG-5962 |
| **05** | **SKU-4: Safety MCU** | 130nm CMOS | 1.8V / 3.3V | Dual DGridRiscV with 2-cycle skew, FAULTn latch in <2 cycles | ISO 26262 ASIL-D, EV BMS, MCEME ₹1.01 Cr |
| **06** | **SKU-5: Transceiver** | 130nm LDMOS | 5V / ±40V Fault | RS-485 + CAN-FD (5 Mbps), ±15 kV HBM ESD, 30 mV hysteresis | Harsh industrial harnesses, ISO 11898-2 |
| **07** | **SKU-6: Supervisor** | 180nm CMOS | 1.0V – 5.0V Quad | Chopper comparators, 8 µs deglitch, 10 ppm/°C, windowed WDT | MIL-STD-883K pathfinder, 30–80M/yr PCB attach |
| **08** | **SKU-7: 77GHz Radar** | IHP SiGe + 130nm | 3.3V RF / 1.2V BB | 2TX/4RX, IHP SG13G2 HBTs ($f_T$ 350 GHz), 4 GHz sweep (3.75 cm res) | AD2 Mirror Tower (captive), Non-ITAR counter-UAS |
| **09** | **SKU-8: Display Driver** | 130nm HV CMOS | 0–12V Column Amps | 1280×10-bit DACs, temp-compensated gamma, ASIL-B capable | BEL 17" Rugged SXGA, PIL-5 Line Item #5 |
| **10** | **SKU-9: Zonal Gateway** | 130nm + 180nm | 12V / 48V Battery | 16× smart e-fuses, 4-port Gigabit TSN (802.1Qbv), EVITA-Full HSM | SDV Zonal Wire-Harness Reduction (>40% wt) |
| **11** | **Track B: D100 SoC** | 130nm + 28nm SiP | 5V / 12V Battery | PX4 loop + 30 Hz EKF VIO + Hardware Failsafe Island to ESC | DAP-2020 Make-II, DGCA Type Certification |
| **12** | **DG SDV Platform** | Heterogeneous SiP | Multi-Rail Domain | 64-bit AXI4 crossbar with AXI-REALM QoS, Triple-Lockstep Safe core | Collapses 80+ distributed ECUs into 1 mesh |
| **13** | **SiP Packaging** | 4-Layer Organic | BGA 15×15 mm | 6 wire-bond mature dies + 1 flip-chip 28nm die; deliberately NOT UCIe | Substrate PDN, thermal relief vias, AEC-Q100 |
| **14** | **3-Phase Roadmap** | 130nm $\to$ 28nm | Cross-Node | Arithmetic check self-audit: commits to disciplined ~50 SKUs by Year 5 | Phase 1 (130/180nm) $\to$ Phase 2 (90/55nm) $\to$ Phase 3 |

---

## 3. Detailed Subsystem Deep Dives

### 3.1 SKU-1: BLDC Motor Controller (Sheet 2)
Collapses discrete multi-chip solutions (TI DRV83xx pre-driver + external MCU) into a monolithic 130 nm BCD die.
- **Hardware Math:** Hardware PID loop executing in $<1\text{ }\mu\text{s}$ with CORDIC polar-to-rectangular coordinate converter.
- **Power Path:** Integrated 5V–120V buck-boost pre-driver with 7-channel PWM and runtime star/delta stator reconfiguration.
- **Traction Hook:** Bureau of Energy Efficiency (BEE) 5-star rating mandate driving ₹250–550 Cr/yr BLDC fan conversions.

### 3.2 SKU-2: Smart-Meter SoC (Sheet 3)
Designed for India’s 250-million-meter national smart grid mandate ($2–5 ASP).
- **Metrology Engine:** DG-AFE6 6-channel 24-bit $\Sigma\Delta$ ADC with $\text{sinc}^3$ OSR-256 filter, measuring active/reactive/apparent power ($P, Q, S$) and harmonic distortion up to THD-15.
- **Always-On RTC Domain:** Draws $<2\text{ }\mu\text{W}$ from backup coin cells, maintaining anti-tamper magnetic and chassis-open logging while mains power is severed.

### 3.3 SKU-7: 77 GHz 4D MIMO Radar (Sheet 8)
- **Partitioning Boundary:** Physical ADC defines the die boundary. 
  - **RF Die:** IHP Microelectronics SG13G2 (0.13 $\mu\text{m}$ SiGe BiCMOS with 350 GHz $f_T/f_{\max}$ HBTs) handles chirp generation, power amplifiers, and 4 LNA/mixer chains.
  - **Baseband Die:** Standard 130 nm CMOS die handles 12-bit 40 Msps sampling, range/Doppler 2D-FFTs, and CFAR point-cloud extraction.
- **Geopolitical Sourcing:** Fabricated at IHP in Frankfurt (Oder), Germany—100% free of US ITAR export restrictions.

### 3.4 Sheet 11: D100 Tactical Drone SoC & The Failsafe Wedge
The D100 drone processor implements an uncompromised hardware separation pattern:
- **Independent Failsafe Island:** Hardware link monitor and safe-state state machine wired directly to electronic speed controllers (ESCs). Runs on dedicated isolated power and clock nets.
- **Jamming Immunity:** If the Linux vision tile or autonomous VIO stack crashes or suffers electronic jamming, the failsafe island instantly takes over and guides the airframe to a controlled landing.
- **Contracted Pre-ASIC Proof:** ₹1.01 Cr formal contract signed with the Indian Army’s Military College of Electronics and Mechanical Engineering (MCEME).

### 3.5 Sheet 13: Organic Substrate Multi-Die SiP Packaging
- **Pragmatic Packaging:** Rather than adopting expensive silicon interposers ($>\$10\text{M}$ NRE) or fragile TSV micro-bumps, DeepGrid uses a standard 4-layer organic BT-resin laminate BGA package (15×15 mm).
- **Die Coexistence:** Allows high-voltage 120V BCD pre-drivers to sit 2 mm away from 1.8V sensitive RISC-V cores.
- **Wave 2 Flip-Chip:** 28nm AI accelerator joins via flip-chip micro-bumps on the same organic substrate after Series A funding.

### 3.6 Sheet 14: Three Phases & The Arithmetic Self-Audit
DeepGrid's Technical Annex features an authentic self-audit printed directly on the roadmap:
- **The Error Caught:** Early drafts claimed *"10 new SKUs every year and over 1,000 active SKUs by Year 5."*
- **Mathematical Correction:** $10\text{ SKUs/yr} \times 5\text{ yrs} = 50\text{ SKUs}$. A 1,000-SKU ramp would require 200 tapeouts per year—a 20× impossibility. DeepGrid publicly committed to a disciplined **~50-SKU catalogue** by Year 5.
- **Shrink Rationale:** Shrinking to 90/55/45nm in Phase 2 is performed **strictly for channel count and DSP throughput** (military GNSS and SDR basebands), never for speed vanity. Analog I/O rings remain permanently at 130 nm.
