'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
import {useState, useMemo, useRef} from 'react';
import {
  Search, ArrowUpRight, ArrowRight, ShieldCheck, 
  BookOpen, X, Check, Network, LayoutGrid, RotateCcw,
  FileText, Compass, HelpCircle, Download, Copy
} from 'lucide-react';
import {SectionHead} from './detail';
import {
  deepGridCatalog, searchDeepGridKnowledge, quickPrompts, 
  documentSources, DocumentSource,
  graphNodes, graphEdges, DeepGridItem,
  nodeToCatalogMap, catalogToNodeMap
} from './data/deepgrid-knowledge';
import {groundedDocuments, GroundedDoc} from './documents-data';

// Helper to resolve the authoritative grounded document for any DeepGrid catalog item
export function resolveItemDocument(item?: DeepGridItem | null): GroundedDoc {
  if (!item) return groundedDocuments[4]; // Default to Doc 5 (Mature Silicon Whitepaper)

  if (item.docId) {
    const found = groundedDocuments.find(d => d.id === item.docId);
    if (found) return found;
  }

  // 1. Doc 5: Mature-Node Silicon Master Whitepaper (198-Day Loop, Strategy, Moats, Three-Factory, Finance, Capital)
  if (
    item.id === '198-day-loop' || 
    item.category === 'loop' || 
    item.citation.includes('Mature Silicon') || 
    item.citation.includes('Whitepaper v3') ||
    item.id === 'three-factory' ||
    item.id === 'dap-2020-moats' ||
    item.id === 'munger-audit' ||
    item.id === 'fin-funds' ||
    item.id === 'import-funnel-10x' ||
    item.id === 'boxes-not-chips' ||
    item.id === 'chinese-price-crash' ||
    item.id === 'dgridriscv-core-architecture'
  ) {
    return groundedDocuments.find(d => d.id === 'doc5') || groundedDocuments[4];
  }

  // 2. Doc S1: D100 Tactical Drone Platform
  if (item.id === 'track-b-d100' || item.name.includes('D100')) {
    return groundedDocuments.find(d => d.id === 'doc-d100') || groundedDocuments[1];
  }

  // 3. Doc S2: DG SDV Software-Defined Vehicle Zonal Architecture
  if (item.id === 'dg-sdv-platform' || item.name.includes('SDV')) {
    return groundedDocuments.find(d => d.id === 'doc-sdv') || groundedDocuments[1];
  }

  // 4. Doc 1: Thirty Use Cases, No Accelerator (Edge AI & Diagnostics)
  if (
    item.citation.includes('Thirty Use Cases') || 
    item.id.startsWith('dg32-ai') || 
    item.id.startsWith('dg32-30') || 
    item.id.startsWith('dg32-tree') || 
    item.id.startsWith('dg32-dsp') || 
    item.id.startsWith('dg32-afe') || 
    item.id.startsWith('dg32-benchmark')
  ) {
    return groundedDocuments.find(d => d.id === 'doc1') || groundedDocuments[0];
  }

  // 5. Doc 3: dgrid_dshot_rx RTL Specification (Motor Telemetry & Floorplan)
  if (
    item.citation.includes('dshot_rx') || 
    item.citation.includes('DShot receive') ||
    item.id === 'dshot-bidir-rx' || 
    item.id === 'sram-floorplan-lever'
  ) {
    return groundedDocuments.find(d => d.id === 'doc3') || groundedDocuments[2];
  }

  // 6. Doc 4: DG32-2DOM Dual-Domain Architecture (Clocks, Bridges, Attention, AVIP)
  if (
    item.citation.includes('2DOM') || 
    item.id.startsWith('dg32-2dom') || 
    item.id === 'int8-attention-engine' || 
    item.id === 'avip-bearing-diagnostics' || 
    item.id === 'foc-loop-budget'
  ) {
    return groundedDocuments.find(d => d.id === 'doc4') || groundedDocuments[3];
  }

  // 7. Doc 6: Preliminary Datasheets (QFN-64, Supply Sequencing, Pinout, Boot ROM)
  if (
    item.citation.includes('Datasheet') || 
    item.id === 'dg32-lite' || 
    item.id.startsWith('dg32-qfn64') || 
    item.id.startsWith('dg32-power') || 
    item.id.startsWith('dg32-boot')
  ) {
    return groundedDocuments.find(d => d.id === 'doc6') || groundedDocuments[5];
  }

  // 8. Doc 2: Technical Annex v3 (10 SKUs, Roadmap, SiP Packaging)
  if (
    item.citation.includes('SKU Compendium') || 
    item.id.startsWith('sku-') || 
    item.id === 'sip-packaging' ||
    item.category === 'sku'
  ) {
    return groundedDocuments.find(d => d.id === 'doc2') || groundedDocuments[1];
  }

  // Fallbacks by category
  if (item.category === 'defense' || item.category === 'strategy' || item.category === 'finance') {
    return groundedDocuments.find(d => d.id === 'doc5') || groundedDocuments[4];
  }
  if (item.category === 'ai') {
    return groundedDocuments.find(d => d.id === 'doc1') || groundedDocuments[0];
  }

  return groundedDocuments.find(d => d.id === 'doc2') || groundedDocuments[1];
}

