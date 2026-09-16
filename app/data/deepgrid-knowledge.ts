// DeepGrid Grounded Knowledge Graph
// Compiled from deepgrid-sku-compendium, deepgrid-mature-silicon, deepgrid-architecture, and deepgrid-dg32-lite-ai

export interface DeepGridItem {
  id: string;
  name: string;
  category: 'sku' | 'ai' | 'strategy' | 'architecture' | 'defense' | 'loop' | 'finance';
  tagline: string;
  docId?: 'doc1' | 'doc2' | 'doc3' | 'doc4' | 'doc5' | 'doc6' | 'doc-d100' | 'doc-sdv';
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

export interface DocumentSource {
  id: 'all' | 'doc1' | 'doc2' | 'doc3' | 'doc4' | 'doc5' | 'doc6';
  badge: string;
  title: string;
  subtitle: string;
  fileReference: string;
}

export const documentSources: DocumentSource[] = [
  {
    id: 'all',
    badge: 'ALL DOCS',
    title: 'All Grounded Documents',
    subtitle: 'Cross-document intelligence spanning all 6 DeepGrid engineering deliverables',
    fileReference: 'Full Grounded Vector Catalog (50 Nodes, 70 Edges, 39 Cards)'
  },
  {
    id: 'doc1',
    badge: 'Doc #1',
    title: 'Thirty Use Cases (No Accelerator)',
    subtitle: '50 MHz RV32IM edge AI compute envelope, 19 model types, DSP pipelines, and CWRU data audit',
    fileReference: 'deepgrid-dg32-lite-ai · 30-Use-Cases-No-Accelerator.pdf'
  },
  {
    id: 'doc2',
    badge: 'Doc #2',
    title: 'Technical Annex v3 (10 SKUs & SDV)',
    subtitle: '10-chip SKU compendium, D100 tactical drone SoC, DG SDV reference architecture, 3-phase roadmap',
    fileReference: 'deepgrid-sku-compendium · Technical-Annex-v3.pdf'
  },
  {
    id: 'doc3',
    badge: 'Doc #3',
    title: 'dgrid_dshot_rx RTL Specification',
    subtitle: 'Hardware DShot receive, bidirectional GCR 4b→5b eRPM telemetry reply, 28KB vs 32KB SRAM floorplan lever',
    fileReference: 'deepgrid-dshot-bidir · dgrid_dshot_rx.pdf'
  },
  {
    id: 'doc4',
    badge: 'Doc #4',
    title: 'DG32-2DOM Dual-Domain Architecture',
    subtitle: 'Dual 50/114 MHz clocks, 4-phase CDC bridges, INT8 attention engine, AVIP bearing fault diagnostics',
    fileReference: 'deepgrid-dg32-2dom · DG32-2DOM-Architecture.pdf'
  },
  {
    id: 'doc5',
    badge: 'Doc #5',
    title: 'Master Whitepaper v3 (Defence Silicon)',
    subtitle: '$9B mature import funnel, 10x NRE dismantling, "Boxes, Not Chips" statutory moats, Chinese crash stress test',
    fileReference: 'deepgrid-mature-silicon · Master-Whitepaper-v3.pdf'
  },
  {
    id: 'doc6',
    badge: 'Doc #6',
    title: 'Preliminary Datasheets (QFN-64)',
    subtitle: '64-pin QFN pinout, 100% LITE/2DOM compatibility, strict power supply sequencing, 64 KB standalone boot ROM',
    fileReference: 'deepgrid-datasheet-qfn64 · DG32-LITE-and-2DOM-Datasheets.pdf'
  }
];

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'sku' | 'ai' | 'defense' | 'loop' | 'safety' | 'strategy' | 'architecture';
  docId: 'doc1' | 'doc2' | 'doc3' | 'doc4' | 'doc5' | 'doc6';
  docBadge: string;
  docName: string;
}

