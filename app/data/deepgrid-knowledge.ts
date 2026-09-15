// DeepGrid Grounded Knowledge Graph
// Compiled from deepgrid-sku-compendium, deepgrid-mature-silicon, and deepgrid-architecture

export interface DeepGridItem {
  id: string;
  name: string;
  category: 'sku' | 'strategy' | 'architecture' | 'defense' | 'loop' | 'finance';
  tagline: string;
  nodeFoundry?: string;
  voltageRail?: string;
  standards?: string;
  summary: string;
  keyFacts: string[];
  citation: string;
  actions?: {
    label: string;
    target: string;
    isExternal?: boolean;
  }[];
  connectedNodeIds?: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  shortName: string;
  category: 'sku' | 'foundry' | 'moat' | 'architecture' | 'anchor' | 'governance';
  x: number; // 0-100 normalized coordinate
  y: number; // 0-100 normalized coordinate
  description: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  category?: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'sku' | 'defense' | 'loop' | 'safety' | 'strategy';
}

export const quickPrompts: QuickPrompt[] = [
  { id: 'sku-compare', label: 'DG32 vs STM32G0', query: 'Compare DG32 with STM32G0', category: 'sku' },
  { id: 'shuttle-198', label: '198-Day Silicon Loop', query: 'How does the 198-day shuttle loop work?', category: 'loop' },
  { id: 'lockstep-safety', label: 'Lockstep 2-Cycle Skew', query: 'How does the 2-cycle lockstep core prevent bridge burn?', category: 'safety' },
  { id: 'three-factory', label: '3-Factory Sovereignty', query: 'What is the Three-Factory Sovereignty Roadmap?', category: 'strategy' },
  { id: 'd100-drone', label: 'D100 Drone SoC', query: 'Tell me about the D100 tactical drone SoC', category: 'sku' },
  { id: 'dap-2020', label: 'DAP-2020 Defense Moats', query: 'What are the DAP-2020 Make-II and Buy Indian IDDM requirements?', category: 'defense' },
  { id: 'radar-77ghz', label: 'SKU-7 77GHz Radar', query: 'What are the specs for SKU-7 77GHz SiGe Radar?', category: 'sku' },
  { id: 'bldc-sku1', label: 'SKU-1 BLDC Motor', query: 'What is SKU-1 BLDC motor controller rail and latency?', category: 'sku' },
  { id: 'sip-packaging', label: 'Organic SiP Packaging', query: 'Why organic substrate instead of silicon interposers?', category: 'safety' },
  { id: 'munger-audit', label: 'Charlie Munger Audit', query: 'What are the 14 risks and Stop Rules S1-S4?', category: 'strategy' },
  { id: 'funds-10cr', label: '₹10 Cr Financial Model', query: 'How is the ₹10 Cr seed capital allocated across fabs and ATE?', category: 'strategy' }
];

