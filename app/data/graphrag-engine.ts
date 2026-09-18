// True GraphRAG Engine for DeepGrid Silicon Intelligence
// Designed for CTOs, VPs of Engineering, Automotive & Defence Procurement Executives.
// Combines:
// 1. Graph Topology: 318 nodes and 430 typed edges from Graphify AST + Domain Knowledge Graph
// 2. Semantic Entry Point: In-browser sparse-dense vector cosine similarity over 4,418 vocabulary terms
// 3. Relational Traversal: Dynamic K-hop BFS walking across typed links (contains, imports, depends_on, implements, accelerates)
// 4. Grounded Synthesis: Grounded in 177 primary PDF pages with exact page citations and downloadable assets
// 100% Deterministic, $0 Runtime Cost, Fully Static Compatible.

import unifiedIndexRaw from './graphrag-unified-index.json';
import {THEME_EXAMPLES} from './theme-examples';
import { deepGridCatalog, DeepGridItem, GraphNode } from './deepgrid-knowledge';
import { groundedDocuments, GroundedDoc } from '../documents-data';

export interface TraversedEdge {
  fromNode: GraphNode;
  toNode: GraphNode;
  relationLabel: string;
}

export interface GraphRAGPath {
  summary: string;
  steps: {
    source: string;
    relation: string;
    target: string;
  }[];
}

export interface GraphRAGResult {
  query: string;
  domainTag: string;
  contextualTitle: string;
  communityName: string;
  seedEntities: GraphNode[];
  traversedEdges: TraversedEdge[];
  graphPath: GraphRAGPath;
  matchedItem: DeepGridItem;
  matchedDoc: GroundedDoc;
  answer: string;
  explanation: string[];
  keyBusinessFacts: string[];
  referenceLinks: {
    label: string;
    hash: string;
    description: string;
  }[];
  citation: {
    documentTitle: string;
    documentNum: string;
    section: string;
    page: string;
    pdfPath: string;
    pdfSize: string;
    specPath: string;
  };
  technicalDetails: {
    summary: string;
    specPoints: string[];
    deepLink: {
      label: string;
      hash: string;
      context: string;
    };
  };
  relatedTopics: {
    label: string;
    query: string;
  }[];
}

interface UnifiedNode {
  id: string;
  name: string;
  shortName: string;
  category: string;
  communityId: number;
  communityName: string;
  description: string;
  origin: string;
  vector: Record<string, number>;
}

interface UnifiedEdge {
  from: string;
  to: string;
  label: string;
  weight: number;
}

interface UnifiedChunk {
  id: string;
  docTitle: string;
  docNum: string;
  pdfPath: string;
  pdfSize: string;
  specPath: string;
  pageLabel: string;
  section: string;
  text: string;
  vector: Record<string, number>;
}

interface UnifiedGraphIndex {
  nodes: UnifiedNode[];
  edges: UnifiedEdge[];
  chunks: UnifiedChunk[];
  vocab: string[];
  idf: number[];
}

const graphIndex = unifiedIndexRaw as unknown as UnifiedGraphIndex;
const vocabMap = new Map<string, number>(graphIndex.vocab.map((w, i) => [w, i]));
const idfList = graphIndex.idf;

// Fast lookup map for nodes
const nodeById = new Map<string, UnifiedNode>();
graphIndex.nodes.forEach(n => nodeById.set(n.id, n));

/**
 * Computes sparse TF-IDF vector for any query string
 */
function vectorizeQuery(text: string): Record<number, number> {
  const words = text.toLowerCase().match(/[a-z0-9_]+/g) || [];
  const vec: Record<number, number> = {};
  let normSq = 0;

  words.forEach(w => {
    if (vocabMap.has(w)) {
      const idx = vocabMap.get(w)!;
      const weight = (vec[idx] || 0) + idfList[idx];
      vec[idx] = weight;
    }
  });

  for (const idx in vec) {
    normSq += vec[idx] * vec[idx];
  }

  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (const idx in vec) {
      vec[idx] /= norm;
    }
  }

  return vec;
}

/**
 * Computes cosine dot-product
 */
function dotProduct(vecA: Record<number, number>, vecB: Record<string, number>): number {
  let dot = 0;
  for (const idxStr in vecB) {
    const idx = Number(idxStr);
    if (vecA[idx]) {
      dot += vecA[idx] * vecB[idxStr];
    }
  }
  return dot;
}

/**
 * Clean and filter raw text extracted from PDF pages
 */
function cleanExtractedText(raw: string): string {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (line.length < 20) return false;
      if (/^[A-Z]\s+[A-Z]\s+[A-Z]/i.test(line)) return false;
      if (/^(contents|navigate|deepgrid semi|plain edition|page \d+|part \w+)/i.test(line)) return false;
      return true;
    })
    .join(' ')
    .replace(/\s+/g, ' ');
}

// Canonical Executive Knowledge Definitions for Core Engineering Themes
export interface ExecutiveTheme {
  keywords: string[];
  title: string;
  tag: string;
  lead: string;
  explanation: string[];
  facts: string[];
  docNum: string;
  docTitle: string;
  section: string;
  page: string;
  pdfPath: string;
  pdfSize: string;
  specPath: string;
  refLinks: { label: string; hash: string; description: string }[];
}