export const quickPrompts: QuickPrompt[] = [
  // --- Document #1: Thirty Use Cases (No Accelerator) ---
  { id: 'ai-envelope', label: 'AI Without Accelerator', query: 'How does DG32-LITE run AI without a hardware accelerator?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },
  { id: 'usecases-30', label: '30 Edge AI Use Cases', query: 'What are the 30 industrial use cases supported on DG32-LITE?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },
  { id: 'kurtosis-trap', label: 'Kurtosis vs RMS Trap', query: 'Why is kurtosis non-monotonic and why can you not alarm on it alone?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },
  { id: 'goertzel-fft', label: 'Goertzel vs 8MB FFT', query: 'Why does broken rotor bar detection use Goertzel instead of FFT?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },
  { id: 'cwru-leakage', label: 'CWRU Benchmark Audit', query: 'What did the audit reveal about CWRU bearing dataset leakage?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },
  { id: 'dsp-pipeline', label: 'DSP Feature Pipeline', query: 'How does the fixed-point DSP pipeline extract Kurtosis and FFT features in <100 µs?', category: 'ai', docId: 'doc1', docBadge: 'Doc #1', docName: 'Thirty Use Cases' },

  // --- Document #2: Technical Annex v3 (10 SKUs & Roadmap) ---
  { id: 'sku-compare', label: 'DG32 vs STM32G0', query: 'Compare DG32 with STM32G0 in pinout, cost, and latency', category: 'sku', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'sku-roadmap', label: '3-Phase SKU Roadmap', query: 'What is the 3-phase node roadmap and arithmetic check?', category: 'strategy', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'd100-failsafe', label: 'D100 Failsafe Island', query: 'How does the D100 drone hardware failsafe island work?', category: 'sku', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'bel-display', label: 'SKU-8 BEL 17" Display', query: 'What is the PIL-5 mandate for the SKU-8 BEL display driver?', category: 'sku', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'radar-sige', label: 'SKU-7 SiGe 350GHz Radar', query: 'Why does SKU-7 use IHP SiGe 350GHz instead of pure CMOS?', category: 'sku', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'sip-packaging', label: 'Organic SiP Packaging', query: 'Why organic substrate instead of silicon interposers?', category: 'safety', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },
  { id: 'sdv-zonal', label: 'DG SDV Reference Zonal', query: 'How does the DG SDV architecture eliminate wire harnesses via zonal controllers?', category: 'architecture', docId: 'doc2', docBadge: 'Doc #2', docName: 'Technical Annex v3' },

  // --- Document #3: dgrid_dshot_rx RTL Specification ---
  { id: 'dshot-bidir', label: 'Hardware DShot RX RTL', query: 'Why is DShot receive and bidirectional telemetry implemented in hardware rather than firmware?', category: 'architecture', docId: 'doc3', docBadge: 'Doc #3', docName: 'dgrid_dshot_rx' },
  { id: 'gcr-erpm', label: 'GCR 4b→5b eRPM Reply', query: 'How does the hardware telemetry reply engine encode eRPM period and handle early abort?', category: 'architecture', docId: 'doc3', docBadge: 'Doc #3', docName: 'dgrid_dshot_rx' },
  { id: 'sram-floorplan', label: '28KB vs 32KB SRAM Lever', query: 'What is the 28 KB vs 32 KB SRAM floorplan lever for 2DOM?', category: 'architecture', docId: 'doc3', docBadge: 'Doc #3', docName: 'dgrid_dshot_rx' },
  { id: 'pad-ring-reuse', label: 'Pad-Ring Bidirectional Reuse', query: 'How does dgrid_dshot_rx reuse the bidirectional pad ring without external analog switches?', category: 'architecture', docId: 'doc3', docBadge: 'Doc #3', docName: 'dgrid_dshot_rx' },

  // --- Document #4: DG32-2DOM System Architecture ---
  { id: 'dg32-2dom-clock', label: 'DG32-2DOM Dual Clock & CDC', query: 'How do the 50 MHz core and 114 MHz attention clock domains communicate via CDC bridges?', category: 'architecture', docId: 'doc4', docBadge: 'Doc #4', docName: 'DG32-2DOM System' },
  { id: 'int8-attn-math', label: 'INT8 Attention Math (40-bit)', query: 'Why does the INT8 attention engine require a 40-bit numerator and u15 EXP instead of INT4?', category: 'ai', docId: 'doc4', docBadge: 'Doc #4', docName: 'DG32-2DOM System' },
  { id: 'avip-csa', label: 'AVIP Bearing Fault CSA', query: 'How does AVIP detect bearing faults from stator current without an accelerometer?', category: 'ai', docId: 'doc4', docBadge: 'Doc #4', docName: 'DG32-2DOM System' },
  { id: 'foc-headroom', label: 'FOC Control Loop Budget', query: 'What are the cycle costs of an FOC current loop and how much CPU headroom remains at 10 kHz?', category: 'architecture', docId: 'doc4', docBadge: 'Doc #4', docName: 'DG32-2DOM System' },
  { id: 'sram-macros-2dom', label: '18 On-Die SRAM Macros (86%)', query: 'Why do the 18 sky130 SRAM macros consume 86% of the 2DOM die area?', category: 'architecture', docId: 'doc4', docBadge: 'Doc #4', docName: 'DG32-2DOM System' },

  // --- Document #5: Master Whitepaper v3 (India Defence Silicon) ---
  { id: 'funnel-10x', label: '$9B Funnel & 10x Cost', query: 'How does DeepGrid achieve a 10x cost reduction across the $9B import funnel?', category: 'strategy', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'boxes-not-chips', label: '"Boxes, Not Chips" Playbook', query: 'Why does DeepGrid target boxes and LRUs in PIL-5 rather than chips?', category: 'defense', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'crash-stop-rules', label: 'Chinese Crash & Stop Rules', query: 'What happens in the FY31 Chinese price crash stress test and what are Stop Rules S1-S4?', category: 'strategy', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'dgridriscv-spec', label: 'DGridRiscV Core Spec', query: 'What is the exact circuit-code architecture of the DGridRiscV RV32IM processor?', category: 'architecture', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'funds-10cr', label: '₹10 Cr Capital Waterfall', query: 'How is the ₹10 Cr seed capital allocated across fabs and ATE?', category: 'strategy', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'dap-2020', label: 'DAP-2020 Defense Moats', query: 'What are the DAP-2020 Make-II and Buy Indian IDDM requirements?', category: 'defense', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },
  { id: 'three-factory', label: '3-Factory Sovereignty', query: 'What is the Three-Factory Sovereignty Roadmap across SkyWater, IHP, and SCL?', category: 'strategy', docId: 'doc5', docBadge: 'Doc #5', docName: 'Master Whitepaper v3' },

  // --- Document #6: Preliminary Datasheets (DG32-LITE & 2DOM) ---
  { id: 'qfn64-pinout', label: '64-Pin QFN Pin Assignment', query: 'What is the complete 64-pin QFN pin assignment and packaging specification for DG32?', category: 'architecture', docId: 'doc6', docBadge: 'Doc #6', docName: 'QFN-64 Datasheet' },
  { id: 'power-pcb-rules', label: 'Power Supply Sequencing', query: 'What are the power supply sequencing rules and PCB layout constraints for DG32-LITE and 2DOM?', category: 'safety', docId: 'doc6', docBadge: 'Doc #6', docName: 'QFN-64 Datasheet' },
  { id: 'esd-biasing-rails', label: 'ESD Diode Rail Biasing', query: 'Why must unused power rails (vdda1/2, vccd2) be tied to nominal voltages on the carrier board?', category: 'safety', docId: 'doc6', docBadge: 'Doc #6', docName: 'QFN-64 Datasheet' },
  { id: 'boot-rom-flow', label: '64 KB Boot ROM & QSPI Fast Read', query: 'How does the standalone 64 KB boot ROM execute QSPI NOR flash boot without an external management core?', category: 'architecture', docId: 'doc6', docBadge: 'Doc #6', docName: 'QFN-64 Datasheet' },
  { id: 'pcb-diff-pairs', label: 'PCB High-Speed Routing', query: 'What are the PCB layout guidelines for high-speed differential pairs and grounding?', category: 'architecture', docId: 'doc6', docBadge: 'Doc #6', docName: 'QFN-64 Datasheet' }
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
    docId: 'doc5',
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
  },
  {
    id: 'dg32-2dom-system',
    name: 'DG32-2DOM Dual-Domain System Architecture (CI2612)',
    category: 'architecture',
    tagline: 'Dual-clock SoC architecture: 50 MHz lockstep flight-control core + 114 MHz attention engine',
    nodeFoundry: 'SkyWater sky130A · chipIgnite CI2612 (3400 × 4500 µm Die)',
    voltageRail: '1.8V Core / 3.3V I/O · 50 MHz clk_i & 114 MHz clk_fast_i',
    standards: 'AEC-Q100 Grade 1 Target · ISO 26262 ASIL-D Lockstep Flight Control',
    summary: 'The DG32-2DOM (A3) combines the hardened DG32-LITE motor-control core with an INT8 attention engine on a second clock, connected through 4-phase CDC level bridges on a 15.30 mm² die.',
    keyFacts: [
      'PMA Whitelist & 21 Slaves: Hardwired rule fault = !(addr[31] | addr[31:28]==0x1); unmapped accesses return SLVERR to prevent unrecoverable bus hangs.',
      'Frozen Flight-Control Core: Dual RV32IMC cores in lockstep with private 16 KB DMEM for checker; fetch port is private slave to 64 KB baked Boot ROM.',
      'Dual-Clock Isolation: 50 MHz core domain timing closure (54 MHz sign-off) is completely untouched by the 114 MHz attention engine.',
      'Physical Area Breakdown: 18 SRAM macros occupy 5.12 mm² (86% of placed area); total std-cell logic is only 0.751 mm² on a 15.30 mm² die.',
      'Hardware Offloading: CORDIC (53-58 cyc), SAR ADC (177 cyc), and PWM dead-time offload fetch-bound CPU, leaving 82-90% free headroom.'
    ],
    citation: 'DG32-2DOM System Architecture — Block Definition (chipIgnite CI2612, Sept 2026)',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'Control Loop Timing', target: 'control' }
    ],
    connectedNodeIds: ['dg32-lite', 'arch-lockstep', 'int8-attention-engine', 'foc-loop-budget']
  },
  {
    id: 'int8-attention-engine',
    name: 'Hardware INT8 Attention Engine & 40-Bit Numerator (dgrid_int8_attn)',
    category: 'ai',
    tagline: 'Hardware transformer attention engine with u15 softmax exponential and 40-bit accumulator',
    nodeFoundry: '114 MHz Fast Accelerator Domain (clk_fast_i)',
    voltageRail: '1.8V Core Logic · 4-Phase CDC Synchronizers',
    standards: 'Bit-Exact FP32 Match · Softmax Weight Retention',
    summary: 'Accelerates multi-head self-attention and cross-attention without stalling the CPU domain. Eliminates INT4 quantization collapse by maintaining weights in u15 all the way into a 40-bit signed numerator seat.',
    keyFacts: [
      'Why INT8 over INT4: With ~400 near-uniform keys, 1/400 softmax weight rounds to zero in INT4. INT8 keeps weights in u15 into a 40-bit numerator, preventing zero-collapse.',
      '40-Bit Signed Numerator: Standard int32 overflows at NK=512; 40 bits provides bit-exact precision against golden floating-point models up to NK=131,072.',
      '48-Step Restoring Divider: Evaluates per-row normalization reciprocal 1/Z in dedicated hardware.',
      'K/V On-Chip Buffer Residency: K and V buffers loaded once via DMA; re-read locally per row cuts bus traffic by 400× to ~1% bus occupancy.',
      'Analytic Cycle Cost: 3,242 cycles per query row at LANES=16, KD=32, DV=64, NK=400 on 114 MHz clock.'
    ],
    citation: 'DG32-2DOM System Architecture — Section 4.18: INT8 Attention Engine',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'View Roadmap', target: 'roadmap' }
    ],
    connectedNodeIds: ['dg32-2dom-system', 'avip-bearing-diagnostics', 'dg32-30-usecases']
  },
  {
    id: 'avip-bearing-diagnostics',
    name: 'AVIP Multimodal Classifier & Stator Current Signature Analysis (CSA)',
    category: 'ai',
    tagline: 'Zero-accelerometer bearing fault classifier running in 46.7 ms via on-die phase-current SAR ADC',
    nodeFoundry: 'PWM Ripple Null Current Sampling · 114 MHz Attention Inference',
    voltageRail: 'Differential Analog Input (1.8V vccd1)',
    standards: 'ISO 13373 Vibration Standards · MCSA Motor Diagnostics',
    summary: 'AVIP detects inner race, outer race, and ball bearing defects using Stator Current Signature Analysis (MCSA). Samples motor current at PWM ripple null to derive mechanical fault frequencies, eliminating external accelerometers.',
    keyFacts: [
      'Zero Accelerometer Mandate: Physical bearing defect modulates stator current at fe ± k*f_defect; phase-current SAR ADC at PWM ripple null captures the signature.',
      'Multimodal Model: Time-domain conv/GRU + FFT conv/GRU fused by 2 self-attention blocks and 1 cross-attention block.',
      'Inference Latency: Shipped CWRU model (47,076 params) executes in 46.7 ms on clk_fast_i at 94-95% held-out-load accuracy.',
      'Scale Invariance: Full AVIP (478,277 params) has 10× parameters but requires only 1.2× compute (54.5 ms) due to deeper, narrower low-resolution layers.',
      'Dual Output: Produces classical 9 KB fault score (runs on DG32-LITE without accelerator) + (35,20,20,2) INT8 tensor for 2DOM.'
    ],
    citation: 'DG32-2DOM System Architecture — Section 11: AVIP Bearing-Fault Detection',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'Inspect Full Citations', target: 'ask' }
    ],
    connectedNodeIds: ['int8-attention-engine', 'dg32-30-usecases', 'dg32-afe-sensing']
  },
  {
    id: 'foc-loop-budget',
    name: 'FOC Control-Loop Budget & Fetch-Bound Headroom',
    category: 'architecture',
    tagline: '~100 kHz closed-loop bandwidth: 300 cycles fixed hardware cost, >90% free CPU headroom at 10 kHz',
    nodeFoundry: '50 MHz Core Domain · Hardware Offload Architecture',
    voltageRail: '1.8V Core / 3.3V I/O',
    standards: 'Deterministic FOC Timing · 39-Cycle Fault Latch Latency',
    summary: 'Accounts for every clock cycle in the field-oriented control loop. Offloads ADC sampling (177 cyc) and Park/Clarke transforms (53-58 cyc) to hardware blocks, reserving >90% of execution cycles for firmware observers.',
    keyFacts: [
      'Fetch-Bound Core: VexiiRiscv fetches from SRAM at ~8 cycles/instruction; plain-C int8 MAC takes 54 cycles vs 6 with I-cache.',
      'Fixed Hardware Overhead: ADC sampling (177 cyc) + 2× CORDIC (106 cyc) + PWM write = ~300 cycles (~6 µs).',
      '10 kHz Headroom: Out of 5,000 cycles, ~4,700 cycles are free for speed loops, field weakening, and Luenberger/EKF state observers.',
      'Total Loop Bandwidth: ~5 µs acquisition + ~5 µs compute achieves a ~100 kHz closed-loop control rate.',
      'Measured Block Fmax: Lockstep core achieves 55-62 MHz; peripherals harden at >167 MHz (GPIO, DShot, PWM).'
    ],
    citation: 'DG32-2DOM System Architecture — Section 5: Performance and Control-Loop Budget',
    actions: [
      { label: 'Control Loop Timing', target: 'control' },
      { label: 'Explore Architecture', target: 'architecture' }
    ],
    connectedNodeIds: ['dg32-lite', 'dg32-2dom-system', 'dshot-bidir-rx', 'sku-1']
  },
  {
    id: 'import-funnel-10x',
    name: 'The $9B Mature-Node Import Funnel & 10x Economics',
    category: 'strategy',
    tagline: 'Dismantling $2M–$5M NRE down to ₹0.6–1.2 Cr across India’s $9B mature-node import market',
    nodeFoundry: 'Mature Nodes ≥ 130 nm · SkyWater & SCL Mohali',
    voltageRail: '5V to 120V High Voltage & Mixed Signal',
    standards: 'UN COMTRADE HS 8542 · Open-Source Silicon Flow',
    summary: 'India imports $23.4B of chips annually, of which $9B is mature-node silicon (≥130 nm). DeepGrid targets 9 addressable chip classes ($0.46B) and cuts development costs by 10× using free open-source EDA and shared MPW runs.',
    keyFacts: [
      'The 5-Level Funnel: $23.4B total imports → $9.0B mature-node (≥130 nm) → $0.46B across 9 DeepGrid chip classes → ₹1,000 Cr FY31 target → ₹2.88 Cr live pre-ASIC orders today.',
      '10x Cost Dismantling: Physical layout ($1–2M sent outside → in-house staff time on free kits); EDA licenses ($0.5–1M/yr → Yosys, OpenROAD, Magic, KLayout at ₹0).',
      'MPW Economics: Shared sky130 factory run costs $14,950 (₹14.3 Lakhs) for 100 packaged chips vs $0.5–1M full mask sets. IHP SiGe radar runs cost €5,110–7,300/mm² (₹34–80 Lakhs).',
      'All-In Development Cost: ₹0.6–1.2 Crore per finished, tested, approved chip (vs $2–5M conventional NRE), delivering 60–75% gross margins at 10,000 units/year.',
      'Economic Boundary: Cannot compete on commodity wafers at 10M units against paid-off mega-fabs; profitably owns low-volume protected programs where imports are banned.'
    ],
    citation: 'DeepGrid Mature Silicon Whitepaper v3 — Section 1 & 2: What India Buys & Our Costs Line by Line',
    actions: [
      { label: 'View Financial Model', target: 'ask?q=10cr' },
      { label: 'Explore 198-Day Loop', target: 'architecture' }
    ],
    connectedNodeIds: ['fin-funds', '198-day-loop', 'three-factory', 'dap-2020-moats']
  },
  {
    id: 'boxes-not-chips',
    name: '"Boxes, Not Chips" Statutory Defence Framework',
    category: 'defense',
    tagline: 'Entering one level down: providing the sovereign silicon inside PIL-5 line-replaceable units',
    nodeFoundry: 'SCL Mohali 180 nm · Sovereign Military Fabrication',
    voltageRail: '28V Military Avionics · High-Reliability Bus',
    standards: 'DAP-2020 Buy(Indian-IDDM) · PIL-1..5 · SRIJAN Portal · Make-II',
    summary: 'Auditing 346 items in the Ministry of Defence’s 5th Positive Indigenisation List (PIL-5) revealed government lists never name chips; they enumerate boxes, LRUs, and assemblies. DeepGrid sells to the box maker, embedding indigenous silicon that grants statutory procurement priority.',
    keyFacts: [
      'The List Reality: PIL-5 contains 346 items (bushes, pumps, valves, optical filters, and LRU boxes) with zero chip-level part numbers.',
      'One Level Down Wedge: DeepGrid supplies the silicon inside the listed box (e.g. Chip 1 in PIL-5 anti-tank missile motor; Chip 3 in PIL-5 4A 16–40V DC-DC converter for BEL tanks; Chip 8 in BEL 17" rugged display).',
      'The 4 Statutory Moats: DAP-2020 Buy(Indian-IDDM) beats imports before price evaluation → PIL lists ban foreign suppliers on milestone dates → SRIJAN portal lists 37,696 DPSU import targets → Make-II guarantees volume orders.',
      'The IDDM Distinction: Silicon fabricated at SkyWater/IHP qualifies as Buy(Indian) because design and layout are 100% Indian; migrating to SCL Mohali unlocks Buy(Indian-IDDM) maximum priority.',
      'Three Buyer Clocks: List entry (permission, 2–4 yr trickle) vs Defence filing (real order path, 15–18 mos trials) vs Tender win (fast volume clock, 6–12 mos vendor registration).'
    ],
    citation: 'DeepGrid Mature Silicon Whitepaper v3 — Section 11: Two Ways to Sell the Same Chip',
    actions: [
      { label: 'Explore Defence Moats', target: 'ask?q=dap' },
      { label: 'View Anchor Customers', target: 'family' }
    ],
    connectedNodeIds: ['dap-2020-moats', 'sku-3', 'sku-8', 'sku-4', 'three-factory']
  },
  {
    id: 'chinese-price-crash',
    name: 'Chinese Price Crash Stress Test & Stop Rules S1–S4',
    category: 'finance',
    tagline: 'Downside resilience model (FY31 drops to ₹750 Cr) and 4 binding operational stop rules',
    nodeFoundry: 'Capital Governance & Risk Management',
    voltageRail: 'Downside Balance Sheet Protection',
    standards: 'Stop Rules S1–S4 · Charlie Munger Inversion Checklist',
    summary: 'DeepGrid applies Charlie Munger’s inversion framework to stress-test the company against a catastrophic collapse in Chinese silicon prices. Evaluates revenue resilience and enforces 4 strict, pre-committed operational Stop Rules.',
    keyFacts: [
      'Price Crash Stress Test: Smart meters drop -30% (₹480Cr → ₹340Cr); Motors drop -40% (₹220Cr → ₹130Cr); Vehicle gateways drop -30% (₹35Cr → ₹25Cr); Drone brains drop to ₹55Cr.',
      'Defence Immunity: Screened defence silicon (₹200 Cr) remains exactly ₹200 Cr — statutory PIL import bans completely shield it from foreign dumping.',
      'Downside Survival: Total FY31 revenue falls from ₹1,000 Cr to ₹750 Cr, preserving profitability (60–75% margins) and easily funding subsequent rounds.',
      'Stop Rule S1 (Meter Gate): If Ripple has not signed by the Chip 2 factory order cutoff, Chip 2 waits 1 cycle; funds reallocate to Chips 1 and 3.',
      'Stop Rule S2 (Screening): If Chip 6 fails military screening twice, all forward defence revenue is pushed out 12 months within 30 days.',
      'Stop Rule S3 (Commercial Exit): In FY29, if delivered Chinese prices < manufacturing cost, exit ceiling fan drivers; keep EV motors and proprietary modules.',
      'Stop Rule S4 (SCL Delay): If SCL Mohali slips >2 cycles, publicly disclose the delay and execute production runs exclusively at SkyWater and IHP.'
    ],
    citation: 'DeepGrid Mature Silicon Whitepaper v3 — Section 12 & 14: Competitor Insulation & Risk Matrix',
    actions: [
      { label: 'Review Risk Audit', target: 'ask?q=munger' },
      { label: 'Use of Funds', target: 'ask?q=funds' }
    ],
    connectedNodeIds: ['munger-audit', 'fin-funds', 'import-funnel-10x', 'dap-2020-moats']
  },
  {
    id: 'dgridriscv-core-architecture',
    name: 'DGridRiscV Canonical Core Specification',
    category: 'architecture',
    tagline: 'Standardized RV32IM_Zicsr controller (misa = 0x40001100) shared across 7 of 10 chips',
    nodeFoundry: '130 nm CMOS · Single 50 MHz Clock Domain',
    voltageRail: '1.8V Core / 3.3V I/O',
    standards: 'RV32IM_Zicsr Specification · Fixed-Point Bit-Exact Execution',
    summary: 'Seven of the ten chips share an identical, parameter-locked RISC-V core generated from VexiiRiscv. Deliberately omits caches, branch prediction, and floating-point to guarantee deterministic sub-1 µs loop latency and bit-exact software verification across foundries.',
    keyFacts: [
      'Instruction Set & Mode: RV32IM_Zicsr (Machine mode only via PrivilegedPlugin, misa = 0x40001100).',
      'In-Order Pipeline: Single-issue lane0, 2 fetch stages (fetch_logic_ctrls_0..1), 6 execute stages (execute_ctrl0..5).',
      'Hardware Math: Full hardware multiplier and divider (MulPlugin + DivPlugin), single-cycle barrel shifter (BarrelShifterPlugin).',
      'Off-Core Fabric: Cacheless 32-bit AXI4 fetch and LSU interfaces (FetchCachelessAxi4Plugin, LsuCachelessAxi4Plugin) to tightly coupled SRAM.',
      'Architectural Omissions: No caches (avoids jitter/miss latency), no branch predictor (saves area), no FPU (fixed-point math bit-exact between commercial and screened defence parts), no compressed instructions (removes alignment stall traps).'
    ],
    citation: 'DeepGrid Mature Silicon Whitepaper v3 — Section 8: The Processor Every Chip Shares',
    actions: [
      { label: 'Explore Architecture', target: 'architecture' },
      { label: 'View Lockstep Core', target: 'ask?q=lockstep' }
    ],
    connectedNodeIds: ['dg32-lite', 'sku-4', 'foc-loop-budget', '198-day-loop']
  },
  {
    id: 'dg32-qfn64-pinout',
    name: 'DG32 64-Pin QFN Physical Pin Map & Packaging',
    category: 'architecture',
    tagline: 'Standardized 9x9mm 0.5mm-pitch QFN package unifying DG32-LITE (CI2609) and DG32-2DOM (CI2612)',
    nodeFoundry: 'SkyWater sky130A · OpenFrame CI2609 & CI2612 Shuttles',
    voltageRail: '3.3V I/O (vddio) / 1.8V Core (vccd1)',
    standards: 'JEDEC MO-220 QFN-64 · OpenFrame Harness Pinout',
    summary: 'Authoritative 64-pin QFN package definition with exact pin assignments across all 4 sides. Guarantees 100% pin-compatible drop-in board replacement between DG32-LITE and DG32-2DOM.',
    keyFacts: [
      'West Side (Pins 1–16): Analog SAR ADC negative input (pin 2), 3-phase gate drive PWM_AH..CL (pins 3–8), PWM_TRIG (pin 11), Quadrature ENC_A/B/Z (pins 12–14), Hall A/B (pins 15–16).',
      'South Side (Pins 17–32): vddio 3.3V (pin 17), vccd 1.8V (pin 18), resetb 3.3V (pin 21), Hall C (pin 22), JTAG TCK/TMS/TDI/TDO (pins 24–27), RST_N (pin 28), vdda 3.3V (pin 30), CLK 50 MHz (pin 31), QSPI_SCLK 25 MHz (pin 32).',
      'East Side (Pins 33–48): QSPI NOR flash CSN0, IO0–IO3 (pins 33–37), QSPI_CSN1 (pin 41), UART0 TX/RX console (pins 42–43), UART1 TX/RX telemetry (pins 44–45), SPI Master SCLK/MOSI (pins 46, 48), vccd1 1.8V core (pin 49).',
      'North Side (Pins 49–64): SPI MISO/CSN (pins 50–51), I2C open-drain SCL/SDA (pins 53–54), GPIO0–2 (pins 55, 57, 58), FAULT_N active-low trip (pin 59), RAIL_OK0/1 (pins 60–61), ADC_VINP positive input (pin 62), vddio 3.3V (pin 64).',
      'Exposed Die Paddle (EP): Center paddle is VSS ground; must be soldered directly to the PCB ground plane for low-inductance return and thermal dissipation.'
    ],
    citation: 'DG32-LITE & DG32-2DOM Preliminary Datasheets — Section 2 & 3: Pinout & Pin Description',
    actions: [
      { label: 'View Pinout Specs', target: 'pinout' },
      { label: 'Explore Architecture', target: 'architecture' }
    ],
    connectedNodeIds: ['dg32-lite', 'dg32-2dom-system', 'dshot-bidir-rx', 'foc-loop-budget']
  },
  {
    id: 'dg32-power-sequencing-pcb',
    name: 'DG32 Power Sequencing, Electrical Limits & PCB Layout',
    category: 'architecture',
    tagline: 'Board design rules: 3.3V-before-1.8V ramp, unused rail ESD biasing, and differential ADC routing',
    nodeFoundry: 'SkyWater sky130A Standard Operating Limits',
    voltageRail: '3.3V vddio / 1.8V vccd1 / 0–1.8V Diff Analog',
    standards: 'AEC-Q100 Grade 1 · MIL-STD-883 Environmental · OpenROAD Signoff',
    summary: 'Hardware electrical and PCB layout specifications for DG32 carrier boards. Mandates 3.3V-before-1.8V power sequencing to protect pad rings, unused rail biasing (vdda1/2, vccd2) for ESD steering, and differential microstrip shielding for current sensing.',
    keyFacts: [
      'Power Sequencing Rule: 3.3V pad-ring supply (vddio, vdda) must ramp up before or coincident with 1.8V core supply (vccd, vccd1). At no time may vccd1 exceed vddio by >0.3V.',
      'Unused Rail Biasing: Unused user rails (vdda1 pins 40/47, vdda2 pin 9 to 3.3V; vccd2 pin 63 to 1.8V) must be tied to nominal voltages to keep pad-ring domain-order ESD diodes properly biased.',
      'Differential Analog Routing: SAR ADC inputs ADC_VINP (pin 62) and ADC_VINN (pin 2) operate 0 to 1.8V differential; route as a length-matched 100-ohm differential pair shielded from PWM switching traces.',
      'Power Budget: Estimated total power is ~0.43 W at 50 MHz (tt 25 °C, 1.8 V vccd1). Dynamic and leakage current is drawn entirely from vccd1 (pin 49).',
      'JTAG Invariance: Internal weak pull-ups on TMS (pin 25) and TDI (pin 26), and weak pull-down on TCK (pin 24) ensure an unconnected JTAG header idles safely without floating toggles.'
    ],
    citation: 'DG32-LITE & DG32-2DOM Preliminary Datasheets — Section 4, 5 & 9: Electrical Characteristics & Board Guidance',
    actions: [
      { label: 'Explore Hardware Rules', target: 'architecture' },
      { label: 'View Pinout', target: 'pinout' }
    ],
    connectedNodeIds: ['dg32-qfn64-pinout', 'dg32-lite', 'dg32-2dom-system']
  },
  {
    id: 'dg32-boot-rom-qspi',
    name: 'DG32 Standalone Boot ROM & QSPI-XIP Flow',
    category: 'architecture',
    tagline: 'Autonomous multi-stage bootloader: 115200 8N1 banner, 0xD632_B007 flash detection, and SRAM copy',
    nodeFoundry: '64 KB Baked Std-Cell ROM · SkyWater sky130A',
    voltageRail: '1.8V Core Logic',
    standards: 'QSPI Quad-Output-Fast-Read (0x6B) · PMA Hardwired Whitelist',
    summary: 'The DG32 architecture operates without an external management core. At power-on, the baked 64 KB std-cell boot ROM executes autonomously, emits console telemetry, verifies flash header magic 0xD632_B007, copies executable code to SRAM, and jumps to application code.',
    keyFacts: [
      'ROM-Only Fetch Invariant: The CPU instruction fetch bus is hardwired to the private boot ROM alone. Code does NOT execute in place from external NOR flash; it must be copied to SRAM before execution.',
      'Flash Magic Validation: Boot ROM reads QSPI NOR header at 0x1000_0000; validates 32-bit magic word 0xD632_B007 followed by 32-bit binary length before initiating copy.',
      'Quad-Output Fast-Read: Transfers image using QSPI opcode 0x6B (1-1-4 mode, 8 dummy cycles, SCLK = 25 MHz) directly into 32 KB SRAM (0x9000_0000).',
      'UART Console & Fallback: Emits "DG32" boot banner on UART0 (pin 42) at 115,200 baud 8N1 (divider=434 @ 50 MHz). If flash is blank, ROM falls back to interactive UART monitor (r/w/j/i commands).',
      'PMA Bus Protection: Hardwired VexiiRiscv PMA whitelist: !(addr[31] | addr[31:28]==0x1). Unmapped bus accesses complete with SLVERR; bus never hangs.'
    ],
    citation: 'DG32-LITE & DG32-2DOM Preliminary Datasheets — Section 6 & 7: Clock, Reset, Boot & Memory Map',
    actions: [
      { label: 'Explore Boot Architecture', target: 'architecture' },
      { label: 'View Register Map', target: 'ask?q=register' }
    ],
    connectedNodeIds: ['dgridriscv-core-architecture', 'dg32-lite', 'dg32-qfn64-pinout']
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
  { id: 'dg32-2dom-system', name: '2DOM Dual-Domain', shortName: '2DOM Dual', category: 'architecture', x: 20, y: 28, description: '3400x4500um die with 50MHz core + 114MHz attention engine via CDC.' },
  { id: 'int8-attention-engine', name: 'INT8 Attention Engine', shortName: 'INT8 Attn', category: 'ai', x: 12, y: 22, description: 'Hardware attention engine with 40-bit numerator, u15 EXP, 48-step divider.' },
  { id: 'avip-bearing-diagnostics', name: 'AVIP MCSA Diagnostics', shortName: 'AVIP MCSA', category: 'ai', x: 4, y: 32, description: 'Multimodal bearing fault classifier using phase-current SAR ADC with no accelerometer.' },
  { id: 'foc-loop-budget', name: 'FOC Loop Budget', shortName: 'FOC Budget', category: 'architecture', x: 38, y: 50, description: '100 kHz closed-loop bandwidth: 300 cycles fixed, 4700 cycles free at 10 kHz.' },

  // Anchor Customers
  { id: 'anchor-mceme', name: 'MCEME Army', shortName: 'MCEME', category: 'anchor', x: 12, y: 75, description: 'Indian Army MCEME: ₹1.01 Cr contracted pre-ASIC validation.' },
  { id: 'anchor-airgap', name: 'Airgap EV', shortName: 'Airgap', category: 'anchor', x: 10, y: 32, description: 'Commercial anchor for 15M units/year BLDC motor silicon.' },
  { id: 'anchor-ripple', name: 'Ripple Metering', shortName: 'Ripple', category: 'anchor', x: 48, y: 88, description: 'National rollout partner for 250M smart meter front-ends.' },
  { id: 'anchor-bel', name: 'BEL Avionics', shortName: 'BEL', category: 'anchor', x: 8, y: 62, description: 'Bharat Electronics Limited 17" cockpit tactical display program.' },

  // Governance & Finance
  { id: 'fin-seed', name: '₹10 Cr Model', shortName: '₹10 Cr', category: 'governance', x: 62, y: 46, description: 'Seed allocation for 6 MPW runs, ATE lines, and FY31 revenue.' },
  { id: 'fin-munger', name: 'Charlie Munger Audit', shortName: 'Munger Audit', category: 'governance', x: 74, y: 38, description: '14-Point Risk Matrix and non-negotiable Stop Rules S1-S4.' },
  { id: 'import-funnel-node', name: '$9B Import Funnel', shortName: '$9B Funnel', category: 'moat', x: 58, y: 38, description: '$9B mature-node import funnel dismantled via 10x lower NRE.' },
  { id: 'boxes-not-chips-node', name: 'Boxes, Not Chips', shortName: 'Boxes', category: 'moat', x: 72, y: 58, description: 'Entering one level down: providing sovereign silicon inside PIL-5 LRU boxes.' },
  { id: 'stop-rules-node', name: 'Stop Rules S1–S4', shortName: 'Stop Rules', category: 'governance', x: 80, y: 42, description: 'Pre-committed governance rules guarding against Chinese price crashes and delays.' },
  { id: 'dgridriscv-core-node', name: 'DGridRiscV Core', shortName: 'DGridRiscV', category: 'architecture', x: 40, y: 28, description: 'Canonical RV32IM_Zicsr cacheless processor shared across 7 chips.' },
  { id: 'qfn64-package-node', name: 'QFN-64 Package', shortName: 'QFN-64', category: 'architecture', x: 30, y: 48, description: '64-pin 9x9mm 0.5mm pitch unified package for DG32-LITE & 2DOM.' },
  { id: 'power-seq-node', name: 'Power Sequencing', shortName: 'Power Seq', category: 'governance', x: 46, y: 60, description: '3.3V-before-1.8V ramp order and unused rail ESD biasing rules.' },
  { id: 'boot-rom-node', name: '64KB Boot ROM', shortName: 'Boot ROM', category: 'architecture', x: 50, y: 44, description: 'Baked std-cell ROM executing standalone boot & 0xD632_B007 flash copy.' }
];

