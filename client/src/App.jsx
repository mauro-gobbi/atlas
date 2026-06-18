import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import RegulationViewer from './components/RegulationViewer.jsx';
import './App.css';

export default function App() {
  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectReg = useCallback((reg) => {
    setSelectedReg(reg);
  }, []);

  const handleLanguageChange = useCallback((code) => {
    setSelectedLang(code);
  }, []);

  return (
    <div className="app-layout">
      <Header
        selectedLang={selectedLang}
        onLanguageChange={handleLanguageChange}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="app-body">
        <Sidebar
          open={sidebarOpen}
          selectedReg={selectedReg}
          onSelectReg={handleSelectReg}
        />
        <main className="main-content">
          {selectedReg ? (
            <RegulationViewer
              regulation={selectedReg}
              lang={selectedLang}
            />
          ) : (
            <Welcome />
          )}
        </main>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="welcome fade-in">
      <div className="welcome-inner">
        <div className="welcome-icon">⚖️</div>
        <h1>EU Regulation Atlas</h1>
        <p>
          Browse 15 key EU digital regulations in all 24 official EU languages,
          fetched directly from the official EUR-Lex XML source.
        </p>
        <div className="welcome-hints">
          <div className="hint">
            <span className="hint-icon">←</span>
            <span>Select a regulation from the sidebar</span>
          </div>
          <div className="hint">
            <span className="hint-icon">🌐</span>
            <span>Switch language in the top-right dropdown</span>
          </div>
          <div className="hint">
            <span className="hint-icon">📋</span>
            <span>Navigate articles with the table of contents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
