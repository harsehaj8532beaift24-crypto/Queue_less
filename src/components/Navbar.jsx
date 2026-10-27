import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, 
  Building2, 
  BarChart3, 
  Sun, 
  Moon, 
  Bell, 
  CheckCircle2,
  User,
  LogOut,
  LogIn,
  HelpCircle,
  QrCode
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  tokensCount, 
  theme, 
  toggleTheme, 
  notifications = [],
  clearNotifications,
  currentUser,
  onOpenAuth,
  onLogout,
  isServerConnected,
  onOpenInfo,
  onOpenScanner
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.65rem 0',
      transition: 'background-color 0.2s ease',
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Brand Logo & Live Status */}
        <div 
          onClick={() => setActiveTab('explore')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--btn-primary-bg, #262626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <Ticket size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                QueueLess
              </span>
              <span 
                className={`badge ${isServerConnected ? 'badge-emerald' : 'badge-amber'}`} 
                style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}
                title={isServerConnected ? 'Connected to MongoDB & Socket.IO server' : 'Connecting to local/remote server'}
              >
                {isServerConnected ? 'Connected' : 'Connecting'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '-1px' }}>
              Virtual Queue Management System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav 
          aria-label="Main Navigation"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'var(--bg-secondary)', 
            padding: '3px', 
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('explore')}
            className={activeTab === 'explore' ? 'btn-primary' : 'btn-secondary'}
            style={{ 
              height: '34px',
              fontSize: '0.825rem', 
              padding: '0 0.9rem',
              borderRadius: '6px',
              border: activeTab === 'explore' ? undefined : 'none',
              background: activeTab === 'explore' ? undefined : 'transparent',
              boxShadow: activeTab === 'explore' ? undefined : 'none',
            }}
          >
            <Building2 size={16} />
            <span>Explore Venues</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={activeTab === 'tokens' ? 'btn-primary' : 'btn-secondary'}
            style={{ 
              height: '34px',
              fontSize: '0.825rem', 
              padding: '0 0.9rem',
              borderRadius: '6px',
              border: activeTab === 'tokens' ? undefined : 'none',
              background: activeTab === 'tokens' ? undefined : 'transparent',
              boxShadow: activeTab === 'tokens' ? undefined : 'none',
              position: 'relative',
            }}
          >
            <Ticket size={16} />
            <span>My Tokens</span>
            {tokensCount > 0 && (
              <span style={{
                background: 'var(--rose)',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '0.65rem',
                fontWeight: 700,
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.2rem',
              }}>
                {tokensCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}
            style={{ 
              height: '34px',
              fontSize: '0.825rem', 
              padding: '0 0.9rem',
              borderRadius: '6px',
              border: activeTab === 'admin' ? undefined : 'none',
              background: activeTab === 'admin' ? undefined : 'transparent',
              boxShadow: activeTab === 'admin' ? undefined : 'none',
            }}
          >
            <BarChart3 size={16} />
            <span>Business Portal</span>
          </button>

          <button
            onClick={() => onOpenInfo && onOpenInfo('faq')}
            className="btn-secondary"
            title="Help, FAQ and Policies"
            style={{ 
              height: '34px',
              fontSize: '0.825rem', 
              padding: '0 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              color: 'var(--text-secondary)',
            }}
          >
            <HelpCircle size={15} />
            <span>Help & FAQ</span>
          </button>

          <button
            onClick={() => onOpenScanner && onOpenScanner()}
            className="btn-secondary"
            title="Scan ticket with camera, upload pass image, or enter code"
            style={{ 
              height: '34px',
              fontSize: '0.825rem', 
              padding: '0 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              color: 'var(--text-secondary)',
            }}
          >
            <QrCode size={15} />
            <span>Scan Pass</span>
          </button>
        </nav>

        {/* Right Actions: User Profile / Auth, Notifications & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* User Auth Info */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-secondary)',
                padding: '0.25rem 0.6rem',
                borderRadius: '9px',
                fontSize: '0.8rem',
                border: '1px solid var(--border-color)',
                height: '36px',
              }}>
                <User size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="btn-secondary"
                aria-label="Sign Out"
                title="Sign Out"
                style={{ width: '36px', height: '36px', padding: 0, minHeight: '36px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => onOpenAuth ? onOpenAuth('login') : setActiveTab('signin')}
                className={activeTab === 'signin' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  fontSize: '0.825rem',
                  height: '34px',
                  minHeight: '34px',
                  padding: '0 0.85rem',
                  borderRadius: '7px',
                }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth ? onOpenAuth('register') : setActiveTab('signup')}
                className="btn-primary"
                style={{
                  fontSize: '0.825rem',
                  height: '34px',
                  minHeight: '34px',
                  padding: '0 0.85rem',
                  borderRadius: '7px',
                  outline: activeTab === 'signup' ? '2px solid var(--text-primary)' : 'none',
                }}
              >
                <User size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-secondary"
              aria-label="View queue notifications"
              style={{
                width: '36px',
                height: '36px',
                minHeight: '36px',
                padding: 0,
                position: 'relative',
              }}
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald)',
                  boxShadow: '0 0 6px var(--emerald)',
                }} />
              )}
            </button>

            {showNotifications && (
              <div className="glass-modal animate-slide-down" style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                padding: '0.9rem',
                zIndex: 200,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem',
                }}>
                  <h4 style={{ fontSize: '0.875rem' }}>Live Queue Alerts</h4>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.25rem 0' }}>
                    No new queue notifications.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.map((n, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-tertiary)',
                        padding: '0.6rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                      }}>
                        <CheckCircle2 size={15} style={{ color: 'var(--emerald)', marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{n.title}</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '1px' }}>{n.message}</p>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {n.time || 'Just now'}
                          </span>
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
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '36px',
              height: '36px',
              minHeight: '36px',
              padding: 0,
            }}
          >
            {theme === 'dark' ? (
              <Sun size={16} style={{ color: 'var(--amber)' }} />
            ) : (
              <Moon size={16} style={{ color: 'var(--accent-primary)' }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
