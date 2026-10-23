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

export function BookingModal({ venue, department, onClose, onConfirmBooking, isSubmitting = false }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Senior Citizen');
  const [errors, setErrors] = useState({});

  if (!venue || !department) return null;

  // AI live estimation preview
  const currentAhead = department.queueLength ?? venue.currentQueueLength ?? 0;
  const aiPrediction = predictWaitTime({
    peopleAhead: currentAhead,
    activeCounters: department.activeCounters || venue.activeCounters || 1,
    avgServiceTimeMins: department.avgTime || venue.avgServiceTimeMins || 10,
    peakMultiplier: venue.peakMultiplier || 1.1,
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
    if (!validateForm() || isSubmitting) return;

    const bookingPayload = {
      queueId: department.queueId,
      venueId: venue.id || venue._id,
      departmentId: department.id || department._id,
      venueName: venue.name,
      departmentName: department.name,
      customerName: customerName.trim(),
      phone: phone.trim(),
      partySize,
      isPriority,
      priorityReason: isPriority ? priorityReason : '',
      venue,
      department,
      aiEstimatedMins: aiPrediction.estimatedMins,
    };

    onConfirmBooking(bookingPayload);
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
            <span className="badge badge-emerald" style={{ marginBottom: '0.2rem' }}>
              Remote Virtual Token Booking
            </span>
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
              Confidence Score: {aiPrediction.confidenceScore}% • {currentAhead} ahead in MongoDB queue
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              Velocity: {aiPrediction.queueVelocity}
            </span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Avg Service: {department.avgTime || 10}m
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer Full Name */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Your Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                  borderColor: errors.customerName ? 'var(--rose)' : undefined,
                }}
              />
            </div>
            {errors.customerName && <p style={{ color: 'var(--rose)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.customerName}</p>}
          </div>

          {/* Contact Phone */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Mobile Phone Number (For Turn SMS / WhatsApp) *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                  borderColor: errors.phone ? 'var(--rose)' : undefined,
                }}
              />
            </div>
            {errors.phone && <p style={{ color: 'var(--rose)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.phone}</p>}
          </div>

          {/* Party Size & Priority Toggle Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Party Size */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Party Size
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem' }}
                >
                  <option value={1}>1 Person (Standard)</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4+ People (Group)</option>
                </select>
              </div>
            </div>

            {/* Special Priority Checkbox */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Special Priority
              </label>
              <div 
                onClick={() => setIsPriority(!isPriority)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isPriority ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                  border: isPriority ? '1px solid var(--rose)' : '1px solid var(--border-color)',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isPriority} 
                  onChange={() => {}} 
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Priority Line</span>
              </div>
            </div>
          </div>

          {/* Priority Reason Dropdown (if enabled) */}
          {isPriority && (
            <div className="animate-fade-in">
              <label style={{ fontSize: '0.82rem', color: 'var(--rose)', display: 'block', marginBottom: '0.3rem' }}>
                Priority Verification Reason:
              </label>
              <select
                value={priorityReason}
                onChange={(e) => setPriorityReason(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderColor: 'var(--rose)' }}
              >
                <option value="Senior Citizen">Senior Citizen (60+ years)</option>
                <option value="Medical Emergency / Physical Disability">Medical Need / Differently Abled</option>
                <option value="Expectant Mother / Infant Care">Expectant Mother / Infant</option>
                <option value="Government Official / VIP">Government Official</option>
              </select>
            </div>
          )}

          {/* Action Submit Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ flex: 2, padding: '0.75rem', justifyContent: 'center' }}
            >
              <Ticket size={18} />
              <span>{isSubmitting ? 'Generating in MongoDB...' : 'Confirm Remote Token'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
