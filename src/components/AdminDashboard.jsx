import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  Plus, 
  Play, 
  AlertOctagon, 
  UserCheck, 
  PhoneCall, 
  Activity,
  Layers,
  QrCode,
  Search,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  RefreshCw,
  X
} from 'lucide-react';
import { calculateBusinessMetrics } from '../utils/aiPredictor';
import { analyticsApi, tokenApi } from '../api/client';
import QRScannerView from './QRScannerView';

export function AdminDashboard({ venues, tokens, onUpdateVenue, onUpdateTokenStatus, onAddWalkInToken }) {
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || venues[0]?._id || 'v1');
  const [subTab, setSubTab] = useState('controls'); // 'controls', 'analytics', 'qr'
  const [walkInName, setWalkInName] = useState('');
  const [walkInDept, setWalkInDept] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Real Database Analytics state
  const [dbAnalytics, setDbAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // QR Verification Tool state
  const [qrInput, setQrInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const currentVenue = venues.find(v => (v.id || v._id) === selectedVenueId) || venues[0];

  const venueTokens = tokens.filter(t => {
    const tVenueId = t.business?._id || t.business || t.venueId;
    const currentId = currentVenue.id || currentVenue._id;
    return tVenueId === currentId;
  });

  const waitingTokens = venueTokens.filter(t => {
    const s = (t.status || '').toLowerCase();
    return s === 'waiting' || s === 'calling';
  });
  const servingTokens = venueTokens.filter(t => (t.status || '').toLowerCase() === 'serving');
  const completedTokens = venueTokens.filter(t => (t.status || '').toLowerCase() === 'completed');

  // Fallback heuristic metrics if DB analytics is loading
  const fallbackMetrics = calculateBusinessMetrics(currentVenue, tokens);

  // Fetch real MongoDB Analytics when subTab is 'analytics' or venue changes
  const fetchAnalytics = async () => {
    const vId = currentVenue._id || currentVenue.id;
    if (!vId) return;
    setLoadingAnalytics(true);
    try {
      const res = await analyticsApi.getOverview(vId);
      if (res.success && res.data) {
        setDbAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error, showing local metrics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedVenueId]);

  // Handle Counter Allocation toggle (+ / - counters)
  const handleAdjustCounters = (delta) => {
    const active = currentVenue.activeCounters || 2;
    const total = currentVenue.totalCounters || 4;
    const newActive = Math.min(total, Math.max(1, active + delta));
    onUpdateVenue(currentVenue._id || currentVenue.id, { activeCounters: newActive });
  };

  // Call Next Token in Queue
  const handleCallNext = () => {
    const nextToken = waitingTokens.find(t => (t.status || '').toLowerCase() === 'waiting');
    if (nextToken) {
      onUpdateTokenStatus(nextToken._id || nextToken.tokenId, 'calling');
    }
  };

  const handleMarkServing = (id) => {
    onUpdateTokenStatus(id, 'serving');
  };

  const handleMarkCompleted = (id) => {
    onUpdateTokenStatus(id, 'completed');
  };

  const handleMarkNoShow = (id) => {
    onUpdateTokenStatus(id, 'cancelled');
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    const depts = currentVenue.departments || [];
    const dept = depts.find(d => (d.id || d._id) === walkInDept) || depts[0] || { name: 'General', prefix: 'WALK', avgTime: 10 };
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    const tokenId = `QL-${dept.prefix || 'WALK'}-${randomNum}`;

    const newWalkIn = {
      queueId: dept.queueId,
      tokenId,
      tokenNumber: tokenId,
      venueId: currentVenue._id || currentVenue.id,
      venueName: currentVenue.name,
      departmentName: dept.name,
      customerName: `${walkInName.trim()} (Walk-in)`,
      phone: 'Desk Booking',
      partySize: 1,
      isPriority: false,
      priorityReason: '',
      position: waitingTokens.length + 1,
      peopleAhead: waitingTokens.length,
      estimatedWaitMins: Math.round((waitingTokens.length * (dept.avgTime || 10)) / (currentVenue.activeCounters || 1)),
      status: 'waiting',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: JSON.stringify({ tokenId, venue: currentVenue.name, customer: walkInName }),
    };

    onAddWalkInToken(newWalkIn);
    setWalkInName('');
    setShowWalkInModal(false);
  };

  // QR Code Verification Handler
  const handleVerifyQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setIsVerifying(true);
    setVerifyError('');
    setVerificationResult(null);

    try {
      const res = await tokenApi.verifyQR({ qrData: qrInput.trim() });
      if (res.success && res.data) {
        setVerificationResult(res);
      } else {
        setVerifyError(res.message || 'Token verification failed');
      }
    } catch (err) {
      setVerifyError(err.message || 'Verification rejected: Invalid token record');
    } finally {
      setIsVerifying(false);
    }
  };

  const displayTotalServed = dbAnalytics?.completedTokens ?? fallbackMetrics.totalServed;
  const displayCurrentWaiting = dbAnalytics?.currentWaiting ?? fallbackMetrics.currentWaiting;
  const displayAvgWait = dbAnalytics?.avgWaitMins ?? fallbackMetrics.avgWaitMins;
  const displayEfficiency = dbAnalytics?.efficiencyScore ?? fallbackMetrics.efficiencyScore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header & Venue Switcher */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
            <Activity size={12} /> Staff & Admin Portal
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Queue Control & Real-time Operations
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Live counter management, token caller, MongoDB aggregation analytics, and instant QR verification.
          </p>
        </div>

        {/* Venue Selector Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {venues.map((venue) => {
            const vId = venue.id || venue._id;
            const isSelected = selectedVenueId === vId;
            return (
              <button
                key={vId}
                type="button"
                onClick={() => setSelectedVenueId(vId)}
                className={isSelected ? 'btn-primary' : 'btn-secondary'}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                }}
              >
                {venue.name.split(' ')[0]} • {venue.categoryName || venue.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs: Controls / Real DB Analytics / QR Scanner (Segmented Control) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'var(--bg-secondary)',
        padding: '0.35rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          onClick={() => setSubTab('controls')}
          className={subTab === 'controls' ? 'btn-primary' : 'btn-secondary'}
          style={{
            fontSize: '0.84rem',
            padding: '0.5rem 1rem',
            border: subTab === 'controls' ? 'none' : '1px solid transparent',
          }}
        >
          <Sliders size={16} />
          <span>Queue Controls ({waitingTokens.length} Waiting)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab('analytics');
            fetchAnalytics();
          }}
          className={subTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
          style={{
            fontSize: '0.84rem',
            padding: '0.5rem 1rem',
            border: subTab === 'analytics' ? 'none' : '1px solid transparent',
          }}
        >
          <BarChart2 size={16} />
          <span>MongoDB Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('qr')}
          className={subTab === 'qr' ? 'btn-primary' : 'btn-secondary'}
          style={{
            fontSize: '0.84rem',
            padding: '0.5rem 1rem',
            border: subTab === 'qr' ? 'none' : '1px solid transparent',
          }}
        >
          <QrCode size={16} />
          <span>QR Verification Scanner</span>
        </button>
      </div>

      {/* TAB 1: QUEUE CONTROLS */}
      {subTab === 'controls' && (
        <>
          {/* Analytics KPI Overview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            {/* Total Customers Served */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Served Today
                </span>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--emerald)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{displayTotalServed}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 500, display: 'block', marginTop: '4px' }}>
                  ● Persisted in MongoDB
                </span>
              </div>
            </div>

            {/* Currently Waiting */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Queue Length
                </span>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--amber)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={18} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber)', lineHeight: 1.1 }}>
                  {displayCurrentWaiting}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  Active tickets waiting
                </span>
              </div>
            </div>

            {/* Average Wait Time */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Avg Actual Wait
                </span>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--accent-primary)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
                  {displayAvgWait} <span style={{ fontSize: '1rem', fontWeight: 600 }}>mins</span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'block', marginTop: '4px' }}>
                  AI dynamic prediction
                </span>
              </div>
            </div>

            {/* Efficiency Score */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Counter Capacity
                </span>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.12)',
                  color: 'var(--cyan)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Activity size={18} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)', lineHeight: 1.1 }}>
                  {displayEfficiency}%
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  {currentVenue.activeCounters || 2} of {currentVenue.totalCounters || 4} counters active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Queue Control Toolbar */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={handleCallNext}
                disabled={waitingTokens.length === 0}
                className="btn-primary" 
                style={{ fontSize: '0.9rem', padding: '0.65rem 1.35rem' }}
              >
                <Play size={18} />
                <span>Call Next Token</span>
              </button>

              <button 
                type="button"
                onClick={() => setShowWalkInModal(true)}
                className="btn-secondary" 
                style={{ fontSize: '0.9rem', padding: '0.65rem 1.15rem' }}
              >
                <Plus size={18} />
                <span>Issue Walk-in Token</span>
              </button>
            </div>

            {/* Active Counter Adjuster */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'var(--bg-tertiary)',
              padding: '0.4rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Active Service Desks:
              </span>
              <button 
                type="button"
                onClick={() => handleAdjustCounters(-1)}
                className="btn-secondary"
                style={{ width: '30px', height: '30px', padding: 0, justifyContent: 'center' }}
                disabled={(currentVenue.activeCounters || 2) <= 1}
                aria-label="Decrease active counters"
              >
                -
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>
                {currentVenue.activeCounters || 2}
              </span>
              <button 
                type="button"
                onClick={() => handleAdjustCounters(1)}
                className="btn-secondary"
                style={{ width: '30px', height: '30px', padding: 0, justifyContent: 'center' }}
                disabled={(currentVenue.activeCounters || 2) >= (currentVenue.totalCounters || 4)}
                aria-label="Increase active counters"
              >
                +
              </button>
            </div>
          </div>

          {/* Active Queue Table / List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Active Desk Queue Line ({venueTokens.length} total)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Manage status transitions for current tokens at {currentVenue.name}.
                </p>
              </div>
              <span className="badge badge-indigo">{currentVenue.name}</span>
            </div>

            {venueTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>No active tokens</h4>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>
                  All queues for this venue are clear, or no tokens have been booked yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {venueTokens.map((t) => {
                  const s = (t.status || 'waiting').toLowerCase();
                  const tId = t._id || t.tokenId;
                  const tNum = t.tokenNumber || t.tokenId;

                  return (
                    <div 
                      key={tId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.9rem 1.1rem',
                        borderRadius: '12px',
                        background: s === 'calling'
                          ? 'rgba(244, 63, 94, 0.1)'
                          : s === 'serving'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'var(--bg-tertiary)',
                        border: s === 'calling'
                          ? '1px solid var(--rose)'
                          : s === 'serving'
                          ? '1px solid var(--emerald)'
                          : '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
                        <div style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          color: s === 'calling' ? 'var(--rose)' : s === 'serving' ? 'var(--emerald)' : 'var(--accent-primary)',
                          minWidth: '105px',
                        }}>
                          {tNum}
                        </div>

                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.customerName}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t.service?.name || t.departmentName} • {t.partySize || 1} Person(s)
                          </span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${
                          s === 'calling' ? 'badge-rose animate-pulse-glow' :
                          s === 'serving' ? 'badge-emerald' : 
                          s === 'completed' ? 'badge-indigo' : 
                          s === 'cancelled' ? 'badge-rose' : 'badge-amber'
                        }`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {s.toUpperCase()}
                        </span>

                        {s === 'waiting' && (
                          <button 
                            type="button"
                            onClick={() => onUpdateTokenStatus(tId, 'calling')}
                            className="btn-primary" 
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Call
                          </button>
                        )}

                        {s === 'calling' && (
                          <button 
                            type="button"
                            onClick={() => handleMarkServing(tId)}
                            className="btn-primary" 
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Start Service
                          </button>
                        )}

                        {(s === 'serving' || s === 'calling') && (
                          <button 
                            type="button"
                            onClick={() => handleMarkCompleted(tId)}
                            className="btn-secondary" 
                            style={{
                              fontSize: '0.78rem',
                              padding: '0.35rem 0.75rem',
                              color: 'var(--emerald)',
                              borderColor: 'rgba(16, 185, 129, 0.4)',
                            }}
                          >
                            Mark Complete
                          </button>
                        )}

                        {s === 'waiting' && (
                          <button 
                            type="button"
                            onClick={() => handleMarkNoShow(tId)}
                            className="btn-secondary" 
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--rose)',
                              borderColor: 'rgba(244, 63, 94, 0.3)',
                              padding: '0.35rem 0.65rem',
                            }}
                          >
                            No-Show
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: REAL MONGODB AGGREGATED ANALYTICS */}
      {subTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '0.3rem' }}>
                  <BarChart2 size={12} /> MongoDB Aggregation Pipeline
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  Historical Performance Analytics
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Aggregated from live ServiceHistory collection for {currentVenue.name}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAnalytics}
                className="btn-secondary"
                disabled={loadingAnalytics}
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
              >
                <RefreshCw size={14} className={loadingAnalytics ? 'animate-spin' : ''} />
                <span>Refresh Aggregations</span>
              </button>
            </div>

            {/* Aggregated KPI Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Total Tokens Issued
                </span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', lineHeight: 1.1 }}>
                  {dbAnalytics?.totalTokensIssued ?? fallbackMetrics.totalServed}
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Completed Services
                </span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px', lineHeight: 1.1 }}>
                  {dbAnalytics?.completedTokens ?? 0}
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Average Service Duration
                </span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px', lineHeight: 1.1 }}>
                  {dbAnalytics?.avgServiceDurationMins ?? 10} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>mins</span>
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Average Actual Waiting Time
                </span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber)', marginTop: '4px', lineHeight: 1.1 }}>
                  {dbAnalytics?.avgWaitMins ?? 8} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>mins</span>
                </p>
              </div>
            </div>

            {/* Hourly Traffic Bar Chart */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Hourly Customer Traffic Distribution (MongoDB Records)
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-primary)' }} />
                    Standard
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--rose)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--rose)' }} />
                    Peak Hours
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '0.4rem',
                alignItems: 'flex-end',
                height: '140px',
                background: 'var(--bg-tertiary)',
                padding: '1.25rem 0.5rem 0.5rem',
                borderRadius: '12px',
              }}>
                {(dbAnalytics?.hourlyTraffic || []).map((slot, idx) => {
                  const maxCount = Math.max(...(dbAnalytics?.hourlyTraffic || [{ count: 1 }]).map(s => s.count), 1);
                  const barHeight = Math.max(12, Math.round((slot.count / maxCount) * 85));

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: slot.isPeak ? 'var(--rose)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                        {slot.count}
                      </span>
                      <div style={{
                        width: '100%',
                        maxWidth: '24px',
                        height: `${barHeight}px`,
                        borderRadius: '4px',
                        background: slot.isPeak ? 'var(--rose)' : 'var(--text-primary)',
                        transition: 'height 0.3s ease',
                      }} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {slot.hour.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QR CODE VERIFICATION TOOL */}
      {subTab === 'qr' && (
        <QRScannerView
          venue={currentVenue}
          onTokenAction={(tokenId, action) => {
            if (action === 'call') onUpdateTokenStatus(tokenId, 'calling');
            else if (action === 'serve') onUpdateTokenStatus(tokenId, 'serving');
            else if (action === 'complete') onUpdateTokenStatus(tokenId, 'completed');
            else if (action === 'skip' || action === 'cancel') onUpdateTokenStatus(tokenId, 'cancelled');
          }}
        />
      )}

      {/* Add Walk-in Modal */}
      {showWalkInModal && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setShowWalkInModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Generate Desk Walk-in Token"
        >
          <div 
            className="glass-modal animate-slide-down" 
            style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Issue Desk Walk-in Token</h3>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close walk-in modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="walkInNameInput" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Customer Name
                </label>
                <input 
                  id="walkInNameInput"
                  type="text" 
                  placeholder="e.g. John Doe (Walk-in)"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="walkInDeptSelect" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Target Counter / Department
                </label>
                <select
                  id="walkInDeptSelect"
                  value={walkInDept}
                  onChange={(e) => setWalkInDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  {(currentVenue.departments || []).map(d => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.name} ({d.prefix}) • ~{d.avgTime || 10}m avg
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
