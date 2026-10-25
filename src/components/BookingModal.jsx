import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  User, 
  Phone, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Ticket,
  Download,
  Printer,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { predictWaitTime } from '../utils/aiPredictor';

export function BookingModal({ 
  venue, 
  department, 
  onClose, 
  onConfirmBooking, 
  isSubmitting = false, 
  currentUser = null,
  onViewTokens = null
}) {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [partySize, setPartySize] = useState(1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Senior Citizen');
  const [errors, setErrors] = useState({});
  const [confirmedToken, setConfirmedToken] = useState(null);

  const canvasRef = useRef(null);

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

  // Render QR Code canvas when token is confirmed
  useEffect(() => {
    if (confirmedToken && canvasRef.current) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const tokenNum = confirmedToken.tokenNumber || confirmedToken.tokenId;
      const hash = confirmedToken.qrTokenHash || 'dev_hash';
      const payload = (confirmedToken.qrCodeData && confirmedToken.qrCodeData.startsWith('http'))
        ? confirmedToken.qrCodeData
        : `${origin}/verify-token?token=${encodeURIComponent(tokenNum)}&hash=${encodeURIComponent(hash)}`;

      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 150,
          margin: 1,
          color: {
            dark: '#262626',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR render error:', error);
        }
      );
    }
  }, [confirmedToken]);

  if (!venue || !department) return null;

  // Queue wait time calculation
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

  const handleSubmit = async (e) => {
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

    try {
      const result = await onConfirmBooking(bookingPayload);
      if (result) {
        setConfirmedToken(result);
      }
    } catch {
      // Errors handled via global notification
    }
  };

  const handleDownloadQR = () => {
    if (canvasRef.current && confirmedToken) {
      const tokenNum = confirmedToken.tokenNumber || confirmedToken.tokenId;
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QueueLess-Pass-${tokenNum}.png`;
      a.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCompleteAndNavigate = () => {
    onClose();
    if (onViewTokens) onViewTokens();
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
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close booking modal"
          className="btn-secondary"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            minHeight: '32px',
            borderRadius: '50%',
            padding: 0,
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>

        {/* STEP 2: BOOKING CONFIRMATION & QR PASS */}
        {confirmedToken ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--emerald)',
            }}>
              <CheckCircle2 size={26} />
            </div>

            <div>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                CONFIRMED & SAVED IN DATABASE
              </span>
              <h2 id="booking-modal-title" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                Virtual Token Issued
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {venue.name} — {department.name}
              </p>
            </div>

            {/* Generated QR Pass Preview */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
            }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '0.05em', margin: 0 }}>
                {confirmedToken.tokenNumber || confirmedToken.tokenId}
              </p>

              <div style={{
                background: '#ffffff',
                padding: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                display: 'inline-flex',
              }}>
                <canvas ref={canvasRef} aria-label={`QR code for token ${confirmedToken.tokenNumber}`} />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: '320px' }}>
                Scan this QR code with any smartphone camera or at the venue service counter to open the live verification pass.
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                width: '100%',
                fontSize: '0.8rem',
                background: 'var(--bg-primary)',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Queue Position:</span>
                  <p style={{ fontWeight: 700 }}>#{confirmedToken.position || 1}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Est. Wait Duration:</span>
                  <p style={{ fontWeight: 700, color: 'var(--emerald)' }}>~{confirmedToken.estimatedWaitMinutes || 10} mins</p>
                </div>
              </div>
            </div>

            {/* Confirmation Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
                >
                  <Download size={14} />
                  <span>Download QR Pass</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
                >
                  <Printer size={14} />
                  <span>Print Ticket</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCompleteAndNavigate}
                className="btn-primary"
                style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '0.75rem' }}
              >
                <Ticket size={16} />
                <span>View My Tokens Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: INITIAL BOOKING FORM */
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem', paddingRight: '2rem' }}>
              <div>
                <span className="badge badge-charcoal" style={{ marginBottom: '0.25rem' }}>
                  Remote Token Booking
                </span>
                <h2 id="booking-modal-title" style={{ fontSize: '1.25rem', lineHeight: 1.25 }}>{venue.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department: {department.name}</p>
              </div>
            </div>

            {/* Wait Time Indicator */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Clock size={14} />
                  Estimated Wait Time
                </div>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '1px' }}>
                  ~{aiPrediction.estimatedMins} Mins
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {currentAhead} waiting ahead in queue
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  Active Counters: {department.activeCounters || venue.activeCounters || 1}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Avg Service: ~{department.avgTime || 10}m
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Customer Full Name */}
              <div>
                <label htmlFor="customerFullName" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Your Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="customerFullName"
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
                <label htmlFor="customerPhone" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number (For Arrival Alerts) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="customerPhone"
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
                <div>
                  <label htmlFor="partySizeSelect" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Party Size
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Users size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', zIndex: 1 }} />
                    <select
                      id="partySizeSelect"
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

                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                      background: isPriority ? '#fef2f2' : 'var(--input-bg)',
                      border: isPriority ? '1px solid var(--rose)' : '1px solid var(--input-border)',
                      padding: '0 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isPriority} 
                      onChange={() => {}} 
                      tabIndex={-1}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--rose)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isPriority ? 'var(--rose)' : 'var(--text-primary)' }}>
                      {isPriority ? 'Priority Applied' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Category Selector */}
              {isPriority && (
                <div className="animate-fade-in">
                  <label htmlFor="priorityReasonSelect" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority Verification Category
                  </label>
                  <select 
                    id="priorityReasonSelect"
                    value={priorityReason} 
                    onChange={(e) => setPriorityReason(e.target.value)}
                  >
                    <option value="Senior Citizen">Senior Citizen (60+)</option>
                    <option value="Differently Abled">Differently Abled / Mobility Assistance</option>
                    <option value="Medical Emergency">Medical Triage / Urgent Case</option>
                    <option value="Infant / Pregnant">Mother with Infant / Pregnant</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  padding: '0.75rem',
                  justifyContent: 'center',
                }}
              >
                <Ticket size={16} />
                <span>{isSubmitting ? 'Generating Booking...' : 'Confirm & Join Queue'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <ShieldCheck size={13} />
                <span>Instant encrypted QR check-in pass generated upon booking</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
