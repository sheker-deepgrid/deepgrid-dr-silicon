'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
import {useState, useMemo, useRef} from 'react';
import {
  Search, ArrowUpRight, ArrowRight, ShieldCheck, 
  BookOpen, X, Check, Network, LayoutGrid, RotateCcw,
  FileText, Compass, HelpCircle, Download, Copy, Users,
  ExternalLink, Maximize2
} from 'lucide-react';
import {SectionHead} from './detail';
import CouncilView from './council-view';
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

  const c = (item.citation || '').toLowerCase();
  const id = item.id.toLowerCase();

  // 1. Doc 6: Preliminary Datasheets (QFN-64, Supply Sequencing, Pinout, Boot ROM)
  if (
    c.includes('datasheet') || 
    id === 'dg32-lite' || 
    id.startsWith('dg32-qfn64') || 
    id.startsWith('dg32-power') || 
    id.startsWith('dg32-boot')
  ) {
    return groundedDocuments.find(d => d.id === 'doc6') || groundedDocuments[5];
  }

  // 2. Doc 1: Thirty Use Cases, No Accelerator (Edge AI & Diagnostics)
  if (
    c.includes('thirty use cases') || 
    id.startsWith('dg32-ai') || 
    id.startsWith('dg32-30') || 
    id.startsWith('dg32-tree') || 
    id.startsWith('dg32-dsp') || 
    id.startsWith('dg32-afe') || 
    id.startsWith('dg32-benchmark')
  ) {
    return groundedDocuments.find(d => d.id === 'doc1') || groundedDocuments[0];
  }

  // 3. Doc 3: dgrid_dshot_rx RTL Specification (Motor Telemetry & Floorplan)
  if (
    c.includes('dshot') || 
    c.includes('dshot_rx') || 
    id.includes('dshot') || 
    id.includes('floorplan')
  ) {
    return groundedDocuments.find(d => d.id === 'doc3') || groundedDocuments[2];
  }

  // 4. Doc 4: DG32-2DOM Dual-Domain Architecture (Clocks, Bridges, Attention, AVIP)
  if (
    c.includes('2dom') || 
    id.includes('2dom') || 
    id.includes('attention') || 
    id.includes('avip') || 
    id.includes('foc-loop')
  ) {
    return groundedDocuments.find(d => d.id === 'doc4') || groundedDocuments[3];
  }

  // 5. Doc 2: Technical Annex v3 (10 SKUs, D100, SDV Platform, Roadmap)
  if (
    c.includes('sku compendium') || 
    id.startsWith('sku-') || 
    id.includes('sdv') || 
    id.includes('d100') ||
    item.category === 'sku'
  ) {
    return groundedDocuments.find(d => d.id === 'doc2') || groundedDocuments[1];
  }

  // 6. Doc 5: Mature-Node Silicon Master Whitepaper (198-Day Loop, Strategy, Moats, Three-Factory, Finance, Capital)
  return groundedDocuments.find(d => d.id === 'doc5') || groundedDocuments[4];
}

