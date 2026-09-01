import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  Clock, 
  Users, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Download,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  FastForward
} from 'lucide-react';

export function TokenCard({ token, onCancelToken, onPushBackToken, onSimulateStep }) {
  const canvasRef = useRef(null);

  // Render QR Code onto Canvas
  useEffect(() => {
    if (canvasRef.current && token.qrCodeData) {
      QRCode.toCanvas(
        canvasRef.current,
        token.qrCodeData,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR rendering error:', error);
        }
      );
    }
  }, [token.qrCodeData]);

  // Trigger celebration confetti when token state becomes SERVING or COMPLETED
  useEffect(() => {
    if (token.status === 'SERVING' || token.status === 'CALLING') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [token.status]);

  const isServing = token.status === 'SERVING' || token.status === 'CALLING';
  const isCompleted = token.status === 'COMPLETED';
  const isCancelled = token.status === 'CANCELLED';

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Banner Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
            Virtual Token Ticket
          </span>
          {token.isPriority && (
            <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
              Priority: {token.priorityReason}
            </span>
          )}
        </div>

        {/* Live Status Pill */}
        <span className={`badge ${
          isServing ? 'badge-emerald animate-pulse-glow' : 
          isCompleted ? 'badge-indigo' : 
          isCancelled ? 'badge-rose' : 'badge-amber'
        }`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
          {token.status === 'WAITING' && `Waiting (#${token.position})`}
          {token.status === 'CALLING' && `🔔 YOUR TURN NOW!`}
          {token.status === 'SERVING' && `In Service at Counter`}
          {token.status === 'COMPLETED' && `Completed`}
          {token.status === 'CANCELLED' && `Cancelled`}
        </span>
      </div>

      {/* Main Token Display Box */}
      <div style={{
        background: isServing 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
          : 'var(--bg-tertiary)',
        border: isServing ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {token.venueName} • {token.departmentName}
        </p>
        
        {/* Token Big Number */}
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          color: isServing ? 'var(--emerald)' : 'var(--accent-primary)',
          letterSpacing: '0.02em',
          margin: '0.2rem 0',
        }}>
          {token.tokenId}
        </h1>

        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Customer: {token.customerName}
        </p>
      </div>

      {/* QR Code & Scan Instructions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        margin: '1.25rem 0',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{
          background: '#ffffff',
          padding: '6px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}>
          <canvas ref={canvasRef} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <QrCode size={16} style={{ color: 'var(--accent-primary)' }} />
            Check-in QR Code
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Show this QR code at the desk or kiosk when your token is called for instant validation.
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Booked at: {token.issuedAt}
          </span>
        </div>
      </div>

      {/* Live Counter Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>People Ahead</span>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--amber)' }}>
            {token.peopleAhead}
          </p>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Wait Time</span>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald)' }}>
            ~{token.estimatedWaitMins} <span style={{ fontSize: '0.75rem' }}>mins</span>
          </p>
        </div>
      </div>

      {/* AI Smart Notification Tip */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '10px',
        padding: '0.75rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.78rem',
        color: 'var(--accent-primary)',
      }}>
        <Sparkles size={16} style={{ flexShrink: 0 }} />
        <span>
          {token.peopleAhead <= 1 
            ? '🔔 Your turn is almost here! Please stay close to the counter.' 
            : `AI Tip: Arrive at the lobby in ${Math.max(1, token.estimatedWaitMins - 5)} minutes for smooth entry.`}
        </span>
      </div>

      {/* Interactive Demo Actions Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        
        {/* Fast-Forward Simulation Demo Button */}
        {token.status === 'WAITING' && (
          <button
            onClick={() => onSimulateStep(token.tokenId)}
            className="btn-secondary"
            style={{
              justifyContent: 'center',
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: 'var(--emerald)',
              fontSize: '0.85rem',
            }}
          >
            <FastForward size={16} />
            Simulate Next Token Call (-1 Ahead)
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {token.status === 'WAITING' && (
            <button 
              onClick={() => onPushBackToken(token.tokenId)}
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
              title="Delayed in traffic? Delay your turn by 10 mins"
            >
              <RotateCcw size={14} />
              Push Back +10m
            </button>
          )}

          {token.status === 'WAITING' && (
            <button 
              onClick={() => onCancelToken(token.tokenId)}
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', color: 'var(--rose)', fontSize: '0.8rem' }}
            >
              <XCircle size={14} />
              Cancel Token
            </button>
          )}

          <button 
            onClick={handlePrintTicket}
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            Print Ticket
          </button>
        </div>

      </div>
    </div>
  );
}
