'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
import {useState, useMemo, useRef} from 'react';
import {
  Search, ArrowUpRight, ArrowRight, ShieldCheck, 
  BookOpen, X, Check, Network, LayoutGrid, RotateCcw,
  FileText
} from 'lucide-react';
import {SectionHead} from './detail';
import {
  deepGridCatalog, searchDeepGridKnowledge, quickPrompts, 
  documentSources, DocumentSource,
  graphNodes, graphEdges, DeepGridItem,
  nodeToCatalogMap, catalogToNodeMap
} from './data/deepgrid-knowledge';

export default function AskDeepGrid({go}: {go: (hash: string) => void}) {
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeView, setActiveView] = useState<'graph' | 'cards'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('dg32-lite');
  const [selectedItem, setSelectedItem] = useState<DeepGridItem | null>(null);
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

  // Filter catalog items
  const results = useMemo(() => {
    const raw = searchDeepGridKnowledge(query);
    if (activeCategory === 'all') return raw;
    return raw.filter(item => item.category === activeCategory);
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
    const matches = searchDeepGridKnowledge(promptQuery);
    if (matches.length > 0) {
      const matchedItem = matches[0];
      const targetNodeId = catalogToNodeMap[matchedItem.id] || matchedItem.id;
      setSelectedNodeId(targetNodeId);

      // Category auto-selection: if category filter would hide the matched node, clear restriction
      if (activeCategory !== 'all' && activeCategory !== matchedItem.category) {
        setActiveCategory('all');
      }
    }
  };

  // Handle Node Click with Category Auto-Selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const catalogId = nodeToCatalogMap[nodeId] || nodeId;
    const item = deepGridCatalog.find(i => i.id === catalogId);
    if (item && activeCategory !== 'all' && activeCategory !== item.category) {
      setActiveCategory('all');
    }
  };

  const categories = [
    { id: 'all', label: 'All Intelligence' },
    { id: 'ai', label: 'Edge AI (30 Tasks)' },
    { id: 'sku', label: 'SKUs (10 Chips)' },
    { id: 'strategy', label: 'Three-Factory Roadmap' },
    { id: 'loop', label: '198-Day Loop & EDA' },
    { id: 'defense', label: 'DAP-2020 & Defense Moats' },
    { id: 'architecture', label: 'Silicon Architecture & RTL' },
    { id: 'finance', label: 'Finance & Risk Audits' }
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
        tag="07 / ASK DEEPGRID" 
        title="Grounded Silicon Intelligence & Knowledge Graph" 
        copy="Query the full vector knowledge matrix of DeepGrid Semi: 10-chip SKU compendium, mature-node physics (130nm/180nm BCD, SiGe 350GHz), the 198-day loop, and sovereign defense moats. Zero hallucination: every parameter is grounded in the Master Whitepaper and Technical Annex v3."
      />

      {/* Query Search Bar */}
      <div className="dr-ask-bar">
        <div className="dr-ask-input-wrap">
          <Search className="dr-ask-search-icon" size={20} />
          <input 
            type="text"
            className="dr-ask-input"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (activeView === 'graph' && e.target.value) {
                handleQuerySelect(e.target.value);
              }
            }}
            placeholder="Ask about SKUs (1–10), D100, lockstep latency, 198-day loop, 3-factory sovereignty, DAP-2020..."
            aria-label="Search DeepGrid knowledge"
          />
          {query && (
            <button className="dr-ask-clear" onClick={() => setQuery('')} aria-label="Clear query">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Document-Aware Quick Queries Explorer */}
        <div className="dr-doc-selector-container">
          <div className="dr-doc-selector-header">
            <div className="dr-doc-selector-title">
              <FileText size={15} className="dr-doc-icon" />
              <span>FILTER BY SOURCE DOCUMENT:</span>
            </div>
            <div className="dr-doc-badges-strip" role="tablist" aria-label="Filter queries by document">
              {documentSources.map(doc => (
                <button
                  key={doc.id}
                  role="tab"
                  aria-selected={selectedDocId === doc.id}
                  className={`dr-doc-pill ${selectedDocId === doc.id ? 'active' : ''}`}
                  onClick={() => setSelectedDocId(doc.id)}
                  title={doc.title}
                >
                  <span className="dr-doc-pill-badge">{doc.badge}</span>
                  <span className="dr-doc-pill-label">{doc.id === 'all' ? 'All (34 Queries)' : doc.title.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active document context banner */}
          <div className="dr-doc-active-banner">
            <div className="dr-doc-active-left">
              <span className="dr-doc-active-badge">{activeDoc.badge}</span>
              <div className="dr-doc-active-info">
                <span className="dr-doc-active-title">{activeDoc.title}</span>
                <span className="dr-doc-active-sub">{activeDoc.subtitle}</span>
              </div>
            </div>
            <div className="dr-doc-active-right">
              <span className="dr-doc-active-file">REF: {activeDoc.fileReference}</span>
            </div>
          </div>

          {/* Filtered Quick Prompts */}
          <div className="dr-ask-prompts" aria-label="Quick queries">
            <span className="dr-ask-prompts-label">HIGH-YIELD QUERIES ({filteredPrompts.length}):</span>
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
      </div>

      {/* View Switcher & Category Tabs */}
      <div className="dr-ask-controls-strip">
        <div className="dr-ask-filters" role="tablist" aria-label="Filter categories">
          {categories.map(c => (
            <button
              key={c.id}
              role="tab"
              aria-selected={activeCategory === c.id}
              className={`dr-ask-filter-btn ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(c.id);
                if (c.id === 'ai') {
                  setSelectedNodeId('dg32-30-usecases');
                } else if (c.id !== 'all') {
                  const first = deepGridCatalog.find(item => item.category === c.id);
                  if (first) setSelectedNodeId(first.id);
                }
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="dr-ask-view-toggle">
          <button
            className={`dr-ask-toggle-btn ${activeView === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveView('graph')}
            title="Interactive Knowledge Graph Topology"
          >
            <Network size={16} /> <span>Graph Matrix</span>
          </button>
          <button
            className={`dr-ask-toggle-btn ${activeView === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveView('cards')}
            title="Catalog Intel Dossiers"
          >
            <LayoutGrid size={16} /> <span>Dossier Cards ({results.length})</span>
          </button>
        </div>
      </div>

      {/* Results Count & Grounding Badge */}
      <div className="dr-ask-meta-strip">
        <span className="mono">
          {activeView === 'graph' 
            ? `INTERACTIVE KNOWLEDGE GRAPH · ${graphNodes.length} GROUNDED NODES & ${graphEdges.length} RELATIONSHIPS · DRAG TO EXPLORE`
            : `SHOWING ${results.length} VERIFIED INTEL ARTIFACTS ${query ? `FOR "${query.toUpperCase()}"` : ''}`}
        </span>
        <span className="dr-ask-badge-verified">
          <ShieldCheck size={14} /> ZERO-HALLUCINATION GROUNDED
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
                <RotateCcw size={14} /> Reset
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
                  const edgeOpacity = isHighlighted ? 1 : (isNeighborConnection ? 0.35 : 0.08);

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
                  const isCategoryMatch = activeCategory === 'all' || node.category === activeCategory;

                  // True Subgraph Dimming:
                  // Selected: 1.0, 1st-degree connected: 0.88, non-connected: 0.20 (or 0.12 if category filter)
                  let nodeOpacity = 0.20;
                  if (isSelected) {
                    nodeOpacity = 1.0;
                  } else if (isConnected) {
                    nodeOpacity = 0.88;
                  } else if (activeCategory !== 'all') {
                    nodeOpacity = isCategoryMatch ? 0.45 : 0.12;
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
                        fill={isSelected ? '#ffffff' : (isConnected ? color : '#7a8880')}
                        fontWeight={isSelected || isConnected ? "600" : "400"}
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
                <span className="mono dr-drawer-facts-title">GROUNDED TAKEAWAYS</span>
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
                  Full Socratic Audit <ArrowRight size={15} />
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
                <span className="dr-ask-facts-title mono">AUTHENTIC VECTOR FACTS</span>
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
                <button 
                  className="text-link"
                  onClick={() => setSelectedItem(item)}
                >
                  Inspect Full Citations <ArrowRight size={15} />
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
              <button className="primary" onClick={() => setQuery('')}>
                Reset Search Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal / Slide-out for Full Vector Citation */}
      {selectedItem && (
        <dialog 
          className="dr-ask-modal-backdrop" 
          open
          aria-modal="true"
          onKeyDown={e => {
            if (e.key === 'Escape') setSelectedItem(null);
          }}
          onClick={() => setSelectedItem(null)}
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
                <span className="mono">{selectedItem.category.toUpperCase()} · VERIFIED VECTOR AUDIT</span>
                <h2>{selectedItem.name}</h2>
              </div>
              <button className="dr-ask-modal-close" onClick={() => setSelectedItem(null)} aria-label="Close modal">
                <X size={20} />
              </button>
            </header>
            <div className="dr-ask-modal-body">
              <p className="dr-ask-modal-tagline">{selectedItem.tagline}</p>
              
              <div className="dr-ask-modal-source">
                <BookOpen size={18} />
                <div>
                  <strong>Primary Reference Source:</strong>
                  <span>{selectedItem.citation}</span>
                </div>
              </div>

              <h4>Core Takeaways & Socratic Boundary:</h4>
              <ul className="dr-ask-modal-facts">
                {selectedItem.keyFacts.map((fact, idx) => (
                  <li key={idx}>
                    <span className="dr-ask-num mono">{String(idx + 1).padStart(2, '0')}</span>
                    <p>{fact}</p>
                  </li>
                ))}
              </ul>

              <div className="dr-ask-modal-footer">
                <button className="primary" onClick={() => setSelectedItem(null)}>
                  Close Audit View
                </button>
              </div>
            </div>
          </section>
        </dialog>
      )}
    </section>
  );
}