export default function AskDeepGrid({go}: {go: (hash: string) => void}) {
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeView, setActiveView] = useState<'council' | 'graph' | 'cards'>('council');
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
  const graphIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send message to embedded graph when query changes
  const sendGraphSearch = (term: string) => {
    if (graphIframeRef.current && graphIframeRef.current.contentWindow) {
      graphIframeRef.current.contentWindow.postMessage({ search: term }, '*');
    }
  };

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

  // Document counts across all 39 catalog items
  const docCounts = useMemo(() => {
    const counts: Record<string, number> = { all: deepGridCatalog.length };
    deepGridCatalog.forEach(item => {
      const doc = resolveItemDocument(item);
      counts[doc.id] = (counts[doc.id] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter catalog items with strict document pillar and category scoping
  const results = useMemo(() => {
    let list = searchDeepGridKnowledge(query);

    // 1. Filter by selected document pillar
    if (selectedDocId !== 'all') {
      list = list.filter(item => {
        const doc = resolveItemDocument(item);
        return doc.id === selectedDocId;
      });
    }

    // 2. Filter by category if active
    if (activeCategory !== 'all') {
      list = list.filter(item => doesItemMatchCategory(activeCategory, item.category));
    }

    return list;
  }, [query, selectedDocId, activeCategory]);

  // Document filter for quick queries: 2 from each of the 6 PDF documents by default
  const filteredPrompts = useMemo(() => {
    if (selectedDocId === 'all') {
      const docIds: ('doc1' | 'doc2' | 'doc3' | 'doc4' | 'doc5' | 'doc6')[] = [
        'doc1', 'doc2', 'doc3', 'doc4', 'doc5', 'doc6'
      ];
      const selected: typeof quickPrompts = [];
      docIds.forEach(dId => {
        const matches = quickPrompts.filter(p => p.docId === dId);
        selected.push(...matches.slice(0, 2));
      });
      return selected;
    }
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
        title="Verified Silicon Intelligence" 
        copy="Search DeepGrid Semi technology, manufacturing qualifications, sovereign supply chain security, and motor-control silicon architecture. Every answer is grounded in authoritative engineering whitepapers with downloadable primary references."
      />

      {/* Top View Selector Strip */}
      <div className="dr-ask-top-bar">
        <div className="dr-ask-view-toggle">
          <button
            className={`dr-ask-toggle-btn ${activeView === 'council' ? 'active' : ''}`}
            onClick={() => setActiveView('council')}
            title="Direct Grounded Answers with Official Citations"
          >
            <BookOpen size={16} /> <span>Grounded Answers</span>
          </button>
          <button
            className={`dr-ask-toggle-btn ${activeView === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveView('graph')}
            title="Interactive Silicon Architecture Map"
          >
            <Network size={16} /> <span>Architecture Map</span>
          </button>
          <button
            className={`dr-ask-toggle-btn ${activeView === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveView('cards')}
            title="Full Catalog Specification Dossiers"
          >
            <LayoutGrid size={16} /> <span>Specification Dossiers ({results.length})</span>
          </button>
        </div>

        <span className="dr-ask-badge-verified">
          <ShieldCheck size={14} /> 100% SPEC-VERIFIED
        </span>
      </div>

      {/* Query Search Bar */}
      <div className="dr-ask-bar" style={{marginBottom: '18px'}}>
        <div className="dr-ask-input-wrap">
          <Search className="dr-ask-search-icon" size={20} />
          <input 
            type="search"
            name="deepgrid-query"
            autoComplete="off"
            spellCheck={false}
            className="dr-ask-input"
            value={query}
            onChange={e => handleQuerySelect(e.target.value)}
            placeholder="Ask about unit economics, supply chain security, 198-day loop, DAP-2020, ASIL-D safety…"
            aria-label="Search DeepGrid knowledge"
          />
          {query && (
            <button className="dr-ask-clear" onClick={() => handleQuerySelect('')} aria-label="Clear query">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick High-Yield Technical Queries (2 from each PDF document) */}
        <div className="dr-ask-prompts" style={{marginTop: '10px'}} aria-label="Quick queries">
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

      {/* View 0: Multi-Agent Council Deliberation (Primary View) */}
      {activeView === 'council' && (
        <CouncilView 
          query={query} 
          onSelectQuery={handleQuerySelect} 
          go={go} 
        />
      )}

      {/* View 1: Interactive Knowledge Graph View (Powered by Graphify) */}
      {activeView === 'graph' && (
        <div className="dr-graphify-embed-container">
          {/* Top Control Bar with Graph Metrics & Actions */}
          <div className="dr-graphify-embed-header">
            <div className="dr-graphify-header-left">
              <div className="dr-graphify-title">
                <Network size={18} style={{color: 'var(--copper)'}} />
                <span>DEEPGRID KNOWLEDGE GRAPH TOPOLOGY</span>
                <span className="dr-graphify-badge">1,037 NODES · 1,803 EDGES · 72 COMMUNITIES</span>
              </div>
              <p className="dr-graphify-subtitle">
                Interactive force-directed graph generated directly by Graphify across all 8 PDF whitepapers, 42 Markdown specs, and 143 code modules.
              </p>
            </div>

            <div className="dr-graphify-header-right">
              <a
                href={`./downloads/graph.html${query ? `?search=${encodeURIComponent(query)}` : ''}`}
                target="_blank"
                rel="noreferrer"
                className="dr-graphify-btn outline"
                title="Open interactive 3D graph in full window"
              >
                <Maximize2 size={13} /> Fullscreen
              </a>
              <a
                href="./downloads/graph.json"
                download="deepgrid-graph.json"
                className="dr-graphify-btn outline"
                title="Download 1,037-node Graphify JSON"
              >
                <Download size={13} /> Graph JSON
              </a>
              <a
                href="./downloads/GRAPH_REPORT.md"
                target="_blank"
                rel="noreferrer"
                className="dr-graphify-btn primary"
                title="View Graphify Audit Report"
              >
                <FileText size={13} /> Graph Report
              </a>
            </div>
          </div>

          {/* Query-Contextual Focus Strip */}
          <div className="dr-graphify-focus-strip">
            <span className="dr-focus-label">CONTEXTUAL SUBGRAPH FOCUS:</span>
            <div className="dr-focus-chips">
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('Goertzel')}
                title="Focus on Edge AI Goertzel recurrence filter"
              >
                Doc 1: Goertzel Recurrence
              </button>
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('DShot')}
                title="Focus on Hardware DShot RX RTL"
              >
                Doc 3: DShot RTL & GCR
              </button>
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('2DOM')}
                title="Focus on Dual-Domain DG32-2DOM CDC Bridges"
              >
                Doc 4: DG32-2DOM Dual Clock
              </button>
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('Three-Factory')}
                title="Focus on Sovereign Three-Factory Roadmap"
              >
                Doc 5: Three-Factory Roadmap
              </button>
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('DAP-2020')}
                title="Focus on DAP-2020 Make-II Moats"
              >
                Doc 5: DAP-2020 Make-II
              </button>
              <button
                type="button"
                className="dr-focus-chip"
                onClick={() => sendGraphSearch('QFN-64')}
                title="Focus on QFN-64 Packaging & Pinout"
              >
                Doc 6: QFN-64 Pinout
              </button>
            </div>
          </div>

          {/* Embedded vis.js Interactive Graph Stage */}
          <div className="dr-graphify-frame-wrap">
            <iframe
              ref={graphIframeRef}
              src={`./downloads/graph.html${query ? `?search=${encodeURIComponent(query)}` : ''}`}
              title="DeepGrid Graphify Knowledge Network"
              className="dr-graphify-iframe"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* View 2: Traditional Intel Dossier Cards Grid */}
      {activeView === 'cards' && (
        <>
          {/* Document Pillar Filter Strip */}
          <div className="dr-deck-strip" style={{marginBottom: '16px'}} role="tablist" aria-label="Filter dossiers by document pillar">
            {documentSources.map(doc => {
              const count = doc.id === 'all' ? docCounts.all : (docCounts[doc.id] || 0);
              return (
                <button
                  key={doc.id}
                  role="tab"
                  aria-selected={selectedDocId === doc.id}
                  className={`dr-deck-pill ${selectedDocId === doc.id ? 'active' : ''}`}
                  onClick={() => setSelectedDocId(doc.id)}
                  title={doc.title}
                >
                  <span className="dr-doc-pill-badge">{doc.badge}</span>
                  <span className="dr-doc-pill-label">
                    {doc.id === 'all' ? `All (${count})` : `${doc.title.split('(')[0].trim()} (${count})`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Document Pillar Context Banner */}
          {selectedDocId !== 'all' && activeDoc && (
            <div className="dr-dossier-doc-banner">
              <div className="dr-dossier-doc-banner-main">
                <div className="dr-dossier-banner-badge-row">
                  <span className="dr-dossier-pill-tag">{activeDoc.badge}</span>
                  <span className="dr-dossier-count-tag">
                    {results.length} Grounded Specification Dossiers
                  </span>
                </div>
                <h3 className="dr-dossier-doc-title">{activeDoc.title}</h3>
                <p className="dr-dossier-doc-subtitle">{activeDoc.subtitle}</p>
              </div>
              <div className="dr-dossier-doc-banner-actions">
                <button 
                  type="button" 
                  className="dr-dossier-action-btn primary"
                  onClick={() => {
                    const gDoc = groundedDocuments.find(d => d.id === activeDoc.id);
                    if (gDoc) handleReadDocInline(gDoc);
                  }}
                >
                  <BookOpen size={14} /> Read Spec Inline
                </button>
                {(() => {
                  const gDoc = groundedDocuments.find(d => d.id === activeDoc.id);
                  if (!gDoc) return null;
                  return (
                    <a
                      href={gDoc.pdfFile}
                      download
                      className="dr-dossier-action-btn secondary"
                    >
                      <Download size={14} /> Download PDF ({gDoc.fileSizePdf})
                    </a>
                  );
                })()}
                <button
                  type="button"
                  className="dr-dossier-action-btn outline"
                  onClick={() => setSelectedDocId('all')}
                  title="View all 39 dossiers across all 6 documents"
                >
                  View All (39)
                </button>
              </div>
            </div>
          )}

          {/* Query Filter Status if query is active */}
          {query.trim() && (
            <div className="dr-dossier-query-bar">
              <span>Filtering {results.length} dossiers for &quot;{query}&quot;</span>
              <button
                type="button"
                className="dr-dossier-clear-btn"
                onClick={() => setQuery('')}
              >
                Clear Query
              </button>
            </div>
          )}

          <div className="dr-ask-grid">
          {results.map(item => {
            const itemDoc = resolveItemDocument(item);
            return (
              <article className="dr-ask-card" key={item.id}>
                <div className="dr-ask-card-header">
                  <span className="dr-ask-category-tag mono">{itemDoc.badge} · {item.category.toUpperCase()}</span>
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
                  <a 
                    href={itemDoc.pdfFile}
                    download={itemDoc.pdfFileName}
                    className="dr-ask-card-pdf-link"
                    title={`Download official ${itemDoc.pdfFileName} (${itemDoc.fileSizePdf})`}
                    onClick={e => e.stopPropagation()}
                  >
                    <Download size={13} />
                    <span>{itemDoc.fileSizePdf} PDF</span>
                  </a>
                  <button 
                    className="text-link"
                    onClick={() => setSelectedItem(item)}
                  >
                    Inspect Technical Dossier <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
          </div>

          {results.length === 0 && (
            <div className="dr-ask-empty">
              <p className="dr-lead">No dossiers found matching &quot;{query}&quot; {selectedDocId !== 'all' ? `in ${activeDoc.title}` : ''}.</p>
              <p className="muted">
                Try querying by SKU name (e.g. <code>SKU-1</code>, <code>SKU-4</code>, <code>SKU-7</code>), 
                domain (<code>198-day loop</code>, <code>radar</code>, <code>SCL Mohali</code>, <code>DAP-2020</code>), 
                or reset document/query filters.
              </p>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px'}}>
                {query && (
                  <button className="primary" onClick={() => handleQuerySelect('')}>
                    Reset Query Filter
                  </button>
                )}
                {selectedDocId !== 'all' && (
                  <button className="outline" onClick={() => setSelectedDocId('all')}>
                    View All 39 Dossiers
                  </button>
                )}
              </div>
            </div>
          )}
        </>
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
                          <span>{loadingDocContent ? 'Loading…' : 'Read Spec Inline'}</span>
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
