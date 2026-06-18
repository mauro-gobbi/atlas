import { useState } from 'react';
import { REGULATIONS } from '../data/regulations.js';
import './Sidebar.css';

export default function Sidebar({ open, selectedReg, onSelectReg }) {
  const [query, setQuery] = useState('');

  const filtered = REGULATIONS.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.shortId.includes(q) ||
      r.tags.some((t) => t.includes(q)) ||
      r.type.toLowerCase().includes(q)
    );
  });

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-search">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="search"
          placeholder="Filter regulations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter regulations"
        />
      </div>

      <nav className="sidebar-nav">
        <div className="reg-count">{filtered.length} regulation{filtered.length !== 1 ? 's' : ''}</div>
        <ul>
          {filtered.map((reg) => (
            <li key={reg.id}>
              <button
                className={`reg-item ${selectedReg?.id === reg.id ? 'active' : ''}`}
                onClick={() => onSelectReg(reg)}
                style={{ '--reg-color': reg.color }}
              >
                <span className="reg-dot" />
                <span className="reg-info">
                  <span className="reg-name">{reg.name}</span>
                  <span className="reg-meta">
                    <span className={`reg-type ${reg.type === 'Directive' ? 'directive' : ''}`}>
                      {reg.type}
                    </span>
                    <span className="reg-id mono">{reg.shortId}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="no-results">No regulations match your filter.</p>
        )}
      </nav>
    </aside>
  );
}