export const nodeToCatalogMap: Record<string, string> = {
  'dg32-lite': 'dg32-lite',
  'dg32-2dom': 'dg32-2dom-system',
  'dg32-2dom-system': 'dg32-2dom-system',
  'sku-1': 'sku-1',
  'sku-2': 'sku-2',
  'sku-3': 'sku-3',
  'sku-4': 'sku-4',
  'sku-5': 'sku-5',
  'sku-6': 'sku-6',
  'sku-7': 'sku-7',
  'sku-8': 'sku-8',
  'sku-9': 'sku-9',
  'track-b-d100': 'track-b-d100',
  'dg-sdv-platform': 'dg-sdv-platform',
  'sku-node-roadmap': 'sku-node-roadmap',
  'dg32-ai-envelope': 'dg32-ai-envelope',
  'dg32-30-usecases': 'dg32-30-usecases',
  'dg32-tree-ensembles': 'dg32-tree-ensembles',
  'dg32-dsp-pipeline': 'dg32-dsp-pipeline',
  'dg32-afe-sensing': 'dg32-afe-sensing',
  'dg32-benchmark-audit': 'dg32-benchmark-audit',
  'fab-skywater': 'three-factory',
  'fab-ihp': 'sku-7',
  'fab-scl': 'three-factory',
  'moat-dap2020': 'dap-2020-moats',
  'dap-2020-moats': 'dap-2020-moats',
  'moat-make2': 'dap-2020-moats',
  'moat-pil5': 'boxes-not-chips',
  'moat-srijan': 'dap-2020-moats',
  'arch-198loop': '198-day-loop',
  '198-day-loop': '198-day-loop',
  'arch-lockstep': 'sku-4',
  'arch-sip': 'sip-packaging',
  'sip-packaging': 'sip-packaging',
  'arch-dgridriscv': 'dgridriscv-core-architecture',
  'dgridriscv-core-architecture': 'dgridriscv-core-architecture',
  'dgridriscv-core-node': 'dgridriscv-core-architecture',
  'dshot-bidir-rx': 'dshot-bidir-rx',
  'sram-floorplan-lever': 'sram-floorplan-lever',
  'int8-attention-engine': 'int8-attention-engine',
  'avip-bearing-diagnostics': 'avip-bearing-diagnostics',
  'foc-loop-budget': 'foc-loop-budget',
  'anchor-mceme': 'track-b-d100',
  'anchor-airgap': 'sku-1',
  'anchor-ripple': 'sku-2',
  'anchor-bel': 'sku-8',
  'fin-seed': 'fin-funds',
  'fin-funds': 'fin-funds',
  'fin-munger': 'munger-audit',
  'munger-audit': 'munger-audit',
  'import-funnel-node': 'import-funnel-10x',
  'import-funnel-10x': 'import-funnel-10x',
  'boxes-not-chips-node': 'boxes-not-chips',
  'boxes-not-chips': 'boxes-not-chips',
  'stop-rules-node': 'chinese-price-crash',
  'chinese-price-crash': 'chinese-price-crash',
  'qfn64-package-node': 'dg32-qfn64-pinout',
  'dg32-qfn64-pinout': 'dg32-qfn64-pinout',
  'power-seq-node': 'dg32-power-sequencing-pcb',
  'dg32-power-sequencing-pcb': 'dg32-power-sequencing-pcb',
  'boot-rom-node': 'dg32-boot-rom-qspi',
  'dg32-boot-rom-qspi': 'dg32-boot-rom-qspi'
};

