'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
import {useState, useEffect, useMemo} from 'react';
import {
  FileText, Download, ArrowUpRight, Search, X, Check,
  BookOpen, Sparkles, Compass,
  Copy, ShieldCheck
} from 'lucide-react';
import {groundedDocuments, GroundedDoc} from './documents-data';

export default function GroundedDocumentsHub({go}: {go?: (hash: string) => void}) {
  const [filterGroup, setFilterGroup] = useState<'all' | 'core' | 'platform'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingDoc, setReadingDoc] = useState<GroundedDoc | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return groundedDocuments.filter(doc => {
      const matchesGroup = filterGroup === 'all' || doc.group === filterGroup;
      if (!matchesGroup) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.subtitle.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.subsystem.toLowerCase().includes(q) ||
        doc.badge.toLowerCase().includes(q) ||
        doc.stats.some(s => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q))
      );
    });
  }, [filterGroup, searchQuery]);

  // Fetch markdown when modal opens
  useEffect(() => {
    if (!readingDoc) {
      setMarkdownContent('');
      return;
    }
    setLoadingContent(true);
    setCopied(false);
    fetch(readingDoc.specFile)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        setMarkdownContent(text);
        setLoadingContent(false);
      })
      .catch(err => {
        console.warn('Could not fetch markdown file:', err);
        // Provide structured fallback text if offline or static path issue
        setMarkdownContent(
          `# ${readingDoc.title}\n\n` +
          `**Document Identifier:** ${readingDoc.badge}\n` +
          `**Subsystem:** ${readingDoc.subsystem}\n` +
          `**Official Source Document:** \`${readingDoc.pdfFileName}\` (${readingDoc.fileSizePdf} · ${readingDoc.pdfPageCount})\n` +
          `**Markdown Architecture Spec:** \`${readingDoc.specFileName}\` (${readingDoc.fileSizeMd})\n\n` +
          `---\n\n` +
          `## Executive Summary\n\n${readingDoc.summary}\n\n` +
          `## Key Technical Parameters\n\n` +
          readingDoc.stats.map(s => `- **${s.label}:** ${s.value}`).join('\n') +
          `\n\n## Core Engineering Takeaways\n\n` +
          readingDoc.highlights.map(h => `- ${h}`).join('\n') +
          `\n\n---\n*Click "Download PDF" in the header to view the complete authoritative publication PDF.*`
        );
        setLoadingContent(false);
      });
  }, [readingDoc]);

  // Handle escape key to close reader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readingDoc) {
        setReadingDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingDoc]);

  const handleCopy = () => {
    if (!markdownContent) return;
    navigator.clipboard.writeText(markdownContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <section className="dr-docs-hub" aria-label="Authoritative Design Documents & Specs">
      <header className="dr-docs-hub-header">
        <div>
          <p className="dr-lib-kicker">AUTHORITATIVE DESIGN ARCHIVE · 6 CORE DESIGN DOCUMENTS & SPECS</p>
          <h2>Where are DeepGrid&apos;s silicon benchmarks and architecture claims grounded?</h2>
          <p className="dr-docs-lead">
            Every simulation benchmark, timing envelope, clock partition, and pin configuration on this platform is
            grounded in these design authority documents. Download the original authoritative PDFs, read full markdown specifications,
            or cross-reference technical claims directly in the{' '}
            {go ? (
              <button className="dr-inline-link" onClick={() => go('ask')}>
                Ask DeepGrid <ArrowUpRight size={14} />
              </button>
            ) : (
              <a href="#ask" className="dr-inline-link">
                Ask DeepGrid <ArrowUpRight size={14} />
              </a>
            )}{' '}
            intelligence section.
          </p>
        </div>

        {go && (
          <div className="dr-docs-ask-cta">
            <button className="dr-doc-btn dr-doc-btn-primary" onClick={() => go('ask')}>
              <Sparkles size={15} />
              <span>Explore in Ask DeepGrid</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        )}
      </header>

      {/* Filter and Search Bar */}
      <div className="dr-docs-toolbar">
        <div className="dr-docs-tabs" role="tablist" aria-label="Document categories">
          <button
            role="tab"
            aria-selected={filterGroup === 'all'}
            className={filterGroup === 'all' ? 'active' : ''}
            onClick={() => setFilterGroup('all')}
          >
            All Documents <span className="dr-count-badge">{groundedDocuments.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={filterGroup === 'core'}
            className={filterGroup === 'core' ? 'active' : ''}
            onClick={() => setFilterGroup('core')}
          >
            Core Silicon Deliverables (Docs #1–#6) <span className="dr-count-badge">6</span>
          </button>
          <button
            role="tab"
            aria-selected={filterGroup === 'platform'}
            className={filterGroup === 'platform' ? 'active' : ''}
            onClick={() => setFilterGroup('platform')}
          >
            Platform &amp; System Architectures <span className="dr-count-badge">3</span>
          </button>
        </div>

        <div className="dr-docs-search">
          <Search size={16} className="dr-docs-search-icon" />
          <input
            type="text"
            placeholder="Search documents by parameter, standard, or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search documents"
          />
          {searchQuery && (
            <button
              className="dr-docs-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="dr-docs-grid">
        {filteredDocs.map(doc => (
          <article key={doc.id} className="dr-doc-card">
            <div className="dr-doc-card-top">
              <div className="dr-doc-badge-row">
                <span className="dr-doc-badge">{doc.badge}</span>
                <span className="dr-doc-subsystem">{doc.subsystem}</span>
              </div>
              <h3 className="dr-doc-title">{doc.title}</h3>
              <p className="dr-doc-subtitle">{doc.subtitle}</p>
            </div>

            <p className="dr-doc-summary">{doc.summary}</p>

            {/* Spec Stats Grid */}
            <div className="dr-doc-stats">
              {doc.stats.map(s => (
                <div key={s.label} className="dr-doc-stat-cell">
                  <span className="dr-doc-stat-label">{s.label}</span>
                  <strong className="dr-doc-stat-value">{s.value}</strong>
                </div>
              ))}
            </div>

            {/* Key Engineering Highlights */}
            <div className="dr-doc-highlights-wrap">
              <span className="dr-doc-highlights-title">KEY ARCHITECTURAL PROOFS</span>
              <ul className="dr-doc-highlights">
                {doc.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            {/* Direct Clickable Links & Actions */}
            <div className="dr-doc-actions">
              <a
                className="dr-doc-btn dr-doc-btn-pdf"
                href={doc.pdfFile}
                download
                title={`Download official PDF: ${doc.pdfFileName}`}
              >
                <FileText size={15} />
                <span>Download PDF</span>
                <small className="dr-btn-size">{doc.fileSizePdf}</small>
              </a>

              <button
                className="dr-doc-btn"
                onClick={() => setReadingDoc(doc)}
                title="Read formatted markdown document online"
              >
                <BookOpen size={15} />
                <span>Read Spec</span>
              </button>

              <a
                className="dr-doc-btn"
                href={doc.specFile}
                download
                title={`Download raw ${doc.specFileName} markdown specification`}
              >
                <Download size={14} />
                <span>Spec (.md)</span>
                <small className="dr-btn-size">{doc.fileSizeMd}</small>
              </a>

              {go && (
                <button
                  className="dr-doc-btn dr-doc-btn-ghost"
                  onClick={() => go('ask')}
                  title="Query this document in the Ask DeepGrid intelligence section"
                >
                  <Sparkles size={14} />
                  <span>Ask DeepGrid</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="dr-docs-empty">
          <p>No documents found matching &ldquo;{searchQuery}&rdquo; in this category.</p>
          <button className="primary" onClick={() => { setSearchQuery(''); setFilterGroup('all'); }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* In-Browser Document Reader Modal */}
      {readingDoc && (
        <div className="dr-reader-backdrop" onClick={() => setReadingDoc(null)}>
          <div
            className="dr-reader-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Reading ${readingDoc.title}`}
          >
            <header className="dr-reader-header">
              <div className="dr-reader-header-left">
                <span className="dr-doc-badge">{readingDoc.badge}</span>
                <h2>{readingDoc.title}</h2>
                <div className="dr-reader-file-meta">
                  <code>{readingDoc.specFileName}</code>
                  <span>·</span>
                  <span>{readingDoc.fileSizeMd}</span>
                  <span>·</span>
                  <span>PDF: {readingDoc.fileSizePdf} ({readingDoc.pdfPageCount})</span>
                </div>
              </div>

              <div className="dr-reader-header-actions">
                <a
                  className="dr-doc-btn dr-doc-btn-pdf"
                  href={readingDoc.pdfFile}
                  download
                  title="Download official PDF publication"
                >
                  <FileText size={15} />
                  <span>Download PDF</span>
                </a>

                <button
                  className="dr-doc-btn dr-reader-copy-btn"
                  onClick={handleCopy}
                  title="Copy full document text to clipboard"
                >
                  {copied ? <Check size={15} className="dr-text-emerald" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>

                <a
                  className="dr-doc-btn"
                  href={readingDoc.specFile}
                  download
                  title="Download raw markdown source"
                >
                  <Download size={15} />
                  <span>.md</span>
                </a>

                {go && (
                  <button
                    className="dr-doc-btn dr-doc-btn-ghost"
                    onClick={() => {
                      setReadingDoc(null);
                      go('ask');
                    }}
                    title="Deep dive into this deliverable in Ask DeepGrid"
                  >
                    <Sparkles size={15} />
                    <span>Ask DeepGrid</span>
                  </button>
                )}

                <button
                  className="dr-reader-close"
                  onClick={() => setReadingDoc(null)}
                  aria-label="Close document reader"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            <div className="dr-reader-body">
              {loadingContent ? (
                <div className="dr-reader-loading">
                  <div className="dr-spinner" />
                  <p>Loading full document specification...</p>
                </div>
              ) : (
                <div className="dr-reader-content">
                  <pre className="dr-reader-markdown-view">{markdownContent}</pre>
                </div>
              )}
            </div>

            <footer className="dr-reader-footer">
              <div>
                <span className="mono">PDF SOURCE:</span>{' '}
                <code>scratch/deepgrid-dr-silicon/public/downloads/docs/{readingDoc.pdfFileName}</code>
              </div>
              <button className="text-link" onClick={() => setReadingDoc(null)}>
                Close reader (Esc)
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
