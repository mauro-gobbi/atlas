import { useState, useEffect, useRef, useCallback } from 'react';
import TableOfContents from './TableOfContents.jsx';
import './RegulationViewer.css';

export default function RegulationViewer({ regulation, lang }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('articles'); // articles | recitals
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [tocOpen, setTocOpen] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!regulation) return;
    let cancelled = false;
    setDoc(null);
    setError(null);
    setLoading(true);
    setActiveArticleId(null);

    fetch(`/api/regulation/${regulation.celex}?lang=${lang}`)
      .then((r) => {
        if (!r.ok) return r.json().then((e) => Promise.reject(e));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setDoc(data);
          setLoading(false);
          if (data.articles?.length) setActiveArticleId(data.articles[0].eId || data.articles[0].num);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.error || 'Failed to load document');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [regulation, lang]);

  const scrollToArticle = useCallback((eId) => {
    setActiveArticleId(eId);
    const el = document.getElementById(`art-${eId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const eurLexUrl = `https://eur-lex.europa.eu/legal-content/${lang}/TXT/HTML/?uri=CELEX:${regulation.celex}`;

  return (
    <div className="rv-layout">
      {/* TOC panel */}
      {doc && (
        <div className={`rv-toc-panel ${tocOpen ? 'open' : 'closed'}`}>
          <div className="toc-header">
            <span>Contents</span>
            <button className="toc-close" onClick={() => setTocOpen(false)} aria-label="Close TOC">✕</button>
          </div>
          <TableOfContents
            toc={doc.toc}
            articles={doc.articles}
            activeId={activeArticleId}
            onSelect={scrollToArticle}
          />
        </div>
      )}

      {/* Main reading pane */}
      <div className="rv-main" ref={contentRef}>
        {/* Doc header */}
        <div className="rv-doc-header" style={{ '--reg-color': regulation.color }}>
          <div className="rv-doc-badge">
            <span className={`doc-type ${regulation.type === 'Directive' ? 'directive' : ''}`}>
              {regulation.type}
            </span>
            <span className="mono doc-shortid">{regulation.shortId}</span>
          </div>
          <h1 className="rv-doc-title">{regulation.name}</h1>
          <p className="rv-doc-desc">{regulation.description}</p>
          <div className="rv-doc-actions">
            {doc && !tocOpen && (
              <button className="action-btn" onClick={() => setTocOpen(true)}>
                ☰ Contents
              </button>
            )}
            <a href={eurLexUrl} target="_blank" rel="noopener noreferrer" className="action-btn ext">
              Open on EUR-Lex ↗
            </a>
          </div>
        </div>

        {/* Body */}
        {loading && (
          <div className="rv-loading">
            <div className="spinner" />
            <span>Fetching {lang} text from EUR-Lex…</span>
          </div>
        )}

        {error && (
          <div className="rv-error fade-in">
            <div className="error-icon">⚠️</div>
            <div className="error-msg">
              <strong>Not available</strong>
              <p>{error}</p>
            </div>
            <a href={eurLexUrl} target="_blank" rel="noopener noreferrer" className="action-btn ext">
              Check EUR-Lex ↗
            </a>
          </div>
        )}

        {doc && !loading && (
          <div className="rv-body fade-in">
            {/* Tabs */}
            {doc.recitals?.length > 0 && (
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'articles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('articles')}
                >
                  Articles
                  <span className="tab-count">{doc.articles?.length || 0}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'recitals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recitals')}
                >
                  Recitals
                  <span className="tab-count">{doc.recitals?.length || 0}</span>
                </button>
              </div>
            )}

            {/* Articles */}
            {activeTab === 'articles' && (
              <div className="articles-list">
                {doc.articles?.length > 0 ? (
                  doc.articles.map((art, i) => (
                    <ArticleBlock
                      key={art.eId || i}
                      article={art}
                      active={activeArticleId === (art.eId || art.num)}
                      color={regulation.color}
                    />
                  ))
                ) : (
                  <p className="no-content">No articles extracted from this document.</p>
                )}
              </div>
            )}

            {/* Recitals */}
            {activeTab === 'recitals' && (
              <div className="recitals-list">
                {doc.recitals.map((r, i) => (
                  <div key={i} className="recital-block">
                    {r.num && <span className="recital-num">{r.num}</span>}
                    <p>{r.text || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleBlock({ article, active, color }) {
  const id = `art-${article.eId || article.num}`;
  return (
    <div
      id={id}
      className={`article-block ${active ? 'active' : ''}`}
      style={{ '--reg-color': color }}
    >
      <div className="art-header">
        <span className="art-num mono">{article.num}</span>
        {article.heading && <span className="art-heading">{article.heading}</span>}
        {article.chapterNum && (
          <span className="art-chapter">{article.chapterNum}</span>
        )}
      </div>
      <div className="art-content">
        {article.paragraphs.map((p, i) => (
          <div key={i} className="art-para">
            {p.num && <span className="para-num">{p.num}</span>}
            <p>{p.text || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
