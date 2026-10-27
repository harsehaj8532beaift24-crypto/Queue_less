import React from 'react';
import { Ticket, HelpCircle, Mail, ShieldCheck } from 'lucide-react';

export function Footer({ onOpenInfo, onNavigateAuth }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      marginTop: '4rem',
      padding: '3rem 0 1.5rem 0',
    }}>
      <div className="app-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--btn-primary-bg, #262626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <Ticket size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                QueueLess
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Smart Virtual Queue Management System. Eliminating physical waiting lines across hospitals, banking branches, salons, government offices, and cafeterias.
            </p>
          </div>

          {/* Core System Features */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>System Features</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>Remote Virtual Token Booking</li>
              <li>Encrypted QR Code Ticket Pass</li>
              <li>Dynamic Wait Time Estimation</li>
              <li>Real-time Queue Notifications</li>
              <li>Business Counter Controls & Analytics</li>
            </ul>
          </div>

          {/* Help & Support Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Account & Policies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateAuth && onNavigateAuth('login')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                >
                  Sign In to Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateAuth && onNavigateAuth('register')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                >
                  Create New Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo && onOpenInfo('faq')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo && onOpenInfo('contact')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                >
                  Contact Customer Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo && onOpenInfo('terms')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                >
                  Privacy & Usage Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Architecture</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-charcoal">React 18</span>
              <span className="badge badge-emerald">Vite</span>
              <span className="badge badge-charcoal">Node.js Express</span>
              <span className="badge badge-charcoal">MongoDB</span>
              <span className="badge badge-emerald">Socket.IO</span>
              <span className="badge badge-charcoal">QR Engine</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <p>© {new Date().getFullYear()} QueueLess — Smart Virtual Queue Management System. All rights reserved.</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Professional Queue Optimization & Real-Time Booking
          </p>
        </div>
      </div>
    </footer>
  );
}