export default function AskDeepGrid({go}: {go: (hash: string) => void}) {
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeView, setActiveView] = useState<'graph' | 'cards'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('dg32-lite');
  const [selectedItem, setSelectedItem] = useState<DeepGridItem | null>(null);
  const [readingDocContent, setReadingDocContent] = useState<{title: string; text: string} | null>(null);
  const [loadingDocContent, setLoadingDocContent] = useState<boolean>(false);
  const [copiedModalSpec, setCopiedModalSpec] = useState<boolean>(false);
  
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number; y: number}>>(() => {
    const initial: Record<string, {x: number; y: number}> = {};
    graphNodes.forEach(n => {
      initial[n.id] = { x: n.x, y: n.y };
    });
    return initial;
  });

  const [dragNode, setDragNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Active selected item details with bidirectional mapping
  const activeDetailItem = useMemo(() => {
    const catalogId = nodeToCatalogMap[selectedNodeId] || selectedNodeId;
    return deepGridCatalog.find(item => item.id === catalogId) || deepGridCatalog[0];
  }, [selectedNodeId]);

  // Connected nodes and edges to active node
  const activeConnectedNodeIds = useMemo(() => {
    const set = new Set<string>([selectedNodeId]);
    graphEdges.forEach(e => {
      if (e.from === selectedNodeId) set.add(e.to);
      if (e.to === selectedNodeId) set.add(e.from);
    });
    return set;
  }, [selectedNodeId]);

  // Helper to check if a catalog item or node matches a category filter
  const doesItemMatchCategory = (cat: string, itemCategory?: string, nodeCategory?: string) => {
    if (cat === 'all') return true;
    if (itemCategory === cat || nodeCategory === cat) return true;
    if (cat === 'defense' && (itemCategory === 'defense' || nodeCategory === 'moat')) return true;
    if (cat === 'strategy' && (itemCategory === 'strategy' || nodeCategory === 'foundry')) return true;
    if (cat === 'finance' && (itemCategory === 'finance' || nodeCategory === 'governance')) return true;
    if (cat === 'loop' && (itemCategory === 'loop' || nodeCategory === 'architecture')) return true;
    if (cat === 'ai' && (itemCategory === 'ai' || nodeCategory === 'ai')) return true;
    if (cat === 'sku' && (itemCategory === 'sku' || nodeCategory === 'sku')) return true;
    if (cat === 'architecture' && (itemCategory === 'architecture' || nodeCategory === 'architecture')) return true;
    return false;
  };

  // Filter catalog items
  const results = useMemo(() => {
    const raw = searchDeepGridKnowledge(query);
    if (activeCategory === 'all') return raw;
    return raw.filter(item => doesItemMatchCategory(activeCategory, item.category));
  }, [query, activeCategory]);

  // Document filter for quick queries
  const filteredPrompts = useMemo(() => {
    if (selectedDocId === 'all') return quickPrompts;
    return quickPrompts.filter(p => p.docId === selectedDocId);
  }, [selectedDocId]);

  const activeDoc = useMemo(() => {
    return documentSources.find(d => d.id === selectedDocId) || documentSources[0];
  }, [selectedDocId]);

  // Handle Query Selection with Category Auto-Selection & Graph Binding
  const handleQuerySelect = (promptQuery: string) => {
    setQuery(promptQuery);
    if (!promptQuery.trim()) return;
    const matches = searchDeepGridKnowledge(promptQuery);
    if (matches.length > 0) {
      const matchedItem = matches[0];
      const targetNodeId = catalogToNodeMap[matchedItem.id] || matchedItem.id;
      setSelectedNodeId(targetNodeId);

      const targetNode = graphNodes.find(n => n.id === targetNodeId);
      // Category auto-selection: if category filter would hide the matched node, clear restriction
      if (activeCategory !== 'all' && !doesItemMatchCategory(activeCategory, matchedItem.category, targetNode?.category)) {
        setActiveCategory('all');
      }
    }
  };

  // Handle Node Click with Category Auto-Selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const targetNode = graphNodes.find(n => n.id === nodeId);
    const catalogId = nodeToCatalogMap[nodeId] || nodeId;
    const item = deepGridCatalog.find(i => i.id === catalogId);
    if (activeCategory !== 'all' && !doesItemMatchCategory(activeCategory, item?.category, targetNode?.category)) {
      setActiveCategory('all');
    }
  };

  // Load Markdown Architecture Spec inline within the audit view
  const handleReadDocInline = (doc: GroundedDoc) => {
    setLoadingDocContent(true);
    setCopiedModalSpec(false);
    fetch(doc.specFile)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        setReadingDocContent({ title: doc.title, text });
        setLoadingDocContent(false);
      })
      .catch(() => {
        setReadingDocContent({
          title: doc.title,
          text: `# ${doc.title}\n\n` +
            `**Document Badge:** ${doc.badge}\n` +
            `**Subsystem:** ${doc.subsystem}\n` +
            `**Official PDF:** \`${doc.pdfFileName}\` (${doc.fileSizePdf} · ${doc.pdfPageCount})\n` +
            `**Architecture Spec:** \`${doc.specFileName}\` (${doc.fileSizeMd})\n\n` +
            `---\n\n## Executive Summary\n\n${doc.summary}\n\n` +
            `## Key Technical Parameters\n\n` +
            doc.stats.map(s => `- **${s.label}:** ${s.value}`).join('\n') +
            `\n\n## Core Engineering Takeaways\n\n` +
            doc.highlights.map(h => `- ${h}`).join('\n')
        });
        setLoadingDocContent(false);
      });
  };

  const categories = [
    { id: 'all', label: 'All Domains' },
    { id: 'ai', label: 'Edge AI & Diagnostics' },
    { id: 'sku', label: '10-Chip SKU Compendium' },
    { id: 'strategy', label: 'Three-Factory Sovereignty' },
    { id: 'loop', label: '198-Day Fast Loop & EDA' },
    { id: 'defense', label: 'Defense Moats & DAP-2020' },
    { id: 'architecture', label: 'Silicon Architecture & RTL' },
    { id: 'finance', label: 'Capital & Financial Audits' }
  ];

  // Dragging logic for graph nodes
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragNode(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setNodePositions(prev => ({
      ...prev,
      [dragNode]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDragNode(null);
  };

  const resetGraphPositions = () => {
    const initial: Record<string, {x: number; y: number}> = {};
    graphNodes.forEach(n => {
      initial[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(initial);
  };

  // Node Category styling helper
  const getNodeColor = (cat: string) => {
    switch (cat) {
      case 'ai': return '#00e5ff'; // Vibrant Electric Cyan for Edge AI
      case 'sku': return '#d4a36e'; // Copper
      case 'foundry': return '#4fc3f7'; // Cyan
      case 'moat': return '#81c784'; // Forest green
      case 'architecture': return '#ba68c8'; // Lavender
      case 'anchor': return '#ffd54f'; // Gold
      case 'governance': return '#ff8a65'; // Coral
      default: return '#c9c4b6';
    }
  };

  return (
    <section className="page-wrap dr-ask-section">
      <SectionHead 
        tag="08 / ASK DEEPGRID" 
        title="Silicon Intelligence & Architecture Navigator" 
        copy="Explore the complete DeepGrid Semi technology portfolio: 10-chip SKU compendium, automotive & defense qualification (AEC-Q100, DAP-2020), sovereign fab manufacturing, and dual-core lockstep benchmarks. All specifications are directly extracted and verified against authoritative engineering whitepapers."
      />

      {/* Query Search Bar */}
      <div className="dr-ask-bar">
        <div className="dr-ask-input-wrap">
          <Search className="dr-ask-search-icon" size={20} />
          <input 
            type="text"
            className="dr-ask-input"
            value={query}
            onChange={e => handleQuerySelect(e.target.value)}
            placeholder="Ask about SKUs (1–10), D100, lockstep latency, 198-day loop, 3-factory sovereignty, DAP-2020..."
            aria-label="Search DeepGrid knowledge"
          />
          {query && (
            <button className="dr-ask-clear" onClick={() => handleQuerySelect('')} aria-label="Clear query">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Structured Executive Intelligence Control Deck: Category-Titled Layers */}
        <div className="dr-deck-container">
          {/* Layer 1: Strategic Technology Domain */}
          <div className="dr-deck-section">
            <div className="dr-deck-header">
              <Compass size={15} className="dr-doc-icon" />
              <span className="dr-deck-title">1. STRATEGIC TECHNOLOGY DOMAIN:</span>
            </div>
            <div className="dr-deck-strip" role="tablist" aria-label="Filter by technology domain">
              {categories.map(c => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={activeCategory === c.id}
                  className={`dr-deck-pill ${activeCategory === c.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(c.id);
                    if (c.id === 'ai') {
                      setSelectedNodeId('dg32-30-usecases');
                    } else if (c.id === 'sku') {
                      setSelectedNodeId('sku-1');
                    } else if (c.id === 'strategy') {
                      setSelectedNodeId('fab-scl');
                    } else if (c.id === 'loop') {
                      setSelectedNodeId('arch-198loop');
                    } else if (c.id === 'defense') {
                      setSelectedNodeId('moat-dap2020');
                    } else if (c.id === 'architecture') {
                      setSelectedNodeId('arch-lockstep');
                    } else if (c.id === 'finance') {
                      setSelectedNodeId('fin-munger');
                    }
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer 2: Authoritative Evidence Source */}
          <div className="dr-deck-section">
            <div className="dr-deck-header">
              <FileText size={15} className="dr-doc-icon" />
              <span className="dr-deck-title">2. FILTER BY AUTHORITATIVE EVIDENCE SOURCE:</span>
            </div>
            <div className="dr-deck-strip" role="tablist" aria-label="Filter queries by document">
              {documentSources.map(doc => (
                <button
                  key={doc.id}
                  role="tab"
                  aria-selected={selectedDocId === doc.id}
                  className={`dr-deck-pill ${selectedDocId === doc.id ? 'active' : ''}`}
                  onClick={() => setSelectedDocId(doc.id)}
                  title={doc.title}
                >
                  <span className="dr-doc-pill-badge">{doc.badge}</span>
                  <span className="dr-doc-pill-label">{doc.id === 'all' ? 'All (34 Queries)' : doc.title.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>

            {/* Active Document Context Banner */}
            <div className="dr-doc-active-banner">
              <div className="dr-doc-active-left">
                <span className="dr-doc-active-badge">{activeDoc.badge}</span>
                <div className="dr-doc-active-info">
                  <span className="dr-doc-active-title">{activeDoc.title}</span>
                  <span className="dr-doc-active-sub">{activeDoc.subtitle}</span>
                </div>
              </div>
              <div className="dr-doc-active-right">
                <span className="dr-doc-active-file">AUTHORITATIVE REF: {activeDoc.fileReference}</span>
              </div>
            </div>
          </div>

          {/* Layer 3: High-Yield Technical Queries */}
          <div className="dr-deck-section">
            <div className="dr-deck-header">
              <HelpCircle size={15} className="dr-doc-icon" />
              <span className="dr-deck-title">3. HIGH-YIELD TECHNICAL QUERIES ({filteredPrompts.length}):</span>
            </div>
            <div className="dr-ask-prompts" aria-label="Quick queries">
              {filteredPrompts.map(p => (
                <button
                  key={p.id}
                  className={`dr-ask-chip ${query === p.query ? 'active' : ''}`}
                  onClick={() => handleQuerySelect(p.query)}
                  title={p.query}
                >
                  <span className="dr-ask-chip-doc">{p.docBadge}</span>
                  <span className="dr-ask-chip-text">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layer 4: Presentation View Mode */}
          <div className="dr-deck-section dr-deck-view-section">
            <div className="dr-deck-header">
              <LayoutGrid size={15} className="dr-doc-icon" />
              <span className="dr-deck-title">4. PRESENTATION FORMAT:</span>
            </div>
            <div className="dr-ask-view-toggle">
              <button
                className={`dr-ask-toggle-btn ${activeView === 'graph' ? 'active' : ''}`}
                onClick={() => setActiveView('graph')}
                title="Interactive Silicon Architecture Map"
              >
                <Network size={16} /> <span>System Map</span>
              </button>
              <button
                className={`dr-ask-toggle-btn ${activeView === 'cards' ? 'active' : ''}`}
                onClick={() => setActiveView('cards')}
                title="Executive Technical Dossiers"
              >
                <LayoutGrid size={16} /> <span>Dossiers ({results.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Grounding Badge */}
      <div className="dr-ask-meta-strip">
        <span className="mono">
          {activeView === 'graph' 
            ? `SILICON ARCHITECTURE MAP · SELECT ANY MODULE TO INSPECT SPECIFICATIONS`
            : `EXECUTIVE SPECIFICATION DOSSIERS (${results.length} VERIFIED ENTRIES)${query ? ` · FILTER: "${query.toUpperCase()}"` : ''}`}
        </span>
        <span className="dr-ask-badge-verified">
          <ShieldCheck size={14} /> 100% SPEC-VERIFIED
        </span>
      </div>

      {/* View 1: Interactive Knowledge Graph View */}
      {activeView === 'graph' && (
        <div className="dr-graph-container">
          <div className="dr-graph-canvas-wrap">
            <div className="dr-graph-legend">
              <span className="legend-item"><i style={{background: '#00e5ff'}}/> Edge AI (30 Tasks)</span>
              <span className="legend-item"><i style={{background: '#d4a36e'}}/> SKUs & Dies</span>
              <span className="legend-item"><i style={{background: '#4fc3f7'}}/> Foundries</span>
              <span className="legend-item"><i style={{background: '#81c784'}}/> Defense Moats</span>
              <span className="legend-item"><i style={{background: '#ba68c8'}}/> Protocols</span>
              <span className="legend-item"><i style={{background: '#ffd54f'}}/> Anchors</span>
              <span className="legend-item"><i style={{background: '#ff8a65'}}/> Governance</span>
              <button className="dr-graph-reset" onClick={resetGraphPositions} title="Reset Graph Layout">
                <RotateCcw size={14} /> Reset View
              </button>
            </div>

            <svg
              ref={svgRef}
              className="dr-graph-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              role="application"
              aria-label="DeepGrid Knowledge Graph Network"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Edges */}
              <g className="dr-graph-edges">
                {graphEdges.map((e, idx) => {
                  const pFrom = nodePositions[e.from] || { x: 50, y: 50 };
                  const pTo = nodePositions[e.to] || { x: 50, y: 50 };
                  const isHighlighted = e.from === selectedNodeId || e.to === selectedNodeId;
                  const isNeighborConnection = activeConnectedNodeIds.has(e.from) && activeConnectedNodeIds.has(e.to);

                  const fromNode = graphNodes.find(n => n.id === e.from);
                  const toNode = graphNodes.find(n => n.id === e.to);
                  const fromCatMatch = doesItemMatchCategory(activeCategory, deepGridCatalog.find(i => i.id === (nodeToCatalogMap[e.from] || e.from))?.category, fromNode?.category);
                  const toCatMatch = doesItemMatchCategory(activeCategory, deepGridCatalog.find(i => i.id === (nodeToCatalogMap[e.to] || e.to))?.category, toNode?.category);

                  let edgeOpacity = isHighlighted ? 1 : (isNeighborConnection ? 0.42 : 0.08);
                  if (activeCategory !== 'all' && !isHighlighted) {
                    if (!fromCatMatch || !toCatMatch) {
                      edgeOpacity = 0.03;
                    } else {
                      edgeOpacity = 0.35;
                    }
                  }

                  return (
                    <g key={idx} className={`dr-edge-group ${isHighlighted ? 'highlighted' : ''}`} style={{ opacity: edgeOpacity, transition: 'opacity 0.25s ease' }}>
                      <line
                        x1={pFrom.x}
                        y1={pFrom.y}
                        x2={pTo.x}
                        y2={pTo.y}
                        className="dr-graph-edge-line"
                        stroke={isHighlighted ? "#d4a36e" : "#51625a"}
                        strokeWidth={isHighlighted ? "0.6" : "0.22"}
                      />
                      {isHighlighted && (
                        <g>
                          <rect
                            x={(pFrom.x + pTo.x) / 2 - 9}
                            y={(pFrom.y + pTo.y) / 2 - 2.6}
                            width="18"
                            height="3.2"
                            rx="0.6"
                            fill="#0c0f0e"
                            stroke="#d4a36e66"
                            strokeWidth="0.15"
                          />
                          <text
                            x={(pFrom.x + pTo.x) / 2}
                            y={(pFrom.y + pTo.y) / 2 - 0.5}
                            className="dr-graph-edge-text"
                            textAnchor="middle"
                            fill="#eee6d4"
                            fontSize="1.5"
                            fontFamily="monospace"
                            fontWeight="600"
                          >
                            {e.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Nodes with True Subgraph Dimming */}
              <g className="dr-graph-nodes">
                {graphNodes.map(node => {
                  const pos = nodePositions[node.id] || { x: node.x, y: node.y };
                  const isSelected = selectedNodeId === node.id;
                  const isConnected = activeConnectedNodeIds.has(node.id);
                  const color = getNodeColor(node.category);
                  
                  const catalogId = nodeToCatalogMap[node.id] || node.id;
                  const catalogItem = deepGridCatalog.find(item => item.id === catalogId);
                  const isCategoryMatch = doesItemMatchCategory(activeCategory, catalogItem?.category, node.category);

                  // True Subgraph Dimming:
                  // Selected: 1.0, 1st-degree connected: 0.90, category-match: 0.75, non-category: 0.08
                  let nodeOpacity = 0.28;
                  if (isSelected) {
                    nodeOpacity = 1.0;
                  } else if (isConnected) {
                    nodeOpacity = 0.90;
                  } else if (activeCategory !== 'all') {
                    nodeOpacity = isCategoryMatch ? 0.75 : 0.08;
                  }

                  return (
                    <g
                      key={node.id}
                      className={`dr-graph-node-group ${isSelected ? 'selected' : ''} ${isConnected ? 'connected' : ''}`}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      style={{ opacity: nodeOpacity, transition: 'opacity 0.25s ease' }}
                    >
                      {/* Outer pulse halo for selected */}
                      {isSelected && (
                        <circle
                          r="4.0"
                          className="dr-node-halo"
                          stroke={color}
                        />
                      )}
                      {/* Outer ring for 1st-degree connected neighbors */}
                      {isConnected && !isSelected && (
                        <circle
                          r="2.8"
                          fill="none"
                          stroke={color}
                          strokeWidth="0.3"
                          strokeDasharray="0.8 0.4"
                          opacity="0.8"
                        />
                      )}
                      {/* Center Node Dot */}
                      <circle
                        r={isSelected ? "2.6" : (isConnected ? "2.1" : "1.7")}
                        fill={color}
                        className="dr-node-dot"
                        onMouseDown={(e) => handleMouseDown(node.id, e)}
                        onClick={() => handleNodeSelect(node.id)}
                      />
                      {/* Node Label */}
                      <text
                        y="4.2"
                        className="dr-node-label"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : (isConnected ? color : (isCategoryMatch && activeCategory !== 'all' ? '#ede5d5' : '#7a8880'))}
                        fontWeight={isSelected || isConnected || (isCategoryMatch && activeCategory !== 'all') ? "600" : "400"}
                        fontSize={isSelected ? "2.6" : (isConnected ? "2.2" : "1.8")}
                        onClick={() => handleNodeSelect(node.id)}
                      >
                        {node.shortName}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Interactive Spec Inspector Drawer */}
          <aside className="dr-graph-spec-drawer">
            <div className="dr-drawer-header">
              <span className="mono dr-drawer-badge" style={{color: getNodeColor(graphNodes.find(n => n.id === selectedNodeId)?.category || 'sku')}}>
                {(graphNodes.find(n => n.id === selectedNodeId)?.category || 'SKU').toUpperCase()} NODE
              </span>
              <span className="dr-drawer-citation mono">{activeDetailItem?.citation || 'DeepGrid Architecture Matrix'}</span>
            </div>

            <h3 className="dr-drawer-title">{activeDetailItem ? activeDetailItem.name : selectedNodeId}</h3>
            <p className="dr-drawer-tagline">{activeDetailItem?.tagline || graphNodes.find(n => n.id === selectedNodeId)?.description}</p>

            {/* Hardware Parameters */}
            {activeDetailItem && (activeDetailItem.nodeFoundry || activeDetailItem.voltageRail || activeDetailItem.standards) && (
              <div className="dr-drawer-specs">
                {activeDetailItem.nodeFoundry && (
                  <div className="dr-drawer-spec-row">
                    <span className="mono">FAB & NODE:</span>
                    <strong>{activeDetailItem.nodeFoundry}</strong>
                  </div>
                )}
                {activeDetailItem.voltageRail && (
                  <div className="dr-drawer-spec-row">
                    <span className="mono">VOLTAGE / RAIL:</span>
                    <strong>{activeDetailItem.voltageRail}</strong>
                  </div>
                )}
                {activeDetailItem.standards && (
                  <div className="dr-drawer-spec-row">
                    <span className="mono">STANDARDS:</span>
                    <strong>{activeDetailItem.standards}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Grounded Summary */}
            {activeDetailItem && (
              <div className="dr-drawer-summary">
                <p>{activeDetailItem.summary}</p>
              </div>
            )}

            {/* Key Facts list */}
            {activeDetailItem && (
              <div className="dr-drawer-facts">
                <span className="mono dr-drawer-facts-title">KEY SPECIFICATIONS & HIGHLIGHTS</span>
                <ul>
                  {activeDetailItem.keyFacts.map((fact, idx) => (
                    <li key={idx}>
                      <Check size={14} className="dr-check-icon" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authoritative Source Document Reference with Direct Links */}
            {activeDetailItem && (() => {
              const doc = resolveItemDocument(activeDetailItem);
              return (
                <div className="dr-drawer-doc-card">
                  <div className="dr-drawer-doc-header">
                    <span className="mono dr-drawer-doc-badge">{doc.badge}</span>
                    <span className="mono dr-drawer-doc-num">DOC #{doc.docNum}</span>
                  </div>
                  <h4 className="dr-drawer-doc-name">{doc.title}</h4>
                  <p className="dr-drawer-doc-citation mono">{activeDetailItem.citation}</p>
                  <div className="dr-drawer-doc-actions">
                    <a 
                      href={doc.pdfFile} 
                      download={doc.pdfFileName}
                      className="dr-drawer-link-btn primary"
                      title={`Download official ${doc.pdfFileName} (${doc.fileSizePdf})`}
                    >
                      <Download size={13} />
                      <span>Download PDF ({doc.fileSizePdf})</span>
                    </a>
                    <a 
                      href={doc.specFile} 
                      download={doc.specFileName}
                      className="dr-drawer-link-btn outline"
                      title={`Download ${doc.specFileName} (${doc.fileSizeMd})`}
                    >
                      <FileText size={13} />
                      <span>MD Spec</span>
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <div className="dr-drawer-actions">
              {activeDetailItem?.actions && activeDetailItem.actions.map(act => (
                <button
                  key={act.target}
                  className="primary"
                  onClick={() => go(act.target)}
                >
                  {act.label} <ArrowUpRight size={16} />
                </button>
              ))}
              {activeDetailItem && (
                <button
                  className="text-link"
                  onClick={() => setSelectedItem(activeDetailItem)}
                >
                  Full Technical Specification <ArrowRight size={15} />
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* View 2: Traditional Intel Dossier Cards Grid */}
      {activeView === 'cards' && (
        <div className="dr-ask-grid">
          {results.map(item => (
            <article className="dr-ask-card" key={item.id}>
              <div className="dr-ask-card-header">
                <span className="dr-ask-category-tag mono">{item.category.toUpperCase()}</span>
                <span className="dr-ask-citation mono">{item.citation}</span>
              </div>

              <h3 className="dr-ask-card-title">{item.name}</h3>
              <p className="dr-ask-card-tagline">{item.tagline}</p>

              {/* Hardware Specs Strip */}
              {(item.nodeFoundry || item.voltageRail || item.standards) && (
                <div className="dr-ask-specs">
                  {item.nodeFoundry && (
                    <div className="dr-ask-spec-item">
                      <span className="mono">NODE & FAB</span>
                      <strong>{item.nodeFoundry}</strong>
                    </div>
                  )}
                  {item.voltageRail && (
                    <div className="dr-ask-spec-item">
                      <span className="mono">RAILS / VOLTAGE</span>
                      <strong>{item.voltageRail}</strong>
                    </div>
                  )}
                  {item.standards && (
                    <div className="dr-ask-spec-item">
                      <span className="mono">STANDARDS</span>
                      <strong>{item.standards}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="dr-ask-summary">
                <p>{item.summary}</p>
              </div>

              {/* Key Verified Facts */}
              <div className="dr-ask-facts">
                <span className="dr-ask-facts-title mono">KEY TECHNICAL HIGHLIGHTS</span>
                <ul>
                  {item.keyFacts.map((fact, idx) => (
                    <li key={idx}>
                      <Check size={15} className="dr-ask-check-icon" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="dr-ask-actions">
                {item.actions && item.actions.map(act => (
                  <button
                    key={act.target}
                    className="primary"
                    onClick={() => go(act.target)}
                  >
                    {act.label} <ArrowUpRight size={16} />
                  </button>
                ))}
                {(() => {
                  const doc = resolveItemDocument(item);
                  return (
                    <a 
                      href={doc.pdfFile}
                      download={doc.pdfFileName}
                      className="dr-ask-card-pdf-link"
                      title={`Download official ${doc.pdfFileName} (${doc.fileSizePdf})`}
                      onClick={e => e.stopPropagation()}
                    >
                      <Download size={13} />
                      <span>{doc.fileSizePdf} PDF</span>
                    </a>
                  );
                })()}
                <button 
                  className="text-link"
                  onClick={() => setSelectedItem(item)}
                >
                  Inspect Technical Dossier <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}

          {results.length === 0 && (
            <div className="dr-ask-empty">
              <p className="dr-lead">No exact match found for &quot;{query}&quot;.</p>
              <p className="muted">
                Try querying by SKU name (e.g. <code>SKU-1</code>, <code>SKU-4</code>, <code>SKU-7</code>), 
                domain (<code>198-day loop</code>, <code>radar</code>, <code>SCL Mohali</code>, <code>DAP-2020</code>), 
                or click one of the quick query chips above.
              </p>
              <button className="primary" onClick={() => handleQuerySelect('')}>
                Reset Search Filter
              </button>
            </div>
          )}
        </div>
      )}



      {/* Modal / Slide-out for Full Vector Citation */}
      {selectedItem && (() => {
        const selectedDoc = resolveItemDocument(selectedItem);
        return (
          <dialog 
            className="dr-ask-modal-backdrop" 
            open
            aria-modal="true"
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedItem(null);
                setReadingDocContent(null);
              }
            }}
            onClick={() => {
              setSelectedItem(null);
              setReadingDocContent(null);
            }}
          >
            <section 
              className="dr-ask-modal"
              aria-label="Audit details"
              tabIndex={-1}
              onKeyDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
            >
              <header className="dr-ask-modal-header">
                <div>
                  <span className="mono">{selectedItem.category.toUpperCase()} · AUTHORITATIVE SPECIFICATION AUDIT</span>
                  <h2>{selectedItem.name}</h2>
                </div>
                <button 
                  className="dr-ask-modal-close" 
                  onClick={() => {
                    setSelectedItem(null);
                    setReadingDocContent(null);
                  }} 
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="dr-ask-modal-body">
                {readingDocContent ? (
                  <div className="dr-ask-modal-inline-reader">
                    <div className="dr-ask-inline-reader-bar">
                      <button 
                        type="button"
                        className="dr-ask-back-btn" 
                        onClick={() => setReadingDocContent(null)}
                      >
                        ← Back to Specification Audit
                      </button>
                      <div className="dr-ask-inline-reader-actions">
                        <button 
                          type="button"
                          className="dr-doc-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(readingDocContent.text);
                            setCopiedModalSpec(true);
                            setTimeout(() => setCopiedModalSpec(false), 2000);
                          }}
                        >
                          {copiedModalSpec ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedModalSpec ? 'Copied' : 'Copy Spec'}</span>
                        </button>
                        <a 
                          href={selectedDoc.pdfFile} 
                          download={selectedDoc.pdfFileName} 
                          className="dr-doc-btn dr-doc-btn-primary"
                        >
                          <Download size={14} /> Download PDF ({selectedDoc.fileSizePdf})
                        </a>
                      </div>
                    </div>
                    <pre className="dr-reader-markdown-view">{readingDocContent.text}</pre>
                  </div>
                ) : (
                  <>
                    <p className="dr-ask-modal-tagline">{selectedItem.tagline}</p>
                    
                    {/* Authoritative Source Reference Card with Direct Document Links */}
                    <div className="dr-ask-modal-source-card">
                      <div className="dr-ask-source-head">
                        <div className="dr-ask-source-badge-wrap">
                          <BookOpen size={16} className="dr-ask-source-icon" />
                          <span className="mono dr-ask-source-badge">{selectedDoc.badge}</span>
                        </div>
                        <span className="dr-ask-source-docnum mono">
                          AUTHORITATIVE SPEC DOC #{selectedDoc.docNum} · {selectedDoc.subsystem.toUpperCase()}
                        </span>
                      </div>

                      <div className="dr-ask-source-meta">
                        <h4 className="dr-ask-source-title">{selectedDoc.title}</h4>
                        <p className="dr-ask-source-sub">{selectedDoc.subtitle}</p>
                        <div className="dr-ask-source-citation">
                          <span className="mono">SPECIFIC AUDIT CITATION:</span>
                          <strong>{selectedItem.citation}</strong>
                        </div>
                      </div>

                      <div className="dr-ask-source-links">
                        <a 
                          href={selectedDoc.pdfFile} 
                          download={selectedDoc.pdfFileName}
                          className="dr-doc-link-btn primary"
                          title={`Download official ${selectedDoc.pdfFileName} (${selectedDoc.fileSizePdf})`}
                        >
                          <Download size={14} />
                          <span>Download Official PDF</span>
                          <span className="dr-doc-link-tag mono">{selectedDoc.fileSizePdf} · {selectedDoc.pdfPageCount}</span>
                        </a>

                        <a 
                          href={selectedDoc.specFile}
                          download={selectedDoc.specFileName}
                          className="dr-doc-link-btn outline"
                          title={`Download ${selectedDoc.specFileName} (${selectedDoc.fileSizeMd})`}
                        >
                          <FileText size={14} />
                          <span>Architecture Spec (.md)</span>
                          <span className="dr-doc-link-tag mono">{selectedDoc.fileSizeMd}</span>
                        </a>

                        <button 
                          type="button"
                          className="dr-doc-link-btn outline"
                          onClick={() => handleReadDocInline(selectedDoc)}
                          title={`Read ${selectedDoc.title} inline`}
                        >
                          <BookOpen size={14} />
                          <span>{loadingDocContent ? 'Loading...' : 'Read Spec Inline'}</span>
                        </button>

                        <button 
                          type="button"
                          className="dr-doc-link-btn text"
                          onClick={() => {
                            setSelectedItem(null);
                            setReadingDocContent(null);
                            go('library');
                          }}
                          title="Open Section 07 Authoritative Design Archive"
                        >
                          <span>Inspect in Design Library</span>
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>

                    <h4>Key Technical Specifications & Operational Envelope:</h4>
                    <ul className="dr-ask-modal-facts">
                      {selectedItem.keyFacts.map((fact, idx) => (
                        <li key={idx}>
                          <span className="dr-ask-num mono">{String(idx + 1).padStart(2, '0')}</span>
                          <p>{fact}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="dr-ask-modal-footer">
                      <button 
                        type="button"
                        className="dr-doc-link-btn outline" 
                        onClick={() => handleReadDocInline(selectedDoc)}
                        style={{marginRight: 'auto'}}
                      >
                        <BookOpen size={15} /> Read Full Document Spec (.md)
                      </button>
                      <button 
                        type="button"
                        className="primary" 
                        onClick={() => {
                          setSelectedItem(null);
                          setReadingDocContent(null);
                        }}
                      >
                        Close Specification View
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </dialog>
        );
      })()}

      <div className="dr-links dr-sec-gap" style={{marginTop: '2.5rem'}}>
        <button className="text-link" onClick={() => go('overview')}>
          01 / Overview &amp; safety thesis <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('family')}>
          02 / Product family comparison <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('architecture')}>
          03 / Block architecture &amp; 3D die <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('control')}>
          04 / 100 kHz control-loop budget <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('pinout')}>
          05 / QFN-64 pinout &amp; package <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('roadmap')}>
          06 / Multi-spin roadmap <ArrowUpRight size={16} />
        </button>
        <button className="text-link" onClick={() => go('library')}>
          07 / Authoritative documents &amp; official PDFs <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
