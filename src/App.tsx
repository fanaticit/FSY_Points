import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Manage from './pages/Manage';
import History from './pages/History';
import { LayoutDashboard, Users, History as HistoryIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)', padding: '0.2rem 1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src="/logo.jpg" alt="FSY Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid var(--accent)' }} />
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>FSY Points</h1>
            </div>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/" style={{ color: 'var(--header-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><LayoutDashboard size={18}/> Board</Link>
              <Link to="/history" style={{ color: 'var(--header-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><HistoryIcon size={18}/> History</Link>
              <Link to="/manage" style={{ color: 'var(--header-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><Users size={18}/> Manage</Link>
            </nav>
          </div>
        </header>
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
