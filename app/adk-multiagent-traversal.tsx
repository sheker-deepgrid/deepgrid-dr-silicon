'use client';
import { useState, useEffect } from 'react';
import {
  Bot,
  Cpu,
  ShieldCheck,
  Building2,
  GitFork,
  ArrowRight,
  RotateCcw,
  Sparkles,
  FileText,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { GraphRAGResult } from './data/graphrag-engine';
import { SPECIALISTS, type SpecialistId } from './data/deepgrid-graph-search';

interface ADKMultiAgentTraversalProps {
  result: GraphRAGResult;
}

interface AgentNode {
  id: string;
  name: string;
  type: 'root' | 'specialist' | 'tool' | 'synthesis';
  role: string;
  icon: any;
  status: 'active' | 'routed' | 'completed' | 'idle';
  tools: string[];
  outputSnippet: string;
  x: number;
  y: number;
}

interface AgentLink {
  from: string;
  to: string;
  label: string;
  active: boolean;
}

export default function ADKMultiAgentTraversal({ result }: ADKMultiAgentTraversalProps) {
  const [activeStep, setActiveStep] = useState<number>(4); // fully executed by default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_hardware');
  const [showToolDrawer, setShowToolDrawer] = useState<boolean>(true);

  // Determine active specialists based on query keywords
  const q = result.query.toLowerCase();
  const needsHardware = true; // physical silicon & AI compute always involved
  const needsSafety = q.includes('safe') || q.includes('lockstep') || q.includes('trip') || q.includes('recall') || q.includes('fault') || q.includes('kurtosis') || q.includes('rotor');
  const needsDefense = q.includes('dap') || q.includes('moat') || q.includes('make-ii') || q.includes('procure') || q.includes('sovereign') || q.includes('fund') || q.includes('crash') || q.includes('cost');

  // Build the ADK Multi-Agent Graph topology
  const agentNodes: AgentNode[] = [
    {
      id: 'agent_root',
      name: 'ADK Root Triage Agent',
      type: 'root',
      role: 'Triage & Delegation Dispatcher',
      icon: Workflow,
      status: activeStep >= 1 ? 'completed' : 'active',
      tools: ['query_vectorizer()', 'intent_classifier()', 'specialist_router()'],
      outputSnippet: `Classified query intent: Routed to Domain Specialists with verified remit boundaries.`,
      x: 18,
      y: 50
    },
    {
      id: 'agent_safety',
      name: 'Safety & Verification Auditor',
      type: 'specialist',
      role: 'Functional Safety & ASIL-D',
      icon: ShieldCheck,
      status: activeStep >= 2 ? (needsSafety ? 'completed' : 'idle') : 'idle',
      tools: ['lockstep_comparator()', 'iso26262_checker()', 'fault_injection_eval()'],
      outputSnippet: `ASIL-D advisory boundary confirmed: Hardware lockstep supervisor retains autonomous 2-cycle (<40 ns) FAULT_N safe-state trip authority.`,
      x: 52,
      y: 20
    },
    {
      id: 'agent_hardware',
      name: 'Physical Silicon & EDA Lead',
      type: 'specialist',
      role: 'Hardware RTL, DSP & Compute Envelope',
      icon: Cpu,
      status: activeStep >= 2 ? 'completed' : 'idle',
      tools: ['graphify_retriever()', 'cordic_math_eval()', 'sram_budget_check()'],
      outputSnippet: `${result.keyBusinessFacts[0] || '12.5 MMAC/s scalar budget; 24 of 30 tasks execute in <1.0 ms.'} Grounded in ${result.citation.documentTitle} (${result.citation.page}).`,
      x: 52,
      y: 50
    },
    {
      id: 'agent_defense',
      name: 'Sovereign Moats & Procurement Strategist',
      type: 'specialist',
      role: 'DAP-2020 Make-II & Supply Chain',
      icon: Building2,
      status: activeStep >= 2 ? (needsDefense ? 'completed' : 'idle') : 'idle',
      tools: ['dap2020_iddm_eval()', 'pil5_list_checker()', 'three_factory_router()'],
      outputSnippet: `Qualifies for Buy (Indian-IDDM) with >50% domestic content under DAP-2020, securing statutory priority over foreign silicon imports.`,
      x: 52,
      y: 80
    },
    {
      id: 'agent_synthesis',
      name: 'Council Synthesis Agent',
      type: 'synthesis',
      role: 'Executive Intelligence Synthesizer',
      icon: Sparkles,
      status: activeStep >= 3 ? 'completed' : 'idle',
      tools: ['evidence_cross_correlator()', 'executive_brief_compiler()'],
      outputSnippet: result.answer.slice(0, 180) + '...',
      x: 84,
      y: 50
    }
  ];

  const agentLinks: AgentLink[] = [
    { from: 'agent_root', to: 'agent_safety', label: 'delegates: safety verification', active: activeStep >= 2 && needsSafety },
    { from: 'agent_root', to: 'agent_hardware', label: 'delegates: compute & DSP RTL', active: activeStep >= 2 },
    { from: 'agent_root', to: 'agent_defense', label: 'delegates: sovereign moats', active: activeStep >= 2 && needsDefense },
    { from: 'agent_safety', to: 'agent_synthesis', label: 'returns: ASIL-D interlock', active: activeStep >= 3 && needsSafety },
    { from: 'agent_hardware', to: 'agent_synthesis', label: 'returns: cycle & memory bounds', active: activeStep >= 3 },
    { from: 'agent_defense', to: 'agent_synthesis', label: 'returns: statutory compliance', active: activeStep >= 3 && needsDefense }
  ];

  const handleReplay = () => {
    setActiveStep(0);
    setIsPlaying(true);
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= 4) {
        clearInterval(timer);
        setIsPlaying(false);
      }
    }, 650);
  };

  const selectedAgent = agentNodes.find(a => a.id === selectedAgentId) || agentNodes[2];

  return (
    <div className="dr-adk-container">
      {/* ADK Header Strip */}
      <div className="dr-adk-header">
        <div className="dr-adk-header-left">
          <div className="dr-adk-badge">
            <span className="dr-adk-logo">GOOGLE ADK</span>
            <span className="dr-adk-title">AGENT DEVELOPMENT KIT · MULTI-AGENT EXECUTION GRAPH</span>
          </div>
          <div className="dr-adk-sub">
            Visualizing root triage dispatch, specialist grounding, and multi-agent synthesis across 1,037 knowledge nodes
          </div>
        </div>

        <div className="dr-adk-header-right">
          <div className="dr-adk-status-indicator">
            <Radio size={12} className="dr-adk-pulse" />
            <span>Multi-Agent Council Active</span>
          </div>
          <button
            className="dr-adk-replay-btn"
            onClick={handleReplay}
            disabled={isPlaying}
            title="Replay ADK Agent Orchestration"
          >
            <RotateCcw size={13} className={isPlaying ? 'dr-spin' : ''} />
            {isPlaying ? 'Dispatching Agents...' : 'Replay Orchestration'}
          </button>
        </div>
      </div>

      {/* ADK Visual Multi-Agent Canvas */}
      <div className="dr-adk-stage">
        <svg
          className="dr-adk-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="adk-edge-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4a36e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
            </linearGradient>
            <filter id="adk-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Directed Agent-to-Agent (A2A) Links */}
          <g className="dr-adk-links">
            {agentLinks.map((link, idx) => {
              const src = agentNodes.find(a => a.id === link.from)!;
              const tgt = agentNodes.find(a => a.id === link.to)!;
              if (!src || !tgt) return null;

              const isHighlighted = link.active;
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const cx = src.x + dx * 0.5;
              const cy = src.y + dy * 0.5 + (dy === 0 ? 0 : (dy > 0 ? -4 : 4));

              return (
                <g key={idx} className={`dr-adk-edge-group ${isHighlighted ? 'active' : 'inactive'}`}>
                  <path
                    d={`M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`}
                    fill="none"
                    stroke={isHighlighted ? 'url(#adk-edge-active)' : '#232c28'}
                    strokeWidth={isHighlighted ? '0.7' : '0.3'}
                    strokeDasharray={isHighlighted ? '2.5 1.5' : 'none'}
                    className={isHighlighted ? 'dr-adk-animated-edge' : ''}
                  />

                  {/* Centered Edge Label Pill */}
                  {isHighlighted && (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <rect
                        x="-10"
                        y="-2"
                        width="20"
                        height="4"
                        rx="1"
                        fill="#0b0e0d"
                        stroke="#d4a36e66"
                        strokeWidth="0.25"
                      />
                      <text
                        x="0"
                        y="0.7"
                        textAnchor="middle"
                        fill="#eee6d4"
                        fontSize="1.45"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {link.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Interactive Agent Nodes */}
          <g className="dr-adk-nodes">
            {agentNodes.map(agent => {
              const isSelected = selectedAgentId === agent.id;
              let strokeColor = '#3f4e46';
              let fillColor = '#101412';
              let tagColor = '#94a3b8';

              if (agent.type === 'root') {
                strokeColor = '#60a5fa';
                tagColor = '#60a5fa';
                fillColor = '#0f172a';
              } else if (agent.id === 'agent_safety') {
                strokeColor = '#f87171';
                tagColor = '#f87171';
                fillColor = '#1f1315';
              } else if (agent.id === 'agent_hardware') {
                strokeColor = '#d4a36e';
                tagColor = '#d4a36e';
                fillColor = '#1e1710';
              } else if (agent.id === 'agent_defense') {
                strokeColor = '#38bdf8';
                tagColor = '#38bdf8';
                fillColor = '#0f1c24';
              } else if (agent.type === 'synthesis') {
                strokeColor = '#34d399';
                tagColor = '#34d399';
                fillColor = '#0d1f17';
              }

              const isWorking = agent.status === 'active' || agent.status === 'completed';

              return (
                <g
                  key={agent.id}
                  className={`dr-adk-node ${isSelected ? 'selected' : ''}`}
                  transform={`translate(${agent.x}, ${agent.y})`}
                  onClick={() => setSelectedAgentId(agent.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer Pulsing Halo */}
                  {isWorking && (
                    <circle
                      r="6.5"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="0.3"
                      opacity="0.6"
                      className="dr-halo-pulse"
                    />
                  )}

                  {/* Main Node Body */}
                  <circle
                    r="5.2"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '0.9' : '0.55'}
                    filter="url(#adk-glow)"
                  />

                  {/* Inner Node Ring */}
                  <circle
                    r="1.8"
                    fill={strokeColor}
                  />

                  {/* Label Plaque */}
                  <g transform="translate(0, 8.2)">
                    <rect
                      x="-14"
                      y="-2.4"
                      width="28"
                      height="6.8"
                      rx="1"
                      fill="#0c0e0de8"
                      stroke={strokeColor}
                      strokeWidth="0.2"
                    />
                    <text
                      x="0"
                      y="-0.2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="1.85"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {agent.name.length > 22 ? agent.name.slice(0, 20) + '...' : agent.name}
                    </text>
                    <text
                      x="0"
                      y="2.8"
                      textAnchor="middle"
                      fill={tagColor}
                      fontSize="1.25"
                      fontFamily="monospace"
                      letterSpacing="0.2"
                    >
                      {agent.role.length > 24 ? agent.role.slice(0, 22) + '...' : agent.role}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Agent Inspector & Trace Panel */}
        <div className="dr-adk-inspector">
          <div className="dr-adk-inspector-top">
            <div className="dr-inspector-title-row">
              <span className="dr-inspector-agent-badge">
                {selectedAgent.type.toUpperCase()} AGENT
              </span>
              <span className="dr-inspector-agent-name">{selectedAgent.name}</span>
              <span className={`dr-inspector-status ${selectedAgent.status}`}>
                ● {selectedAgent.status.toUpperCase()}
              </span>
            </div>

            <div className="dr-adk-tools-chips">
              <span className="dr-tools-label">ADK TOOLS ATTACHED:</span>
              {selectedAgent.tools.map((t, idx) => (
                <span key={idx} className="dr-tool-chip">
                  <code>{t}</code>
                </span>
              ))}
            </div>
          </div>

          <div className="dr-adk-trace-box">
            <span className="dr-trace-tag">GROUNDED AGENT OUTPUT TRACE:</span>
            <p className="dr-trace-text">{selectedAgent.outputSnippet}</p>
          </div>

          <div className="dr-adk-inspector-actions">
            <span className="dr-adk-citation-note">
              <FileText size={11} style={{ marginRight: '4px' }} />
              Primary Verification: {result.citation.documentTitle} · {result.citation.section} ({result.citation.page})
            </span>
            <a
              href="./downloads/graph.html"
              target="_blank"
              rel="noreferrer"
              className="dr-adk-graph-link"
            >
              Open 3D Knowledge Graph <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
