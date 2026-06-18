import './TableOfContents.css';

export default function TableOfContents({ toc, articles, activeId, onSelect }) {
  if (!toc || toc.length === 0) {
    // Flat list of articles
    return (
      <div className="toc-scroll">
        <ul className="toc-list flat">
          {articles?.map((art, i) => {
            const id = art.eId || art.num;
            return (
              <li key={i}>
                <button
                  className={`toc-art ${activeId === id ? 'active' : ''}`}
                  onClick={() => onSelect(id)}
                  title={art.heading}
                >
                  <span className="toc-art-num mono">{art.num}</span>
                  <span className="toc-art-title">{art.heading || art.num}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="toc-scroll">
      {toc.map((chapter, ci) => (
        <div key={ci} className="toc-chapter">
          {(chapter.num || chapter.title) && (
            <div className="toc-chapter-header">
              {chapter.num && <span className="toc-ch-num mono">{chapter.num}</span>}
              {chapter.title && <span className="toc-ch-title">{chapter.title}</span>}
            </div>
          )}
          <ul className="toc-list">
            {chapter.articles.map((art, ai) => {
              const id = art.eId || art.num;
              return (
                <li key={ai}>
                  <button
                    className={`toc-art ${activeId === id ? 'active' : ''}`}
                    onClick={() => onSelect(id)}
                    title={art.heading}
                  >
                    <span className="toc-art-num mono">{art.num}</span>
                    <span className="toc-art-title">{art.heading || art.num}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
