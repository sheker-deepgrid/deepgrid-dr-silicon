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

/**
 * The prompt the GraphRAG proxy sends to the model, built from the same deterministic subgraph the
 * page shows as its grounding trail. It lives here, beside queryGraphify, so the proxy and the page
 * cannot drift apart: one function decides what the model is allowed to see. The proxy runs this
 * itself from the query alone, so the key it holds can only ever answer questions about this graph.
 */
export function buildRagPrompt(query: string, r: GraphSearchResult): string {
  const nodes = r.subgraphNodes.slice(0, 20).map(n =>
    `- "${n.label}" (source: ${n.source_file || 'spec'}${n.source_location ? ', ' + n.source_location : ''}; community: ${n.community_name || 'DeepGrid'})`
  ).join('\n');
  const edges = r.subgraphLinks.slice(0, 15).map(e => {
    const src = typeof e.source === 'string' ? e.source : (e.source as { id: string }).id;
    const tgt = typeof e.target === 'string' ? e.target : (e.target as { id: string }).id;
    return `- (${nodeMap.get(src)?.label || src}) --[${e.relation}]--> (${nodeMap.get(tgt)?.label || tgt})`;
  }).join('\n');
  return [
    'You are the DeepGrid Semi silicon architect answering a diligence question.',
    'Answer ONLY from the knowledge-graph context below. If the context does not contain the answer, say so plainly and name what is missing. Never invent a number, part, date or standard.',
    'All DG32 figures are pre-silicon design values, not measurements; say so when you quote one.',
    'Write 120 to 220 words: a one-sentence answer first, then at most five short bullets. Use plain text with "- " bullets and **bold** for at most three key terms. No headings, no tables.',
    '',
    `Question: ${query}`,
    '',
    'Verified facts from the matched catalog entry:',
    r.instantSynthesis,
    '',
    'Graph entities reached from the question:',
    nodes || '- (none)',
    '',
    'Graph relationships:',
    edges || '- (none)',
  ].join('\n');
}

/**
 * Stream a live GraphRAG synthesis from the proxy. The model key lives in the proxy, never in this
 * static bundle: the page sends only the question. Resolves to the full text, or null when the proxy
 * is unavailable, rate-limited or out of quota, so the caller can fall back to the deterministic
 * synthesis instead of showing an error.
 */
export async function streamGraphRAG(
  url: string,
  query: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query}),
      signal,
    });
  } catch {
    return null;
  }
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', text = '';
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    // strip CRs so \r\n-framed events split too; a CR inside a JSON string is escaped, never literal
    buffer += decoder.decode(value, {stream: true}).replace(/\r/g, '');
    // SSE events end with a blank line; keep any partial event for the next read
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const ev of events) {
      for (const line of ev.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const json = line.slice(5).trim();
        if (!json || json === '[DONE]') continue;
        try {
          const part = JSON.parse(json)?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (part) { text += part; onChunk(text); }
        } catch { /* a malformed event is skipped, not fatal */ }
      }
    }
  }
  return text || null;
}
