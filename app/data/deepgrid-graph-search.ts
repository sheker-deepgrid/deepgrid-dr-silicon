// Client-Side Graphify Engine & Dynamic RAG Synthesizer
// Provides BFS graph traversal, semantic subgraph retrieval, and background Gemini 2.5 Flash synthesis.

import graphDataRaw from './deepgrid-graphify.json';
import { deepGridCatalog, catalogToNodeMap, nodeToCatalogMap, searchDeepGridKnowledge, DeepGridItem } from './deepgrid-knowledge';
import { faultPath, evidenceLadder } from '../detail-content';

export interface GraphifyNode {
  id: string;
  label: string;
  file_type?: string;
  source_file?: string;
  source_location?: string;
  community?: number;
  community_name?: string;
  norm_label?: string;
}

export interface GraphifyLink {
  source: string;
  target: string;
  relation: string;
  confidence?: string;
  confidence_score?: number;
  source_file?: string;
  source_location?: string;
}

export interface GraphifyData {
  nodes: GraphifyNode[];
  links: GraphifyLink[];
}

const graphData = graphDataRaw as unknown as GraphifyData;

export interface GraphSearchResult {
  query: string;
  seedNodes: GraphifyNode[];
  subgraphNodes: GraphifyNode[];
  subgraphLinks: GraphifyLink[];
  communities: { id: number; name: string; count: number }[];
  citationList: { file: string; location: string; symbol: string }[];
  instantSynthesis: string;
}

// Build adjacency list for instant BFS in browser
const adjacency = new Map<string, { neighborId: string; link: GraphifyLink }[]>();
const nodeMap = new Map<string, GraphifyNode>();

graphData.nodes.forEach(n => {
  nodeMap.set(n.id, n);
  adjacency.set(n.id, []);
});

graphData.links.forEach(link => {
  const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
  const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
  
  if (adjacency.has(src)) {
    adjacency.get(src)!.push({ neighborId: tgt, link });
  }
  if (adjacency.has(tgt)) {
    adjacency.get(tgt)!.push({ neighborId: src, link });
  }
});

/**
 * Executes a client-side BFS traversal over graph.json for any user query.
 */
