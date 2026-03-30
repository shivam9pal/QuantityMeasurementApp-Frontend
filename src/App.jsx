import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Compare } from './components/Compare';
import { Convert } from './components/Convert';
import { Arithmetic } from './components/Arithmetic';
import { History } from './components/History';
import './App.css';

const TABS = {
  compare: {
    label: 'Compare',
    eyebrow: 'Quick check',
    title: 'Compare any two quantities',
    description: 'Pick units, enter values, and see instantly whether they represent the same measurement.',
  },
  convert: {
    label: 'Convert',
    eyebrow: 'Unit switch',
    title: 'Convert between supported units',
    description: 'Move smoothly across length, weight, volume, and temperature units without changing your workflow.',
  },
  arithmetic: {
    label: 'Arithmetic',
    eyebrow: 'Calculated results',
    title: 'Add, subtract, and divide measurements',
    description: 'Perform arithmetic on compatible quantities and keep results in the unit that fits your task.',
  },
  history: {
    label: 'History',
    eyebrow: 'Recent activity',
    title: 'Review previously recorded operations',
    description: 'Track comparisons, conversions, and arithmetic results from your recent measurement activity.',
  },
};

function App() {
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('compare');
  const activeTabContent = TABS[activeTab];

  if (!user) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      <div className="app-backdrop app-backdrop-left" />
      <div className="app-backdrop app-backdrop-right" />

      <header className="app-header">
        <div className="header-content">
          <div className="brand-block">
            <span className="brand-tag">Measurement Workspace</span>
            <h1>Quantity Measurement</h1>
            <p className="brand-subtitle">
              Compare, convert, calculate, and review measurement operations in one place.
            </p>
          </div>

          <div className="header-actions">
            <div className="user-pill">
              <span className="user-pill-label">Signed in as</span>
              <strong>{user.username}</strong>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="app-shell">
        <nav className="app-nav" aria-label="Primary">
          {Object.entries(TABS).map(([tabKey, tab]) => (
            <button
              key={tabKey}
              className={`nav-btn ${activeTab === tabKey ? 'active' : ''}`}
              onClick={() => setActiveTab(tabKey)}
            >
              <span className="nav-btn-label">{tab.label}</span>
              <span className="nav-btn-meta">{tab.eyebrow}</span>
            </button>
          ))}
        </nav>

        <main className="app-main">
          <section className="section-intro">
            <span className="section-intro-tag">{activeTabContent.eyebrow}</span>
            <h2>{activeTabContent.title}</h2>
            <p>{activeTabContent.description}</p>
          </section>

          {activeTab === 'compare' && <Compare />}
          {activeTab === 'convert' && <Convert />}
          {activeTab === 'arithmetic' && <Arithmetic />}
          {activeTab === 'history' && <History />}
        </main>
      </div>
    </div>
  );
}

export default App;
