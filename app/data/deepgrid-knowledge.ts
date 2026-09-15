// DeepGrid Grounded Knowledge Graph
// Compiled from deepgrid-sku-compendium, deepgrid-mature-silicon, deepgrid-architecture, and deepgrid-dg32-lite-ai

export interface DeepGridItem {
  id: string;
  name: string;
  category: 'sku' | 'ai' | 'strategy' | 'architecture' | 'defense' | 'loop' | 'finance';
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
  category: 'sku' | 'foundry' | 'moat' | 'architecture' | 'anchor' | 'governance' | 'ai';
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
  category: 'sku' | 'ai' | 'defense' | 'loop' | 'safety' | 'strategy' | 'architecture';
}

export const quickPrompts: QuickPrompt[] = [
  { id: 'sku-compare', label: 'DG32 vs STM32G0', query: 'Compare DG32 with STM32G0', category: 'sku' },
  { id: 'sku-roadmap', label: '3-Phase SKU Roadmap', query: 'What is the 3-phase node roadmap and arithmetic check?', category: 'strategy' },
  { id: 'd100-failsafe', label: 'D100 Failsafe Island', query: 'How does the D100 drone hardware failsafe island work?', category: 'sku' },
  { id: 'bel-display', label: 'SKU-8 BEL 17" Display', query: 'What is the PIL-5 mandate for the SKU-8 BEL display driver?', category: 'sku' },
  { id: 'radar-sige', label: 'SKU-7 SiGe 350GHz Radar', query: 'Why does SKU-7 use IHP SiGe 350GHz instead of pure CMOS?', category: 'sku' },
  { id: 'ai-envelope', label: 'AI Without Accelerator', query: 'How does DG32-LITE run AI without a hardware accelerator?', category: 'ai' },
  { id: 'usecases-30', label: '30 Edge AI Use Cases', query: 'What are the 30 industrial use cases supported on DG32-LITE?', category: 'ai' },
  { id: 'kurtosis-trap', label: 'Kurtosis vs RMS Trap', query: 'Why is kurtosis non-monotonic and why can you not alarm on it alone?', category: 'ai' },
  { id: 'goertzel-fft', label: 'Goertzel vs 8MB FFT', query: 'Why does broken rotor bar detection use Goertzel instead of FFT?', category: 'ai' },
  { id: 'cwru-leakage', label: 'CWRU Benchmark Audit', query: 'What did the audit reveal about CWRU bearing dataset leakage?', category: 'ai' },
  { id: 'shuttle-198', label: '198-Day Silicon Loop', query: 'How does the 198-day shuttle loop work?', category: 'loop' },
  { id: 'lockstep-safety', label: 'Lockstep 2-Cycle Skew', query: 'How does the 2-cycle lockstep core prevent bridge burn?', category: 'safety' },
  { id: 'three-factory', label: '3-Factory Sovereignty', query: 'What is the Three-Factory Sovereignty Roadmap?', category: 'strategy' },
  { id: 'd100-drone', label: 'D100 Drone SoC', query: 'Tell me about the D100 tactical drone SoC', category: 'sku' },
  { id: 'dap-2020', label: 'DAP-2020 Defense Moats', query: 'What are the DAP-2020 Make-II and Buy Indian IDDM requirements?', category: 'defense' },
  { id: 'radar-77ghz', label: 'SKU-7 77GHz Radar', query: 'What are the specs for SKU-7 77GHz SiGe Radar?', category: 'sku' },
  { id: 'bldc-sku1', label: 'SKU-1 BLDC Motor', query: 'What is SKU-1 BLDC motor controller rail and latency?', category: 'sku' },
  { id: 'dshot-bidir', label: 'Bidirectional DShot RX', query: 'Why is DShot receive and bidirectional telemetry implemented in hardware rather than firmware?', category: 'architecture' },
  { id: 'sram-floorplan', label: '28KB vs 32KB SRAM Floorplan', query: 'What is the 28 KB vs 32 KB SRAM floorplan lever for 2DOM?', category: 'architecture' },
  { id: 'gcr-erpm', label: 'GCR 4b→5b eRPM Reply', query: 'How does the hardware telemetry reply engine encode eRPM period and handle early abort?', category: 'architecture' },
  { id: 'sip-packaging', label: 'Organic SiP Packaging', query: 'Why organic substrate instead of silicon interposers?', category: 'safety' },
  { id: 'munger-audit', label: 'Charlie Munger Audit', query: 'What are the 14 risks and Stop Rules S1-S4?', category: 'strategy' },
  { id: 'funds-10cr', label: '₹10 Cr Financial Model', query: 'How is the ₹10 Cr seed capital allocated across fabs and ATE?', category: 'strategy' }
];

