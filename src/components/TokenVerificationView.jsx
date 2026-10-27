import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2, 
  MapPin, 
  RefreshCw, 
  ArrowLeft,
  Ticket,
  ExternalLink,
  Info,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { tokenApi, qrApi, getSocket } from '../api/client';

export function TokenVerificationView({ tokenRef, onBack }) {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollTimerRef = useRef(null);

  // Helper to extract clean token identifier and hash from various URL formats
  const parseRefAndHash = useCallback((raw) => {
    if (!raw) return { id: '', hash: '' };
    const str = String(raw).trim();
    let id = str;
    let hash = '';

    if (str.includes('token=') || str.includes('?')) {
      try {
        const dummy = 'http://localhost';
        const url = new URL(str.startsWith('http') ? str : `${dummy}/${str.replace(/^\/+/, '')}`);
        const t = url.searchParams.get('token');
        const h = url.searchParams.get('hash');
        if (t) id = t.trim();
        if (h) hash = h.trim();
      } catch {
        const matchToken = str.match(/token=([^&]+)/);
        const matchHash = str.match(/hash=([^&]+)/);
        if (matchToken && matchToken[1]) id = decodeURIComponent(matchToken[1]);
        if (matchHash && matchHash[1]) hash = decodeURIComponent(matchHash[1]);
      }
    }

    // Strip leading /token/ or /tokens/ or /verify/ if present
    if (id.includes('/')) {
      const parts = id.split('/').filter(Boolean);
      id = parts[parts.length - 1];
    }

    // Also check window.location.search if hash wasn't found in raw
    if (!hash && typeof window !== 'undefined' && window.location.search) {
      try {
        const sp = new URLSearchParams(window.location.search);
        const h = sp.get('hash');
        if (h) hash = h.trim();
      } catch {}
    }

    return { id, hash };
  }, []);

  const fetchTokenDetails = useCallback(async (isSilent = false) => {
    if (!tokenRef) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    const { id, hash } = parseRefAndHash(tokenRef);

    try {
      // 1. Primary: Dedicated public token endpoint GET /api/tokens/:tokenId/public
      let res;
      try {
        res = await tokenApi.getPublic(id, hash);
      } catch (err) {
        // Fallback to QR public view if route difference
        try {
          res = await qrApi.viewPublic(id);
        } catch {
          // Final fallback to verify endpoint
          res = await qrApi.verify({ qrData: id, hash });
        }
      }

      if (res && res.success && res.data) {
        setTokenData(res.data);
      } else {
        setError(res?.message || 'Token record not found in MongoDB database.');
      }
    } catch (err) {
      setError(
        err.message?.includes('404') || err.message?.includes('not found')
          ? 'Booking not found in database. Please ensure you have scanned an authentic QueueLess pass.'
          : 'Unable to connect to the queue service. Please check your network connection and tap Retry.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tokenRef, parseRefAndHash]);

  // Initial fetch and Real-time Socket.IO synchronization
  useEffect(() => {
    if (!tokenRef) {
      setError('No token reference was provided in the scan URL.');
      setLoading(false);
      return;
    }

    fetchTokenDetails();

    // 1. Socket.IO Real-Time Updates
    let socket;
    try {
      socket = getSocket();
      const handleLiveUpdate = () => {
        fetchTokenDetails(true);
      };

      socket.on('queue_updated', handleLiveUpdate);
      socket.on('business_queue_updated', handleLiveUpdate);
      socket.on('token_updated', handleLiveUpdate);
    } catch (err) {
      console.warn('Socket subscription note:', err);
    }

    // 2. Periodic poll fallback (every 15 seconds)
    pollTimerRef.current = setInterval(() => {
      fetchTokenDetails(true);
    }, 15000);

    // 3. Document visibility change (refresh when phone screen reopens)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTokenDetails(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) {
        socket.off('queue_updated');
        socket.off('business_queue_updated');
        socket.off('token_updated');
      }
    };
  }, [tokenRef, fetchTokenDetails]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Waiting in Queue</span>;
      case 'calling':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Called to Counter</span>;
      case 'serving':
        return <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Currently Serving</span>;
      case 'completed':
        return <span className="badge badge-charcoal" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Service Completed</span>;
      case 'cancelled':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Cancelled</span>;
      case 'skipped':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>Skipped (No-Show)</span>;
      default:
        return <span className="badge badge-indigo" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>{status || 'Active'}</span>;
    }
  };

  return (
    <div style={{
      maxWidth: '580px',
      margin: '2rem auto',
      padding: '0 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      width: '100%',
    }}>
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
          style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={15} />
          <span>QueueLess Portal</span>
        </button>

        <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
          <ShieldCheck size={14} />
          <span>Live Verified Booking</span>
        </span>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <RefreshCw size={30} className="spin" style={{ color: 'var(--text-secondary)', margin: '0 auto 1.25rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Retrieving Booking Record...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
              Connecting to MongoDB to confirm cryptographic token pass.
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: 'var(--rose)',
            }}>
              <AlertCircle size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Pass Retrieval Failed
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5, maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
              {error}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fetchTokenDetails(false)}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.4rem' }}
              >
                <RotateCcw size={14} />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.4rem' }}
              >
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        ) : tokenData ? (
          <>
            {/* Authenticity Header Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Official Virtual Queue Pass
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)', margin: '2px 0 0 0', letterSpacing: '0.04em' }}>
                  {tokenData.tokenNumber}
                </h2>
              </div>
              <div>
                {getStatusBadge(tokenData.status)}
              </div>
            </div>

            {/* Next Steps Guidance Banner */}
            {tokenData.nextStepMessage && (
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: tokenData.status === 'calling'
                  ? 'rgba(244, 63, 94, 0.08)'
                  : tokenData.status === 'serving'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(99, 102, 241, 0.08)',
                color: tokenData.status === 'calling'
                  ? 'var(--rose)'
                  : tokenData.status === 'serving'
                    ? 'var(--emerald)'
                    : 'var(--text-primary)',
                border: tokenData.status === 'calling'
                  ? '1px solid var(--rose)'
                  : '1px solid var(--border-color)',
              }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>{tokenData.nextStepMessage}</span>
              </div>
            )}

            {/* Venue & Service Details */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Building2 size={20} style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>
                    {tokenData.venueName}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Department / Service: <strong style={{ color: 'var(--text-primary)' }}>{tokenData.serviceName}</strong>
                  </p>
                  {tokenData.venueAddress && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} />
                      <span>{tokenData.venueAddress}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Queue Position & Wait Time Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '0.9rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>
                  Queue Position
                </span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '3px 0 0 0' }}>
                  {tokenData.status === 'serving' 
                    ? 'At Counter' 
                    : tokenData.status === 'completed' 
                      ? 'Completed' 
                      : `#${tokenData.position || (tokenData.peopleAhead ? tokenData.peopleAhead + 1 : 1)}`}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {tokenData.status === 'serving' 
                    ? 'Counter Service Active' 
                    : tokenData.status === 'completed' 
                      ? 'Service Finished' 
                      : `${tokenData.peopleAhead ?? 0} ahead of you`}
                </span>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                padding: '0.9rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>
                  Estimated Wait
                </span>
                <p style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 800, 
                  color: tokenData.status === 'completed' ? 'var(--text-secondary)' : 'var(--emerald)', 
                  margin: '3px 0 0 0' 
                }}>
                  {tokenData.status === 'serving' 
                    ? 'In Progress' 
                    : tokenData.status === 'completed' 
                      ? 'Done' 
                      : `~${tokenData.estimatedWaitMinutes || 5} mins`}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {tokenData.status === 'serving' 
                    ? 'Desk In Service' 
                    : tokenData.status === 'completed' 
                      ? 'Recorded in History' 
                      : 'Live Dynamic Calculation'}
                </span>
              </div>
            </div>

            {/* Privacy-Safe Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              fontSize: '0.82rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', display: 'block' }}>Ticket Holder (Masked)</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                  {tokenData.customerName || 'Customer'}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', display: 'block' }}>Priority Verification</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0 0' }}>
                  {tokenData.isPriority ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      Verified ({tokenData.priorityReason || 'Special Care'})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Standard Queue Pass</span>
                  )}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', display: 'block' }}>Booking Timestamp</span>
                <p style={{ color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {tokenData.joinedAt ? new Date(tokenData.joinedAt).toLocaleString() : 'Recent'}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', display: 'block' }}>Cryptographic Reference</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tokenData.qrTokenHash ? `${tokenData.qrTokenHash.slice(0, 16)}...` : 'Verified'}
                </p>
              </div>
            </div>

            {/* Refresh / Update Action */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fetchTokenDetails(true)}
                disabled={refreshing}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.7rem' }}
              >
                <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Latest Status'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.85rem', padding: '0.7rem 1.25rem' }}
              >
                <span>Done</span>
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Security & Authenticity Notice */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        QueueLess Smart Queue Management. This page is connected directly to real-time MongoDB database records. Unauthenticated view protects personal identity.
      </div>
    </div>
  );
}

export default TokenVerificationView;