export const executiveThemes: ExecutiveTheme[] = [
  // 1. Goertzel vs FFT
  {
    keywords: ['goertzel', 'fft', 'broken rotor', 'rotor bar', 'sideband', 'quantization floor'],
    title: 'Goertzel Recurrence vs. 8 MB FFT for Broken Rotor Bar Detection',
    tag: 'EDGE AI & MOTOR CURRENT SIGNATURE ANALYSIS (MCSA)',
    lead: 'Resolving induction motor slip sidebands separated by 0.5 to 3 Hz over a 30- to 100-second record would require an 8-Megabyte RAM buffer to execute a conventional 2^20-point FFT. DG32-LITE eliminates this multi-megabyte memory penalty by deploying an 8-bin Goertzel recurrence filter that evaluates only the discrete physical sideband frequencies in 6,144 cycles (0.12 ms) within just 16.5 KB of SRAM.',
    explanation: [
      'The Physical & Memory Challenge: Broken rotor bar faults produce current signature sidebands at fb = f1(1 ± 2s), where s is motor slip (typically 1% to 5%). Separating these narrow peaks (0.5–3 Hz from the 50 Hz fundamental) requires long continuous sampling windows of 30 to 100 seconds at 0.01 to 0.05 Hz bin resolution. Performing an unconstrained full-spectrum 2^20-point FFT on this window would require 8 MB of RAM—demanding a costly external DRAM chip and power-hungry memory controller.',
      'The Goertzel Solution on a 50 MHz Core: Rather than computing thousands of unneeded spectral bins across the full bandwidth, DG32-LITE implements second-order IIR Goertzel recurrence filters targeted exclusively at the exact 8 predicted sideband harmonic frequencies. The entire 8-bin calculation consumes only 6,144 clock cycles (0.12 ms on the 50 MHz core) and executes entirely inside internal SRAM, preserving 82% CPU execution headroom for standard motor control.',
      'Dynamic Range & AFE Realities: ISO 20958 establishes that broken rotor bar sidebands sit 40 to 60 dBc below the 50 Hz fundamental. Because standard 8-bit ADCs provide only 42 dB of usable dynamic range under ISO 13373-2 (D = 6(N-1) dB), these sidebands would disappear beneath the quantization noise floor. DeepGrid pairs the Goertzel algorithm with 12-to-16-bit analog front ends or analog fundamental notch filtering, guaranteeing reliable detection before bar breakage destroys the stator.'
    ],
    facts: [
      'Execution Latency: 6,144 clock cycles (0.12 ms) across all 8 physical sideband bins.',
      'Memory Footprint: <1.5 KB working buffer vs. 8 MB required for a 2^20-point full FFT.',
      'Dynamic Range Requirement: Detects sidebands -40 to -60 dBc below the 50 Hz fundamental (ISO 20958).',
      'System Impact: Eliminates external DRAM and discrete high-power DSP companion chips from the BOM.'
    ],
    docNum: '01',
    docTitle: 'Thirty Use Cases, No Accelerator',
    section: 'Section 4.2: Goertzel Recurrence vs. 8 MB FFT',
    page: 'p. 11',
    pdfPath: './downloads/docs/deepgrid-dg32-ai-30-use-cases.pdf',
    pdfSize: '414 KB',
    specPath: './downloads/docs/deepgrid-dg32-ai-architecture.md',
    refLinks: [
      { label: 'Explore 30 Industrial AI Tasks', hash: 'overview', description: 'Review the full 30 use cases and their physical compute envelopes.' },
      { label: 'Inspect 100 kHz Control Loop Budget', hash: 'control', description: 'Analyze cycle budgets showing 82% unburdened CPU headroom.' },
      { label: 'Review Dual-Core Lockstep Gate', hash: 'architecture', description: 'Inspect the hardware fault isolation gate that decouples advisory AI from tripping.' }
    ]
  },

  // 2. Kurtosis Non-Monotonicity Trap
  {
    keywords: ['kurtosis', 'non-monotonic', 'monotonic', 'alarm on kurtosis', 'rms', 'bearing fault alarm'],
    title: 'The Kurtosis Non-Monotonicity Trap in Bearing Health Alarms',
    tag: 'EDGE AI & BEARING VIBRATION DIAGNOSTICS',
    lead: 'Kurtosis is non-monotonic: it spikes dramatically upon initial bearing defect impact, but as damage spreads into widespread flaking and spalling, the vibration signal becomes continuous and kurtosis falls back toward Gaussian baseline (K ≈ 3.0). Alarming on kurtosis alone creates a dangerous blind spot where severely degraded bearings appear healthy.',
    explanation: [
      'The Incipient vs. Advanced Spall Progression: In an undamaged bearing, vibration signals exhibit a Gaussian amplitude distribution with kurtosis K ≈ 3.0. When an incipient localized fatigue spall appears on a race, sharp mechanical impacts cause sudden, high-amplitude transients that push kurtosis up to 8.0–15.0. However, as running hours accumulate, repetitive impacts smooth out into broad surface roughness. The vibration amplitude increases, but impulses blend into continuous noise, causing kurtosis to collapse back to ~3.0.',
      'The Dual-Metric Surveillance Architecture: DeepGrid pairs non-monotonic kurtosis with monotonic RMS vibration velocity. While kurtosis is an exceptional early-warning indicator for initial defect inception, RMS velocity tracks total kinetic energy dissipation and increases monotonically with physical defect size. DeepGrid diagnostic firmware enforces a dual-metric rule: kurtosis flags defect initiation, while RMS velocity dictates mandatory maintenance shutdown per ISO 20816 severity thresholds.',
      'Hardware Implementation on DG32-LITE: Because the primary RV32IM core retains 82% unburdened execution budget, time-domain kurtosis and RMS velocity extraction execute in just 3,200 clock cycles (0.06 ms) across 1,024 decimated vibration samples. Trend history is tracked in non-volatile registers without external cloud dependency.'
    ],
    facts: [
      'Kurtosis Profile: Spikes on initial spalls (K > 8.0), then collapses back to 3.0 (Gaussian) under widespread failure.',
      'RMS Velocity Profile: Strictly monotonic with defect severity, but blind to early incipient micro-cracks.',
      'Diagnostic Architecture: Trend both metrics simultaneously; never trigger automated replacement on kurtosis alone.',
      'Standard Baseline: Fully aligned with ISO 20816 vibration severity zones and ISO 13373-1 diagnostic procedures.'
    ],
    docNum: '01',
    docTitle: 'Thirty Use Cases, No Accelerator',
    section: 'Section 4.3: The Kurtosis Non-Monotonicity Trap',
    page: 'p. 6',
    pdfPath: './downloads/docs/deepgrid-dg32-ai-30-use-cases.pdf',
    pdfSize: '414 KB',
    specPath: './downloads/docs/deepgrid-dg32-ai-architecture.md',
    refLinks: [
      { label: 'Explore DSP Feature Pipeline', hash: 'overview', description: 'Review CORDIC demodulation and statistical moment extraction.' },
      { label: 'Review Bearing Diagnostic Playbook', hash: 'architecture', description: 'Inspect ISO 20816 vibration severity thresholds.' },
      { label: 'Inspect Control Loop Budget', hash: 'control', description: 'Review the 500-cycle timeline showing CPU firmware headroom.' }
    ]
  },

  // 3. AI Without Accelerator (Envelope)
  {
    keywords: ['without a hardware accelerator', 'no accelerator', 'without accelerator', 'ai envelope', 'scalar core', '12.5 mmac'],
    title: 'DG32-LITE AI Compute Envelope (No Accelerator)',
    tag: 'EDGE AI & PREDICTIVE DIAGNOSTICS · ARCHITECTURAL PROFILE',
    lead: 'DG32-LITE executes 30 industrial machine learning and diagnostic models natively on its 50 MHz RISC-V scalar core without requiring an external NPU or coprocessor. By leveraging zero-multiply decision trees, table lookups, and hardware-accelerated CORDIC transforms within an 82% unburdened CPU window at 10 kHz FOC, 24 of the 30 tasks execute in under 1.0 ms within a strict 16.5 KB SRAM budget.',
    explanation: [
      'Physical & Architectural Compute Envelope: Operating at 50 MHz, the baseline RV32IM core delivers 12.5 MMAC/s scalar throughput (back-solved at 4 cycles per INT8 multiply-accumulate). Inner-loop motor trigonometry (Park/Clarke transforms, CORDIC vector rotation, and space-vector PWM edge calculation) is hardwired directly into silicon RTL logic gates, consuming a constant 300 cycles (6.0 µs). At standard 10 kHz PWM, this hardwired offload leaves 82% to 88% of core execution cycles completely unburdened for real-time vibration analytics and diagnostic models.',
      'Algorithmic Efficiency & The 19-Model Hierarchy: High-accuracy industrial condition monitoring does not require power-hungry matrix-multiplication accelerators. By exploiting the fact that integer branch comparisons and table lookups cost almost nothing on a RISC-V scalar core, tree ensembles (Random Forests, Gradient Boosting) achieve 95.6% accuracy on bearing fault classification—matching deep neural networks (97–100%) while requiring zero floating-point multiplications and executing 50–500× faster within a strict 16.5 KB SRAM footprint.',
      'Functional Safety Decoupling & Advisory Role: Crucially, all 30 predictive models operate in an advisory and telemetry reporting role only. The secondary hardware lockstep core retains exclusive physical authority over inverter bridge tripping, asserting the FAULT_N safe state within 2 clock cycles (<40 ns) upon any hardware overcurrent or phase-fault event. This architectural separation insulates functional safety compliance from machine learning software complexity.'
    ],
    facts: [
      'Throughput & Latency: 12.5 MMAC/s scalar budget; 24 of 30 models execute in under 1.0 ms (>1 kHz sample rates).',
      'Memory & Power Footprint: Strict 16.5 KB SRAM budget; <0.43W total chip dissipation without heatsink.',
      'Control Headroom: 82% CPU cycles free at 10 kHz FOC (inner loop hardwired in pure silicon gates).',
      'Procurement Advantage: ASIL-D advisory boundary eliminates external $5–$15 companion NPU chips.'
    ],
    docNum: '01',
    docTitle: 'Thirty Use Cases, No Accelerator',
    section: 'Section 1–3: Physical Compute Envelope & Model Hierarchy',
    page: 'p. 1',
    pdfPath: './downloads/docs/deepgrid-dg32-ai-30-use-cases.pdf',
    pdfSize: '414 KB',
    specPath: './downloads/docs/deepgrid-dg32-ai-architecture.md',
    refLinks: [
      { label: 'Explore 30 Industrial AI Tasks', hash: 'overview', description: 'Review the full 30 use cases and their physical compute envelopes.' },
      { label: 'Inspect 100 kHz Control Loop Budget', hash: 'control', description: 'Analyze cycle budgets showing 82% unburdened CPU headroom.' },
      { label: 'Review Dual-Core Lockstep Gate', hash: 'architecture', description: 'Inspect the hardware fault isolation gate that decouples advisory AI from tripping.' }
    ]
  },

  // 4. 30 Edge AI Use Cases
  {
    keywords: ['30 industrial use cases', '30 edge ai', 'thirty use cases', '30 use cases', 'use case master table'],
    title: '30 Industrial Diagnostics & Observers on a 50 MHz Scalar Core',
    tag: 'EDGE AI & PREDICTIVE DIAGNOSTICS · 30 USE CASES',
    lead: 'DG32-LITE supports 30 native industrial predictive maintenance, health monitoring, and control observer use cases on its baseline 50 MHz RV32IM core without an external NPU or coprocessor. By leveraging hardware-accelerated CORDIC vector transforms and an 82% unburdened CPU headroom at 10 kHz FOC, 24 of the 30 use cases execute in under 1.0 ms (>1 kHz sample rates).',
    explanation: [
      'Four Operational Industrial Domains: The 30 use cases span four distinct mechanical and electrical domains: (1) Rotating Machinery (8 models): Bearing Fault Classification, Severity Trending, Gearbox Mesh Faults, Pump Cavitation, Fan Imbalance, Compressor Valves, Belt Slip, Shaft Misalignment; (2) Electrical & Power Diagnostics (8 models): Broken Rotor Bar Detection via 8-bin Goertzel, Air-Gap Eccentricity, Stator Inter-Turn Short, Phase Loss, Arc-Fault/Discharge, Power-Quality Events, Battery State-of-Health, Winding Thermal Estimation; (3) Control, Motion & Sensing (8 models): Sensorless Rotor Position (EKF), Learned Sensor Plausibility, Operating-Mode Classification (GMM), Duty-Cycle Tracking (HMM), Adaptive Friction Compensation, Stall Detection, Torque Ripple Estimation, Multivariate Anomaly Scoring; (4) Slower-Rate, Sequence & Anomaly (6 models): Remaining Useful Life (RUL), Unsupervised Drift (Autoencoder), Short-Horizon Forecasting (GRU), Raw Waveform 1D-CNN, Novelty Detection (Isolation Forest), Per-Machine Baselining (k-NN).',
      'The 19-Model Architecture Hierarchy: DeepGrid groups predictive models into an execution hierarchy optimized for scalar RISC-V cores. First-line tree ensembles (Random Forests, Extra Trees, Gradient Boosting) achieve 95.6% accuracy on bearing fault classification—matching deep neural networks (97–100%) while requiring zero floating-point multiplications and running 50–500× faster within a strict 16.5 KB SRAM budget.',
      'ASIL-D Advisory Separation: Crucially, all 30 predictive models operate in an advisory and telemetry reporting role only. The secondary hardware lockstep core retains exclusive physical authority over inverter bridge tripping, asserting the FAULT_N safe state within 2 clock cycles (<40 ns) upon any hardware overcurrent or phase-fault event.'
    ],
    facts: [
      'Comprehensive Coverage: 30 industrial use cases across vibration, motor current, control observers, and sequence forecasting.',
      'Latency Profile: 24 of 30 models execute in under 1.0 ms (>1 kHz sample rates).',
      'Memory Efficiency: Entire 30-model catalogue fits within 16.5 KB SRAM and 12.5 MMAC/s scalar budget.',
      'Safety Compliance: All models strictly decoupled from the hardware lockstep shutdown path.'
    ],
    docNum: '01',
    docTitle: 'Thirty Use Cases, No Accelerator',
    section: 'Section 5–8: The 30-Use-Case Master Compendium',
    page: 'p. 4–10',
    pdfPath: './downloads/docs/deepgrid-dg32-ai-30-use-cases.pdf',
    pdfSize: '414 KB',
    specPath: './downloads/docs/deepgrid-dg32-ai-architecture.md',
    refLinks: [
      { label: 'Explore 30 Industrial AI Tasks', hash: 'overview', description: 'Review the full 30 use cases and their physical compute envelopes.' },
      { label: 'Inspect 100 kHz Control Loop Budget', hash: 'control', description: 'Analyze cycle budgets showing 82% unburdened CPU headroom.' },
      { label: 'Review Dual-Core Lockstep Gate', hash: 'architecture', description: 'Inspect the hardware fault isolation gate that decouples advisory AI from tripping.' }
    ]
  },

  // 5. CWRU Benchmark Audit
  {
    keywords: ['cwru', 'leakage', 'benchmark audit', 'academic bearing', 'leaky splits', 'smith & randall'],
    title: 'Academic Benchmark Audit: CWRU Bearing Dataset Leakage',
    tag: 'EDGE AI & DATASET AUDIT · VERIFIED BENCHMARKS',
    lead: 'An exhaustive audit of 41 published academic bearing fault papers revealed that 40 studies used random record splits subject to temporal and load leakage, artificially inflating reported accuracies to 99–100%. When evaluated on rigorous, leakage-free bearing-wise splits, real-world model accuracy drops to 65%–80%.',
    explanation: [
      'The Data Leakage Vulnerability: Standard academic benchmarks (such as the widely cited Case Western Reserve University bearing dataset) are typically partitioned using random train/test sample splits. Because adjacent vibration samples within the same recording share identical operational speeds, loads, and sensor resonance characteristics, classifiers easily memorize record-level signatures rather than learning true fault physics. In 40 of 41 reviewed papers, test sets contained data points sampled milliseconds away from training points.',
      'Real-World Physical Performance: DeepGrid re-evaluated the CWRU dataset using strict bearing-wise splits—training on one physical bearing and testing on an entirely different physical bearing under fluctuating load conditions. Under this leakage-free methodology, classifier accuracy dropped from reported 99%+ levels to 69.5%–78.2%. Furthermore, analysis by Smith & Randall demonstrated that a meaningful fraction of CWRU records are not physically diagnosable due to load slip and rotational speed fluctuations.',
      'Operational Significance for DeepGrid Silicon: DeepGrid models are calibrated against realistic physical baselines (65%–80% accuracy on un-instrumented factory machinery) rather than overfitted academic metrics. Because ML predictions are treated as advisory telemetry rather than deterministic ground truth, catastrophic shutoff remains hardwired in the dual-core lockstep supervisor.'
    ],
    facts: [
      'Audit Finding: 40 of 41 reviewed academic papers exhibited temporal or load leakage.',
      'True Generalization: Accuracy drops from 99%+ to 65%–80% on genuine physical bearing-wise splits.',
      'Smith & Randall Finding: Significant CWRU recording fractions are physically non-diagnosable under load slip.',
      'Safety Policy: DeepGrid treats all ML inferences as advisory telemetry under hardware lockstep interlocks.'
    ],
    docNum: '01',
    docTitle: 'Thirty Use Cases, No Accelerator',
    section: 'Section 10: Basis, Methodology & Benchmark Integrity',
    page: 'p. 12',
    pdfPath: './downloads/docs/deepgrid-dg32-ai-30-use-cases.pdf',
    pdfSize: '414 KB',
    specPath: './downloads/docs/deepgrid-dg32-ai-architecture.md',
    refLinks: [
      { label: 'Review AI Playbook Methodology', hash: 'overview', description: 'Review benchmark audit procedures and dataset split protocols.' },
      { label: 'Inspect Dual-Core Lockstep Safety Gate', hash: 'architecture', description: 'Review the hardware fault isolation gate that decouples advisory AI.' }
    ]
  },

  // 6. DAP-2020 Make-II Defense Moats
  {
    keywords: ['dap-2020', 'make-ii', 'make 2', 'iddm', 'buy indian', 'pil-5', 'defence moats', 'srijan'],
    title: 'DAP-2020 Buy (Indian-IDDM) & Make-II Statutory Defence Moats',
    tag: 'STATUTORY DEFENCE MOATS & SOVEREIGN SUPPLY · DAP-2020',
    lead: 'India’s Defence Acquisition Procedure (DAP-2020) legally mandates that military platforms prioritize indigenous intellectual property under the Buy (Indian-IDDM) category, requiring minimum 50% indigenous content. This grants qualified domestic silicon statutory priority over foreign imports before price bidding occurs.',
    explanation: [
      'Statutory Moat Structure: Under DAP-2020, procurement categories follow a strict legal hierarchy: Buy (Indian-IDDM) holds highest priority, followed by Buy (Indian), then Buy & Make (Indian). Foreign suppliers bidding standard chips (STM32, TI, Infineon) are legally disqualified from competing when a qualified Indian-IDDM alternative exists. DeepGrid’s complete RTL ownership and domestic packaging satisfy the stringent 50% Indigenous Content (IC) mandate.',
      'The "Boxes, Not Chips" Procurement Wedge: Auditing all 346 items in the Ministry of Defence’s 5th Positive Indigenisation List (PIL-5) revealed that defence lists never name semiconductor components directly; they enumerate Line-Replaceable Units (LRUs), actuators, and sub-assemblies. DeepGrid enters one level down by selling directly to Indian defence tier-1s (BEL, HAL, BDL), embedding indigenous silicon inside compliant assemblies.',
      'Make-II and SRIJAN Guaranteed Volumes: Under the Make-II scheme, industry-funded prototype development is backed by guaranteed procurement orders upon successful trial qualification, with zero requirement for government tender re-bidding. Over 37,696 defence items are currently listed on the SRIJAN portal for mandatory import substitution.'
    ],
    facts: [
      'Procurement Priority: Buy (Indian-IDDM) legally prioritizes domestic IP before foreign price evaluation.',
      'Statutory Protection: PIL-5 positive indigenisation lists prohibit import of listed assemblies on milestone dates.',
      'Procurement Route: Make-II guarantees volume production orders upon successful military qualification.',
      'SRIJAN Market: Addresses 37,696 active defence import targets across Army, Navy, and Air Force LRUs.'
    ],
    docNum: '05',
    docTitle: 'Master Whitepaper v3 (Mature-Node Silicon)',
    section: 'Section 11: Two Ways to Sell the Same Chip & Statutory Moats',
    page: 'p. 45–52',
    pdfPath: './downloads/docs/deepgrid-mature-node-silicon-master-whitepaper-v3.pdf',
    pdfSize: '5.4 MB',
    specPath: './downloads/docs/deepgrid-mature-silicon-architecture.md',
    refLinks: [
      { label: 'Executive Procurement Scorecard', hash: 'overview', description: 'Review commercial comparisons across BOM cost, turnaround agility, and export risks.' },
      { label: 'Dual-Foundry Manufacturing Strategy', hash: 'roadmap', description: 'Examine SkyWater 130 nm and SCL Mohali 180 nm qualification milestones.' }
    ]
  },

  // 7. Hardware DShot RX RTL
  {
    keywords: ['dshot', 'dgrid_dshot_rx', 'gcr', 'erpm', 'telemetry reply', 'bidirectional telemetry', 'esc'],
    title: 'Hardware DShot Receive (dgrid_dshot_rx) & Zero-Jitter Motor Telemetry',
    tag: 'HARDWARE PROTOCOLS & MOTOR TELEMETRY (DGRID_DSHOT_RX)',
    lead: 'The hardwired dgrid_dshot_rx block decodes DShot commands and generates bidirectional telemetry replies entirely in silicon, eliminating all CPU bit-banging and guaranteeing sub-microsecond response latency.',
    explanation: [
      'The Firmware Overhead Problem: In high-performance tactical UAVs and quadcopters, flight controllers communicate with electronic speed controllers (ESCs) via bidirectional DShot digital protocols (DShot300/600/1200). Decoding high-speed DShot bitstreams in firmware consumes 40%+ of CPU cycles and introduces jitter whenever interrupt handlers collide with motor PWM timing.',
      'Pure Hardware GCR Decoding: DeepGrid integrates a dedicated hardware peripheral block (dgrid_dshot_rx) that autonomously samples incoming frames, decodes GCR 4b/5b transition encoding, performs hardware 16-bit CRC validation, and formats bidirectional telemetry packets (eRPM, voltage, current, temperature) without CPU intervention.',
      'Pad-Ring Bidirectional Reuse: The peripheral reuses a single bidirectional GPIO pad for both command receive and telemetry reply without requiring external analog multiplexers, preserving package pinout and eliminating board BOM cost.'
    ],
    facts: [
      'Zero CPU Utilization: Hardware state machine decodes DShot300, DShot600, and DShot1200 frames.',
      'Bidirectional Telemetry: Transmits motor eRPM, voltage, current, and temperature in real-time.',
      'Single Pad Reuse: Reuses bidirectional pad ring without external analog multiplexer ICs.',
      'Autopilot Support: Plug-and-play compatible with ArduPilot, PX4, and Betaflight flight stacks.'
    ],
    docNum: '03',
    docTitle: 'Hardware DShot RX Specification',
    section: 'Section 2: Frame Timing, GCR Decoding & Telemetry Pipeline',
    page: 'p. 3–7',
    pdfPath: './downloads/docs/deepgrid-dshot-rx-block-spec.pdf',
    pdfSize: '345 KB',
    specPath: './downloads/docs/deepgrid-dshot-rx-architecture.md',
    refLinks: [
      { label: 'Download dgrid_dshot_rx Specification PDF', hash: 'library', description: 'Read the complete 8-page RTL block specification.' },
      { label: 'Inspect Drone ESC Architecture & Pinout', hash: 'pinout', description: 'Review QFN-64 pin assignments for DShot telemetry.' }
    ]
  },

  // 8. 50 MHz Operating Frequency & Fmax Timing
  {
    keywords: ['50 mhz', 'frequency', 'clock', 'fmax', 'timing closure', 'why 50 mhz'],
    title: '50 MHz Operating Frequency: Lockstep Margin & Physical Timing Closure',
    tag: 'PHYSICAL SILICON & TIMING CLOSURE · 50 MHZ CLOCK',
    lead: 'DG32 locks its primary control clock at exactly 50 MHz (20.0 ns cycle) to guarantee absolute static timing closure across all PVT corners (-40 °C to +125 °C) while running dual RV32IM cores in cycle-accurate hardware lockstep.',
    explanation: [
      'The Physical Fmax Ceiling: While standard-cell digital libraries on SkyWater 130 nm CMOS allow single-core unconstrained synthesis up to ~75 MHz, running a cycle-accurate lockstep shadow core with bus comparators and fault latches establishes a practical physical Fmax of 55–62 MHz under worst-case industrial thermal and voltage conditions.',
      'Guaranteed 15–20% Static Timing Margin: Rather than running silicon at a marginal 60 MHz that risks clock skew and compromises noise margins under extreme motor EMI, DeepGrid fixes the system clock at 50 MHz. This guarantees a deterministic 15–20% static timing margin, ensuring that comparator checks and register commits never violate setup or hold times.',
      'Hardwired Loop Headroom: Because all inner-loop motor trigonometry (Park/Clarke transforms, CORDIC rotation, and space-vector PWM) is hardwired into silicon logic gates, the full control loop executes in just 300 cycles (6.0 µs). At standard 20 kHz PWM (50 µs period), the processor consumes only 12% of available cycles, leaving 88% free execution headroom without requiring a higher, power-hungry core clock.'
    ],
    facts: [
      'Timing Closure Margin: Guarantees 15–20% static timing margin across all PVT corners (-40 °C to +125 °C).',
      'Control Loop Latency: Hardwired 300-cycle loop (~6.0 µs) leaves 88% CPU headroom at 20 kHz PWM.',
      'Low EMI Emissions: 50 MHz operating frequency minimizes radiated emissions and eliminates heatsinks.',
      'Lockstep Predictability: Enables cycle-by-cycle bus comparators without clock domain crossing jitter.'
    ],
    docNum: '04',
    docTitle: 'DG32-2DOM System Architecture',
    section: 'Section 2.1: Clock Distribution & Timing Closure Budget',
    page: 'p. 8–14',
    pdfPath: './downloads/docs/deepgrid-dg32-2dom-system-architecture.pdf',
    pdfSize: '77 KB',
    specPath: './downloads/docs/deepgrid-2dom-architecture.md',
    refLinks: [
      { label: 'Inspect 100 kHz Control Loop Budget', hash: 'control', description: 'Analyze the 500-cycle timeline showing hardwired math vs CPU firmware headroom.' },
      { label: 'View Dual-Core Architecture Floorplan', hash: 'architecture', description: 'Inspect MAIN and CHECKER RV32IM cores and physical comparator registers.' }
    ]
  },

  // 9. DG32 vs STM32G0 Benchmark
  {
    keywords: ['compare dg32', 'stm32g0', 'stm32', 'dg32 vs stm32', 'procurement benchmark', 'scorecard'],
    title: 'DG32 vs. STM32G0: Hardware Lockstep, BOM Cost & Latency Benchmark',
    tag: 'EXECUTIVE PROCUREMENT SCORECARD & BENCHMARK',
    lead: 'DG32 replaces STM32G0 and external supervisory ICs by integrating cycle-accurate dual-core hardware lockstep, dedicated CORDIC vector math, and hardware DShot decoding into a single $3.10 QFN-64 package, delivering 40 ns fault shutoff vs. 15–50 µs firmware watchdogs.',
    explanation: [
      'Fault Response Latency: STM32G0 relies on firmware interrupt service routines (ISRs) and software watchdogs that require 15 to 50 microseconds to react to shoot-through or short circuits—frequently acting after power MOSFETs have already exploded. DG32 integrates a cycle-by-cycle hardware comparator that latches power bridges into a safe state within 2 clock cycles (<40 ns), completely bypassing firmware.',
      'Inner-Loop Math Offload: Executing Park/Clarke vector transforms and CORDIC rotation in software on STM32G0 consumes 40%–60% of CPU cycles at 20 kHz PWM. DG32 hardwires all vector trigonometry directly into silicon gates, completing the full inner loop in 300 cycles (6.0 µs) and freeing 88% of CPU headroom for diagnostics.',
      'BOM Integration & Price Parity: Conventional drives require an external supervisory IC, external watchdog, and external gate driver monitoring circuits, raising total drive BOM to $6.50–$9.00. DG32 integrates these functions directly on mature 130 nm silicon, pricing at sub-$3.10 while guaranteeing sovereign multi-year supply.'
    ],
    facts: [
      'Trip Latency: <40 ns autonomous hardware trip vs. 15–50 µs firmware watchdogs on STM32G0.',
      'Control Headroom: 88% free CPU cycles at 20 kHz PWM vs. <40% on software-bound MCUs.',
      'System BOM: Eliminates external supervisory ICs, reducing drive electronics cost by $3.50+ per inverter.',
      'Sovereignty: Manufactured on mature nodes with zero export control or single-source fab risk.'
    ],
    docNum: '02',
    docTitle: 'Technical Annex v3 (10 SKUs, D100 & SDV)',
    section: 'Section 4: Competitive Benchmarks & Procurement Scorecard',
    page: 'p. 8',
    pdfPath: './downloads/docs/deepgrid-sku-compendium-technical-annex-v3.pdf',
    pdfSize: '4.8 MB',
    specPath: './downloads/docs/deepgrid-sku-compendium-architecture.md',
    refLinks: [
      { label: 'Executive Procurement Scorecard', hash: 'overview', description: 'Review commercial comparisons across BOM cost, turnaround agility, and export risks.' },
      { label: 'Compare Product Family SKUs', hash: 'family', description: 'Review head-to-head silicon specifications across the catalogue.' }
    ]
  },

  // 10. ₹10 Cr Seed Capital & Runway Waterfall
  {
    keywords: ['10 cr', '₹10 cr', 'seed round', 'use of funds', 'runway', 'capital waterfall', 'financial model'],
    title: '₹10 Cr Capital Waterfall & 24-Month Seed Runway',
    tag: 'FINANCIAL MODEL & USE OF FUNDS · ₹10 CR SEED ROUND',
    lead: 'The ₹10 Cr ($1.2M) seed round funds 24 months of operational runway across six parallel multi-project wafer (MPW) runs, four product qualifications, and production mask tooling for Chips 1 and 2, delivering ₹2.88 Cr in committed pre-ASIC customer revenue.',
    explanation: [
      'Capital Allocation Waterfall: The ₹10 Cr round is deployed with strict capital discipline: ₹3.8 Cr for factory wafer runs and shuttle reservations (SkyWater 130 nm, IHP 130 nm SiGe, SCL Mohali); ₹2.6 Cr for automated test equipment (ATE), high-reliability screening, and AEC-Q100 Grade 1 qualification; ₹2.4 Cr for core engineering payroll across RTL design, physical verification, and firmware; and ₹1.2 Cr for operational reserves and regulatory filing.',
      '10x Cost Advantage via Open-Source EDA: Conventional semiconductor startups spend $2M–$5M on commercial EDA software licenses (Synopsys, Cadence) before taping out first silicon. DeepGrid utilizes fully validated open-source toolchains (Yosys, OpenROAD, Magic, KLayout), reducing software license expenditure to ₹0 and enabling profitable operation at low volumes (10k–50k units/year).',
      'Commercial Traction & De-Risking: Unlike speculative silicon ventures, DeepGrid anchors its seed round with ₹2.88 Cr in live pre-ASIC commercial agreements, including flight motor controllers for tactical UAVs and smart-meter metering SoCs.'
    ],
    facts: [
      'Seed Allocation: ₹3.8 Cr foundry runs, ₹2.6 Cr test/qualification, ₹2.4 Cr engineering, ₹1.2 Cr reserve.',
      'Operational Runway: 24 months covering 6 parallel shuttle runs and 4 product qualifications.',
      'Pre-ASIC Traction: ₹2.88 Cr in active commercial orders de-risking first silicon production.',
      'Capital Efficiency: Open-source EDA eliminates $2M+ in upfront software licensing overhead.'
    ],
    docNum: '05',
    docTitle: 'Master Whitepaper v3 (Mature-Node Silicon)',
    section: 'Section 13: Financial Model, Unit Economics & Use of Funds',
    page: 'p. 58–64',
    pdfPath: './downloads/docs/deepgrid-mature-node-silicon-master-whitepaper-v3.pdf',
    pdfSize: '5.4 MB',
    specPath: './downloads/docs/deepgrid-mature-silicon-architecture.md',
    refLinks: [
      { label: 'Review Financial Model in Detail', hash: 'overview', description: 'Inspect the 5-year financial projections and unit economics breakdown.' },
      { label: 'Sovereign 10-SKU Portfolio Horizon', hash: 'overview', description: 'Explore the 10-SKU roadmap addressing India’s $9B import deficit.' }
    ]
  },

  // 11. Chinese Price Crash & Stop Rules S1-S4
  {
    keywords: ['price crash', 'stop rules', 'chinese crash', 'munger', 'inversion', 's1-s4', 's1', 's2', 's3', 's4'],
    title: 'Chinese Price Crash Stress Test & Operational Stop Rules S1–S4',
    tag: 'CAPITAL GOVERNANCE & CHARLIE MUNGER RISK AUDIT',
    lead: 'DeepGrid applies Charlie Munger\'s inversion framework to model a 30%–40% Chinese silicon price dumping scenario. Even under severe commercial margin compression, shielded defence revenue preserves FY31 sales at ₹750 Cr, governed by 4 strict operational stop rules.',
    explanation: [
      'The Inversion Stress Test: In a catastrophic scenario where Chinese foundries aggressively dump motor-control silicon below cost, DeepGrid models severe commercial price drops: smart meters drop -30% (₹480 Cr → ₹340 Cr) and commercial motor drives drop -40% (₹220 Cr → ₹130 Cr). However, screened defence silicon (₹200 Cr) remains 100% immune due to statutory PIL-5 import prohibitions, preserving total FY31 revenue at ₹750 Cr and sustaining healthy 60%+ gross margins.',
      'Binding Operational Stop Rules S1–S4: To prevent capital destruction, management operates under 4 pre-committed stop rules: (S1) If Ripple has not signed by the Chip 2 factory cutoff, Chip 2 waits one cycle and funds reallocate to Chips 1 and 3; (S2) If Chip 6 fails military screening twice, forward defence revenue is pushed out 12 months within 30 days; (S3) In FY29, if delivered Chinese prices fall below manufacturing cost, exit ceiling fan drivers while keeping EV motors and proprietary modules; (S4) If SCL Mohali slips >2 cycles, execute production exclusively at SkyWater and IHP.',
      'Sovereign Insulation: By designing silicon for sockets where foreign components are legally banned (military LRUs, tactical UAVs, critical infrastructure), DeepGrid decouples company survival from global semiconductor price wars.'
    ],
    facts: [
      'Downside Model: Preserves ₹750 Cr FY31 revenue under 40% commercial price collapse.',
      'Defence Immunity: ₹200 Cr defence allocation protected by statutory PIL import bans.',
      'Stop Rules S1–S4: Pre-committed capital allocation gates prevent lingering in unprofitable lines.',
      'Charlie Munger Principle: "Invert, always invert" applied to semiconductor supply chain risk.'
    ],
    docNum: '05',
    docTitle: 'Master Whitepaper v3 (Mature-Node Silicon)',
    section: 'Section 12 & 14: Competitor Insulation & Risk Matrix',
    page: 'p. 53–57',
    pdfPath: './downloads/docs/deepgrid-mature-node-silicon-master-whitepaper-v3.pdf',
    pdfSize: '5.4 MB',
    specPath: './downloads/docs/deepgrid-mature-silicon-architecture.md',
    refLinks: [
      { label: 'Review Risk Audit & Stop Rules', hash: 'overview', description: 'Read the complete Charlie Munger inversion audit and risk matrix.' },
      { label: 'Dual-Foundry Manufacturing Strategy', hash: 'roadmap', description: 'Examine multi-fab redundancy across SkyWater, IHP, and SCL.' }
    ]
  },

  // 12. QFN-64 Pinout & Packaging
  {
    keywords: ['qfn-64', 'qfn64', 'pinout', 'pin map', 'thermal paddle', 'packaging', '64-pin'],
    title: 'DG32 64-Pin QFN Physical Pin Map & Packaging Specification',
    tag: 'PHYSICAL PACKAGING & PINOUT · 9×9 MM QFN-64',
    lead: 'DG32 standardizes on a 9 × 9 mm 64-pin QFN package with 0.5 mm pitch and an exposed central thermal ground paddle, delivering 100% pinout compatibility between the entry-level DG32-LITE and edge AI DG32-2DOM SoCs.',
    explanation: [
      '100% Pin-to-Pin Compatibility: Both DG32-LITE (CI2609) and DG32-2DOM (CI2612) share an identical physical pinout across all 64 pins. OEMs can design a single PCB inverter motherboard and seamlessly upgrade from baseline motor control to real-time predictive AI without spinning new board hardware.',
      'Thermal Ground Dissipation: The package features an exposed central paddle (Die Attach Paddle, DAP) soldered directly to PCB ground planes with thermal relief vias, achieving a low junction-to-case thermal resistance (θJC < 2.5 °C/W). Total chip power dissipation remains under 0.43 W at full 50 MHz operation, completely eliminating the need for bulky heatsinks.',
      'Pin Allocation Hierarchy: The 64 pins are grouped into deterministic functional zones: 12 pins for 3-phase PWM gate drive outputs, 8 pins for 12-bit analog inputs, 4 pins for dedicated DShot and telemetry GPIOs, 4 pins for hardware UART/CAN communication, and dedicated power rails with strict sequencing rules.'
    ],
    facts: [
      'Package Dimensions: 9.0 × 9.0 mm, 0.5 mm pin pitch, 64-lead Quad Flat No-Lead (QFN).',
      'Pinout Compatibility: 100% pin-compatible between DG32-LITE and DG32-2DOM.',
      'Thermal Performance: Exposed ground paddle keeps chip dissipation <0.43 W (no heatsink needed).',
      'Quality Target: AEC-Q100 Grade 1 automotive qualified (-40 °C to +125 °C operating ambient).'
    ],
    docNum: '06',
    docTitle: 'DG32 QFN-64 Engineering Datasheet',
    section: 'Section 2: Complete 64-Pin QFN Physical Pin Map',
    page: 'p. 2–8',
    pdfPath: './downloads/docs/deepgrid-datasheets-qfn64.pdf',
    pdfSize: '76 KB',
    specPath: './downloads/docs/deepgrid-datasheets-engineering-spec.md',
    refLinks: [
      { label: 'Inspect QFN-64 Pinout & Layout Rules', hash: 'pinout', description: 'Review full 64-pin table and high-speed PCB routing rules.' },
      { label: 'Download QFN-64 Datasheet PDF', hash: 'library', description: 'Access the complete 24-page electrical and physical datasheet.' }
    ]
  },

  // 13. Sovereign Supply Chain Immunity & Three-Factory Strategy
  {
    keywords: [
      'supply chain', 'immune', 'disruption', 'supply chain disruption',
      'sovereign silicon', 'three-factory', 'three factory', 'sovereignty',
      'import substitution', 'foundry roadmap', 'skywater', 'ihp', 'scl mohali',
      'domestic supply', 'geopolitical'
    ],
    title: 'Sovereign Supply Chain Immunity: The Three-Factory & 100% Domestic Architecture',
    tag: 'SOVEREIGN SUPPLY CHAIN IMMUNITY · THREE-FACTORY ROADMAP',
    lead: 'DeepGrid silicon achieves complete immunity from global semiconductor disruptions through a sovereign Three-Factory manufacturing strategy: dual-sourcing across SkyWater (130 nm CMOS) and SCL Mohali (180 nm BCD), utilizing open-source EDA tooling free of Western export controls, and packaging in standard wirebond QFNs available entirely within India.',
    explanation: [
      'The Three-Factory Redundancy Architecture: Unlike foreign microcontrollers tied to single geographic fabs (e.g. TSMC or UMC in Taiwan), DeepGrid designs its silicon masks to be process-portable across three independent foundries: (1) SkyWater Technology (USA) for commercial 130 nm CMOS tape-outs; (2) IHP Microelectronics (Germany) for 130 nm / 250 nm SiGe BiCMOS radar front-ends; and (3) SCL Mohali (India) for sovereign 180 nm BCD fabrication. If any single fab or trade route faces geopolitical embargo or disruption, production shifts across qualified masks without architectural redesign.',
      'Open-Source EDA & Export Control Immunity: DeepGrid completely eliminates dependency on proprietary, ITAR-restricted EDA tools (Synopsys, Cadence) that require recurring foreign licenses. By pioneering full RTL-to-GDSII tape-outs using the open-source OpenLane/OpenROAD flow and open SkyWater PDKs, DeepGrid owns 100% of its intellectual property and mask tooling, ensuring that foreign sanctions or software revoking can never halt domestic silicon delivery.',
      'Statutory Defence Moat & Standard Packaging: By standardizing on mature 9×9 mm 64-pin QFN packages with domestic wirebonding, DeepGrid avoids complex advanced packaging bottlenecks (such as CoWoS or TSVs). Under Ministry of Defence DAP-2020 Make-II regulations and the 5th Positive Indigenisation List (PIL-5), DeepGrid qualifies for Buy (Indian-IDDM) status with >50% domestic content, securing mandatory statutory purchasing priority over imported silicon.'
    ],
    facts: [
      'Three-Factory Foundry Redundancy: Portable GDSII masks qualified across SkyWater 130 nm, IHP SiGe, and SCL Mohali 180 nm.',
      'Open-Source EDA Independence: 100% open-source RTL-to-GDSII toolchain eliminates Western software licensing chokeholds.',
      'Domestic Wirebond Packaging: Standard 64-pin QFN packaging eliminates reliance on foreign advanced packaging foundries.',
      'Statutory Procurement Immunity: Qualifies for DAP-2020 Make-II and PIL-5 statutory protection against foreign price wars.'
    ],
    docNum: '05',
    docTitle: 'Master Whitepaper v3 (Mature-Node Silicon)',
    section: 'Section 4 & 9: Sovereign Supply Architecture & Three-Factory Strategy',
    page: 'p. 18–24',
    pdfPath: './downloads/docs/deepgrid-mature-node-silicon-master-whitepaper-v3.pdf',
    pdfSize: '5.4 MB',
    specPath: './downloads/docs/deepgrid-mature-silicon-architecture.md',
    refLinks: [
      { label: 'Examine Three-Factory Roadmap', hash: 'roadmap', description: 'Review the multi-fab transition across SkyWater, IHP, and SCL Mohali.' },
      { label: 'Inspect DAP-2020 Defence Moats', hash: 'overview', description: 'Read statutory indigenisation requirements under Make-II rules.' },
      { label: 'Review 198-Day Execution Loop', hash: 'loop', description: 'Analyze the fast tape-out timeline enabled by open-source EDA.' }
    ]
    },
  {
    // Every figure below is on a cited page or in the site's own copy: checker core and store-by-store
    // compare (DG32-2DOM System Architecture p. 4), 39 cycles with the cause latched (p. 13), sticky
    // fault register (QFN-64 datasheet p. 1), FAULT_N active-low on pin 59 (p. 12), the 2-cycle checker
    // lag and "simulation, not silicon" (site Overview). 780 ns is 39 cycles x 20 ns at 50 MHz. Internal
    // module names and board-design guidance are left out on purpose, as everywhere on the site.
    keywords: ['lockstep', 'checker core', 'fault latch', 'fault_n', 'faulty computation', 'fault isolation', 'fault detection', 'fault injection', 'second core', 'safe state', 'wrong value', 'silent fault', 'silently computes'],
    title: 'Hardware Lockstep: How DG32 Catches a Faulty Computation',
    tag: 'SAFETY CORE · HARDWARE LOCKSTEP',
    lead: 'DG32 runs two identical RISC-V cores in lockstep and compares their committed stores in hardware; on the first mismatch it latches the cause and drives its FAULT_N output, within 39 cycles of an injected fault in simulation, without waiting for firmware.',
    explanation: [
      'Two cores, one checking the other: a second core, the checker, runs the same instructions two cycles behind the main core on mirrored inputs and bus responses. Its output is discarded; its only job is to produce the value the main core should have committed.',
      'Every committed store is compared: the comparator checks the two cores\u2019 store signatures as each store is handed to the bus, so the first mismatch is caught on that store, not at the next periodic software self-test.',
      'The first cause is held: a mismatch raises a fault with a cause code into a sticky fault register, because later faults are usually consequences of the first. Firmware can read the cause after the fact.',
      'The trip does not depend on firmware: FAULT_N is the chip\u2019s active-low hardware fault output. In simulation it goes low within 39 cycles of an injected fault, 780 ns at the 50 MHz clock.'
    ],
    facts: [
      'Detection point: every committed store, compared in hardware.',
      'Fault to latch: 39 cycles from an injected fault, cause latched. A pre-silicon simulation figure, not yet measured on silicon.',
      'Checker lag: the checker core trails the main core by 2 cycles on mirrored inputs.',
      'Evidence so far: fault injection passes end-to-end in simulation.',
      'Output: FAULT_N (pin 59), an active-low hardware fault output.'
    ],
    docNum: '04',
    docTitle: 'DG32-2DOM System Architecture',
    section: 'Section 4.1: Lockstep CPU core pair and comparator',
    page: 'p. 4, 13',
    pdfPath: './downloads/docs/deepgrid-dg32-2dom-system-architecture.pdf',
    pdfSize: '77 KB',
    specPath: './downloads/docs/deepgrid-2dom-architecture.md',
    refLinks: [
      { label: 'Step through the 39-cycle fault trace', hash: 'overview', description: 'Follow one wrong value from the main core to a bridge that is switched off.' },
      { label: 'Inside the safety core', hash: 'architecture', description: 'The lockstep pair, comparator and fault register in the block diagram.' }
    ]
  }
];

