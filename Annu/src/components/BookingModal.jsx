import React, { useState, useEffect } from 'react';
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
  Ticket,
  RefreshCw
} from 'lucide-react';
import { predictWaitTime } from '../utils/aiPredictor';

export function BookingModal({ venue, department, onClose, onConfirmBooking, isSubmitting = false, currentUser = null }) {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [partySize, setPartySize] = useState(1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Senior Citizen');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) setCustomerName(currentUser.name);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

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
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '1.6rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.25rem' }}>
              Remote Virtual Token Booking
            </span>
            <h2 id="booking-modal-title" style={{ fontSize: '1.3rem', lineHeight: 1.25 }}>{venue.name}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Counter: {department.name}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="btn-secondary"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              borderRadius: '50%',
              padding: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live AI Waiting Time Preview Box */}
        <div style={{
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          marginBottom: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600 }}>
              <Sparkles size={14} />
              AI Predicted Wait Time
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '1px' }}>
              ~{aiPrediction.estimatedMins} Mins
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Confidence Score: {aiPrediction.confidenceScore}% • {currentAhead} ahead in queue
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Customer Full Name */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Your Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  paddingLeft: '2.4rem',
                  borderColor: errors.customerName ? 'var(--rose)' : undefined,
                }}
              />
            </div>
            {errors.customerName && <p style={{ color: 'var(--rose-text)', fontSize: '0.75rem', marginTop: '3px' }}>{errors.customerName}</p>}
          </div>

          {/* Contact Phone */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mobile Phone Number (For Turn Alerts) *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  paddingLeft: '2.4rem',
                  borderColor: errors.phone ? 'var(--rose)' : undefined,
                }}
              />
            </div>
            {errors.phone && <p style={{ color: 'var(--rose-text)', fontSize: '0.75rem', marginTop: '3px' }}>{errors.phone}</p>}
          </div>

          {/* Party Size & Priority Toggle Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Party Size */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Party Size
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', zIndex: 1 }} />
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  style={{ paddingLeft: '2.4rem' }}
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4+ People</option>
                </select>
              </div>
            </div>

            {/* Special Priority Checkbox */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Special Priority
              </label>
              <div 
                onClick={() => setIsPriority(!isPriority)}
                role="checkbox"
                aria-checked={isPriority}
                tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && setIsPriority(!isPriority)}
                style={{
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isPriority ? 'var(--rose-subtle)' : 'var(--input-bg)',
                  border: isPriority ? '1px solid var(--rose)' : '1px solid var(--input-border)',
                  padding: '0 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isPriority} 
                  onChange={() => {}} 
                  tabIndex={-1}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isPriority ? 'var(--rose-text)' : 'var(--text-primary)' }}>
                  Priority Line
                </span>
              </div>
            </div>
          </div>

          {/* Priority Reason Dropdown (if enabled) */}
          {isPriority && (
            <div className="animate-fade-in">
              <label style={{ fontSize: '0.8rem', color: 'var(--rose-text)', marginBottom: '0.25rem' }}>
                Priority Verification Reason:
              </label>
              <select
                value={priorityReason}
                onChange={(e) => setPriorityReason(e.target.value)}
                style={{ borderColor: 'var(--rose-border)' }}
              >
                <option value="Senior Citizen">Senior Citizen (60+ years)</option>
                <option value="Medical Emergency / Physical Disability">Medical Need / Differently Abled</option>
                <option value="Expectant Mother / Infant Care">Expectant Mother / Infant Care</option>
                <option value="Government Official / VIP">Government Official</option>
              </select>
            </div>
          )}

          {/* Action Submit Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ flex: 2 }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Booking in MongoDB...</span>
                </>
              ) : (
                <>
                  <Ticket size={16} />
                  <span>Confirm Remote Token</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
