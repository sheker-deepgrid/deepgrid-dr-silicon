// Client-Side Graphify Engine & Dynamic RAG Synthesizer
// Provides BFS graph traversal, semantic subgraph retrieval, and background Gemini 2.5 Flash synthesis.

import graphDataRaw from './deepgrid-graphify.json';
import { deepGridCatalog, catalogToNodeMap, nodeToCatalogMap, searchDeepGridKnowledge, DeepGridItem } from './deepgrid-knowledge';

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
