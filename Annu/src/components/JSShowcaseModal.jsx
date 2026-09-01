import React, { useState } from 'react';
import { X, Code2, BookOpen, Terminal, Sparkles, CheckCircle2, Play } from 'lucide-react';

const SYLLABUS_TOPICS = [
  {
    id: 'variables-es6',
    title: '1. Variables & ES6 Features (let, const, Destructuring, Spread)',
    description: 'Usage of const, let, template literals, object destructuring, and spread operator in QueueLess state management.',
    code: `// QueueLess JS Implementation: Object Destructuring & Spread Operator
const updateTokenStatus = (tokenId, newStatus) => {
  setTokens(prevTokens => 
    prevTokens.map(token => {
      if (token.tokenId === tokenId) {
        // ES6 Spread Operator & Property Update
        return { 
          ...token, 
          status: newStatus,
          lastUpdated: new Date().toISOString() 
        };
      }
      return token;
    })
  );
};`,
  },
  {
    id: 'array-hof',
    title: '2. Array Higher-Order Functions (map, filter, reduce, sort)',
    description: 'Filtering active venues, transforming tokens, and calculating total queue wait times using map, filter, and reduce.',
    code: `// QueueLess AI Engine: Array map, filter, and reduce
// 1. Filter tokens by venue
const activeQueue = tokens.filter(t => t.venueId === venueId && t.status === 'WAITING');

// 2. Reduce to calculate total accumulated wait time
const totalWaitTime = activeQueue.reduce((accumulatedTime, currentToken) => {
  return accumulatedTime + currentToken.estimatedWaitMins;
}, 0);

// 3. Map venues to append dynamic queue metrics
const formattedVenues = venues.map(venue => ({
  ...venue,
  hasWait: venue.currentQueueLength > 0
}));`,
  },
  {
    id: 'arrow-functions',
    title: '3. Functions, Arrow Functions & Scope',
    description: 'Pure functions for AI waiting time prediction algorithms and venue filtering.',
    code: `// Arrow function for AI Wait Time Calculation
export const predictWaitTime = ({ peopleAhead, activeCounters, avgServiceTimeMins }) => {
  const safeCounters = Math.max(1, activeCounters);
  const rawMins = (peopleAhead * avgServiceTimeMins) / safeCounters;
  return Math.round(rawMins);
};`,
  },
  {
    id: 'objects-json',
    title: '4. Objects, Nested Objects & JSON Handling',
    description: 'Structured data models for Venues, Departments, and Virtual Tokens.',
    code: `// Token Data Object Structure
const tokenObject = {
  tokenId: 'QL-OPD-104',
  venue: {
    id: 'v1',
    name: 'Apollo Health Supercenter'
  },
  customer: {
    name: 'Rahul Sharma',
    contact: '+91 98765 43210'
  },
  status: 'WAITING'
};

// Convert to JSON String for Local Storage
const jsonString = JSON.stringify(tokenObject);
const parsedObject = JSON.parse(jsonString);`,
  },
  {
    id: 'async-promises',
    title: '5. Async/Await & Promise Simulation',
    description: 'Simulating real-time WebSocket ticket updates and asynchronous QR Code rendering.',
    code: `// Asynchronous QR Generation using Promises
const generateQRCode = async (qrData) => {
  try {
    const canvas = document.getElementById('qr-canvas');
    // Promise-based QRCode generation
    await QRCode.toCanvas(canvas, qrData, { width: 140, margin: 1 });
    console.log('QR Code generated successfully!');
  } catch (error) {
    console.error('Async QR generation error:', error);
  }
};`,
  },
  {
    id: 'local-storage',
    title: '6. LocalStorage Browser Data Management',
    description: 'Persisting booked tokens, venues, and user theme preferences in browser storage.',
    code: `// LocalStorage Utilities in QueueLess
export function saveStoredUserTokens(tokens) {
  try {
    localStorage.setItem('queueless_user_tokens', JSON.stringify(tokens));
  } catch (err) {
    console.error('LocalStorage save error:', err);
  }
}

export function getStoredUserTokens() {
  const data = localStorage.getItem('queueless_user_tokens');
  return data ? JSON.parse(data) : [];
}`,
  },
  {
    id: 'react-state',
    title: '7. React Hooks & State Management (useState, useEffect)',
    description: 'Single Page Application state management for venues, tokens, notifications, and live interval simulation ticks.',
    code: `// React useState & useEffect in App.jsx
function App() {
  const [tokens, setTokens] = useState(() => getStoredUserTokens());
  const [activeTab, setActiveTab] = useState('explore');

  // Persistence side-effect
  useEffect(() => {
    saveStoredUserTokens(tokens);
  }, [tokens]);

  return <div>QueueLess SPA Interface</div>;
}`,
  }
];

export function JSShowcaseModal({ onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(SYLLABUS_TOPICS[0]);
  const [consoleOutput, setConsoleOutput] = useState('');

  const handleRunCode = () => {
    setConsoleOutput(`[Execution Success]: Demonstrated ${selectedTopic.title} logic in QueueLess runtime.`);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--amber)',
              padding: '0.4rem',
              borderRadius: '10px',
            }}>
              <Code2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>JS & React Syllabus Concept Showcase</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Demonstration of JavaScript & React core concepts implemented in QueueLess
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flexGrow: 1, overflow: 'hidden' }}>
          
          {/* Left Topic Sidebar */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRight: '1px solid var(--border-color)',
            overflowY: 'auto',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0.4rem' }}>
              SYLLABUS MODULES
            </span>

            {SYLLABUS_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => { setSelectedTopic(topic); setConsoleOutput(''); }}
                style={{
                  textAlign: 'left',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  border: selectedTopic.id === topic.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: selectedTopic.id === topic.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: selectedTopic.id === topic.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: selectedTopic.id === topic.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {topic.title}
              </button>
            ))}
          </div>

          {/* Right Code Display & Playground */}
          <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                {selectedTopic.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedTopic.description}
              </p>
            </div>

            {/* Code Block Container */}
            <div style={{
              background: '#090d16',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}>
              <div style={{
                background: '#111827',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  QueueLess_Implementation.js
                </span>
                <button
                  onClick={handleRunCode}
                  className="btn-emerald"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  <Play size={12} /> Run Code Snippet
                </button>
              </div>

              <pre style={{ padding: '1rem', overflowX: 'auto', color: '#38bdf8' }}>
                <code>{selectedTopic.code}</code>
              </pre>
            </div>

            {/* Terminal Console Output */}
            {consoleOutput && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--emerald)',
                fontFamily: 'JetBrains Mono',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Terminal size={16} />
                {consoleOutput}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
