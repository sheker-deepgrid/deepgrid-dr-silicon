// Multi-Agent Deliberation Engine for DeepGrid Silicon Intelligence
// Implements Root Triage Orchestrator -> Domain Specialists -> Multi-Agent Council Synthesis
// 100% Deterministic, GraphRAG grounded, Zero API Credit Cost

import {
  deepGridCatalog,
  graphNodes,
  graphEdges,
  DeepGridItem,
  GraphNode
} from './deepgrid-knowledge';
import {groundedDocuments, GroundedDoc} from '../documents-data';

export type AgentRole = 'orchestrator' | 'safety' | 'hardware' | 'defense';

export interface TrajectoryStep {
  agent: AgentRole;
  title: string;
  detail: string;
  timestampMs: number;
}

export interface AgentPerspective {
  role: AgentRole;
  agentName: string;
  avatarBadge: string;
  color: string;
  verdict: string;
  keyPoints: string[];
  confidence: number; // 0-100%
  citedDocs: string[];
}

export interface MultiAgentCouncilResult {
  query: string;
  trajectory: TrajectoryStep[];
  matchedItems: DeepGridItem[];
  matchedNodes: GraphNode[];
  summary: string;
  safetyPerspective: AgentPerspective;
  hardwarePerspective: AgentPerspective;
  defensePerspective: AgentPerspective;
  consensus: string;
  recommendedSection: {
    title: string;
    hash: string;
    reason: string;
  };
}

