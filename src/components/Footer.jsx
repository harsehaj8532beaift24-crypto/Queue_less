import React from 'react';
import { Ticket, Sparkles, Shield, Heart } from 'lucide-react';

export function Footer({ openJsShowcase }) {
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <Ticket size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">
                QueueLess
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Smart Virtual Queue Management System. Eliminating waiting lines in hospitals, banks, salons, government offices, and cafeterias.
            </p>
          </div>

          {/* Quick Features */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.85rem' }}>Features</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Remote Token Booking</li>
              <li>• Live QR Ticket Check-in</li>
              <li>• AI Waiting Time Predictor</li>
              <li>• Real-time Notification Engine</li>
              <li>• Business Analytics Dashboard</li>
            </ul>
          </div>

          {/* Tech Stack & Syllabus */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.85rem' }}>Tech Stack & Syllabus</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-indigo">React SPA</span>
              <span className="badge badge-emerald">Vite</span>
              <span className="badge badge-amber">JavaScript ES6+</span>
              <span className="badge badge-indigo">HTML5 & CSS3</span>
              <span className="badge badge-emerald">LocalStorage</span>
              <span className="badge badge-amber">QRCode Generator</span>
            </div>
            <button 
              onClick={openJsShowcase}
              className="btn-secondary" 
              style={{ marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <Sparkles size={14} style={{ color: 'var(--amber)' }} />
              Open Syllabus Code Showcase
            </button>
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
          <p>© {new Date().getFullYear()} QueueLess - Virtual Token & Queue Management System. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Built with <Heart size={14} style={{ color: 'var(--rose)' }} fill="var(--rose)" /> using Modern JavaScript & React
          </p>
        </div>
      </div>
    </footer>
  );
}