export const catalogToNodeMap: Record<string, string> = {
  'dg32-lite': 'dg32-lite',
  'dg32-2dom-system': 'dg32-2dom-system',
  'sku-1': 'sku-1',
  'sku-2': 'sku-2',
  'sku-3': 'sku-3',
  'sku-4': 'sku-4',
  'sku-5': 'sku-5',
  'sku-6': 'sku-6',
  'sku-7': 'sku-7',
  'sku-8': 'sku-8',
  'sku-9': 'sku-9',
  'track-b-d100': 'track-b-d100',
  'dg-sdv-platform': 'dg-sdv-platform',
  'sku-node-roadmap': 'sku-node-roadmap',
  'dg32-ai-envelope': 'dg32-ai-envelope',
  'dg32-30-usecases': 'dg32-30-usecases',
  'dg32-tree-ensembles': 'dg32-tree-ensembles',
  'dg32-dsp-pipeline': 'dg32-dsp-pipeline',
  'dg32-afe-sensing': 'dg32-afe-sensing',
  'dg32-benchmark-audit': 'dg32-benchmark-audit',
  'three-factory': 'fab-scl',
  'dap-2020-moats': 'moat-dap2020',
  '198-day-loop': 'arch-198loop',
  'sip-packaging': 'arch-sip',
  'dgridriscv-core-architecture': 'dgridriscv-core-node',
  'dshot-bidir-rx': 'dshot-bidir-rx',
  'sram-floorplan-lever': 'sram-floorplan-lever',
  'int8-attention-engine': 'int8-attention-engine',
  'avip-bearing-diagnostics': 'avip-bearing-diagnostics',
  'foc-loop-budget': 'foc-loop-budget',
  'fin-funds': 'fin-seed',
  'munger-audit': 'fin-munger',
  'import-funnel-10x': 'import-funnel-node',
  'boxes-not-chips': 'boxes-not-chips-node',
  'chinese-price-crash': 'stop-rules-node',
  'dg32-qfn64-pinout': 'qfn64-package-node',
  'dg32-power-sequencing-pcb': 'power-seq-node',
  'dg32-boot-rom-qspi': 'boot-rom-node'
};