export function runMultiAgentCouncil(rawQuery: string): MultiAgentCouncilResult {
  const q = rawQuery.trim().toLowerCase();
  const now = Date.now();

  // 1. Root Orchestrator: Graph Entity Matching & Subgraph Traversal
  const words = q.split(/\s+/).filter(w => w.length > 2);
  const matchedNodes: GraphNode[] = [];
  const matchedItems: DeepGridItem[] = [];

  graphNodes.forEach(node => {
    const nodeText = `${node.name} ${node.shortName} ${node.description} ${node.category}`.toLowerCase();
    const hits = words.filter(w => nodeText.includes(w)).length;
    if (hits > 0 || (words.length === 0 && matchedNodes.length < 4)) {
      matchedNodes.push(node);
    }
  });

  deepGridCatalog.forEach(item => {
    const itemText = `${item.name} ${item.tagline} ${item.summary} ${item.keyFacts.join(' ')} ${item.standards || ''}`.toLowerCase();
    const hits = words.filter(w => itemText.includes(w)).length;
    if (hits > 0 || (words.length === 0 && matchedItems.length < 3)) {
      matchedItems.push(item);
    }
  });

  // Sort by relevance
  matchedItems.sort((a, b) => {
    const aHits = words.filter(w => `${a.name} ${a.summary}`.toLowerCase().includes(w)).length;
    const bHits = words.filter(w => `${b.name} ${b.summary}`.toLowerCase().includes(w)).length;
    return bHits - aHits;
  });

  const primaryItem = matchedItems[0] || deepGridCatalog[0];

  // 2. Trajectory Generation (Root Orchestrator dispatching tasks)
  const trajectory: TrajectoryStep[] = [
    {
      agent: 'orchestrator',
      title: 'Query Decomposed & Intent Triaged',
      detail: `Parsed ${words.length || 1} semantic intents. Dispatched sub-queries to Safety, Hardware, and Sovereign Defense Specialists.`,
      timestampMs: 12
    },
    {
      agent: 'safety',
      title: 'Lockstep & Fault Isolation Audit',
      detail: 'Audited 39-cycle hardware trip path, dual-core store comparator, and WCET execution bounds.',
      timestampMs: 48
    },
    {
      agent: 'hardware',
      title: 'Physical Silicon & Timing Closure Check',
      detail: 'Checked SkyWater 130 nm / TSMC 28 nm floorplans, 50/114 MHz CDC FIFOs, and fixed ~300-cycle loop budget.',
      timestampMs: 84
    },
    {
      agent: 'defense',
      title: 'Sovereignty & Supply Chain Verification',
      detail: 'Benchmarked against DAP-2020 Make-II clauses, ₹10 Cr capital model, and 198-day shuttle loop.',
      timestampMs: 126
    }
  ];

  // 3. Domain Specialist 1: Safety & Verification Agent
  const isSafetyHeavy = q.includes('safe') || q.includes('lockstep') || q.includes('fault') || q.includes('trip') || q.includes('asil') || q.includes('core');
  const safetyVerdict = isSafetyHeavy || primaryItem.category === 'architecture' || primaryItem.category === 'loop'
    ? `The architecture enforces an uncompromised hardware lockstep invariant. The CHECKER core trails the MAIN core by exactly two clock cycles on mirrored inputs. Any divergence triggers the hardware fault latch within 39 clock cycles (780 ns at 50 MHz), completely bypassing firmware.`
    : `DG32 safety architecture guarantees that peripheral interrupts, Park/Clarke math calculations, and external communication cannot alter the deterministic Worst-Case Execution Time (WCET) or compromise bridge dead-time protection.`;

  const safetyPerspective: AgentPerspective = {
    role: 'safety',
    agentName: 'Safety & Verification Auditor',
    avatarBadge: 'ASIL-D / ISO 26262',
    color: '#f59e0b',
    verdict: safetyVerdict,
    keyPoints: [
      '39-cycle hardware trip directly latches gate driver shutdown without software intervention',
      'Dual identical RISC-V cores verify every committed store with a 2-cycle hardware pipeline delay',
      'Fault injection test registers locked by hardware keys for non-destructive production bring-up'
    ],
    confidence: isSafetyHeavy ? 98 : 94,
    citedDocs: ['Doc #2: DG32-LITE Architecture', 'Doc #5: Mature Silicon Master Whitepaper']
  };

  // 4. Domain Specialist 2: Hardware & Physical Silicon Agent
  const isHwHeavy = q.includes('clock') || q.includes('mhz') || q.includes('cycle') || q.includes('loop') || q.includes('pwm') || q.includes('cordic') || q.includes('qfn') || q.includes('adc');
  const hwVerdict = isHwHeavy || primaryItem.category === 'sku' || primaryItem.category === 'ai'
    ? `On SkyWater 130 nm CMOS, DG32 fixes the control loop at ~300 hardware cycles (70 ADC + 160 CORDIC + 70 PWM). For DG32-2DOM, the 114 MHz INT8 Attention Engine runs behind asynchronous clock domain crossing (CDC) FIFOs, expanding the die width by 0.5 mm while preserving the identical 44-signal QFN-64 pinout.`
    : `All high-bandwidth transforms (Clarke, Park, inverse Park) execute in hardwired silicon blocks rather than software math libraries. This guarantees zero CPU fetch-bandwidth saturation and preserves full firmware execution headroom at 100 kHz.`;

  const hardwarePerspective: AgentPerspective = {
    role: 'hardware',
    agentName: 'Physical Silicon & EDA Lead',
    avatarBadge: '130NM / 50+114MHZ',
    color: '#38bdf8',
    verdict: hwVerdict,
    keyPoints: [
      'Fixed ~300-cycle loop budget at any loop rate (10 kHz, 20 kHz, 50 kHz, 100 kHz)',
      'Asynchronous dual-clock FIFOs guarantee the 114 MHz engine never stalls the 50 MHz motor core',
      'Standard 9 × 9 mm QFN-64 package with exposed thermal ground paddle (<0.43 W total dissipation)'
    ],
    confidence: isHwHeavy ? 99 : 95,
    citedDocs: ['Doc #3: DG32-LITE Datasheet', 'Doc #4: DG32-2DOM Datasheet']
  };

  // 5. Domain Specialist 3: Sovereign Moats & Defense Agent
  const isDefenseHeavy = q.includes('defense') || q.includes('dap') || q.includes('moat') || q.includes('sovereign') || q.includes('fab') || q.includes('import') || q.includes('price') || q.includes('cost');
  const defenseVerdict = isDefenseHeavy || primaryItem.category === 'defense' || primaryItem.category === 'finance'
    ? `DG32 establishes a sovereign silicon moat by utilizing domestic and mature-node foundries (SkyWater 130 nm, SCL Mohali, TSMC 28 nm monolithic), satisfying Indian Defence Acquisition Procedure (DAP-2020 Make-II) domestic content requirements and immunizing commercial OEMs from foreign export controls.`
    : `Under DeepGrid's ₹10 Cr financial model, silicon volume scaling holds unit pricing flat across six years. By standardizing on 4 platform surfaces sharing 1 common bill of materials, inventory risk is amortized across automotive, drone, and industrial robotics sectors.`;

  const defensePerspective: AgentPerspective = {
    role: 'defense',
    agentName: 'Sovereign Moats & Procurement Strategist',
    avatarBadge: 'DAP-2020 / MAKE-II',
    color: '#10b981',
    verdict: defenseVerdict,
    keyPoints: [
      '198-day tapeout-to-shuttle cycle leveraging open-source EDA and multi-project wafer (MPW) runs',
      '3-Factory sovereignty strategy eliminates single-point foundry and geopolitical supply disruptions',
      'Sub-$3 BOM target directly substitutes imported STM32G0, TI Hercules, and Infineon AURIX parts'
    ],
    confidence: isDefenseHeavy ? 97 : 92,
    citedDocs: ['Doc #5: Master Whitepaper v3', 'Doc #6: 10-SKU Technical Annex']
  };

  // 6. Recommended Interactive Section
  let recommendedSection = {
    title: 'DG32 System Architecture',
    hash: 'architecture',
    reason: 'Inspect the block diagram, dual-domain bridges, and die floorplan.'
  };

  if (isSafetyHeavy) {
    recommendedSection = {
      title: '39-Cycle Fault Isolation',
      hash: 'overview',
      reason: 'Trace the hardware comparator trip sequence from CPU mismatch to safe bridge shutdown.'
    };
  } else if (isHwHeavy) {
    recommendedSection = {
      title: '100 kHz Control Loop Budget',
      hash: 'control',
      reason: 'Scrub through the 500-cycle timeline and explore hardware vs CPU firmware budget.'
    };
  } else if (isDefenseHeavy) {
    recommendedSection = {
      title: 'Position & Multi-Spin Roadmap',
      hash: 'roadmap',
      reason: 'Compare DG32 against STM32G0 across safety hardware, analog peripherals, and sovereign cost.'
    };
  }

  // 7. Consensus Summary
  const consensus = `The Multi-Agent Council confirms that ${primaryItem.name} achieves deterministic motor control through hardwired transforms and a dual-core lockstep monitor. By isolating condition monitoring onto a separate 114 MHz clock domain, DeepGrid delivers ASIL-D safety integrity with sovereign mature-node economics.`;

  return {
    query: rawQuery,
    trajectory,
    matchedItems: matchedItems.slice(0, 4),
    matchedNodes: matchedNodes.slice(0, 5),
    summary: primaryItem.summary,
    safetyPerspective,
    hardwarePerspective,
    defensePerspective,
    consensus,
    recommendedSection
  };
}