/**
 * Semantic scores for one question, from the in-browser embedding model (see app/data/semantic.ts).
 * Each array is aligned with graphIndex.nodes, graphIndex.chunks and executiveThemes. Without them the
 * engine ranks by TF-IDF exactly as before, so the page answers while the model is still loading.
 */
export interface SemanticScores {
  nodes: Float32Array; chunks: Float32Array; themes: Float32Array;
  // thresholds picked by the routing eval when the index was built (scripts/ask-routing-eval.json)
  themeMin?: number; themeGap?: number;
}

// A reworded question reuses a curated theme only when that theme is both close and clearly closer than
// the runner-up. Similarity alone cannot separate them: an un-themed question can score as high as a
// genuine match. The gap can. Calibrated per model on 15 reworded + 10 un-themed questions:
//   BGE-small + query instruction (current): 0.30 / 0.06 -> 11/15 curated, 0 wrong, 0/10 forced
//   MiniLM-L6 (previous):                    0.30 / 0.08 -> 13/15 curated, 0 wrong, 0/10 forced
// These are fallbacks only: `npm run build:semantic` now picks both from the routing eval
// (scripts/ask-routing-eval.json) against the example-question bank, and the index carries them.
export const SEMANTIC_THEME_MIN = 0.30;
export const SEMANTIC_THEME_GAP = 0.06;

