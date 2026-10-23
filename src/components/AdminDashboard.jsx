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
  Sparkles, 
  UserCheck, 
  PhoneCall, 
  Activity,
  Layers,
  QrCode,
  Search,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { calculateBusinessMetrics } from '../utils/aiPredictor';
import { analyticsApi, tokenApi } from '../api/client';

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
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.2rem' }}>Business Admin Portal</span>
          <h2 style={{ fontSize: '1.5rem' }}>Queue Control & Business Analytics</h2>
        </div>

        {/* Venue Selector Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {venues.map((venue) => {
            const vId = venue.id || venue._id;
            return (
              <button
                key={vId}
                onClick={() => setSelectedVenueId(vId)}
                className={selectedVenueId === vId ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
              >
                {venue.name.split(' ')[0]} {venue.categoryName || venue.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs: Controls / Real DB Analytics / QR Scanner */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setSubTab('controls')}
          className={subTab === 'controls' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <Sliders size={16} />
          Queue Controls ({waitingTokens.length} Waiting)
        </button>

        <button
          onClick={() => {
            setSubTab('analytics');
            fetchAnalytics();
          }}
          className={subTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <BarChart2 size={16} />
          Real Database Analytics
        </button>

        <button
          onClick={() => setSubTab('qr')}
          className={subTab === 'qr' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.85rem' }}
        >
          <QrCode size={16} />
          QR Verification Scanner
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
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Served Today</span>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', padding: '0.4rem', borderRadius: '8px' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{displayTotalServed}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Persisted in MongoDB</span>
            </div>

            {/* Currently Waiting */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Live Queue Length</span>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', padding: '0.4rem', borderRadius: '8px' }}>
                  <Clock size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber)' }}>{displayCurrentWaiting}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tokens ahead</span>
            </div>

            {/* Average Wait Time */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Avg Actual Wait</span>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '0.4rem', borderRadius: '8px' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{displayAvgWait} <span style={{ fontSize: '1rem', fontWeight: 500 }}>mins</span></h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>AI dynamic prediction</span>
            </div>

            {/* Efficiency Score */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Counter Efficiency</span>
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', padding: '0.4rem', borderRadius: '8px' }}>
                  <Activity size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{displayEfficiency}%</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>{currentVenue.activeCounters || 2} of {currentVenue.totalCounters || 4} counters active</span>
            </div>
          </div>

          {/* Quick Action Queue Control Toolbar */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={handleCallNext}
                disabled={waitingTokens.length === 0}
                className="btn-primary" 
                style={{ fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
              >
                <Play size={18} />
                <span>Call Next Token</span>
              </button>

              <button 
                onClick={() => setShowWalkInModal(true)}
                className="btn-secondary" 
                style={{ fontSize: '0.9rem' }}
              >
                <Plus size={18} />
                <span>Issue Walk-in Token</span>
              </button>
            </div>

            {/* Active Counter Adjuster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.4rem 0.75rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Active Service Desks:</span>
              <button 
                onClick={() => handleAdjustCounters(-1)}
                className="btn-secondary"
                style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
                disabled={(currentVenue.activeCounters || 2) <= 1}
              >
                -
              </button>
              <span style={{ fontWeight: 800, fontSize: '1rem', minWidth: '18px', textAlign: 'center' }}>
                {currentVenue.activeCounters || 2}
              </span>
              <button 
                onClick={() => handleAdjustCounters(1)}
                className="btn-secondary"
                style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
                disabled={(currentVenue.activeCounters || 2) >= (currentVenue.totalCounters || 4)}
              >
                +
              </button>
            </div>
          </div>

          {/* Active Queue Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Active Desk Queue Line ({venueTokens.length} total)</h3>
              <span className="badge badge-indigo">{currentVenue.name}</span>
            </div>

            {venueTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)' }}>
                <Clock size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No tokens currently active for this venue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                        padding: '1rem',
                        borderRadius: '12px',
                        background: s === 'calling' ? 'rgba(239, 68, 68, 0.12)' : s === 'serving' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                        border: s === 'calling' ? '1px solid var(--rose)' : s === 'serving' ? '1px solid var(--emerald)' : '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: s === 'calling' ? 'var(--rose)' : s === 'serving' ? 'var(--emerald)' : 'var(--accent-primary)',
                          minWidth: '110px',
                        }}>
                          {tNum}
                        </div>

                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.customerName}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t.service?.name || t.departmentName} • {t.partySize || 1} Person(s)
                          </span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className={`badge ${
                          s === 'calling' ? 'badge-rose animate-pulse-glow' :
                          s === 'serving' ? 'badge-emerald' : 
                          s === 'completed' ? 'badge-indigo' : 
                          s === 'cancelled' ? 'badge-rose' : 'badge-amber'
                        }`} style={{ fontSize: '0.75rem' }}>
                          {s.toUpperCase()}
                        </span>

                        {s === 'waiting' && (
                          <button 
                            onClick={() => onUpdateTokenStatus(tId, 'calling')}
                            className="btn-primary" 
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Call
                          </button>
                        )}

                        {s === 'calling' && (
                          <button 
                            onClick={() => handleMarkServing(tId)}
                            className="btn-primary" 
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          >
                            Start Service
                          </button>
                        )}

                        {(s === 'serving' || s === 'calling') && (
                          <button 
                            onClick={() => handleMarkCompleted(tId)}
                            className="btn-secondary" 
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--emerald)', borderColor: 'var(--emerald)' }}
                          >
                            Mark Complete
                          </button>
                        )}

                        {s === 'waiting' && (
                          <button 
                            onClick={() => handleMarkNoShow(tId)}
                            className="btn-secondary" 
                            style={{ fontSize: '0.78rem', color: 'var(--rose)', padding: '0.35rem 0.65rem' }}
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
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '0.2rem' }}>
                  MongoDB Aggregation Pipeline
                </span>
                <h3 style={{ fontSize: '1.3rem' }}>Actual Historical Performance Analytics</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Aggregated from ServiceHistory collection records for {currentVenue.name}
                </p>
              </div>

              <button
                onClick={fetchAnalytics}
                className="btn-secondary"
                disabled={loadingAnalytics}
                style={{ fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={loadingAnalytics ? 'animate-spin' : ''} />
                Refresh Aggregations
              </button>
            </div>

            {/* Aggregated KPI Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Tokens Issued</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px' }}>
                  {dbAnalytics?.totalTokensIssued ?? fallbackMetrics.totalServed}
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Completed Services</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px' }}>
                  {dbAnalytics?.completedTokens ?? 0}
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Average Service Duration</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                  {dbAnalytics?.avgServiceDurationMins ?? 10} <span style={{ fontSize: '0.85rem' }}>mins</span>
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Average Actual Waiting Time</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
                  {dbAnalytics?.avgWaitMins ?? 8} <span style={{ fontSize: '0.85rem' }}>mins</span>
                </p>
              </div>
            </div>

            {/* Hourly Traffic Bar Chart */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Hourly Customer Traffic Distribution (From MongoDB Records)
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '0.4rem',
                alignItems: 'flex-end',
                height: '140px',
                background: 'var(--bg-tertiary)',
                padding: '1rem 0.5rem 0.5rem',
                borderRadius: '12px',
              }}>
                {(dbAnalytics?.hourlyTraffic || []).map((slot, idx) => {
                  const maxCount = Math.max(...(dbAnalytics?.hourlyTraffic || [{ count: 1 }]).map(s => s.count), 1);
                  const barHeight = Math.max(12, Math.round((slot.count / maxCount) * 90));

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: slot.isPeak ? 'var(--rose)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                        {slot.count}
                      </span>
                      <div style={{
                        width: '100%',
                        maxWidth: '28px',
                        height: `${barHeight}px`,
                        borderRadius: '4px',
                        background: slot.isPeak
                          ? 'linear-gradient(to top, var(--rose), #f43f5e)'
                          : 'linear-gradient(to top, var(--accent-primary), #818cf8)',
                        transition: 'height 0.4s ease',
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
        <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '0.2rem' }}>
              <ShieldCheck size={12} /> Staff Desk QR Verifier
            </span>
            <h3 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>Token Authenticity & Status Verification</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Scan or enter customer QR code payload or token number to verify against MongoDB.
            </p>
          </div>

          <form onSubmit={handleVerifyQR} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                QR Payload String or Token ID (e.g. QL-OPD-101 or JSON):
              </label>
              <textarea
                rows={3}
                placeholder='Paste scanned QR data payload or Token Number (e.g. QL-OPD-101)'
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !qrInput.trim()}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '0.75rem' }}
            >
              <Search size={16} />
              <span>{isVerifying ? 'Verifying with Database...' : 'Verify Token Authenticity'}</span>
            </button>
          </form>

          {verifyError && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid var(--rose)',
              color: 'var(--rose)',
              padding: '0.85rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <AlertCircle size={18} />
              <span>{verifyError}</span>
            </div>
          )}

          {verificationResult && (
            <div className="animate-slide-down" style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              borderRadius: '12px',
              background: verificationResult.isEligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: verificationResult.isEligible ? '2px solid var(--emerald)' : '2px solid var(--amber)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={20} style={{ color: verificationResult.isEligible ? 'var(--emerald)' : 'var(--amber)' }} />
                <h4 style={{ fontSize: '1.05rem', color: verificationResult.isEligible ? 'var(--emerald)' : 'var(--amber)' }}>
                  {verificationResult.message}
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Token Number:</span>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{verificationResult.data.tokenNumber}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                  <p style={{ fontWeight: 600 }}>{verificationResult.data.customerName}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                  <p>{verificationResult.data.departmentName}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className="badge badge-indigo">{verificationResult.data.status?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Walk-in Modal */}
      {showWalkInModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowWalkInModal(false)}>
          <div 
            className="glass-modal animate-slide-down" 
            style={{ width: '100%', maxWidth: '420px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>Generate Desk Walk-in Token</h3>
            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Walk-in Visitor"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Counter/Department</label>
                <select
                  value={walkInDept}
                  onChange={(e) => setWalkInDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                  }}
                >
                  {(currentVenue.departments || []).map(d => (
                    <option key={d.id || d._id} value={d.id || d._id}>{d.name} ({d.prefix})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowWalkInModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Issue Token in DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
