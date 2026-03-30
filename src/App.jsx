import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Compare } from './components/Compare';
import { Convert } from './components/Convert';
import { Arithmetic } from './components/Arithmetic';
import { History } from './components/History';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('compare');

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
      <header className="app-header">
        <div className="header-content">
          <h1>⚖️ Quantity Measurement</h1>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          Compare
        </button>
        <button
          className={`nav-btn ${activeTab === 'convert' ? 'active' : ''}`}
          onClick={() => setActiveTab('convert')}
        >
          Convert
        </button>
        <button
          className={`nav-btn ${activeTab === 'arithmetic' ? 'active' : ''}`}
          onClick={() => setActiveTab('arithmetic')}
        >
          Arithmetic
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'compare' && <Compare />}
        {activeTab === 'convert' && <Convert />}
        {activeTab === 'arithmetic' && <Arithmetic />}
        {activeTab === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;