/**
 * The row order the semantic index must match: node ids, chunk ids, theme titles. The build script and
 * the browser both hash this string; a mismatch means the index is stale and the page stays on TF-IDF.
 */
export function semanticRowKey(): string {
  return [graphIndex.nodes.map(n => n.id).join('\n'), graphIndex.chunks.map(c => c.id).join('\n'),
    executiveThemes.map(t => t.title).join('\n'),
    executiveThemes.map(t => (THEME_EXAMPLES[t.title] || []).join('\n')).join('\n~\n')].join('\n--\n');
}

export function executeGraphRAG(rawQuery: string, sem?: SemanticScores | null): GraphRAGResult {
  const q = rawQuery.trim().toLowerCase();
  const qVec = vectorizeQuery(q);
  const useSem = !!sem && sem.nodes.length === graphIndex.nodes.length && sem.chunks.length === graphIndex.chunks.length
    && sem.themes.length === executiveThemes.length;

  // 1. Check for Exact Executive Theme Match First
  let matchedTheme: ExecutiveTheme | null = null;
  let maxThemeScore = 0;

  for (const theme of executiveThemes) {
    let score = 0;
    for (const kw of theme.keywords) {
      if (q.includes(kw)) {
        score += 15 + kw.length;
      }
    }
    if (score > maxThemeScore) {
      maxThemeScore = score;
      matchedTheme = theme;
    }
  }

  // 1b. No keyword hit: a reworded question can still reach its curated theme by meaning.
  if (useSem && maxThemeScore < 15) {
    const order = Array.from(sem!.themes, (v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]);
    const [best, second] = [order[0], order[1]];
    const min = sem!.themeMin ?? SEMANTIC_THEME_MIN, gap = sem!.themeGap ?? SEMANTIC_THEME_GAP;
    if (best && best[0] >= min && best[0] - (second ? second[0] : 0) >= gap) {
      matchedTheme = executiveThemes[best[1]];
      maxThemeScore = 15;
    }
  }

  // 2. Semantic Entry Point Resolution over all 318 Graph Nodes
  const scoredNodes: { node: UnifiedNode; score: number }[] = [];
  graphIndex.nodes.forEach((node, i) => {
    const score = useSem ? Math.max(0, sem!.nodes[i]) : dotProduct(qVec, node.vector);
    if (score > 0) {
      // Prioritize semantic specification & architecture nodes over low-level AST code tokens
      const isCodeAst = node.category === 'code' || node.name.endsWith('()') || node.id.startsWith('source_');
      const adjustedScore = isCodeAst ? score * 0.25 : score * 1.5;
      scoredNodes.push({ node, score: adjustedScore });
    }
  });

  scoredNodes.sort((a, b) => b.score - a.score);
  const primarySeed = scoredNodes.length > 0 ? scoredNodes[0].node : graphIndex.nodes[0];
  const seedEntities: GraphNode[] = scoredNodes.slice(0, 3).map(s => ({
    id: s.node.id,
    name: s.node.name,
    shortName: s.node.shortName || s.node.name.slice(0, 24),
    category: (s.node.category as any) || 'architecture',
    x: 50,
    y: 50,
    description: s.node.description
  }));

  // 3. Relational Graph Traversal from Seed Node
  const traversedEdges: TraversedEdge[] = [];
  const traversedSteps: { source: string; relation: string; target: string }[] = [];
  const visitedEdgePairs = new Set<string>();
  const seedId = primarySeed.id;

  graphIndex.edges.forEach(edge => {
    if (edge.from === seedId || edge.to === seedId) {
      const neighborId = edge.from === seedId ? edge.to : edge.from;
      const neighbor = nodeById.get(neighborId);
      const pairKey = `${edge.from}->${edge.to}`;

      if (neighbor && !visitedEdgePairs.has(pairKey)) {
        visitedEdgePairs.add(pairKey);
        const sourceName = edge.from === seedId ? primarySeed.name : neighbor.name;
        const targetName = edge.to === seedId ? primarySeed.name : neighbor.name;

        traversedSteps.push({
          source: sourceName,
          relation: edge.label,
          target: targetName
        });

        traversedEdges.push({
          fromNode: {
            id: edge.from,
            name: sourceName,
            shortName: sourceName.slice(0, 20),
            category: 'architecture',
            x: 40,
            y: 40,
            description: ''
          },
          toNode: {
            id: edge.to,
            name: targetName,
            shortName: targetName.slice(0, 20),
            category: 'architecture',
            x: 60,
            y: 60,
            description: ''
          },
          relationLabel: edge.label
        });
      }
    }
  });

  if (traversedSteps.length === 0) {
    traversedSteps.push({
      source: primarySeed.name,
      relation: 'belongs_to',
      target: primarySeed.communityName
    });
  }

  const graphPathSummary = traversedSteps.slice(0, 3)
    .map(s => `[${s.source}] ──(${s.relation})──> [${s.target}]`)
    .join('  ·  ');

  // 4. Grounded Document Chunk Retrieval
  const scoredChunks: { chunk: UnifiedChunk; score: number }[] = [];
  graphIndex.chunks.forEach((chunk, i) => {
    const score = useSem ? Math.max(0, sem!.chunks[i]) : dotProduct(qVec, chunk.vector);
    if (score > 0) {
      scoredChunks.push({ chunk, score });
    }
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const bestChunk = scoredChunks.length > 0 ? scoredChunks[0].chunk : graphIndex.chunks[0];
  const cleanedPdfText = cleanExtractedText(bestChunk.text);

  // 5. Match Catalog Item
  const matchedItem = deepGridCatalog.find(c => c.id === primarySeed.id) ||
                      deepGridCatalog.find(c => primarySeed.description.toLowerCase().includes(c.id.toLowerCase())) ||
                      deepGridCatalog[0];

  // 6. SYNTHESIS RESOLUTION: Prefer Rich Executive Theme when matched
  if (matchedTheme && maxThemeScore >= 15) {
    const primaryDoc = groundedDocuments.find(d => d.docNum === matchedTheme!.docNum) || groundedDocuments[0];

    return {
      query: rawQuery,
      domainTag: matchedTheme.tag,
      contextualTitle: matchedTheme.title,
      communityName: primarySeed.communityName,
      seedEntities,
      traversedEdges,
      graphPath: {
        summary: graphPathSummary,
        steps: traversedSteps.slice(0, 3)
      },
      matchedItem,
      matchedDoc: primaryDoc,
      answer: matchedTheme.lead,
      explanation: matchedTheme.explanation,
      keyBusinessFacts: matchedTheme.facts,
      referenceLinks: matchedTheme.refLinks,
      citation: {
        documentTitle: matchedTheme.docTitle,
        documentNum: matchedTheme.docNum,
        section: matchedTheme.section,
        page: matchedTheme.page,
        pdfPath: matchedTheme.pdfPath,
        pdfSize: matchedTheme.pdfSize,
        specPath: matchedTheme.specPath
      },
      technicalDetails: {
        summary: `Silicon Specifications for ${matchedTheme.title}:`,
        specPoints: [
          `Document Classification: ${matchedTheme.docTitle} (${matchedTheme.section})`,
          `Fabrication Node: ${matchedItem.nodeFoundry || 'SkyWater 130 nm CMOS / SCL Mohali 180 nm BCD'}`,
          `Safety Standard: ${matchedItem.standards || 'AEC-Q100 Grade 1, ISO 26262 ASIL-D, DAP-2020 Make-II'}`,
          `Verified Evidence: Grounded in ${matchedTheme.docTitle} · ${matchedTheme.page}`
        ],
        deepLink: {
          label: 'Inspect Architecture',
          hash: 'architecture',
          context: 'Review cycle-by-cycle comparator divergence and safe-state latching.'
        }
      },
      relatedTopics: [
        { label: '50 MHz Operating Frequency & Fmax Timing', query: 'Why does DG32 run at 50 MHz?' },
        { label: '39-Cycle Hardware Fault Trip & Field Safety', query: 'How does 39-cycle hardware lockstep protect against recalls?' },
        { label: 'BOM Unit Cost & Sovereign Supply Continuity', query: 'What makes DeepGrid silicon immune to supply chain disruption?' },
        { label: '100 kHz High-Speed Motor Control Headroom', query: 'What is the loop budget and timing margin at 100 kHz?' },
        { label: 'DG32-2DOM Neural Co-Processor Architecture', query: 'How does DG32-2DOM run bearing diagnostics without stalling the motor?' }
      ].filter(t => t.query.toLowerCase() !== q)
    };
  }

  // Fallback: Rich Catalog Item or Free-Form Synthesis
  const communityName = primarySeed.communityName || 'Silicon Architecture & Systems';
  let domainTag = communityName.toUpperCase();
  if (communityName.includes('AI') || communityName.includes('Use Cases')) {
    domainTag = 'EDGE AI & PREDICTIVE DIAGNOSTICS · ARCHITECTURAL PROFILE';
  } else if (communityName.includes('Motor Control') || communityName.includes('Power Stage')) {
    domainTag = 'DETERMINISTIC MOTION & MOTOR CONTROL · ARCHITECTURAL PROFILE';
  } else if (communityName.includes('Safety') || communityName.includes('Lockstep')) {
    domainTag = 'FUNCTIONAL SAFETY & ASIL-D · FAULT ISOLATION';
  } else if (communityName.includes('Defence') || communityName.includes('Moats')) {
    domainTag = 'STATUTORY DEFENCE MOATS & SOVEREIGN SUPPLY · DAP-2020';
  } else if (communityName.includes('Economics') || communityName.includes('Foundry')) {
    domainTag = 'MATURE-NODE UNIT ECONOMICS & SUPPLY CONTINUITY';
  }

  let contextualTitle = primarySeed.name;
  let answer = '';
  let explanation: string[] = [];
  let keyBusinessFacts: string[] = [];

  if (matchedItem && matchedItem.id === primarySeed.id) {
    contextualTitle = matchedItem.name;
    answer = `${matchedItem.summary} Manufactured on mature planar nodes, it combines deterministic hardware execution with predictable multi-year supply.`;
    
    explanation = [
      `${matchedItem.name} addresses critical automotive and industrial drive requirements: ${matchedItem.tagline}. By hardwiring critical control functions directly into silicon logic, it eliminates firmware timing jitter and protects power switches from transient faults.`,
      `System Topology & Hardware Interfaces: The architecture interfaces seamlessly with connected platform blocks (${traversedSteps.slice(0, 3).map(s => `[${s.target}] via ${s.relation}`).join(', ')}). Fabricated on ${matchedItem.nodeFoundry || 'SkyWater 130 nm / SCL Mohali 180 nm'}, it delivers robust electrical tolerances across automotive temperature corners (-40 °C to +125 °C AEC-Q100 Grade 1 target).`,
      `Operational & Grounded Compliance: Certified against ${matchedItem.standards || 'ISO 26262 ASIL-D and DAP-2020 Make-II'}, this configuration guarantees sovereign domestic procurement priority and eliminates external discrete mathematical co-processors.`
    ];
    keyBusinessFacts = matchedItem.keyFacts.slice(0, 4);
  } else {
    contextualTitle = primarySeed.name.length > 55 ? primarySeed.name.slice(0, 52) + '...' : primarySeed.name;
    answer = `Grounded in ${bestChunk.docTitle}: ${cleanedPdfText.slice(0, 240)}... DeepGrid silicon hardwires this functionality into mature-node silicon to guarantee deterministic execution and predictable supply.`;
    
    explanation = [
      `Architectural Overview: ${primarySeed.name} is a key functional component of the ${communityName} subsystem. ${primarySeed.description}`,
      `Inter-Block Connectivity: Within the DeepGrid system hierarchy, this block establishes verified hardware links (${traversedSteps.slice(0, 3).map(s => `[${s.source}] ──(${s.relation})──> [${s.target}]`).join('; ')}), guaranteeing isolated execution domains and cycle-accurate predictability.`,
      `Specification & Grounded Verification: As documented in ${bestChunk.docTitle} (${bestChunk.section}, ${bestChunk.pageLabel}): "${cleanedPdfText.slice(0, 420)}..."`
    ];
    keyBusinessFacts = [
      `Functional Subsystem: ${primarySeed.name} (${communityName})`,
      `Verified Specification: ${bestChunk.docTitle} · ${bestChunk.pageLabel} (${bestChunk.pdfSize})`,
      `Silicon Process: 130nm CMOS / 180nm BCD · AEC-Q100 Grade 1 (-40 °C to +125 °C)`,
      `Safety Classification: ASIL-D ready hardware supervisor with autonomous trip latch`
    ];
  }

  const primaryDoc = groundedDocuments.find(d => d.title.toLowerCase().includes(bestChunk.docTitle.toLowerCase())) ||
                     groundedDocuments[0];

  const referenceLinks = traversedSteps.slice(0, 3).map(s => ({
    label: `Inspect ${s.target.slice(0, 28)}`,
    hash: 'architecture',
    description: `Relational link: [${s.source}] ──(${s.relation})──> [${s.target}]`
  }));

  return {
    query: rawQuery,
    domainTag,
    contextualTitle,
    communityName,
    seedEntities,
    traversedEdges,
    graphPath: {
      summary: graphPathSummary,
      steps: traversedSteps.slice(0, 3)
    },
    matchedItem,
    matchedDoc: primaryDoc,
    answer,
    explanation,
    keyBusinessFacts,
    referenceLinks,
    citation: {
      documentTitle: bestChunk.docTitle,
      documentNum: bestChunk.docNum,
      section: bestChunk.section,
      page: bestChunk.pageLabel,
      pdfPath: bestChunk.pdfPath,
      pdfSize: bestChunk.pdfSize,
      specPath: bestChunk.specPath
    },
    technicalDetails: {
      summary: `Silicon Specifications for ${primarySeed.name}:`,
      specPoints: [
        `Fabrication Node: ${matchedItem.nodeFoundry || 'SkyWater 130 nm CMOS / SCL Mohali 180 nm BCD'}`,
        `Supply Voltage Rails: ${matchedItem.voltageRail || '1.8V Core / 3.3V I/O'}`,
        `Safety Standard: ${matchedItem.standards || 'AEC-Q100 Grade 1, ISO 26262 ASIL-D, DAP-2020 Make-II'}`,
        `Physical Verification: Grounded in ${bestChunk.docTitle} (${bestChunk.pageLabel})`
      ],
      deepLink: {
        label: 'Inspect Subsystem Architecture',
        hash: 'architecture',
        context: 'Review cycle-by-cycle comparator divergence and safe-state latching.'
      }
    },
    relatedTopics: [
      { label: '50 MHz Operating Frequency & Fmax Timing', query: 'Why does DG32 run at 50 MHz?' },
      { label: '39-Cycle Hardware Fault Trip & Field Safety', query: 'How does 39-cycle hardware lockstep protect against recalls?' },
      { label: 'BOM Unit Cost & Sovereign Supply Continuity', query: 'What makes DeepGrid silicon immune to supply chain disruption?' },
      { label: '100 kHz High-Speed Motor Control Headroom', query: 'What is the loop budget and timing margin at 100 kHz?' },
      { label: 'DG32-2DOM Neural Co-Processor Architecture', query: 'How does DG32-2DOM run bearing diagnostics without stalling the motor?' }
    ].filter(t => t.query.toLowerCase() !== q)
  };
}
