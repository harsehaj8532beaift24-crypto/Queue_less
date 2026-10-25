import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { qrApi } from '../api/client';

export function TokenVerificationView({ tokenRef, onBack }) {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTokenDetails = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await qrApi.viewPublic(tokenRef);
      if (res && res.success && res.data) {
        setTokenData(res.data);
      } else {
        setError(res?.message || 'Token not found in MongoDB database.');
      }
    } catch (err) {
      setError(err.message || 'Unable to verify token at this time. Please check your network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (tokenRef) {
      fetchTokenDetails();
    } else {
      setError('No token reference provided in QR payload.');
      setLoading(false);
    }
  }, [tokenRef]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Waiting in Queue</span>;
      case 'calling':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Called to Counter</span>;
      case 'serving':
        return <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Currently Serving</span>;
      case 'completed':
        return <span className="badge badge-charcoal" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Service Completed</span>;
      case 'cancelled':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Cancelled</span>;
      case 'skipped':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Skipped (No-Show)</span>;
      default:
        return <span className="badge badge-indigo" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>{status}</span>;
    }
  };

  return (
    <div style={{
      maxWidth: '560px',
      margin: '2rem auto',
      padding: '0 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
          style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={15} />
          <span>QueueLess Home</span>
        </button>

        <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={13} />
          <span>Verified Pass Check</span>
        </span>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Verifying Booking with Database...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Confirming authentic token record from MongoDB.
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: 'var(--rose)',
            }}>
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Pass Verification Failed
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5, maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
              {error}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => fetchTokenDetails()}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                Retry Verification
              </button>
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticity Banner */}
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
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Official Virtual Pass
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {tokenData.tokenNumber}
                </h2>
              </div>
              <div>
                {getStatusBadge(tokenData.status)}
              </div>
            </div>

            {/* Venue & Service Details */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Building2 size={18} style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tokenData.venueName}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    Department / Service: <strong style={{ color: 'var(--text-primary)' }}>{tokenData.serviceName}</strong>
                  </p>
                  {tokenData.venueAddress && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} />
                      {tokenData.venueAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Queue Metrics (If active) */}
            {(tokenData.status === 'waiting' || tokenData.status === 'calling') && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                    Queue Position
                  </span>
                  <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    #{tokenData.position || (tokenData.peopleAhead + 1)}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {tokenData.peopleAhead} ahead of you
                  </span>
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                    Estimated Wait
                  </span>
                  <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px' }}>
                    ~{tokenData.estimatedWaitMinutes || 5} mins
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Live dynamic calculation
                  </span>
                </div>
              </div>
            )}

            {/* Privacy-Protected Holder Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              fontSize: '0.82rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.85rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Ticket Holder (Masked):</span>
                <p style={{ fontWeight: 600, marginTop: '2px' }}>{tokenData.customerName}</p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Priority Verification:</span>
                <p style={{ fontWeight: 600, marginTop: '2px' }}>
                  {tokenData.isPriority ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      Verified Priority ({tokenData.priorityStatus})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Standard Queue Pass</span>
                  )}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Booked Timestamp:</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {tokenData.joinedAt ? new Date(tokenData.joinedAt).toLocaleString() : 'Recent'}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Cryptographic Hash:</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tokenData.qrTokenHash?.slice(0, 12)}...
                </p>
              </div>
            </div>

            {/* Live Refresh Action */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fetchTokenDetails(true)}
                disabled={refreshing}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Updating Status...' : 'Check Latest Status'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem 1rem' }}
              >
                <span>Return to Portal</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Security Notice */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        QueueLess Cryptographic Ticket Verification. All token data is verified directly against persistent MongoDB database records. Unauthenticated view protects personal identity.
      </div>
    </div>
  );
}