export function queryGraphify(query: string, maxDepth = 2, maxNodes = 20): GraphSearchResult {
  const q = query.trim().toLowerCase();
  if (!q) {
    const defaultNodes = graphData.nodes.slice(0, 8);
    return {
      query: '',
      seedNodes: defaultNodes,
      subgraphNodes: defaultNodes,
      subgraphLinks: [],
      communities: [],
      citationList: [],
      instantSynthesis: 'Enter any specification or architecture query above to traverse the 280-node DeepGrid knowledge graph in real time.'
    };
  }

  const terms = q.split(/\s+/).filter(t => t.length > 1);

  // Score nodes based on label, source file, community name, and id
  const scoredNodes = graphData.nodes.map(node => {
    let score = 0;
    const label = (node.label || '').toLowerCase();
    const sf = (node.source_file || '').toLowerCase();
    const cname = (node.community_name || '').toLowerCase();
    const id = node.id.toLowerCase();

    terms.forEach(term => {
      if (label === term) score += 60;
      else if (label.includes(term)) score += 30;
      if (id.includes(term)) score += 25;
      if (cname.includes(term)) score += 20;
      if (sf.includes(term)) score += 15;
    });

    return { node, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top seeds
  const seedNodes = scoredNodes.slice(0, 5).map(item => item.node);
  if (seedNodes.length === 0) {
    return {
      query,
      seedNodes: [],
      subgraphNodes: [],
      subgraphLinks: [],
      communities: [],
      citationList: [],
      instantSynthesis: `No direct graph matches for "${query}". Try querying keywords like "lockstep delay", "dshot telemetry", "sdv architecture", "cwru benchmark", "198-day loop", or "dap-2020 moats".`
    };
  }

  // BFS traversal from seeds
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [];
  const resultLinks: GraphifyLink[] = [];

  seedNodes.forEach(s => {
    visited.add(s.id);
    queue.push({ id: s.id, depth: 0 });
  });

  while (queue.length > 0 && visited.size < maxNodes) {
    const { id, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;

    const neighbors = adjacency.get(id) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.neighborId)) {
        visited.add(edge.neighborId);
        queue.push({ id: edge.neighborId, depth: depth + 1 });
      }
      if (!resultLinks.includes(edge.link)) {
        resultLinks.push(edge.link);
      }
      if (visited.size >= maxNodes) break;
    }
  }

  const subgraphNodes = Array.from(visited).map(id => nodeMap.get(id)!).filter(Boolean);

  // Group by communities
  const commCounts = new Map<number, { name: string; count: number }>();
  subgraphNodes.forEach(n => {
    const cid = n.community ?? 0;
    const cname = n.community_name || 'General';
    const cur = commCounts.get(cid) || { name: cname, count: 0 };
    cur.count++;
    commCounts.set(cid, cur);
  });

  const communities = Array.from(commCounts.entries()).map(([id, val]) => ({
    id,
    name: val.name,
    count: val.count
  })).sort((a, b) => b.count - a.count);

  // Citations
  const citationList = subgraphNodes
    .filter(n => n.source_file)
    .map(n => ({
      file: n.source_file!,
      location: n.source_location || 'L1',
      symbol: n.label
    }))
    .slice(0, 8);

  // Ranked catalog match based on deep keyword scoring
  const rankedItems = searchDeepGridKnowledge(query);
  const topItem: DeepGridItem = rankedItems.length > 0 ? rankedItems[0] : deepGridCatalog[0];

  // Format clean, human-readable executive architectural synthesis
  let dynamicSynthesis = `### ${topItem.name}\n\n`;
  dynamicSynthesis += `**Architectural Thesis:** ${topItem.tagline}\n\n`;
  dynamicSynthesis += `${topItem.summary}\n\n`;
  
  if (topItem.keyFacts && topItem.keyFacts.length > 0) {
    dynamicSynthesis += `**Verified Silicon Parameters:**\n`;
    topItem.keyFacts.slice(0, 4).forEach(fact => {
      dynamicSynthesis += `• ${fact}\n`;
    });
    dynamicSynthesis += `\n`;
  }

  if (topItem.nodeFoundry || topItem.voltageRail || topItem.standards) {
    dynamicSynthesis += `**Hardware Implementation:**\n`;
    if (topItem.nodeFoundry) dynamicSynthesis += `• Process Node: ${topItem.nodeFoundry}\n`;
    if (topItem.voltageRail) dynamicSynthesis += `• Power Rails: ${topItem.voltageRail}\n`;
    if (topItem.standards) dynamicSynthesis += `• Standards: ${topItem.standards}\n`;
    dynamicSynthesis += `\n`;
  }

  if (topItem.citation) {
    dynamicSynthesis += `**Authoritative Citation:** ${topItem.citation}\n`;
  }

  return {
    query,
    seedNodes,
    subgraphNodes,
    subgraphLinks: resultLinks,
    communities,
    citationList,
    instantSynthesis: dynamicSynthesis
  };
}

// ---------------------------------------------------------------------------------------------
// Multi-agent council (the ADK triage pattern: a root agent routes a question to domain
// specialists, each answers from its own grounding, and a council synthesises). The page and the
// GraphRAG Worker both import this, so the specialists, their grounding and the event stream are
// defined once. Prompts are built only here and only in the Worker: the page sends a question.
// ---------------------------------------------------------------------------------------------

export type SpecialistId = 'safety' | 'hardware' | 'defense';

export const SPECIALISTS: Record<SpecialistId, {name: string; remit: string; seeds: string}> = {
  safety: {
    name: 'Safety & Verification Auditor',
    remit: 'hardware lockstep, fault detection and latching, FAULT_N, fault injection, the verification evidence ladder, functional-safety standards',
    seeds: 'lockstep fault latch safety verification comparator checker',
  },
  hardware: {
    name: 'Physical Silicon & EDA Lead',
    remit: 'clocks and timing closure (Fmax), the control loop and its cycle budget, CORDIC/ADC/PWM blocks, pinout and package, die area, the DG32-2DOM second clock domain',
    seeds: 'clock fmax timing mhz cycles loop cordic pinout package die',
  },
  defense: {
    name: 'Sovereign Moats & Procurement Strategist',
    remit: 'foundries and supply chain, DAP-2020 and domestic-content rules, cost and procurement position, the multi-spin roadmap',
    seeds: 'sovereign foundry supply dap make-ii procurement roadmap cost',
  },
};
export const SPECIALIST_IDS = Object.keys(SPECIALISTS) as SpecialistId[];

/** docId for grounding that comes from the site's own Overview rather than a published PDF. */
export const SITE_OVERVIEW = 'site-overview';

export interface SpecialistContext {
  graph: GraphSearchResult;
  facts: {item: string; citation: string; docId?: string; facts: string[]}[];
}

/** A specialist's own grounding: a graph walk plus the verified catalog facts, both seeded with its remit. */
export function specialistContext(id: SpecialistId, question: string): SpecialistContext {
  const seeded = `${question} ${SPECIALISTS[id].seeds}`;
  const graph = queryGraphify(seeded, 2, 16);
  const facts: SpecialistContext['facts'] = searchDeepGridKnowledge(seeded).slice(0, 3)
    .map(i => ({item: i.name, citation: i.citation, docId: i.docId, facts: i.keyFacts.slice(0, 6)}));
  // The fault path and the evidence ladder exist only as site content, not in the catalog or graph.
  // Without them the safety answer told readers the documents "do not cover" a fault latch and a
  // verification ladder that the Overview shows, so the safety specialist is grounded in them too.
  if (id === 'safety') facts.unshift({
    item: 'Fault isolation and verification evidence',
    citation: 'DG32 Overview — Fault isolation and verification ladder',
    docId: SITE_OVERVIEW,
    facts: [
      ...faultPath.map(([t, d]) => `${t}: ${d}`),
      ...evidenceLadder.map(e => `${e.kind} evidence (${e.means.toLowerCase()}): ${e.examples}`),
    ],
  });
  return {graph, facts};
}

const RULES = [
  'Answer ONLY from the context given. If it does not contain the answer, say so plainly and name what is missing.',
  'Never invent a number, part, date, standard or confidence score. DG32 figures are pre-silicon design values, not measurements; say so when you quote one.',
  'Plain text: "- " bullets and **bold** for at most three key terms. No headings, no tables.',
].join('\n');

export function buildTriagePrompt(question: string): string {
  return [
    'You are the root triage agent of a silicon diligence council. Route the question to the specialists whose remit it needs: one if it is narrow, two or three only if it genuinely spans them.',
    ...SPECIALIST_IDS.map(id => `- ${id}: ${SPECIALISTS[id].name}. Remit: ${SPECIALISTS[id].remit}.`),
    'For each chosen specialist write a focused sub-question in their terms. Give a one-sentence reason for the routing.',
    '',
    `Question: ${question}`,
  ].join('\n');
}

export function buildSpecialistPrompt(id: SpecialistId, question: string, subQuestion: string, ctx: SpecialistContext): string {
  const nodes = ctx.graph.subgraphNodes.slice(0, 16).map(n => `- ${n.label}`).join('\n');
  const facts = ctx.facts.map(f => `From "${f.item}" (${f.citation}):\n${f.facts.map(x => '- ' + x).join('\n')}`).join('\n\n');
  return [
    `You are the ${SPECIALISTS[id].name} on a silicon diligence council. Your remit: ${SPECIALISTS[id].remit}.`,
    RULES,
    'Write 60 to 130 words: one sentence that answers the sub-question, then at most four bullets. Stay inside your remit.',
    '',
    `Original question: ${question}`,
    `Your sub-question: ${subQuestion}`,
    '',
    'Verified catalog facts:',
    facts || '- (none)',
    '',
    'Knowledge-graph entities reached:',
    nodes || '- (none)',
  ].join('\n');
}

export function buildSynthesisPrompt(question: string, answers: {name: string; text: string}[]): string {
  return [
    'Write the final answer for a business reader (an executive, buyer or investor) evaluating DeepGrid silicon, using only the analyst notes below.',
    'Never mention analysts, specialists, agents, a council, notes, "the context" or how the answer was produced; the reader sees only the answer.',
    'Use only claims the notes make; do not add facts. If the notes lack something the question asks, say plainly that DeepGrid\u2019s published documents do not cover it. If two notes conflict, state both figures once.',
    'Never invent a number, part, date or standard. DG32 figures are pre-silicon design values, not measurements; say so once, not per bullet.',
    'Never state a conclusion the notes do not directly support: "safe", "compliant", "cheaper", "qualified" and the like need evidence in the notes for that exact point. If the question asks for one and the notes lack it, say DeepGrid\u2019s published documents do not establish it.',
    'Plain text: a one-sentence answer first, then at most five "- " bullets, **bold** for at most three key terms. No headings. 100 to 200 words.',
    '',
    `Question: ${question}`,
    '',
    ...answers.map((a, i) => `Analyst note ${i + 1}:\n${a.text}\n`),
  ].join('\n');
}

/** A document a specialist drew on: the page turns these into the answer's reference links. */
export type CouncilSource = {item: string; citation: string; docId?: string};

/** Events the Worker streams while the council works. The page shows only the final answer and its sources. */
export type CouncilUsage = {model: string; ms: number; tokensIn: number; tokensOut: number};
export type CouncilEvent =
  | {type: 'triage'; routes: {id: SpecialistId; subQuestion: string}[]; reason: string; fallback?: boolean; usage?: CouncilUsage}
  | {type: 'specialist-start'; id: SpecialistId; grounding: string[]; sources: CouncilSource[]}
  | {type: 'specialist'; id: SpecialistId; text: string; usage: CouncilUsage}
  | {type: 'specialist-error'; id: SpecialistId}
  | {type: 'final'; text: string; usage: CouncilUsage}
  | {type: 'done'; ms: number}
  | {type: 'error'; stage: string};

/**
 * Convene the council through the proxy and hand each event to the page as it arrives. The page
 * sends only the question; the model key lives in the proxy. Resolves false when the proxy is
 * unreachable or refuses, so the caller can fall back to the deterministic synthesis.
 */
export async function streamCouncil(url: string, query: string, onEvent: (e: CouncilEvent) => void, signal?: AbortSignal): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query}), signal});
  } catch {
    return false;
  }
  if (!res.ok || !res.body) return false;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', any = false;
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, {stream: true}).replace(/\r/g, '');
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const ev of events) {
      const line = ev.split('\n').find(l => l.startsWith('data:'));
      if (!line) continue;
      try { onEvent(JSON.parse(line.slice(5)) as CouncilEvent); any = true; } catch { /* skip a malformed event */ }
    }
  }
  return any;
}
