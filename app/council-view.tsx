'use client';
import {useState} from 'react';
import {
  FileText,
  Download,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import {getGroundedAnswer} from './data/multi-agent-engine';

interface GroundedAnswerViewProps {
  query: string;
  onSelectQuery: (q: string) => void;
  go: (hash: string) => void;
}

export default function GroundedAnswerView({query, onSelectQuery, go}: GroundedAnswerViewProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const result = getGroundedAnswer(query || 'What makes DeepGrid silicon immune to supply chain disruption?');

  return (
    <div className="dr-grounded-answer-wrap">
      {/* 1. Direct Business Answer Card */}
      <div className="dr-answer-card">
        <div className="dr-answer-header">
          <div className="dr-answer-badge">
            <CheckCircle2 size={15} style={{color: '#10b981'}} />
            <span>VERIFIED ANSWER</span>
          </div>
          <span className="dr-answer-source-ref">
            Grounded in {result.citation.documentTitle} ({result.citation.page})
          </span>
        </div>

        <p className="dr-answer-body">{result.answer}</p>

        {/* Key Business Facts */}
        <div className="dr-answer-facts">
          <span className="mono dr-facts-heading">KEY STRATEGIC & OPERATIONAL METRICS:</span>
          <ul className="dr-facts-list">
            {result.keyBusinessFacts.map((fact, idx) => (
              <li key={idx}>
                <span className="dr-bullet-dot" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Grounded Citation & Primary Document Access */}
        <div className="dr-citation-card">
          <div className="dr-citation-content">
            <div className="dr-citation-icon-wrap">
              <FileText size={20} style={{color: 'var(--copper)'}} />
            </div>
            <div className="dr-citation-meta">
              <span className="mono dr-citation-tag">OFFICIAL PRIMARY SOURCE</span>
              <strong className="dr-citation-title">
                {result.citation.documentTitle} · {result.citation.section}
              </strong>
              <span className="dr-citation-loc">{result.citation.page}</span>
            </div>
          </div>

          <div className="dr-citation-actions">
            <a 
              href={result.citation.pdfPath}
              download
              className="dr-citation-btn primary"
              title={`Download official whitepaper PDF (${result.citation.pdfSize})`}
            >
              <Download size={14} />
              <span>Download PDF ({result.citation.pdfSize})</span>
            </a>
            <a 
              href={result.citation.specPath}
              download
              className="dr-citation-btn outline"
              title="Download full Markdown specification"
            >
              <BookOpen size={14} />
              <span>Full Spec</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Progressive Disclosure: Deeper Technical Specifications */}
      {result.technicalDetails && (
        <div className="dr-tech-disclosure">
          <button 
            type="button"
            className="dr-tech-toggle-btn"
            onClick={() => setShowTechnical(!showTechnical)}
            aria-expanded={showTechnical}
          >
            <span>Need deeper engineering details, pinouts, or cycle timing?</span>
            <span className="dr-tech-toggle-label">
              {showTechnical ? 'Hide Technical Details' : 'View Technical Specifications'}
              {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {showTechnical && (
            <div className="dr-tech-panel">
              <div className="dr-tech-specs">
                <span className="mono dr-specs-heading">SILICON SPECIFICATIONS & CONSTRAINTS:</span>
                <ul className="dr-specs-list">
                  {result.technicalDetails.specPoints.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              </div>

              <div className="dr-tech-action">
                <button
                  type="button"
                  className="primary"
                  onClick={() => go(result.technicalDetails!.deepLink.hash)}
                >
                  {result.technicalDetails.deepLink.label} <ArrowUpRight size={16} />
                </button>
                <span className="dr-tech-action-context">
                  {result.technicalDetails.deepLink.context}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Suggested Follow-Up Questions */}
      <div className="dr-related-wrap">
        <span className="mono dr-related-heading">RELATED STRATEGIC QUESTIONS:</span>
        <div className="dr-related-chips">
          {result.relatedTopics.map((topic, i) => (
            <button
              key={i}
              type="button"
              className="dr-related-chip"
              onClick={() => onSelectQuery(topic.query)}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