export const deepGridCatalog: DeepGridItem[] = [
  {
    id: 'dg32-lite',
    name: 'DG32-LITE Lockstep RISC-V MCU',
    category: 'sku',
    tagline: 'Dual-core hardware lockstep motor-control SoC for entry-level brushless drives',
    nodeFoundry: '130 nm CMOS · SkyWater / SCL Mohali',
    voltageRail: '1.8V Core / 3.3V I/O · 50 MHz Clock',
    standards: 'AEC-Q100 Grade 1 Target · ISO 26262 ASIL-D Ready',
    summary: 'DG32-LITE puts a RISC-V MCU, motor-control peripherals and a hardware lockstep safety monitor on one 130 nm chip. First silicon rides the September 2026 shuttle.',
    keyFacts: [
      'Two RV32IM cores in hardware lockstep: CHECKER trails MAIN by 2 cycles on mirrored inputs.',
      'Hardware-accelerated FOC loop: ADC sampling, Park/Clarke transforms, and PWM generation run in dedicated blocks, costing ~300 cycles (~6 µs) at any loop rate.',
      'The CPU handles only two PI regulators and high-level state, freeing >85% of execution budget.',
      'Fault pin fires directly from hardware comparator without firmware intervention, protecting power bridge transistors within 2 cycles of divergence (<=39 cycles from fault injection).',
      'QFN-64 (9 × 9 mm, 0.5 mm pitch) carrying 44 dedicated signal pins.'
    ],
    citation: 'DG32-LITE Datasheet v1.0 & dr.deepgridsemi.com',
    actions: [
      { label: 'Explore Architecture', target: 'architecture?chip=lite' },
      { label: 'Control Loop Budget', target: 'control' },
      { label: 'View Pinout', target: 'pinout' }
    ],
    connectedNodeIds: ['arch-lockstep', 'fab-skywater', 'arch-198loop', 'sku-1']
  },
  {
    id: 'dg32-2dom',
    name: 'DG32-2DOM Edge Attention SoC',
    category: 'sku',
    tagline: 'Dual-core lockstep motor-control SoC plus isolated INT8 attention engine',
    nodeFoundry: '130 nm CMOS · SkyWater / SCL Mohali',
    voltageRail: '1.8V Core / 3.3V I/O · 50 MHz (Control) + 114 MHz (Engine)',
    standards: 'AEC-Q100 Grade 1 Target · ISO 26262 ASIL-D Ready',
    summary: 'The identical frozen control core, pinout and limits as DG32-LITE, with an added INT8 attention engine on its own 114 MHz domain for in-situ bearing anomaly and vibration diagnosis.',
    keyFacts: [
      'Identical QFN-64 footprint and 44 signal pins: a board designed for DG32-LITE drops in DG32-2DOM without hardware alterations.',
      'Isolated INT8 attention engine runs behind dual-clock asynchronous bridges, guaranteeing condition monitoring never interrupts or skews the control loop.',
      'Continuous vibration and phase-current spectrogram inference enables predictive failure warning before bridge degradation.',
      'Power envelope: ~0.43 W total estimated at 25 °C and 1.8 V.'
    ],
    citation: 'DG32-2DOM Technical Specification & Library Deck',
    actions: [
      { label: 'Explore 2DOM Engine', target: 'architecture?chip=2dom' },
      { label: 'Product Family Comparison', target: 'family' }
    ],
    connectedNodeIds: ['dg32-lite', 'arch-lockstep', 'fab-skywater']
  },
  {
    id: 'sku-1',
    name: 'SKU-1: BLDC Motor Controller',
    category: 'sku',
    tagline: 'High-voltage mixed-signal motor drive with FOC CORDIC hardware accelerator',
    nodeFoundry: '130 nm BCD · SkyWater / SCL Mohali',
    voltageRail: '5V – 120V High-Voltage Rail',
    standards: 'BEE 5-Star Fans · EV 2-Wheelers · AEC-Q100 Grade 1',
    summary: 'High-voltage BCD motor controller integrating gate pre-drivers directly onto the chip, achieving <1 µs closed current loop latency with integrated bootstrap diodes.',
    keyFacts: [
      '120V BCD process integrates high-side and low-side gate drivers directly on-die, eliminating external level-shifter ICs.',
      'Dedicated hardware CORDIC pipeline computes sin/cos transformations in under 20 clock cycles.',
      'Integrated active dead-time insertion logic prevents shoot-through fault in half-bridge configurations.',
      'Target sockets: BLDC ceiling fans (BEE 5-star mandate), light electric vehicles (2-wheelers/3-wheelers), and industrial pumps.',
      'Replaces TI DRV83xx + external MCU combos.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 2: SKU-1 BLDC Motor',
    connectedNodeIds: ['fab-skywater', 'anchor-airgap', 'moat-pil5', 'dg32-lite']
  },
  {
    id: 'sku-2',
    name: 'SKU-2: Smart-Meter SoC',
    category: 'sku',
    tagline: 'Tamper-proof metrology SoC for the 250M National Smart Meter rollout',
    nodeFoundry: '130 nm CMOS · SCL Mohali / SkyWater',
    voltageRail: '3.3V Logic · <2 µW Battery-Backed RTC Domain',
    standards: 'IS 16444 / IS 15884 · Class 0.2S / 0.5S Accuracy',
    summary: 'Dedicated 3-phase and single-phase energy measurement SoC featuring high-dynamic-range 24-bit Sigma-Delta ADCs and hardware tamper detection active even when unpowered.',
    keyFacts: [
      '24-bit Sigma-Delta ADC with dynamic range >85 dB across 1000:1 current range.',
      'Sub-2 µW real-time clock domain powered by coin cell or supercapacitor during power outages.',
      'Hall-effect and DC magnetic tamper sensors embedded on-chip with cryptographic timestamp logging.',
      'Direct import substitution for Cirrus Logic and Analog Devices metrology front-ends under India Smart Meter National Programme.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 3: SKU-2 Smart Meter',
    connectedNodeIds: ['anchor-ripple', 'fab-scl', 'moat-dap2020']
  },
  {
    id: 'sku-3',
    name: 'SKU-3: Hi-Rel PMIC',
    category: 'sku',
    tagline: 'Radiation-tolerant power management IC for defense and aerospace avionics',
    nodeFoundry: '180 nm BCD · SkyWater / SCL Mohali',
    voltageRail: '5V – 120V Wide-Input Rail (28V Aircraft Bus Standard)',
    standards: 'DO-160G · MIL-STD-461G · MIL-STD-810H · SRIJAN Portal',
    summary: 'High-reliability power management IC capable of surviving 100V transients on 28V military avionics buses, featuring Brokaw bandgap references and DICE flip-flop state machines.',
    keyFacts: [
      'Brokaw bandgap reference achieves <12 ppm/°C drift across -55 °C to +125 °C operating range.',
      'Dual Interlocked Cell (DICE) registers prevent Single Event Upset (SEU) latch-up in radiation-exposed environments.',
      'Integrated quad buck regulators with independent soft-start, UVLO, and thermal shutdown.',
      'Qualified for line-replaceable units (LRUs) on military aircraft, UAVs, and combat vehicles.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 4: SKU-3 Hi-Rel PMIC',
    connectedNodeIds: ['moat-srijan', 'fab-scl', 'fab-skywater']
  },
  {
    id: 'sku-4',
    name: 'SKU-4: Lockstep Safety MCU',
    category: 'sku',
    tagline: 'ASIL-D / SIL-3 functional safety MCU with dual temporally skewed cores',
    nodeFoundry: '130 nm CMOS · SkyWater / SCL Mohali',
    voltageRail: '1.8V Core / 3.3V I/O',
    standards: 'ISO 26262 ASIL-D · IEC 61508 SIL-3 · AEC-Q100 Grade 0',
    summary: 'Dual DGridRiscV core microcontroller with 2-clock-cycle temporal skew and spatial separation to eliminate common-cause transient faults and guarantee fail-safe behavior.',
    keyFacts: [
      'Dual RV32IM cores where checker core receives mirrored inputs delayed by 2 clock cycles.',
      'Hardware comparator checks every committed register write and bus store in real time.',
      'Physical layout separation (>100 µm spacing) prevents single-particle radiation strikes from flipping identical bits.',
      'Trips FAULTn pin and enters hardware safe-state in under 2 clock cycles upon mismatch.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 5: SKU-4 Lockstep MCU',
    connectedNodeIds: ['arch-lockstep', 'anchor-mceme', 'sku-5', 'dg32-lite']
  },
  {
    id: 'sku-5',
    name: 'SKU-5: Robust Interface Transceiver',
    category: 'sku',
    tagline: 'Galvanically isolated CAN-FD & RS-485 transceiver for harsh industrial buses',
    nodeFoundry: '130 nm Thick-Oxide HV CMOS',
    voltageRail: '5V Operating · -40V to +40V Bus Fault Protection',
    standards: 'ISO 11898-2 (CAN-FD 5 Mbps) · TIA/EIA-485-A · ±15 kV HBM ESD',
    summary: 'Rugged bus interface transceiver engineered to survive continuous electrical overstress, ground potential differences, and electromagnetic discharge on vehicular harnesses.',
    keyFacts: [
      '5V thick-oxide LDMOS transistors with ±15 kV Human Body Model (HBM) contact discharge ESD.',
      'Handles CAN-FD data rates up to 5 Mbps with symmetrical driver delay minimizing loop distortion.',
      'Integrated thermal shutdown and dominant timeout protection preventing bus lockup.',
      'Essential companion chip to SKU-4 safety MCU and SKU-9 zonal gateways.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 6: SKU-5 Transceiver',
    connectedNodeIds: ['sku-4', 'sku-9', 'fab-skywater']
  },
  {
    id: 'sku-6',
    name: 'SKU-6: Quad-Rail Voltage Supervisor',
    category: 'sku',
    tagline: 'Ultra-low-jitter precision supply monitor and brownout watchtower',
    nodeFoundry: '180 nm CMOS · SCL Mohali',
    voltageRail: '1.0V to 5.0V Quad Threshold Monitoring',
    standards: 'MIL-STD-883K · AEC-Q100 Grade 0 · IEC 61508',
    summary: 'Autonomous analog watchdog that monitors four independent power rails simultaneously, executing clean deglitched reset generation during power brownouts.',
    keyFacts: [
      'Chopper-stabilized precision comparators eliminate 1/f noise and offset drift over 20-year lifespans.',
      'Fixed 8 µs deglitch filtering eliminates false resets from inductive switching spikes.',
      'Master RESETn output with programmable power-on timeout from 50 ms to 400 ms.',
      'Acts as low-cost pathfinder for SCL Mohali MIL-STD-883 qualification line.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 7: SKU-6 Supervisor',
    connectedNodeIds: ['fab-scl', 'moat-srijan']
  },
  {
    id: 'sku-7',
    name: 'SKU-7: 77 GHz 4D MIMO Radar',
    category: 'sku',
    tagline: 'High-resolution imaging radar front-end in Silicon-Germanium BiCMOS',
    nodeFoundry: 'IHP Microelectronics SG13G2 (0.13 µm SiGe BiCMOS, 350 GHz fT/fmax)',
    voltageRail: '3.3V Analog RF / 1.2V Baseband',
    standards: 'DO-160G Airborne Radar · Automotive ADAS Radar Band (76–81 GHz)',
    summary: 'Sovereign 4D imaging radar RF front-end combining 3 transmitter and 4 receiver channels with integrated fractional-N PLL synthesizer, resolving azimuth and elevation at 3.75 cm range accuracy.',
    keyFacts: [
      'IHP SG13G2 Silicon-Germanium process provides 350 GHz cutoff frequency, unencumbered by US ITAR regulations.',
      'MIMO array configuration enables 12 virtual channels for 3D point-cloud reconstruction.',
      'Low phase-noise VCO (-95 dBc/Hz at 1 MHz offset) provides superior clutter rejection in rain/fog.',
      'Replaces ITAR-controlled millimeter-wave MMICs from Infineon and Texas Instruments in defense radar pods.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 8: SKU-7 77GHz Radar',
    connectedNodeIds: ['fab-ihp', 'moat-dap2020', 'dg-sdv-platform']
  },
  {
    id: 'sku-8',
    name: 'SKU-8: Rugged Display Driver & TCON',
    category: 'sku',
    tagline: 'High-voltage column driver and timing controller for ruggedized avionics panels',
    nodeFoundry: '130 nm High-Voltage CMOS',
    voltageRail: '0V – 12V Column Amps · 1.8V Core Logic',
    standards: 'MIL-STD-810H · BEL 17" Rugged SXGA Line-Item · PIL-5 Notification #5',
    summary: 'Purpose-built column driver and timing controller designed specifically to replace obsolete foreign display silicon in Bharat Electronics Limited (BEL) 17" cockpit tactical displays.',
    keyFacts: [
      '1280-channel 10-bit digital-to-analog column drivers providing wide dynamic contrast in direct sunlight.',
      'Wide temperature liquid-crystal drive waveforms prevent slow refresh degradation at -40 °C cold soak.',
      'Directly answers the Indian Ministry of Defence PIL-5 import substitution mandate #5.',
      'Integrated LVDS receiver and gamma correction lookup tables on a single monolithic substrate.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 9: SKU-8 Display Driver',
    connectedNodeIds: ['anchor-bel', 'moat-pil5', 'fab-skywater']
  },
  {
    id: 'sku-9',
    name: 'SKU-9: SDV Zonal Gateway',
    category: 'sku',
    tagline: 'Software-Defined Vehicle zonal controller with e-fuses and Ethernet TSN',
    nodeFoundry: '130 nm CMOS + 180 nm BCD SiP',
    voltageRail: '12V / 48V Automotive Battery Rails',
    standards: 'IEEE 802.1Qbv TSN · ISO 26262 ASIL-D · AUTOSAR Adaptive',
    summary: 'Next-generation zonal automotive gateway combining a Gigabit Time-Sensitive Networking (TSN) switch with 16 intelligent solid-state e-fuses to replace mechanical relay boxes.',
    keyFacts: [
      '16x smart high-side power switches with programmable I2t overcurrent trip curves and telemetry.',
      '4-port Gigabit Ethernet TSN switch with deterministic IEEE 802.1Qbv time-aware traffic shaping.',
      'Hardware ASIL-D safety island monitors wiring harness health and handles safe power cutoffs.',
      'Cuts wiring harness weight in electric vehicles by over 40% through localized zonal actuation.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 10: SKU-9 Zonal Gateway',
    connectedNodeIds: ['dg-sdv-platform', 'sku-5', 'arch-sip']
  },
  {
    id: 'track-b-d100',
    name: 'Track B: D100 Tactical Drone SoC',
    category: 'sku',
    tagline: 'Heterogeneous autonomous flight computer on an organic multi-die SiP',
    nodeFoundry: '130 nm Safety/IO + 28 nm Compute SiP',
    voltageRail: 'Dual 5V/12V Regulated Battery Bus',
    standards: 'DGCA Type Certification · Indian Army High-Altitude Drone Standards',
    summary: 'Heterogeneous flight navigation processor combining an ASIL-D flight controller with a 28nm Linux compute tile, running 30 Hz Visual-Inertial Odometry (VIO) in GNSS-denied battlefields.',
    keyFacts: [
      'Organic substrate Multi-Die System-in-Package (SiP) combining 130nm safety die and 28nm AI accelerator.',
      'Independent hardware failsafe island: if the Linux tile crashes or jams, the 130nm lockstep core keeps drone airborne.',
      'Direct hardware interfaces for MIPI-CSI thermal cameras, dual IMUs, and PWM motor esc rails.',
      'Designed for sovereign defense procurement under DAP-2020 Make-II scheme.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 11: D100 Tactical Drone SoC',
    connectedNodeIds: ['arch-sip', 'moat-make2', 'anchor-mceme', 'dg32-lite']
  },
  {
    id: 'dg-sdv-platform',
    name: 'DeepGrid SDV Reference Platform',
    category: 'sku',
    tagline: 'End-to-end silicon architecture for Software-Defined Vehicles',
    nodeFoundry: '28 nm Compute + 130/180 nm Satellite Nodes',
    voltageRail: '12V / 48V DC Vehicle Bus',
    standards: 'ISO 26262 ASIL-D · EVITA-Full Hardware Security Module (HSM)',
    summary: 'Comprehensive vehicle electronics architecture combining central cockpit compute with 4 regional zonal gateways (SKU-9), motor control (DG32/SKU-1), and perception radar (SKU-7).',
    keyFacts: [
      '64-bit AXI4 crossbar matrix with hardware AXI-REALM Quality-of-Service bandwidth guarantees.',
      'Triple Modular Redundancy (TMR) on critical safety routing paths.',
      'EVITA-Full compliant HSM with hardware acceleration for ECC, RSA-4096, and SHA-3.',
      'Eliminates over 80 discrete ECUs, collapsing vehicle compute into a unified deterministic mesh.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 12: DG SDV Platform',
    connectedNodeIds: ['sku-9', 'sku-7', 'dg32-lite', 'arch-sip']
  },
  {
    id: '198-day-loop',
    name: 'The 198-Day Silicon Shuttle Loop',
    category: 'loop',
    tagline: 'Lean silicon development sprint replacing $1M legacy EDA with open-source toolchains',
    nodeFoundry: 'OpenLane / Yosys / OpenROAD → SkyWater MPW',
    voltageRail: 'Process-Agnostic Methodology',
    standards: 'Open-Source EDA · Multi-Project Wafer (MPW) Shuttle Cycles',
    summary: 'DeepGrid’s breakthrough 198-day tapeout-to-silicon lifecycle that slashes chip development costs from $2M+ down to $14.3K per MPW shuttle run using open-source tools.',
    keyFacts: [
      '30-Day Digital Sprint: RTL specification, formal verification, and automated GDSII hardening via OpenLane.',
      '168-Day Foundry Shuttle: Multi-Project Wafer (MPW) fabrication and wafer dicing.',
      '$14.3K MPW cost per run enables 4 physical silicon spins for the cost of a single proprietary Synopsys license seat.',
      'Eliminates vendor lock-in and allows continuous tapeout iterations without budget exhaustion.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 5: The 198-Day Silicon Loop',
    connectedNodeIds: ['fab-skywater', 'fin-seed', 'dg32-lite', 'arch-dgridriscv']
  },
  {
    id: 'three-factory',
    name: 'Three-Factory Sovereignty Roadmap',
    category: 'strategy',
    tagline: 'Geopolitical supply-chain insulation spanning USA, Germany, and India',
    nodeFoundry: 'Phase 1: SkyWater 130nm → Phase 2: IHP SG13G2 → Phase 3: SCL Mohali',
    voltageRail: 'Sovereign Multi-Fab Portability',
    standards: 'DAP-2020 Buy Indian-IDDM (100% Domestic Silicon)',
    summary: 'A phased de-risking roadmap that starts with commercially accessible commercial fabs in friendly nations, then systematically ports hardened IP to India’s domestic Semi-Conductor Laboratory (SCL).',
    keyFacts: [
      'Phase 1 (SkyWater 130nm, USA): Rapid prototyping, open PDK, and MPW tapein verification in months.',
      'Phase 2 (IHP Microelectronics, Germany): Sovereign European source for 350 GHz SiGe BiCMOS radar front-ends.',
      'Phase 3 (SCL Mohali, India): Full domestic packaging and fabrication, achieving 100% non-embargoable Indian IP.',
      'PDK-agnostic digital cell libraries guarantee designs can be retargeted across foundries with minimal redesign.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 7: Three-Factory Sovereignty Roadmap',
    connectedNodeIds: ['fab-skywater', 'fab-ihp', 'fab-scl', 'moat-dap2020']
  },
  {
    id: 'dap-2020-moats',
    name: 'Defence Procurement & Legal Moats',
    category: 'defense',
    tagline: 'Statutory protections under DAP-2020, Make-II, and PIL-5 mandates',
    nodeFoundry: 'SCL Mohali Domestic Fab Alignment',
    voltageRail: 'Defence & Strategic Sockets',
    standards: 'DAP-2020 Buy (Indian-IDDM) · Make-II · SRIJAN Portal · Positive Indigenisation Lists',
    summary: 'India’s Defence Acquisition Procedure (DAP-2020) legally mandates that military platforms prioritize indigenous intellectual property, creating a protected multi-billion-dollar domestic moat.',
    keyFacts: [
      'Buy (Indian-IDDM) mandates minimum 50% indigenous content, disqualifying foreign silicon when a qualified domestic IC exists.',
      'Make-II Scheme: Industry-funded prototype development with government-guaranteed procurement orders upon qualification.',
      'PIL-5 Positive Indigenisation Lists legally prohibit import of specified sensor, motor, and display components.',
      'SRIJAN portal registration establishes DeepGrid as the verified Tier-1 domestic supplier for armed forces modernization.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 1: Market & Legal Moats',
    connectedNodeIds: ['moat-dap2020', 'moat-make2', 'moat-pil5', 'moat-srijan', 'fab-scl']
  },
  {
    id: 'sip-packaging',
    name: 'Organic Substrate Multi-Die Packaging',
    category: 'architecture',
    tagline: 'Pragmatic multi-die packaging bypassing expensive silicon interposers',
    nodeFoundry: '15 × 15 mm Organic BGA Substrate',
    voltageRail: 'Mixed 1.8V / 3.3V / High-Voltage Rails',
    standards: 'AEC-Q100 · MIL-STD-883K Thermal Cycling',
    summary: 'DeepGrid pairs mature 130nm analog/high-voltage dies with sub-28nm digital compute using standard organic laminate substrates, avoiding the million-dollar cost and fragility of silicon interposers.',
    keyFacts: [
      'Eliminates costly UCIe or TSV interposers; uses standard wire-bonding and flip-chip micro-bumps on multi-layer organic BT-resin.',
      'Enables high-voltage BCD gate drivers (120V) to sit 2 mm away from low-voltage 1.8V processing cores.',
      'Thermal relief vias through substrate manage 100 °C ambient under-the-hood automotive environments.',
      'Dramatically reduces unit cost while offering modular silicon upgrades.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 6: Block-Level IP Reuse & SiP',
    connectedNodeIds: ['track-b-d100', 'dg-sdv-platform', 'sku-9']
  },
  {
    id: 'munger-audit',
    name: 'Charlie Munger 14-Point Risk Audit',
    category: 'finance',
    tagline: 'Inversion framework cataloging operational risks and Stop Rules S1–S4',
    nodeFoundry: 'Governance Protocol',
    voltageRail: 'Capital Discipline Boundary',
    standards: 'Stop Rules S1–S4 · 7 First Fixes Checklist',
    summary: 'DeepGrid applies Charlie Munger’s inversion mental model to stress-test the company against Chinese price crashes, foundry allocation embargoes, and post-silicon testing delays.',
    keyFacts: [
      'Stop Rule S1: Halt design work on any SKU if pre-committed customer MOUs drop below 100k units/year.',
      'Stop Rule S2: Cap layout burn rate if MPW yield drops below 85% on digital logic.',
      'Stop Rule S3: Transition to SCL Mohali only after commercial characterization passes on SkyWater/IHP.',
      'Stop Rule S4: Never compete on raw commodity wafer price against state-subsidized Chinese fabs; compete exclusively within legally protected PIL/Make-II moats.',
      'Live pre-ASIC contracted revenue (₹2.88 Cr: MCEME ₹1.01 Cr, Infinis, Axitech) proves real market demand before mass silicon tapeout.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 14: What Could Stop This (Charlie Munger Audit)',
    connectedNodeIds: ['fin-seed', 'three-factory', 'dap-2020-moats']
  },
  {
    id: 'fin-funds',
    name: '₹10 Cr Financial Model & Use of Funds',
    category: 'finance',
    tagline: 'Seed capital deployment covering 6 MPW runs, ATE lines, and FY31 buildup',
    nodeFoundry: 'Financial Allocation Engine',
    voltageRail: '24-Month Seed Runway',
    standards: '₹10 Cr Seed Allocation · ₹1,000 Cr FY31 Buildup',
    summary: 'The ₹10 Cr ($1.2M) seed round funds 24 months of runway, six parallel MPW factory runs, four full product qualifications, and production mask sets for Chips 1 and 2.',
    keyFacts: [
      '₹3.60 Cr (36%): Factory runs & dedicated mask sets (6 SkyWater MPW slots, 1 IHP SiGe run, 2 dedicated mask sets).',
      '₹2.40 Cr (24%): Engineering team loaded across 24 months (5-7 specialized analog & digital engineers).',
      '₹1.80 Cr (18%): Environmental qualification, MIL-STD-883 burn-in screening, and CEMILAC certification.',
      '₹1.20 Cr (12%): Automated Test Equipment (ATE) line and custom wafer load boards.',
      '₹1.00 Cr (10%): Working capital and operational contingency buffer.'
    ],
    citation: 'DeepGrid Mature Silicon — Chapter 13: What ₹10 Cr Buys and What It Proves',
    connectedNodeIds: ['198-day-loop', 'munger-audit', 'three-factory']
  }
];

export const graphNodes: GraphNode[] = [
  // SKUs (Cluster Center-Left)
  { id: 'dg32-lite', name: 'DG32-LITE', shortName: 'LITE', category: 'sku', x: 28, y: 35, description: 'Dual-core hardware lockstep motor-control SoC for entry-level brushless drives.' },
  { id: 'dg32-2dom', name: 'DG32-2DOM', shortName: '2DOM', category: 'sku', x: 18, y: 30, description: 'Motor-control SoC + isolated 114 MHz INT8 condition-monitoring engine.' },
  { id: 'sku-1', name: 'SKU-1 Motor', shortName: 'SKU-1', category: 'sku', x: 25, y: 52, description: '130nm BCD 120V FOC CORDIC BLDC motor controller.' },
  { id: 'sku-2', name: 'SKU-2 Meter', shortName: 'SKU-2', category: 'sku', x: 38, y: 65, description: '24-bit Sigma-Delta Class 0.5S smart-meter SoC with <2µW RTC.' },
  { id: 'sku-3', name: 'SKU-3 PMIC', shortName: 'SKU-3', category: 'sku', x: 50, y: 72, description: '180nm BCD 28V military avionics PMIC with Brokaw bandgap.' },
  { id: 'sku-4', name: 'SKU-4 Safety', shortName: 'SKU-4', category: 'sku', x: 36, y: 45, description: 'Dual DGridRiscV lockstep MCU with 2-cycle temporal skew.' },
  { id: 'sku-5', name: 'SKU-5 XCVR', shortName: 'SKU-5', category: 'sku', x: 22, y: 65, description: 'CAN-FD & RS-485 transceiver with ±15kV HBM ESD.' },
  { id: 'sku-6', name: 'SKU-6 Supv', shortName: 'SKU-6', category: 'sku', x: 62, y: 78, description: 'Quad-rail precision voltage supervisor with 8µs deglitch.' },
  { id: 'sku-7', name: 'SKU-7 Radar', shortName: 'SKU-7', category: 'sku', x: 52, y: 22, description: '77 GHz 4D MIMO Radar in 350GHz SiGe BiCMOS.' },
  { id: 'sku-8', name: 'SKU-8 Display', shortName: 'SKU-8', category: 'sku', x: 14, y: 55, description: 'Rugged avionics display driver for BEL 17" SXGA displays.' },
  { id: 'sku-9', name: 'SKU-9 Zonal', shortName: 'SKU-9', category: 'sku', x: 32, y: 20, description: 'SDV zonal gateway with 16x e-fuses & Gigabit Ethernet TSN.' },
  { id: 'track-b-d100', name: 'D100 Drone', shortName: 'D100', category: 'sku', x: 16, y: 15, description: 'Heterogeneous tactical drone SoC on organic multi-die SiP.' },
  { id: 'dg-sdv-platform', name: 'DG SDV', shortName: 'SDV', category: 'sku', x: 38, y: 12, description: 'End-to-end SDV reference architecture with AXI-REALM QoS.' },

  // Foundries (Cluster Center-Right)
  { id: 'fab-skywater', name: 'SkyWater 130nm', shortName: 'SkyWater', category: 'foundry', x: 55, y: 38, description: 'USA commercial foundry, open SKY130 PDK, fast MPW runs.' },
  { id: 'fab-ihp', name: 'IHP SG13G2', shortName: 'IHP SiGe', category: 'foundry', x: 66, y: 24, description: 'German research fab, 0.13µm SiGe BiCMOS with 350 GHz fT for 77GHz radar.' },
  { id: 'fab-scl', name: 'SCL Mohali 180nm', shortName: 'SCL India', category: 'foundry', x: 74, y: 58, description: 'Sovereign Indian fab providing non-embargoable domestic silicon.' },

  // Legal & Defense Moats (Cluster Right)
  { id: 'moat-dap2020', name: 'DAP-2020 IDDM', shortName: 'DAP-2020', category: 'moat', x: 86, y: 48, description: 'Statutory Indian procurement priority for indigenously designed silicon.' },
  { id: 'moat-make2', name: 'Make-II Scheme', shortName: 'Make-II', category: 'moat', x: 84, y: 26, description: 'Industry-funded prototype development with guaranteed military purchase.' },
  { id: 'moat-pil5', name: 'PIL-5 Indigenisation', shortName: 'PIL-5', category: 'moat', x: 88, y: 68, description: 'Ministry of Defence legal bans on importing specified sensor/motor ICs.' },
  { id: 'moat-srijan', name: 'SRIJAN Portal', shortName: 'SRIJAN', category: 'moat', x: 82, y: 84, description: 'Verified national defense supplier registry for import substitution.' },

  // Architectural Protocols (Center Bottom)
  { id: 'arch-198loop', name: '198-Day Loop', shortName: '198-Day', category: 'architecture', x: 48, y: 52, description: '30d digital sprint + 168d fab shuttle replacing $1M legacy EDA.' },
  { id: 'arch-lockstep', name: '2-Cycle Lockstep', shortName: 'Lockstep', category: 'architecture', x: 42, y: 34, description: 'Dual temporally skewed RV32IM cores latching faults in <=2 cycles.' },
  { id: 'arch-sip', name: 'Organic SiP', shortName: 'SiP', category: 'architecture', x: 26, y: 8, description: 'Multi-die organic BT-resin packaging without expensive UCIe interposers.' },
  { id: 'arch-dgridriscv', name: 'DGridRiscV', shortName: 'RV32IM', category: 'architecture', x: 44, y: 44, description: 'Cacheless, non-speculative, deterministic latency processor.' },

  // Anchor Customers
  { id: 'anchor-mceme', name: 'MCEME Army', shortName: 'MCEME', category: 'anchor', x: 12, y: 75, description: 'Indian Army MCEME: ₹1.01 Cr contracted pre-ASIC validation.' },
  { id: 'anchor-airgap', name: 'Airgap EV', shortName: 'Airgap', category: 'anchor', x: 10, y: 44, description: 'Commercial anchor for 15M units/year BLDC motor silicon.' },
  { id: 'anchor-ripple', name: 'Ripple Metering', shortName: 'Ripple', category: 'anchor', x: 48, y: 88, description: 'National rollout partner for 250M smart meter front-ends.' },
  { id: 'anchor-bel', name: 'BEL Avionics', shortName: 'BEL', category: 'anchor', x: 8, y: 62, description: 'Bharat Electronics Limited 17" cockpit tactical display program.' },

  // Governance & Finance
  { id: 'fin-seed', name: '₹10 Cr Model', shortName: '₹10 Cr', category: 'governance', x: 62, y: 46, description: 'Seed allocation for 6 MPW runs, ATE lines, and FY31 revenue.' },
  { id: 'fin-munger', name: 'Charlie Munger Audit', shortName: 'Munger Audit', category: 'governance', x: 74, y: 38, description: '14-Point Risk Matrix and non-negotiable Stop Rules S1-S4.' }
];

export const graphEdges: GraphEdge[] = [
  // DG32 Connections
  { from: 'dg32-lite', to: 'arch-lockstep', label: 'Safety Core' },
  { from: 'dg32-lite', to: 'fab-skywater', label: 'Primary Shuttle' },
  { from: 'dg32-lite', to: 'arch-198loop', label: 'Sep 2026 Shuttle' },
  { from: 'dg32-2dom', to: 'dg32-lite', label: 'Drop-In Compatible' },
  { from: 'dg32-2dom', to: 'arch-lockstep', label: 'Frozen Core' },

  // SKU to Foundry
  { from: 'sku-1', to: 'fab-skywater', label: '130nm BCD' },
  { from: 'sku-1', to: 'anchor-airgap', label: 'Anchor Buyer' },
  { from: 'sku-1', to: 'moat-pil5', label: 'PIL-5 Substitution' },

  { from: 'sku-2', to: 'fab-scl', label: 'Domestic eNVM' },
  { from: 'sku-2', to: 'anchor-ripple', label: '250M Meter Rollout' },

  { from: 'sku-3', to: 'fab-scl', label: '180nm BCD' },
  { from: 'sku-3', to: 'moat-srijan', label: 'NSG-5962' },

  { from: 'sku-4', to: 'arch-lockstep', label: 'Dual RV32IM' },
  { from: 'sku-4', to: 'anchor-mceme', label: '₹1.01 Cr Order' },
  { from: 'sku-5', to: 'sku-4', label: 'Harness Companion' },

  { from: 'sku-6', to: 'fab-scl', label: 'MIL-883 Pathfinder' },
  { from: 'sku-7', to: 'fab-ihp', label: '350 GHz SiGe' },
  { from: 'sku-7', to: 'moat-dap2020', label: 'Non-ITAR' },

  { from: 'sku-8', to: 'anchor-bel', label: 'BEL 17" Cockpit' },
  { from: 'sku-8', to: 'moat-pil5', label: 'PIL-5 #5' },

  { from: 'sku-9', to: 'dg-sdv-platform', label: 'Zonal Edge' },
  { from: 'sku-9', to: 'arch-sip', label: 'Organic SiP' },

  { from: 'track-b-d100', to: 'arch-sip', label: 'Multi-Die Packaging' },
  { from: 'track-b-d100', to: 'moat-make2', label: 'Make-II Prototype' },
  { from: 'track-b-d100', to: 'anchor-mceme', label: 'Army Drones' },

  { from: 'dg-sdv-platform', to: 'sku-7', label: 'Perception Radar' },
  { from: 'dg-sdv-platform', to: 'sku-9', label: 'TSN Mesh' },

  // Foundry Sovereignty Chain
  { from: 'fab-skywater', to: 'fab-ihp', label: 'Phase 1 → Phase 2' },
  { from: 'fab-ihp', to: 'fab-scl', label: 'Phase 2 → Phase 3' },
  { from: 'fab-scl', to: 'moat-dap2020', label: '100% Domestic' },

  // Methodology & Governance
  { from: 'arch-198loop', to: 'fab-skywater', label: '$14.3K MPW Runs' },
  { from: 'arch-198loop', to: 'arch-dgridriscv', label: 'Synthesized Core' },
  { from: 'fin-seed', to: 'arch-198loop', label: '10x Cost Advantage' },
  { from: 'fin-seed', to: 'fin-munger', label: 'Capital Inversion' },
  { from: 'fin-munger', to: 'moat-dap2020', label: 'Stop Rules S1–S4' },
  { from: 'moat-dap2020', to: 'moat-make2', label: 'Statutory Priority' }
];

export function searchDeepGridKnowledge(query: string): DeepGridItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return deepGridCatalog;

  // Exact / keyword scoring
  const scores = deepGridCatalog.map(item => {
    let score = 0;
    const name = item.name.toLowerCase();
    const tagline = item.tagline.toLowerCase();
    const summary = item.summary.toLowerCase();
    const id = item.id.toLowerCase();
    const facts = item.keyFacts.join(' ').toLowerCase();
    const stds = (item.standards || '').toLowerCase();
    const node = (item.nodeFoundry || '').toLowerCase();

    // Query terms
    const terms = q.split(/\s+/);
    terms.forEach(term => {
      if (term.length < 2) return;
      if (id.includes(term)) score += 30;
      if (name.includes(term)) score += 25;
      if (tagline.includes(term)) score += 15;
      if (stds.includes(term)) score += 12;
      if (node.includes(term)) score += 12;
      if (summary.includes(term)) score += 10;
      if (facts.includes(term)) score += 6;
    });

    // Special match boosts for core concepts
    if (q.includes('198') && item.id === '198-day-loop') score += 60;
    if ((q.includes('stm32') || q.includes('compare')) && (item.id === 'dg32-lite' || item.id === 'sku-4')) score += 45;
    if ((q.includes('drone') || q.includes('d100')) && item.id === 'track-b-d100') score += 60;
    if ((q.includes('factory') || q.includes('sovereign') || q.includes('three')) && item.id === 'three-factory') score += 60;
    if ((q.includes('radar') || q.includes('77') || q.includes('sige')) && item.id === 'sku-7') score += 60;
    if ((q.includes('defense') || q.includes('dap') || q.includes('iddm') || q.includes('make-ii') || q.includes('pil')) && item.id === 'dap-2020-moats') score += 60;
    if (q.includes('lockstep') && (item.id === 'dg32-lite' || item.id === 'sku-4')) score += 45;
    if (q.includes('bldc') && (item.id === 'sku-1' || item.id === 'dg32-lite')) score += 45;
    if ((q.includes('munger') || q.includes('audit') || q.includes('stop rule')) && item.id === 'munger-audit') score += 60;
    if ((q.includes('seed') || q.includes('10 cr') || q.includes('financial') || q.includes('funds')) && item.id === 'fin-funds') score += 60;
    if ((q.includes('sip') || q.includes('organic') || q.includes('packaging')) && item.id === 'sip-packaging') score += 60;

    return { item, score };
  });

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
}
