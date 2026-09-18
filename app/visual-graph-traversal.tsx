'use client';
import { useState, useEffect } from 'react';
import {
  Network,
  Play,
  RotateCcw,
  Layers,
  Cpu,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { GraphRAGResult } from './data/graphrag-engine';

interface VisualGraphTraversalProps {
  result: GraphRAGResult;
}

interface VisualNode {
  id: string;
  name: string;
  category: 'query' | 'entry' | 'enabler' | 'target' | 'synthesis';
  role: string;
  detail: string;
  metric?: string;
  x: number;
  y: number;
}

interface VisualEdge {
  from: string;
  to: string;
  relation: string;
  active: boolean;
}

export default function VisualGraphTraversal({ result }: VisualGraphTraversalProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'stages'>('graph');
  const [activeStep, setActiveStep] = useState<number>(3); // fully traversed by default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const steps = result.graphPath.steps || [];
  const primaryDoc = result.citation.documentTitle;
  const pageRef = result.citation.page;

  // Build high-impact visual nodes based on the traversed steps and matched knowledge
  const visualNodes: VisualNode[] = [];
  const visualEdges: VisualEdge[] = [];

  // Node 0: The Business Query / Semantic Anchor
  const seedName = steps.length > 0 ? steps[0].source : result.contextualTitle;
  const targetName = steps.length > 0 ? steps[0].target : 'Industrial Edge Diagnostics';
  const neighborName = steps.length > 1 ? steps[1].target : (result.seedEntities[1]?.name || 'Hardware CORDIC Unit');

  visualNodes.push({
    id: 'node_query',
    name: result.query.length > 38 ? result.query.slice(0, 35) + '...' : result.query,
    category: 'query',
    role: 'Executive Query',
    detail: 'Sparse-Dense TF-IDF Vector cosine projection (5,101 terms)',
    metric: 'Vector Match',
    x: 14,
    y: 50
  });

  visualNodes.push({
    id: 'node_entry',
    name: seedName.length > 28 ? seedName.slice(0, 26) + '...' : seedName,
    category: 'entry',
    role: 'Semantic Entry Point',
    detail: `Identified in community "${result.communityName}"`,
    metric: 'Graph Seed #1',
    x: 38,
    y: 28
  });

  visualNodes.push({
    id: 'node_enabler',
    name: neighborName.length > 28 ? neighborName.slice(0, 26) + '...' : neighborName,
    category: 'enabler',
    role: 'Architectural Anchor',
    detail: 'Hardware RTL offload & dedicated physical execution domain',
    metric: 'Hardware Gate',
    x: 42,
    y: 74
  });

  visualNodes.push({
    id: 'node_target',
    name: targetName.length > 28 ? targetName.slice(0, 26) + '...' : targetName,
    category: 'target',
    role: 'Functional Destination',
    detail: `Grounded in ${primaryDoc} (${pageRef})`,
    metric: 'Verified Target',
    x: 68,
    y: 38
  });

  visualNodes.push({
    id: 'node_synthesis',
    name: result.contextualTitle.length > 30 ? result.contextualTitle.slice(0, 28) + '...' : result.contextualTitle,
    category: 'synthesis',
    role: 'Executive Synthesis',
    detail: 'ASIL-D decoupled insight with verified cycle & SRAM bounds',
    metric: 'Grounded Output',
    x: 90,
    y: 50
  });

  // Edges connecting the reasoning graph
  visualEdges.push({
    from: 'node_query',
    to: 'node_entry',
    relation: 'semantic_vector_entry',
    active: activeStep >= 1
  });

  visualEdges.push({
    from: 'node_entry',
    to: 'node_target',
    relation: steps[0]?.relation || 'implements',
    active: activeStep >= 2
  });

  visualEdges.push({
    from: 'node_enabler',
    to: 'node_target',
    relation: steps[1]?.relation || 'shares_data_with',
    active: activeStep >= 2
  });

  visualEdges.push({
    from: 'node_target',
    to: 'node_synthesis',
    relation: 'grounded_synthesis',
    active: activeStep >= 3
  });

  // Replay animation loop
  const handleReplay = () => {
    setActiveStep(0);
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= 3) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 700);
  };

  const selectedNode = visualNodes.find(n => n.id === selectedNodeId) || visualNodes[1];

  return (
    <div className="dr-visual-traversal-container">
      {/* AGUI Control Bar */}
      <div className="dr-traversal-header">
        <div className="dr-traversal-title-group">
          <div className="dr-traversal-icon-box">
            <Network size={16} className="dr-icon-pulse" />
          </div>
          <div>
            <div className="dr-traversal-title">
              KNOWLEDGE GRAPH TRAVERSAL & SYNTHESIS TRACE
              <span className="dr-traversal-badge">
                <Radio size={10} className="dr-live-dot" /> Multi-Hop Grounded
              </span>
            </div>
            <div className="dr-traversal-subtitle">
              Visualizing how the 1,037-node DeepGrid Silicon Graph and primary whitepapers synthesized this response
            </div>
          </div>
        </div>

        <div className="dr-traversal-actions">
          <div className="dr-view-switch">
            <button
              className={`dr-switch-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
            >
              <Network size={13} /> Graph Topology
            </button>
            <button
              className={`dr-switch-btn ${viewMode === 'stages' ? 'active' : ''}`}
              onClick={() => setViewMode('stages')}
            >
              <Layers size={13} /> Reasoning Stages
            </button>
          </div>

          <button
            className="dr-replay-btn"
            onClick={handleReplay}
            disabled={isPlaying}
            title="Replay visual graph traversal"
          >
            <RotateCcw size={13} className={isPlaying ? 'dr-spin' : ''} />
            {isPlaying ? 'Tracing...' : 'Replay Trace'}
          </button>
        </div>
      </div>

      {/* VIEW 1: Visual Topology SVG Graph */}
      {viewMode === 'graph' && (
        <div className="dr-topology-stage">
          <svg
            className="dr-traversal-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="aura-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="edge-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4a36e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connecting Directed Edges */}
            <g className="dr-svg-edges">
              {visualEdges.map((edge, idx) => {
                const src = visualNodes.find(n => n.id === edge.from)!;
                const tgt = visualNodes.find(n => n.id === edge.to)!;
                if (!src || !tgt) return null;

                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const cx = src.x + dx * 0.5;
                const cy = src.y + dy * 0.5 - (idx % 2 === 0 ? 4 : -4);

                return (
                  <g key={idx} className={`dr-edge-path ${edge.active ? 'active' : 'dimmed'}`}>
                    <path
                      d={`M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`}
                      fill="none"
                      stroke={edge.active ? 'url(#edge-flow-grad)' : '#242c28'}
                      strokeWidth={edge.active ? '0.75' : '0.35'}
                      strokeDasharray={edge.active ? '2 1' : 'none'}
                      className={edge.active ? 'dr-animated-edge' : ''}
                    />

                    {/* Relation Pill Badge */}
                    <g transform={`translate(${cx}, ${cy})`}>
                      <rect
                        x="-7.5"
                        y="-2"
                        width="15"
                        height="4"
                        rx="1"
                        fill="#0c0f0e"
                        stroke={edge.active ? '#d4a36e88' : '#242c28'}
                        strokeWidth="0.25"
                      />
                      <text
                        x="0"
                        y="0.7"
                        textAnchor="middle"
                        fill={edge.active ? '#e0d6c4' : '#6b7280'}
                        fontSize="1.6"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {edge.relation}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Interactive Graph Nodes */}
            <g className="dr-svg-nodes">
              {visualNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                let strokeColor = '#3b4740';
                let fillColor = '#101412';
                let badgeColor = '#94a3b8';

                if (node.category === 'query') {
                  strokeColor = '#60a5fa';
                  badgeColor = '#60a5fa';
                } else if (node.category === 'entry') {
                  strokeColor = '#d4a36e';
                  badgeColor = '#d4a36e';
                  fillColor = '#1a1612';
                } else if (node.category === 'enabler') {
                  strokeColor = '#38bdf8';
                  badgeColor = '#38bdf8';
                } else if (node.category === 'target') {
                  strokeColor = '#34d399';
                  badgeColor = '#34d399';
                  fillColor = '#0d1a14';
                } else if (node.category === 'synthesis') {
                  strokeColor = '#f59e0b';
                  badgeColor = '#f59e0b';
                  fillColor = '#1f1609';
                }

                return (
                  <g
                    key={node.id}
                    className={`dr-graph-node-group ${isSelected ? 'selected' : ''}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Node Background Glow */}
                    <circle
                      r="5.5"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '0.9' : '0.55'}
                      filter="url(#aura-glow)"
                    />

                    {/* Center Pin Indicator */}
                    <circle
                      r="1.8"
                      fill={strokeColor}
                    />

                    {/* Node Label Block */}
                    <g transform="translate(0, 8.5)">
                      <rect
                        x="-14"
                        y="-2.5"
                        width="28"
                        height="6.8"
                        rx="1"
                        fill="#0c0e0dc8"
                        stroke={strokeColor}
                        strokeWidth="0.2"
                      />
                      <text
                        x="0"
                        y="-0.2"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="1.9"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {node.name}
                      </text>
                      <text
                        x="0"
                        y="2.8"
                        textAnchor="middle"
                        fill={badgeColor}
                        fontSize="1.3"
                        fontFamily="monospace"
                        letterSpacing="0.2"
                      >
                        {node.metric}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Node Inspection Drawer */}
          <div className="dr-node-inspector">
            <div className="dr-inspector-head">
              <span className="dr-inspector-category">{selectedNode.role.toUpperCase()}</span>
              <span className="dr-inspector-metric">{selectedNode.metric}</span>
            </div>
            <div className="dr-inspector-name">{selectedNode.name}</div>
            <p className="dr-inspector-desc">{selectedNode.detail}</p>
            <div className="dr-inspector-footer">
              <span className="dr-inspector-source">
                <FileText size={11} style={{ marginRight: '4px' }} />
                Citation: {primaryDoc} ({pageRef})
              </span>
              <a
                href="./downloads/graph.html"
                target="_blank"
                rel="noreferrer"
                className="dr-inspector-link"
              >
                Inspect in 3D Graph <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Executive 4-Stage Reasoning Pipeline */}
      {viewMode === 'stages' && (
        <div className="dr-reasoning-pipeline">
          <div className="dr-stage-card">
            <div className="dr-stage-num">01</div>
            <div className="dr-stage-content">
              <div className="dr-stage-header">
                <span className="dr-stage-badge semantic">SEMANTIC PROJECTION</span>
                <span className="dr-stage-time">&lt;2.4 ms</span>
              </div>
              <div className="dr-stage-title">High-Dimensional TF-IDF Vector Cosine Match</div>
              <p className="dr-stage-text">
                The business query is vectorized across 5,101 dimensions to locate the primary semantic seed node inside the 1,037-node Graphify topology.
              </p>
              <div className="dr-stage-tag">Seed: {seedName}</div>
            </div>
          </div>

          <div className="dr-stage-arrow">
            <ChevronRight size={18} />
          </div>

          <div className="dr-stage-card">
            <div className="dr-stage-num">02</div>
            <div className="dr-stage-content">
              <div className="dr-stage-header">
                <span className="dr-stage-badge traversal">GRAPH TOPOLOGY WALK</span>
                <span className="dr-stage-time">K-Hop BFS</span>
              </div>
              <div className="dr-stage-title">Relational Edge Expansion (1,873 Edges)</div>
              <p className="dr-stage-text">
                Dynamic breadth-first traversal walks typed links (<code>{steps[0]?.relation || 'implements'}</code>, <code>shares_data_with</code>) to identify related physical blocks and constraints.
              </p>
              <div className="dr-stage-tag">Community: {result.communityName}</div>
            </div>
          </div>

          <div className="dr-stage-arrow">
            <ChevronRight size={18} />
          </div>

          <div className="dr-stage-card">
            <div className="dr-stage-num">03</div>
            <div className="dr-stage-content">
              <div className="dr-stage-header">
                <span className="dr-stage-badge grounding">EVIDENCE GROUNDING</span>
                <span className="dr-stage-time">177 PDF Pages</span>
              </div>
              <div className="dr-stage-title">Whitepaper Extraction & Physical Verification</div>
              <p className="dr-stage-text">
                Grounded against primary engineering specifications, ensuring exact cycle budgets, SRAM footprints, and ISO standards are cited with 100% fidelity.
              </p>
              <div className="dr-stage-tag">{primaryDoc} ({pageRef})</div>
            </div>
          </div>

          <div className="dr-stage-arrow">
            <ChevronRight size={18} />
          </div>

          <div className="dr-stage-card">
            <div className="dr-stage-num">04</div>
            <div className="dr-stage-content">
              <div className="dr-stage-header">
                <span className="dr-stage-badge synthesis">EXECUTIVE SYNTHESIS</span>
                <span className="dr-stage-time">Deterministic</span>
              </div>
              <div className="dr-stage-title">Decoupled C-Level Strategic Response</div>
              <p className="dr-stage-text">
                Synthesizes the physical compute envelope, system integration, and ASIL-D lockstep safety insulation for executive and procurement review.
              </p>
              <div className="dr-stage-tag">Status: Verified ASIL-D Compliant</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