export const graphEdges: GraphEdge[] = [
  // Edge AI Connections
  { from: 'dg32-lite', to: 'dg32-ai-envelope', label: '12.5 MMAC/s Budget' },
  { from: 'dg32-ai-envelope', to: 'dg32-30-usecases', label: '30 Native Tasks' },
  { from: 'dg32-30-usecases', to: 'dg32-tree-ensembles', label: 'Zero-Multiply Trees' },
  { from: 'dg32-30-usecases', to: 'dg32-dsp-pipeline', label: 'CORDIC Demodulation' },
  { from: 'dg32-dsp-pipeline', to: 'dg32-afe-sensing', label: 'ISO 13373 Dynamic Range' },
  { from: 'dg32-30-usecases', to: 'dg32-benchmark-audit', label: 'Leakage-Free Validation' },
  { from: 'dg32-30-usecases', to: 'dg32-2dom', label: 'Scalar -> Attention Engine' },
  { from: 'dg32-2dom-system', to: 'int8-attention-engine', label: '114 MHz CDC' },
  { from: 'int8-attention-engine', to: 'avip-bearing-diagnostics', label: '46.7 ms Inference' },
  { from: 'dg32-2dom-system', to: 'foc-loop-budget', label: '50 MHz Control' },
  { from: 'foc-loop-budget', to: 'dg32-lite', label: 'FOC Offload' },
  { from: 'avip-bearing-diagnostics', to: 'dg32-afe-sensing', label: 'Current Signature' },

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
  { from: 'moat-dap2020', to: 'moat-make2', label: 'Statutory Priority' },
  { from: 'import-funnel-node', to: 'fin-seed', label: '$9B Funnel' },
  { from: 'import-funnel-node', to: 'fab-skywater', label: '10x Economics' },
  { from: 'boxes-not-chips-node', to: 'moat-pil5', label: 'PIL-5 LRUs' },
  { from: 'boxes-not-chips-node', to: 'moat-dap2020', label: 'Buy(Indian) Wedge' },
  { from: 'stop-rules-node', to: 'fin-munger', label: 'Crash Sizing' },
  { from: 'stop-rules-node', to: 'sku-2', label: 'S1 Ripple Gate' },
  { from: 'dgridriscv-core-node', to: 'dg32-lite', label: 'RV32IM Base' },
  { from: 'dgridriscv-core-node', to: 'sku-4', label: 'Lockstep Core' },
  { from: 'qfn64-package-node', to: 'dg32-lite', label: 'CI2609 Socket' },
  { from: 'qfn64-package-node', to: 'dg32-2dom-system', label: 'CI2612 Socket' },
  { from: 'power-seq-node', to: 'qfn64-package-node', label: 'Rail Tie Rules' },
  { from: 'boot-rom-node', to: 'dg32-lite', label: 'ROM-Only Fetch' },
  { from: 'boot-rom-node', to: 'dgridriscv-core-node', label: 'PMA Whitelist' }
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
    if ((q.includes('2dom') || q.includes('ci2612') || q.includes('dual clock') || q.includes('3400') || q.includes('pma')) && item.id === 'dg32-2dom-system') score += 85;
    if ((q.includes('attention') || q.includes('int8') || q.includes('softmax') || q.includes('40-bit') || q.includes('u15') || q.includes('restoring divider')) && item.id === 'int8-attention-engine') score += 85;
    if ((q.includes('avip') || q.includes('csa') || q.includes('bearing') || q.includes('current signature') || q.includes('no accelerometer') || q.includes('stator current')) && item.id === 'avip-bearing-diagnostics') score += 85;
    if ((q.includes('foc') || q.includes('headroom') || q.includes('budget') || q.includes('fetch-bound') || q.includes('100 khz') || q.includes('300 cycles')) && item.id === 'foc-loop-budget') score += 85;

    // Master Whitepaper v3 boosts
    if ((q.includes('funnel') || q.includes('$9b') || q.includes('10x') || q.includes('comtrade') || q.includes('economics')) && item.id === 'import-funnel-10x') score += 90;
    if ((q.includes('boxes') || q.includes('not chips') || q.includes('lru') || q.includes('one level down') || q.includes('346 items')) && item.id === 'boxes-not-chips') score += 90;
    if ((q.includes('crash') || q.includes('chinese price') || q.includes('stop rule') || q.includes('s1') || q.includes('s2') || q.includes('s3') || q.includes('s4') || q.includes('750 cr')) && item.id === 'chinese-price-crash') score += 90;
    if ((q.includes('dgridriscv') || q.includes('rv32im') || q.includes('misa') || q.includes('vexii') || q.includes('cacheless') || q.includes('0x40001100') || q.includes('canonical')) && item.id === 'dgridriscv-core-architecture') score += 90;

    // Datasheet QFN-64 & Board Design boosts
    if ((q.includes('qfn') || q.includes('qfn-64') || q.includes('pinout') || q.includes('pin map') || q.includes('package') || q.includes('ci2609') || q.includes('ci2612')) && item.id === 'dg32-qfn64-pinout') score += 95;
    if ((q.includes('power sequencing') || q.includes('vddio') || q.includes('vccd1') || q.includes('pcb') || q.includes('layout') || q.includes('diff pair') || q.includes('differential') || q.includes('esd')) && item.id === 'dg32-power-sequencing-pcb') score += 95;
    if ((q.includes('boot rom') || q.includes('qspi-xip') || q.includes('0xd632_b007') || q.includes('0x6b') || q.includes('standalone boot') || q.includes('copy to sram') || q.includes('banner')) && item.id === 'dg32-boot-rom-qspi') score += 95;

    return { item, score };
  });

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
}
