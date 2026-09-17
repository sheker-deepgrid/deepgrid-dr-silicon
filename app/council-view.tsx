'use client';
import {useState} from 'react';
import {
  ShieldCheck,
  Cpu,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  GitBranch,
  Layers,
  FileText
} from 'lucide-react';
import {runMultiAgentCouncil, AgentPerspective} from './data/multi-agent-engine';

interface CouncilViewProps {
  query: string;
  onSelectQuery: (q: string) => void;
  go: (hash: string) => void;
}

export default function CouncilView({query, onSelectQuery, go}: CouncilViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'safety' | 'hardware' | 'defense'>('all');
  const result = runMultiAgentCouncil(query || 'DG32 lockstep architecture and loop budget');

  const perspectives: AgentPerspective[] = [
    result.safetyPerspective,
    result.hardwarePerspective,
    result.defensePerspective
  ];

  const filteredPerspectives = activeTab === 'all'
    ? perspectives
    : perspectives.filter(p => p.role === activeTab);

  return (
    <div className="dr-council-wrap">
      {/* 1. Multi-Agent Trajectory Stream */}
      <div className="dr-trajectory-box">
        <div className="dr-trajectory-header">
          <div className="dr-trajectory-title">
            <GitBranch size={16} style={{color: 'var(--copper)'}} />
            <span>MULTI-AGENT DELIBERATION TRAJECTORY</span>
          </div>
          <span className="dr-trajectory-badge">3 AGENTS DELIBERATING · GRAPH-GROUNDED</span>
        </div>

        <div className="dr-trajectory-steps">
          {result.trajectory.map((step, idx) => (
            <div key={idx} className={`dr-trajectory-step dr-step-${step.agent}`}>
              <div className="dr-step-dot" />
              <div className="dr-step-content">
                <div className="dr-step-head">
                  <strong>{step.title}</strong>
                  <span className="mono">+{step.timestampMs}ms</span>
                </div>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Council Consensus Banner */}
      <div className="dr-consensus-box">
        <div className="dr-consensus-header">
          <CheckCircle2 size={20} style={{color: '#10b981'}} />
          <div>
            <span className="mono" style={{color: 'var(--copper)', fontSize: '0.75rem', letterSpacing: '0.06em'}}>
              UNIFIED COUNCIL VERDICT
            </span>
            <h3>{result.consensus}</h3>
          </div>
        </div>

        <div className="dr-consensus-action">
          <button 
            type="button"
            className="primary" 
            onClick={() => go(result.recommendedSection.hash)}
            aria-label={`Jump to ${result.recommendedSection.title}`}
          >
            Inspect in {result.recommendedSection.title} <ArrowUpRight size={17} />
          </button>
          <span className="dr-action-reason">{result.recommendedSection.reason}</span>
        </div>
      </div>

      {/* 3. Specialist Perspectives Filter */}
      <div className="dr-council-nav">
        <span className="mono" style={{fontSize: '0.78rem', color: 'var(--ink-2)'}}>INSPECT DOMAIN SPECIALIST:</span>
        <div className="dr-council-tabs" role="tablist">
          <button 
            role="tab"
            aria-selected={activeTab === 'all'} 
            className={`dr-council-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All 3 Specialists
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'safety'} 
            className={`dr-council-tab ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <ShieldCheck size={14} style={{color: '#f59e0b'}} /> Safety & Verification
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'hardware'} 
            className={`dr-council-tab ${activeTab === 'hardware' ? 'active' : ''}`}
            onClick={() => setActiveTab('hardware')}
          >
            <Cpu size={14} style={{color: '#38bdf8'}} /> Physical Silicon & EDA
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'defense'} 
            className={`dr-council-tab ${activeTab === 'defense' ? 'active' : ''}`}
            onClick={() => setActiveTab('defense')}
          >
            <Compass size={14} style={{color: '#10b981'}} /> Sovereign Moats
          </button>
        </div>
      </div>

      {/* 4. Domain Specialist Perspectives Grid */}
      <div className={`dr-perspectives-grid ${activeTab === 'all' ? 'grid-3' : 'grid-1'}`}>
        {filteredPerspectives.map(p => (
          <article key={p.role} className="dr-perspective-card" style={{borderTopColor: p.color}}>
            <div className="dr-card-top">
              <div className="dr-card-meta">
                <span className="dr-role-badge" style={{color: p.color, borderColor: `${p.color}40`, background: `${p.color}15`}}>
                  {p.avatarBadge}
                </span>
                <span className="dr-conf-badge">{p.confidence}% CONFIDENCE</span>
              </div>
              <h4>{p.agentName}</h4>
            </div>

            <p className="dr-verdict">{p.verdict}</p>

            <div className="dr-key-points">
              <span className="mono">VERIFIED EVIDENCE FINDINGS:</span>
              <ul>
                {p.keyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="dr-card-footer">
              <div className="dr-cited-docs">
                <FileText size={13} />
                <span>{p.citedDocs.join(' · ')}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 5. Grounded Graph Subgraph Entities */}
      {result.matchedNodes.length > 0 && (
        <div className="dr-subgraph-strip">
          <span className="mono">GROUNDED ENTITY SUBGRAPH:</span>
          <div className="dr-entity-chips">
            {result.matchedNodes.map(node => (
              <span key={node.id} className="dr-entity-chip">
                <Layers size={12} /> {node.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
