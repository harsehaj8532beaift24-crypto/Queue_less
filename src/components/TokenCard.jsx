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

  const tokenIdentifier = token._id || token.tokenId;
  const displayTokenNumber = token.tokenNumber || token.tokenId || 'QL-TOKEN';
  const venueTitle = token.business?.name || token.venueName || 'Service Venue';
  const deptTitle = token.service?.name || token.departmentName || 'Counter';
  const currentStatus = (token.status || 'waiting').toLowerCase();
  const waitMins = token.estimatedWaitMinutes ?? token.estimatedWaitMins ?? 0;
  const peopleAheadCount = token.peopleAhead ?? 0;
  const positionIndex = token.position ?? (peopleAheadCount + 1);

  // Render QR Code onto Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const payload = token.qrCodeData || JSON.stringify({
        token: displayTokenNumber,
        hash: token.qrTokenHash || 'dev_token',
        venue: venueTitle,
      });

      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR rendering error:', error);
        }
      );
    }
  }, [token.qrCodeData, token.qrTokenHash, displayTokenNumber, venueTitle]);

  // Trigger celebration confetti when token state becomes SERVING or CALLING
  useEffect(() => {
    if (currentStatus === 'serving' || currentStatus === 'calling') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback if canvas-confetti is not available
      }
    }
  }, [currentStatus]);

  const isServing = currentStatus === 'serving';
  const isCalling = currentStatus === 'calling';
  const isCompleted = currentStatus === 'completed';
  const isCancelled = currentStatus === 'cancelled';
  const isWaiting = currentStatus === 'waiting';

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <article
      className="glass-panel"
      aria-label={`Virtual ticket ${displayTokenNumber}`}
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: isCalling
          ? '2px solid var(--rose)'
          : isServing
          ? '2px solid var(--emerald)'
          : '1px solid var(--border-color)',
        boxShadow: isCalling
          ? '0 0 24px rgba(244, 63, 94, 0.25)'
          : isServing
          ? '0 0 24px rgba(16, 185, 129, 0.25)'
          : 'var(--shadow-md)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Top Header Status & Priority */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-indigo" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            VIRTUAL TICKET
          </span>
          {token.isPriority && (
            <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
              Priority: {token.priorityReason || 'Special Assistance'}
            </span>
          )}
        </div>

        {/* Live Status Pill */}
        <span
          className={`badge ${
            isCalling ? 'badge-rose animate-pulse-glow' :
            isServing ? 'badge-emerald animate-pulse-glow' : 
            isCompleted ? 'badge-indigo' : 
            isCancelled ? 'badge-rose' : 'badge-amber'
          }`}
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', fontWeight: 700 }}
        >
          {isWaiting && `Waiting (#${positionIndex})`}
          {isCalling && `🔔 YOUR TURN NOW!`}
          {isServing && `In Service at Desk`}
          {isCompleted && `Completed`}
          {isCancelled && `Cancelled`}
        </span>
      </header>

      {/* Main Token Display Box */}
      <div style={{
        background: isCalling 
          ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
          : isServing
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
          : 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem 1rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600,
          marginBottom: '0.25rem',
        }}>
          {venueTitle} • {deptTitle}
        </p>
        
        {/* Token Big Number */}
        <h2 style={{
          fontSize: 'clamp(2.2rem, 5vw, 2.9rem)',
          fontWeight: 800,
          color: isCalling ? 'var(--rose)' : isServing ? 'var(--emerald)' : 'var(--accent-primary)',
          letterSpacing: '0.04em',
          margin: '0.15rem 0',
          lineHeight: 1.1,
          fontFamily: 'monospace',
        }}>
          {displayTokenNumber}
        </h2>

        <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
          Customer: {token.customerName}
        </p>
      </div>

      {/* Perforated Divider Aesthetic */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 -1.5rem',
          position: 'relative',
        }}
      >
        <div style={{
          width: '18px',
          height: '24px',
          background: 'var(--bg-primary)',
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px',
          borderRight: '1px solid var(--border-color)',
        }} />
        <div style={{
          flexGrow: 1,
          borderTop: '1px dashed var(--border-color)',
          margin: '0 0.5rem',
        }} />
        <div style={{
          width: '18px',
          height: '24px',
          background: 'var(--bg-primary)',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          borderLeft: '1px solid var(--border-color)',
        }} />
      </div>

      {/* QR Code & Scan Instructions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.9rem',
        background: 'var(--bg-secondary)',
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
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          flexShrink: 0,
        }}>
          <canvas
            ref={canvasRef}
            aria-label={`QR Code for verification of token ${displayTokenNumber}`}
            role="img"
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <QrCode size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span>Encrypted Check-in QR</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            Scan at desk or kiosk when your token is called for instant verification.
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Issued: {token.issuedAt || new Date(token.joinedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Live Counter Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
      }}>
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '0.85rem 0.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            People Ahead
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber)', marginTop: '2px', lineHeight: 1.1 }}>
            {peopleAheadCount}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '0.85rem 0.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Est. Wait Time
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px', lineHeight: 1.1 }}>
            ~{waitMins} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>mins</span>
          </p>
        </div>
      </div>

      {/* AI Smart Notification Tip */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '12px',
        padding: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--accent-primary)',
        lineHeight: 1.45,
      }}>
        <Sparkles size={18} style={{ flexShrink: 0 }} />
        <span>
          {isCalling
            ? '🔔 YOUR TURN! Please proceed to the service counter immediately.'
            : isServing
            ? '✅ Currently in service at the counter desk.'
            : peopleAheadCount <= 1 
            ? '🔔 Your turn is almost here! Please stay close to the counter.' 
            : `AI Prediction: Head towards lobby in ~${Math.max(1, waitMins - 5)} mins for smooth entry.`}
        </span>
      </div>

      {/* Interactive Actions Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.25rem' }}>
        
        {/* Step Simulation Demo Button */}
        {isWaiting && (
          <button
            type="button"
            onClick={() => onSimulateStep(tokenIdentifier)}
            className="btn-secondary"
            style={{
              justifyContent: 'center',
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.35)',
              color: 'var(--emerald)',
              fontSize: '0.85rem',
              padding: '0.65rem 1rem',
              fontWeight: 600,
            }}
          >
            <FastForward size={16} />
            <span>Advance Queue / Test Call Next</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isWaiting && (
            <button 
              type="button"
              onClick={() => onPushBackToken(tokenIdentifier)}
              className="btn-secondary" 
              style={{ flex: '1 1 120px', justifyContent: 'center', fontSize: '0.8rem', padding: '0.6rem 0.75rem' }}
              title="Delayed? Push your turn back by 10 mins"
            >
              <RotateCcw size={14} />
              <span>Push Back +10m</span>
            </button>
          )}

          {isWaiting && (
            <button 
              type="button"
              onClick={() => onCancelToken(tokenIdentifier)}
              className="btn-secondary" 
              style={{ flex: '1 1 120px', justifyContent: 'center', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)', fontSize: '0.8rem', padding: '0.6rem 0.75rem' }}
            >
              <XCircle size={14} />
              <span>Cancel Token</span>
            </button>
          )}

          <button 
            type="button"
            onClick={handlePrintTicket}
            className="btn-secondary" 
            style={{ flex: '1 1 100px', justifyContent: 'center', fontSize: '0.8rem', padding: '0.6rem 0.75rem' }}
          >
            <Download size={14} />
            <span>Print Ticket</span>
          </button>
        </div>

      </div>
    </article>
  );
}
