import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Users, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { predictWaitTime } from '../utils/aiPredictor';

export function BookingModal({ venue, department, onClose, onConfirmBooking }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Senior Citizen');
  const [errors, setErrors] = useState({});

  if (!venue || !department) return null;

  // AI live estimation preview
  const currentAhead = venue.currentQueueLength;
  const aiPrediction = predictWaitTime({
    peopleAhead: currentAhead,
    activeCounters: venue.activeCounters,
    avgServiceTimeMins: department.avgTime || venue.avgServiceTimeMins,
    peakMultiplier: venue.peakMultiplier,
    isPriority,
    partySize,
  });

  const validateForm = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Full Name is required';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Valid phone number required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Generate unique Token ID format: QL-[PREFIX]-[RANDOM_NUM]
    const randomNum = Math.floor(100 + Math.random() * 900);
    const tokenId = `QL-${department.prefix || 'TOK'}-${randomNum}`;

    const newBooking = {
      tokenId,
      venueId: venue.id,
      venueName: venue.name,
      departmentName: department.name,
      customerName: customerName.trim(),
      phone: phone.trim(),
      partySize,
      isPriority,
      priorityReason: isPriority ? priorityReason : '',
      position: currentAhead + 1,
      peopleAhead: currentAhead,
      estimatedWaitMins: aiPrediction.estimatedMins,
      status: 'WAITING',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: `${tokenId}-${customerName.toUpperCase().replace(/\s+/g, '_')}-${venue.name.toUpperCase().replace(/\s+/g, '_')}`,
    };

    onConfirmBooking(newBooking);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '1.75rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.2rem' }}>Remote Token Booking</span>
            <h2 style={{ fontSize: '1.35rem' }}>{venue.name}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Counter: {department.name}</p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live AI Waiting Time Preview Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={16} />
              AI Predicted Wait Time
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px' }}>
              ~{aiPrediction.estimatedMins} Mins
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Confidence Score: {aiPrediction.confidenceScore}% • {currentAhead} people ahead
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              Velocity: {aiPrediction.queueVelocity}
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="e.g. Aditi Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '10px',
                  border: errors.customerName ? '1px solid var(--rose)' : '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            {errors.customerName && <span style={{ color: 'var(--rose)', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{errors.customerName}</span>}
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Mobile Phone (for SMS Token updates) *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '10px',
                  border: errors.phone ? '1px solid var(--rose)' : '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            {errors.phone && <span style={{ color: 'var(--rose)', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{errors.phone}</span>}
          </div>

          {/* Party Size */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Party Size (Number of people)
            </label>
            <select
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            >
              <option value={1}>1 Person (Individual)</option>
              <option value={2}>2 People (Couple / Family)</option>
              <option value={3}>3 People (Small Group)</option>
              <option value={4}>4+ People (Group Desk)</option>
            </select>
          </div>

          {/* Special Priority Checkbox */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.85rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Priority Access (Senior Citizen / Medical)</span>
            </label>

            {isPriority && (
              <div style={{ marginTop: '0.6rem' }}>
                <select
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="Senior Citizen">Senior Citizen (60+ years)</option>
                  <option value="Pregnant / Infant Care">Pregnant / Infant Care</option>
                  <option value="Differently Abled">Differently Abled Access</option>
                  <option value="Medical Emergency">Urgent Assistance</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            <Ticket size={20} />
            Generate Virtual Token
          </button>
        </form>
      </div>
    </div>
  );
}
