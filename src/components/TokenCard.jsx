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
            dark: '#1e293b',
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
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
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
              Priority: {token.priorityReason || 'Senior / Medical'}
            </span>
          )}
        </div>

        {/* Live Status Pill */}
        <span className={`badge ${
          isCalling ? 'badge-rose animate-pulse-glow' :
          isServing ? 'badge-emerald animate-pulse-glow' : 
          isCompleted ? 'badge-indigo' : 
          isCancelled ? 'badge-rose' : 'badge-amber'
        }`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
          {isWaiting && `Waiting (#${positionIndex})`}
          {isCalling && `🔔 YOUR TURN NOW!`}
          {isServing && `In Service at Counter`}
          {isCompleted && `Completed`}
          {isCancelled && `Cancelled`}
        </span>
      </div>

      {/* Main Token Display Box */}
      <div style={{
        background: isCalling 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
          : isServing
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
          : 'var(--bg-tertiary)',
        border: isCalling ? '2px solid var(--rose)' : isServing ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {venueTitle} • {deptTitle}
        </p>
        
        {/* Token Big Number */}
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          color: isCalling ? 'var(--rose)' : isServing ? 'var(--emerald)' : 'var(--accent-primary)',
          letterSpacing: '0.02em',
          margin: '0.2rem 0',
        }}>
          {displayTokenNumber}
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
            Encrypted Check-in QR
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Show this QR code at desk or kiosk when your token is called for verification.
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Issued: {token.issuedAt || new Date(token.joinedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            {peopleAheadCount}
          </p>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Wait Time</span>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald)' }}>
            ~{waitMins} <span style={{ fontSize: '0.75rem' }}>mins</span>
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
          {isCalling
            ? '🔔 YOUR TURN! Please head directly to the service counter immediately.'
            : isServing
            ? '✅ Currently in service at counter desk.'
            : peopleAheadCount <= 1 
            ? '🔔 Your turn is almost here! Please stay close to the counter.' 
            : `AI Prediction: Head towards lobby in ~${Math.max(1, waitMins - 5)} mins for smooth entry.`}
        </span>
      </div>

      {/* Interactive Actions Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        
        {/* Step Simulation Demo Button */}
        {isWaiting && (
          <button
            onClick={() => onSimulateStep(tokenIdentifier)}
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
            Advance Queue / Test Call Next
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isWaiting && (
            <button 
              onClick={() => onPushBackToken(tokenIdentifier)}
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
              title="Delayed? Push your turn back by 10 mins"
            >
              <RotateCcw size={14} />
              Push Back +10m
            </button>
          )}

          {isWaiting && (
            <button 
              onClick={() => onCancelToken(tokenIdentifier)}
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
