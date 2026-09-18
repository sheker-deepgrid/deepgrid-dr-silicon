'use client';
import {useEffect,useState} from 'react';
import {
  FileText,
  Download,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Network
} from 'lucide-react';
import {executeGraphRAG,type SemanticScores} from './data/graphrag-engine';
import {getSemantic} from './data/semantic';

interface GroundedAnswerViewProps {
  query: string;
  onSelectQuery: (q: string) => void;
  go: (hash: string) => void;
}

const DEFAULT_QUESTION = 'What makes DeepGrid silicon immune to supply chain disruption?';

// Semantic scores for the question on screen, once the in-browser model has them. Loading starts when
// Ask opens; each question is embedded 250 ms after typing pauses, so fast typing costs nothing. Until
// then (or if the model cannot load) this returns null and the engine answers by TF-IDF.
function useSemanticScores(question: string): SemanticScores | null {
  const [state, setState] = useState<{q: string; s: SemanticScores} | null>(null);
  useEffect(() => { void getSemantic(); }, []);
  useEffect(() => {
    if (question.trim().length < 3) return;
    let live = true;
    const t = setTimeout(async () => {
      const sem = await getSemantic();
      if (!sem || !live) return;
      try { const s = await sem.scores(question); if (live) setState({q: question, s}); } catch { /* stay on TF-IDF */ }
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [question]);
  return state && state.q === question ? state.s : null;
}

export default function GroundedAnswerView({query, onSelectQuery, go}: GroundedAnswerViewProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const question = query || DEFAULT_QUESTION;
  const sem = useSemanticScores(question);
  const result = executeGraphRAG(question, sem);

  return (
    <div className="dr-grounded-answer-wrap" data-semantic={sem ? 'on' : 'off'}>
      {/* 1. Contextual Architectural Answer Card */}
      <article className="dr-answer-card">
        {/* Dynamic Contextual Header (replaces generic 'Verified Answer' label) */}
        <div className="dr-answer-header">
          <div className="dr-answer-badge">
            <span className="dr-bullet-pulse" />
            <span className="mono dr-domain-tag">{result.domainTag}</span>
          </div>
          <span className="dr-answer-source-ref">
            Grounded in {result.citation.documentTitle} ({result.citation.page})
          </span>
        </div>

        {/* Query-Contextual Title */}
        <h2 className="dr-contextual-title">{result.contextualTitle}</h2>

        {/* Executive Bottom-Line Answer */}
        <p className="dr-answer-lead">{result.answer}</p>

        {/* In-Depth Explanation & Architectural Breakdown */}
        <div className="dr-answer-explanation">
          {result.explanation.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Key Strategic & Operational Metrics */}
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

        {/* Further References & Deep Dives */}
        <div className="dr-answer-references">
          <div className="dr-ref-header">
            <span className="mono dr-ref-title">FURTHER REFERENCES & DEEP-DIVE SECTIONS:</span>
          </div>

          <div className="dr-ref-links-grid">
            {result.referenceLinks.map((link, idx) => (
              <button
                key={idx}
                type="button"
                className="dr-ref-link-card"
                onClick={() => go(link.hash)}
              >
                <div className="dr-ref-link-top">
                  <strong>{link.label}</strong>
                  <ArrowUpRight size={15} />
                </div>
                <p>{link.description}</p>
              </button>
            ))}
          </div>

          {/* Primary Whitepaper PDF & Specification Access */}
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
      </article>


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
