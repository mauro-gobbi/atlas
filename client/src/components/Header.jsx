import { useState } from 'react';
import { EU_LANGUAGES } from '../data/regulations.js';
import './Header.css';

export default function Header({ selectedLang, onLanguageChange, sidebarOpen, onToggleSidebar }) {
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = EU_LANGUAGES.find((l) => l.code === selectedLang) || EU_LANGUAGES[5];

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <span className="toggle-bar" />
          <span className="toggle-bar" />
          <span className="toggle-bar" />
        </button>
        <div className="logo">
          <span className="logo-icon">⚖️</span>
          <span className="logo-text">Atlas</span>
          <span className="logo-sub">EU Regulation Browser</span>
        </div>
      </div>

      <div className="header-right">
        <a
          href="https://eur-lex.europa.eu/"
          target="_blank"
          rel="noopener noreferrer"
          className="eurlex-link"
          title="Open EUR-Lex"
        >
          <span>EUR-Lex</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>

        <div className="lang-picker">
          <button
            className="lang-btn"
            onClick={() => setLangOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <span className="lang-code">{currentLang.code}</span>
            <span className="lang-name">{currentLang.nativeName}</span>
            <svg className={`chevron ${langOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {langOpen && (
            <div className="lang-dropdown" role="listbox">
              <div className="lang-grid">
                {EU_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={lang.code === selectedLang}
                    className={`lang-option ${lang.code === selectedLang ? 'active' : ''}`}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangOpen(false);
                    }}
                    title={lang.name}
                  >
                    <span className="lo-code">{lang.code}</span>
                    <span className="lo-native">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {langOpen && (
        <div className="lang-backdrop" onClick={() => setLangOpen(false)} />
      )}
    </header>
  );
}
