import React, { useState } from 'react';
import { 
  Ticket, 
  Building2, 
  BarChart3, 
  Sun, 
  Moon, 
  Bell, 
  CheckCircle2,
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  tokensCount, 
  theme, 
  toggleTheme, 
  notifications = [],
  clearNotifications
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 0',
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px var(--accent-glow)',
          }}>
            <Ticket size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }} className="gradient-text">
                QueueLess
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                LIVE AI
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '-2px' }}>
              Smart Virtual Queue Management
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('explore')}
            className={activeTab === 'explore' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.9rem' }}
          >
            <Building2 size={18} />
            <span>Explore Venues</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={activeTab === 'tokens' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.9rem', position: 'relative' }}
          >
            <Ticket size={18} />
            <span>My Virtual Tokens</span>
            {tokensCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--rose)',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--rose-glow)',
              }}>
                {tokensCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.9rem' }}
          >
            <BarChart3 size={18} />
            <span>Business Portal</span>
          </button>

        </nav>

        {/* Right Actions: Notifications & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-secondary"
              aria-label="Notifications"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald)',
                  boxShadow: '0 0 8px var(--emerald)',
                }} />
              )}
            </button>

            {showNotifications && (
              <div className="glass-modal animate-slide-down" style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '320px',
                padding: '1rem',
                zIndex: 200,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem',
                }}>
                  <h4 style={{ fontSize: '0.95rem' }}>Live Queue Alerts</h4>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                    No new queue notifications yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.map((n, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-tertiary)',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                      }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--emerald)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600 }}>{n.title}</p>
                          <p style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            aria-label="Toggle Dark/Light Mode"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--amber)' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
          </button>
        </div>
      </div>
    </header>
  );
}