export const deepGridCatalog: DeepGridItem[] = [
  // --- Edge AI & Predictive Maintenance (Thirty Use Cases, No Accelerator) ---
  {
    id: 'dg32-ai-envelope',
    name: 'DG32-LITE AI Compute Envelope (No Accelerator)',
    category: 'ai',
    tagline: 'Physical execution envelope for lightweight edge AI on a 50 MHz RV32IM scalar core',
    nodeFoundry: '130 nm CMOS · 50 MHz Clock Domain',
    voltageRail: '1.8V Core / 3.3V I/O',
    standards: 'AEC-Q100 Grade 1 Target · ISO 26262 ASIL-D Advisory Role',
    summary: 'DG32-LITE executes machine learning tasks without an attention engine using a proven scalar hierarchy: 12.5 MMAC/s throughput, 16.5 KB model budget, 82% free CPU cycles, and CORDIC hardware math.',
    keyFacts: [
      '12.5 MMAC/s scalar throughput back-solved from 50 MHz RV32IM core at 4 cycles per int8 multiply-accumulate.',
      '16.5 KB SRAM budget for model weights plus working state (expands to 29.5 KB with runtime in mask ROM).',
      'At 10 kHz FOC current loop rate, dedicated hardware blocks use only ~300 cycles (~6 µs), leaving 82% of core cycles free for diagnostics.',
      'Algorithms suited for a scalar core (Random Forest, LDA, Mahalanobis) are 30–300× cheaper than a transformer at identical accuracy.',
      '24 of 30 industrial use cases run comfortably above 1 kHz sample rates.'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator (Sept 2026) — Slide 01 & 03',
    actions: [
      { label: 'Explore Architecture', target: 'architecture?chip=lite' },
      { label: 'Control Loop Budget', target: 'control' }
    ],
    connectedNodeIds: ['dg32-lite', 'dg32-30-usecases', 'arch-lockstep', 'dg32-tree-ensembles']
  },
  {
    id: 'dg32-30-usecases',
    name: 'Thirty Industrial Use Cases on Scalar Core',
    category: 'ai',
    tagline: 'Comprehensive catalogue of 30 predictive diagnostics and control tasks running on DG32-LITE',
    nodeFoundry: '130 nm CMOS · Single 50 MHz Core',
    voltageRail: 'Integrated Motor Control Subsystem',
    standards: 'ISO 13373 (Vibration) · ISO 20816 (Severity) · ISO 20958 (MCSA)',
    summary: 'Four groups of industrial AI workloads that run natively on DG32-LITE without an attention engine, spanning rotating machinery, electrical motor current signature analysis, real-time control, and long-term degradation.',
    keyFacts: [
      'Group 1: Rotating Machinery (8 tasks) — Bearing fault classification (890 Hz), severity trending, gearbox mesh faults, cavitation, unbalance, valve flutter, belt slip, looseness.',
      'Group 2: Electrical & Power (8 tasks) — Broken rotor bars (Goertzel), air-gap eccentricity, stator inter-turn shorts, phase loss, arc-fault discharge, power quality, battery SoH, thermal estimation.',
      'Group 3: Control, Motion & Sensing (8 tasks) — Sensorless EKF position (0.05 ms), learned sensor plausibility (0.02 ms), regime classification, duty tracking, friction feedforward, stall detection, torque ripple.',
      'Group 4: Slower-Rate & Sequence (6 tasks) — Remaining useful life regression, autoencoder drift detection, GRU forecasting (270 Hz), 1D-CNN raw waveform (79 Hz), isolation forest novelty, k-NN baselining.',
      'Absolute worst-case execution across all 30 use cases is 10.3 ms and 20 KB.'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator — Slides 05–10',
    actions: [
      { label: 'Control Loop Headroom', target: 'control' },
      { label: 'Product Family Comparison', target: 'family' }
    ],
    connectedNodeIds: ['dg32-ai-envelope', 'dg32-tree-ensembles', 'dg32-dsp-pipeline', 'dg32-benchmark-audit', 'dg32-2dom']
  },
  {
    id: 'dg32-tree-ensembles',
    name: 'Tree Ensembles & The 19-Model Hierarchy',
    category: 'ai',
    tagline: 'Why zero-multiply decision trees and linear models outperform deep neural networks on microcontrollers',
    nodeFoundry: 'Scalar Core Instruction Optimization',
    voltageRail: 'Pure Integer ALU Execution',
    standards: 'Deterministic Cycle Bounds · Zero-Divide Instruction Sets',
    summary: 'On a scalar CPU without a MAC array, comparisons and table lookups cost almost nothing. A 100-tree random forest at depth 8 requires roughly 800 comparisons and zero multiplications, running in 0.06 ms at >1 kHz.',
    keyFacts: [
      'Random Forest (100×d8): 3,200 cycles, 0.06 ms, 20 KB RAM, runs >1 kHz. 50–500× cheaper than an equivalent neural net.',
      'On CWRU bearing benchmark, Random Forest over 5 time-domain features reaches 95.6% accuracy (cutting from 9 to 5 features costs only 0.1%).',
      'Meta-review of 42 academic papers showed SVM/RF (95–100%) statistically indistinguishable from deep learning (97–100%).',
      'Hierarchy rule: 1st Tree Ensembles/LDA/Mahalanobis (sub-ms, >1 kHz) → 2nd Small MLPs/Autoencoders → Last GRU (2.95 ms) / 1D-CNN (10.2 ms).',
      'Design rule: Spend effort on band selection and envelope demodulation before spending it on model capacity.'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator — Slides 04–05',
    connectedNodeIds: ['dg32-30-usecases', 'dg32-ai-envelope', 'dg32-benchmark-audit']
  },
  {
    id: 'dg32-dsp-pipeline',
    name: 'Feature Extraction & CORDIC Demodulation',
    category: 'ai',
    tagline: 'Costed signal-processing front-end: envelope demodulation, Goertzel filters, and kurtosis rules',
    nodeFoundry: 'Hardware CORDIC Unit + RV32IM Core',
    voltageRail: 'DSP Math Acceleration',
    standards: 'ISO 20816 Severity Zones · ISO 13373-1 Procedures',
    summary: 'The diagnostic front-end reuses CORDIC hardware already present for motor control (Park/Clarke/magnitude/atan2 in <20 cycles). Demodulated features evaluated at known physical fault frequencies outrank raw moments by 4–5×.',
    keyFacts: [
      'Envelope Demodulation: 5,000 cycles (0.10 ms) using CORDIC magnitude (20 iterations) — the bearing defect front end.',
      'Goertzel Filter (8 bins): 6,144 cycles (0.12 ms) — computes discrete narrowband tones at exact fault frequencies, replacing 8 MB FFTs.',
      'Feature Importance: Hilbert-Huang amplitude at outer-race frequency scored 225.9 vs. 51.8 for raw peak-to-peak.',
      'Kurtosis Trap Warning: Kurtosis is non-monotonic (spikes on incipient spalls, then falls back to Gaussian 3.0 as damage spreads). RMS velocity is monotonic but blind to early faults. Trend both; never alarm on kurtosis alone.',
      'Decimate before buffering: Decimating to 1–2 kS/s keeps the entire working buffer under a few kilobytes.'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator — Slide 06',
    connectedNodeIds: ['dg32-30-usecases', 'dg32-afe-sensing', 'dg32-lite']
  },
  {
    id: 'dg32-afe-sensing',
    name: 'AFE Sensing Constraints & ISO Standards',
    category: 'ai',
    tagline: 'Why the analog front end, not compute or RAM, is the true binding constraint in motor diagnostics',
    nodeFoundry: 'Analog Front End (AFE) Signal Conditioning',
    voltageRail: 'ADC Dynamic Range & Bandwidth Limits',
    standards: 'ISO 13373-2:2016 · ISO 20958:2013 · ISO 13373-1:2002',
    summary: 'ISO 13373-2 defines usable dynamic range as D = 6(N-1) dB. For an 8-bit ADC, dynamic range is only 42 dB, while broken rotor bar sidebands sit -40 to -60 dBc below the fundamental, disappearing under the quantization floor.',
    keyFacts: [
      'Current-based MCSA diagnostics need more than 8 bits: requires either active analog fundamental notch filtering or 12–16 bit converters.',
      'Sideband separation is 2·s·f1 (0.5 to 3 Hz). A direct 2^20-point FFT requires 8 MB RAM. DG32-LITE solves this by evaluating Goertzel filters at predicted sideband frequencies.',
      'Tier 1 Sensor: Single accelerometer (≥5 kHz flat bandwidth, stud mounted per ISO 13373-1). Bearings account for 44% of motor failures.',
      'Tier 2 Sensor: 3-phase current and voltage for negative-sequence detection and Park vector signature per ISO 20958 Annex A.',
      'What works today on DG32-LITE: vibration classification, sensorless EKF, plausibility, regime identification, and anomaly scoring operate on standard peripherals.'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator — Slide 11',
    connectedNodeIds: ['dg32-dsp-pipeline', 'dg32-30-usecases', 'sku-1']
  },
  {
    id: 'dg32-benchmark-audit',
    name: 'CWRU Benchmark Audit & Advisory ML Boundary',
    category: 'ai',
    tagline: 'Academic data leakage audit and the strict advisory role of machine learning under hardware lockstep',
    nodeFoundry: 'Deterministic Safety Isolation Boundary',
    voltageRail: 'Hardware Interlock Dominance',
    standards: 'ISO 26262 ASIL-D Trip Limit Retention · Independent Hardware Monitor',
    summary: 'A critical audit of academic bearing benchmarks reveals widespread data leakage: 40 of 41 published CWRU studies used leaky splits. Furthermore, ML inference on DG32-LITE operates in an advisory role only, subservient to the lockstep safety core.',
    keyFacts: [
      '40 of 41 reviewed CWRU studies used splits vulnerable to data leakage; on a leakage-free bearing-wise split, classifier accuracy dropped from 85.8% to 69.5%.',
      'Realistic production accuracy on unseen physical industrial bearings is 65%–80%, not 99%.',
      'Smith & Randall showed a meaningful fraction of CWRU records are not diagnosable by correct physics due to load slip and speed fluctuations.',
      'No inference result carries a safety integrity claim: the ML classifier advises; the dual-core lockstep monitor holds the absolute hardwired trip limits.',
      'Pre-silicon notice: All figures calculated from verified constants (4 cycles/int8 MAC, 82% headroom at 50 MHz).'
    ],
    citation: 'DG32-LITE Base Variant: Thirty Use Cases, No Accelerator — Slide 12',
    connectedNodeIds: ['dg32-30-usecases', 'dg32-lite', 'arch-lockstep', 'munger-audit']
  },

  // --- Core SKUs & Platform Silicon ---
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
    connectedNodeIds: ['arch-lockstep', 'fab-skywater', 'arch-198loop', 'sku-1', 'dg32-ai-envelope']
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
    connectedNodeIds: ['dg32-lite', 'arch-lockstep', 'fab-skywater', 'dg32-30-usecases']
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
    connectedNodeIds: ['track-b-d100', 'dg-sdv-platform', 'sku-9', 'sku-node-roadmap']
  },
  {
    id: 'sku-node-roadmap',
    name: '3-Phase Node Roadmap & Arithmetic Check',
    category: 'strategy',
    tagline: 'Technology scaling roadmap from 130/180nm to 28nm with honest ~50-SKU self-audit',
    nodeFoundry: '130/180nm (Phase 1) → 90/55/45nm (Phase 2) → 28nm (Phase 3)',
    voltageRail: 'Mature I/O Anchor + Logic Shrinks',
    standards: 'DPSU & Investor Diligence Canon · Tata Dholera / SCL Alignment',
    summary: 'DeepGrid’s 3-phase roadmap ships the foundational catalogue on 130/180nm, shrinks logic-bound parts (GNSS baseband, SDR) to 90/55/45nm for channel count, and introduces 28nm for compute in 2030, self-correcting early drafts to a disciplined ~50-SKU Year 5 catalogue.',
    keyFacts: [
      'Phase 1 (2026–2027, 130/180nm): Ships the 9-SKU core catalogue (motors, PMICs, smart meters, transceivers, supervisors).',
      'Phase 2 (2028–2029, 90/55/45nm): Shrink for channel count and DSP throughput (GNSS baseband, SDR), NOT speed vanity. Analog I/O rings stay 130nm.',
      'Phase 3 (2030+, 28nm and below): Multi-TOPS AI NPUs and central compute. "Everything above is a sub-10 nm problem. 28 nm buys some of it. None of it is claimable on 130 nm, at any clock."',
      'The Arithmetic Check: Self-audits early drafts claiming 1,000 SKUs by Year 5 down to an honest, disciplined ~50-SKU catalogue (10 SKUs/yr × 5 yrs).',
      'Matches India domestic manufacturing timeline: SCL 180nm today and Tata Electronics 28nm fab in Dholera.'
    ],
    citation: 'DeepGrid Semi SKU Compendium — Chapter 14: Node & SKU Roadmap (Sheet 14)',
    actions: [
      { label: 'Explore Roadmap', target: 'roadmap' },
      { label: 'View Product Family', target: 'family' }
    ],
    connectedNodeIds: ['sip-packaging', 'three-factory', 'track-b-d100', 'dg-sdv-platform']
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
  },
  {
    id: 'dshot-bidir-rx',
    name: 'Hardware DShot RX & Bidirectional Telemetry (dgrid_dshot_rx)',
    category: 'architecture',
    tagline: 'Hardware DShot receiver + bidirectional telemetry reply engine (slot 0xC in-place extension)',
    nodeFoundry: 'Slot 0xC · 50 MHz AXI-Lite Peripheral Extension',
    voltageRail: '1.8V Core / 3.3V Pad-Ring (PC_BIDIR)',
    standards: 'Betaflight / Bluejay / AM32 Inverted GCR Protocol · ISO 26262 ASIL-D Safe',
    summary: 'Extends slot 0xC in-place with dgrid_dshot_rx and dgrid_dshot_tel, enabling DG32 to operate as a high-performance ESC. Replaces impossible firmware bit-banging that violently collides with the 5 µs FOC loop and eliminates false lockstep divergence trips.',
    keyFacts: [
      'Why hardware is mandatory: DShot600 polling in firmware requires ~1,340 cycles with interrupts off — 5.3× longer than the entire 5 µs (250 cycle) FOC control period.',
      'Lockstep safety: Firmware branching on asynchronous pad reads produces branch-timing jitter between MAIN and CHECKER cores, falsely tripping the 2-cycle lockstep comparator (FAULTn). Hardware decoding eliminates this completely.',
      'GCR 4b→5b & transition encoding: Hardware automatically calculates inverted CRC4, maps the 12-bit eRPM period payload {e[2:0], m[8:0]} to 20 GCR bits, and creates 21 level transitions transmitted inverted at 5/4 bit rate (750 kbit/s @ 50 MHz).',
      'Pad-ring reuse & shoot-through safety: Reuses 4 PWM high-side pads io[26, 28, 30, 32] as PC_BIDIR (gpio_dm=110, dynamic oeb). Low-side pads io[27, 29, 31] remain untouched PC_OUT, strictly preventing power bridge shoot-through.',
      'Early abort & W1C invariance: If an incoming FC edge arrives while driving a reply, OE releases within 1 cycle (TEL_ABORT). All status flags use Write-1-to-Clear (W1C) to preserve 2-cycle lockstep bus mirror safety.'
    ],
    citation: 'DG32 Block Spec for Review — dgrid_dshot_rx: DShot receive + bidirectional telemetry reply (13 Sep 2026)',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'Control Loop Timing', target: 'control' }
    ],
    connectedNodeIds: ['dg32-lite', 'arch-lockstep', 'sku-1', 'sram-floorplan-lever']
  },
  {
    id: 'sram-floorplan-lever',
    name: 'SRAM Architecture: 28 KB vs 32 KB Floorplan Lever',
    category: 'architecture',
    tagline: 'OpenFrame 2,900 µm wrapper geometric floorplan trade-off: 3×6 vs 3×7 SRAM macro array',
    nodeFoundry: 'SkyWater SKY130 OpenFrame Wrapper (2,900 µm Slot)',
    voltageRail: '1.8V SRAM Core Domain',
    standards: 'OpenFrame Place-and-Route · 50 MHz Timing Closure',
    summary: 'Separates the firmware memory footprint question from the physical floorplan question. Moving from 16 to 14 macros in dual-domain 2DOM reduces the grid from 3×7 to 3×6, deleting an entire macro row and expanding the full-width logic strip from 1.75 mm² to 3.40 mm².',
    keyFacts: [
      'Firmware footprint: 28 KB is bare minimum, 32 KB provides safety margin; reusable buffer optimization recovers 2 KB.',
      'Floorplan reality: 17 macros in a 3×7 array compresses the central logic strip to 1.75 mm², causing severe routing congestion and timing closure failure.',
      'Area doubling: Deleting one macro row (3×6 array) grows the full-width logic strip from 1.75 mm² to 3.40 mm², enabling dual-domain 2DOM to fit the 2,900 µm wrapper slot.',
      'Empirical resolution: The codex branch runs automated tests on keep-32 KB (2dom/13) and 24 KB (2dom/12) configurations to decide strictly with physical routing data.',
      'Base die invariance: DG32-LITE base variant does not have dual-domain congestion and remains permanently at 32 KB SRAM.'
    ],
    citation: 'DG32 Block Spec for Review — §9: SRAM: 28 KB vs 32 KB — separating the two questions',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'View Roadmap', target: 'roadmap' }
    ],
    connectedNodeIds: ['dg32-2dom', 'dg32-lite', 'arch-198loop', 'dshot-bidir-rx']
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
  { id: 'sku-node-roadmap', name: '3-Phase Roadmap', shortName: 'Roadmap', category: 'sku', x: 26, y: 16, description: '130nm -> 90/55nm -> 28nm scaling roadmap with ~50-SKU arithmetic check.' },

  // Edge AI Nodes (New Grounded Cluster)
  { id: 'dg32-ai-envelope', name: '12.5 MMAC/s Budget', shortName: '12.5 MMAC', category: 'ai', x: 26, y: 44, description: 'Scalar AI envelope: 12.5 MMAC/s, 16.5 KB RAM, 82% free CPU cycles.' },
  { id: 'dg32-30-usecases', name: '30 Industrial Use Cases', shortName: '30 AI Tasks', category: 'ai', x: 18, y: 42, description: '30 native predictive maintenance and control use cases without accelerator.' },
  { id: 'dg32-tree-ensembles', name: 'Tree Ensembles & Models', shortName: 'Tree ML', category: 'ai', x: 8, y: 38, description: 'Zero-multiply tree models (RF 100xd8 in 0.06ms) and 19 lightweight architectures.' },
  { id: 'dg32-dsp-pipeline', name: 'CORDIC Envelope & Goertzel', shortName: 'CORDIC DSP', category: 'ai', x: 14, y: 48, description: 'Hardware CORDIC envelope demodulation & targeted Goertzel filters.' },
  { id: 'dg32-afe-sensing', name: 'AFE Dynamic Range', shortName: 'ISO Sensing', category: 'ai', x: 30, y: 55, description: 'ISO 13373-2 >8-bit dynamic range & ISO 13373-1 stud accelerometer mounting.' },
  { id: 'dg32-benchmark-audit', name: 'CWRU Data Leakage Audit', shortName: 'CWRU Audit', category: 'ai', x: 8, y: 48, description: 'Audit of 41 CWRU papers; strict advisory role under lockstep supervisor.' },

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
  { id: 'dshot-bidir-rx', name: 'DShot RX & Telemetry', shortName: 'DShot RX', category: 'architecture', x: 35, y: 38, description: 'Slot 0xC hardware DShot receiver and bidirectional GCR telemetry reply engine.' },
  { id: 'sram-floorplan-lever', name: 'SRAM Floorplan Lever', shortName: 'SRAM Lever', category: 'architecture', x: 22, y: 24, description: '28 KB vs 32 KB macro placement lever doubling logic strip from 1.75 to 3.40 mm².' },

  // Anchor Customers
  { id: 'anchor-mceme', name: 'MCEME Army', shortName: 'MCEME', category: 'anchor', x: 12, y: 75, description: 'Indian Army MCEME: ₹1.01 Cr contracted pre-ASIC validation.' },
  { id: 'anchor-airgap', name: 'Airgap EV', shortName: 'Airgap', category: 'anchor', x: 10, y: 32, description: 'Commercial anchor for 15M units/year BLDC motor silicon.' },
  { id: 'anchor-ripple', name: 'Ripple Metering', shortName: 'Ripple', category: 'anchor', x: 48, y: 88, description: 'National rollout partner for 250M smart meter front-ends.' },
  { id: 'anchor-bel', name: 'BEL Avionics', shortName: 'BEL', category: 'anchor', x: 8, y: 62, description: 'Bharat Electronics Limited 17" cockpit tactical display program.' },

  // Governance & Finance
  { id: 'fin-seed', name: '₹10 Cr Model', shortName: '₹10 Cr', category: 'governance', x: 62, y: 46, description: 'Seed allocation for 6 MPW runs, ATE lines, and FY31 revenue.' },
  { id: 'fin-munger', name: 'Charlie Munger Audit', shortName: 'Munger Audit', category: 'governance', x: 74, y: 38, description: '14-Point Risk Matrix and non-negotiable Stop Rules S1-S4.' }
];

export const graphEdges: GraphEdge[] = [
  // Edge AI Connections
  { from: 'dg32-lite', to: 'dg32-ai-envelope', label: '12.5 MMAC/s Budget' },
  { from: 'dg32-ai-envelope', to: 'dg32-30-usecases', label: '30 Native Tasks' },
  { from: 'dg32-30-usecases', to: 'dg32-tree-ensembles', label: 'Zero-Multiply Trees' },
  { from: 'dg32-30-usecases', to: 'dg32-dsp-pipeline', label: 'CORDIC Demodulation' },
  { from: 'dg32-dsp-pipeline', to: 'dg32-afe-sensing', label: 'ISO 13373 Dynamic Range' },
  { from: 'dg32-30-usecases', to: 'dg32-benchmark-audit', label: 'Leakage-Free Validation' },
  { from: 'dg32-30-usecases', to: 'dg32-2dom', label: 'Scalar -> Attention Engine' },

  // DG32 & DShot Connections
  { from: 'dg32-lite', to: 'arch-lockstep', label: 'Safety Core' },
  { from: 'dg32-lite', to: 'fab-skywater', label: 'Primary Shuttle' },
  { from: 'dg32-lite', to: 'arch-198loop', label: 'Sep 2026 Shuttle' },
  { from: 'dg32-lite', to: 'dshot-bidir-rx', label: 'Slot 0xC Extension' },
  { from: 'dshot-bidir-rx', to: 'arch-lockstep', label: 'W1C Invariant' },
  { from: 'dshot-bidir-rx', to: 'sku-1', label: 'ESC Comms' },
  { from: 'dg32-2dom', to: 'sram-floorplan-lever', label: 'Floorplan Congestion' },
  { from: 'sram-floorplan-lever', to: 'arch-198loop', label: '2dom/12 vs 2dom/13' },
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
  { from: 'sku-node-roadmap', to: 'track-b-d100', label: 'Phase 2 Drone Shrink' },
  { from: 'sku-node-roadmap', to: 'dg-sdv-platform', label: 'Phase 3 Compute' },
  { from: 'sku-node-roadmap', to: 'arch-sip', label: 'Heterogeneous SiP' },
  { from: 'sku-node-roadmap', to: 'fab-skywater', label: 'Phase 1 130/180nm' },

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
    if ((q.includes('use case') || q.includes('30') || q.includes('accelerator')) && item.id === 'dg32-30-usecases') score += 70;
    if ((q.includes('envelope') || q.includes('mmac') || q.includes('scalar ai')) && item.id === 'dg32-ai-envelope') score += 70;
    if ((q.includes('tree') || q.includes('forest') || q.includes('boosting') || q.includes('19 model')) && item.id === 'dg32-tree-ensembles') score += 70;
    if ((q.includes('dsp') || q.includes('kurtosis') || q.includes('goertzel') || q.includes('envelope demod')) && item.id === 'dg32-dsp-pipeline') score += 70;
    if ((q.includes('afe') || q.includes('iso 13373') || q.includes('iso 20958') || q.includes('dynamic range')) && item.id === 'dg32-afe-sensing') score += 70;
    if ((q.includes('cwru') || q.includes('leakage') || q.includes('advisory')) && item.id === 'dg32-benchmark-audit') score += 70;

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
    if ((q.includes('roadmap') || q.includes('50-sku') || q.includes('arithmetic') || q.includes('phase 2') || q.includes('phase 3')) && item.id === 'sku-node-roadmap') score += 70;
    if ((q.includes('bel') || q.includes('display') || q.includes('sxga') || q.includes('tcon')) && item.id === 'sku-8') score += 60;
    if (q.includes('failsafe') && item.id === 'track-b-d100') score += 60;
    if ((q.includes('dshot') || q.includes('erpm') || q.includes('gcr') || q.includes('telemetry') || q.includes('bidirectional') || q.includes('esc') || q.includes('slot 0xc')) && item.id === 'dshot-bidir-rx') score += 80;
    if ((q.includes('sram') || q.includes('floorplan') || q.includes('28kb') || q.includes('32kb') || q.includes('macro') || q.includes('2dom/13') || q.includes('2dom/12') || q.includes('ayaz')) && item.id === 'sram-floorplan-lever') score += 80;

    return { item, score };
  });

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
}
