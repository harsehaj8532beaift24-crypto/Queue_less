import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { calculateBusinessMetrics } from '../utils/aiPredictor';

export function AdminDashboard({ venues, tokens, onUpdateVenue, onUpdateTokenStatus, onAddWalkInToken }) {
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || 'v1');
  const [walkInName, setWalkInName] = useState('');
  const [walkInDept, setWalkInDept] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  const currentVenue = venues.find(v => v.id === selectedVenueId) || venues[0];
  const venueTokens = tokens.filter(t => t.venueId === currentVenue.id);
  const metrics = calculateBusinessMetrics(currentVenue, tokens);

  const waitingTokens = venueTokens.filter(t => t.status === 'WAITING' || t.status === 'CALLING');
  const servingTokens = venueTokens.filter(t => t.status === 'SERVING');
  const completedTokens = venueTokens.filter(t => t.status === 'COMPLETED');

  // Handle Counter Allocation toggle (+ / - counters)
  const handleAdjustCounters = (delta) => {
    const newActive = Math.min(currentVenue.totalCounters, Math.max(1, currentVenue.activeCounters + delta));
    onUpdateVenue(currentVenue.id, { activeCounters: newActive });
  };

  // Call Next Token in Queue
  const handleCallNext = () => {
    const nextToken = waitingTokens.find(t => t.status === 'WAITING');
    if (nextToken) {
      onUpdateTokenStatus(nextToken.tokenId, 'CALLING');
    }
  };

  const handleMarkServing = (tokenId) => {
    onUpdateTokenStatus(tokenId, 'SERVING');
  };

  const handleMarkCompleted = (tokenId) => {
    onUpdateTokenStatus(tokenId, 'COMPLETED');
  };

  const handleMarkNoShow = (tokenId) => {
    onUpdateTokenStatus(tokenId, 'CANCELLED');
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    const dept = currentVenue.departments.find(d => d.id === walkInDept) || currentVenue.departments[0];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const tokenId = `QL-${dept.prefix || 'WALK'}-${randomNum}`;

    const newWalkIn = {
      tokenId,
      venueId: currentVenue.id,
      venueName: currentVenue.name,
      departmentName: dept.name,
      customerName: `${walkInName.trim()} (Walk-in)`,
      phone: 'Desk Booking',
      partySize: 1,
      isPriority: false,
      priorityReason: '',
      position: waitingTokens.length + 1,
      peopleAhead: waitingTokens.length,
      estimatedWaitMins: Math.round((waitingTokens.length * dept.avgTime) / currentVenue.activeCounters),
      status: 'WAITING',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: `${tokenId}-WALKIN-${currentVenue.name}`,
    };

    onAddWalkInToken(newWalkIn);
    setWalkInName('');
    setShowWalkInModal(false);
  };

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
          {venues.map((venue) => (
            <button
              key={venue.id}
              onClick={() => setSelectedVenueId(venue.id)}
              className={selectedVenueId === venue.id ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
            >
              {venue.name.split(' ')[0]} {venue.categoryName}
            </button>
          ))}
        </div>
      </div>

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
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.totalServed}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>+14% vs yesterday</span>
        </div>

        {/* Waiting Customers */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Currently Waiting</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', padding: '0.4rem', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber)' }}>{metrics.currentWaiting}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{waitingTokens.length} active in digital queue</span>
        </div>

        {/* Avg Wait Time */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Avg Wait Time</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{metrics.avgWaitMins} <span style={{ fontSize: '1rem' }}>mins</span></h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Optimal SLA range</span>
        </div>

        {/* Counter Efficiency Score */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Efficiency Score</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan)' }}>{metrics.efficiencyScore}%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentVenue.activeCounters} of {currentVenue.totalCounters} counters active</span>
        </div>
      </div>

      {/* Counter Control & AI Optimizer Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
              Active Service Counter Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Adjust active counters to observe real-time AI wait time calculation changes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.4rem 0.8rem', borderRadius: '12px' }}>
              <button 
                onClick={() => handleAdjustCounters(-1)} 
                className="btn-secondary" 
                style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
                disabled={currentVenue.activeCounters <= 1}
              >
                -
              </button>
              <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '80px', textAlign: 'center' }}>
                {currentVenue.activeCounters} Active
              </span>
              <button 
                onClick={() => handleAdjustCounters(1)} 
                className="btn-secondary" 
                style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
                disabled={currentVenue.activeCounters >= currentVenue.totalCounters}
              >
                +
              </button>
            </div>

            <button 
              onClick={() => setShowWalkInModal(true)}
              className="btn-emerald" 
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              Add Walk-in Token
            </button>
          </div>
        </div>
      </div>

      {/* Main Queue Management Table / List */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Live Queue Monitor</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {waitingTokens.length} Tokens in queue for {currentVenue.name}
            </p>
          </div>

          <button 
            onClick={handleCallNext}
            className="btn-primary" 
            style={{ fontSize: '0.85rem' }}
            disabled={waitingTokens.filter(t => t.status === 'WAITING').length === 0}
          >
            <PhoneCall size={16} />
            Call Next Token in Line
          </button>
        </div>

        {/* Tokens List */}
        {venueTokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            No active tokens in queue for this venue.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {venueTokens.map((t) => (
              <div 
                key={t.tokenId}
                style={{
                  background: t.status === 'CALLING' || t.status === 'SERVING' 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : 'var(--bg-tertiary)',
                  border: t.status === 'CALLING' 
                    ? '2px solid var(--emerald)' 
                    : '1px solid var(--border-color)',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                      {t.tokenId}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      {t.departmentName}
                    </span>
                    {t.isPriority && (
                      <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>
                        Priority: {t.priorityReason}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {t.customerName} • {t.phone} • Booked: {t.issuedAt}
                  </p>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${
                    t.status === 'CALLING' ? 'badge-emerald animate-pulse-glow' :
                    t.status === 'SERVING' ? 'badge-indigo' :
                    t.status === 'COMPLETED' ? 'badge-emerald' :
                    t.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'
                  }`}>
                    {t.status}
                  </span>

                  {t.status === 'CALLING' && (
                    <button 
                      onClick={() => handleMarkServing(t.tokenId)}
                      className="btn-primary" 
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    >
                      Start Service
                    </button>
                  )}

                  {(t.status === 'SERVING' || t.status === 'CALLING') && (
                    <button 
                      onClick={() => handleMarkCompleted(t.tokenId)}
                      className="btn-emerald" 
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    >
                      Mark Complete
                    </button>
                  )}

                  {t.status === 'WAITING' && (
                    <button 
                      onClick={() => handleMarkNoShow(t.tokenId)}
                      className="btn-secondary" 
                      style={{ fontSize: '0.78rem', color: 'var(--rose)', padding: '0.35rem 0.65rem' }}
                    >
                      No-Show
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  {currentVenue.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.prefix})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowWalkInModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
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
