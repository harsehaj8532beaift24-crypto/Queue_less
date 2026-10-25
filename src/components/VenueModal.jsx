import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  BarChart2, 
  CheckCircle,
  Ticket,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { generateHourlyTraffic } from '../utils/aiPredictor';

export function VenueModal({ venue, onClose, onBookDepartment }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!venue) return null;

  const trafficData = generateHourlyTraffic(venue.id || venue._id);
  const departments = venue.departments || [];

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="venue-modal-title">
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
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

        {/* Modal Header Banner */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', paddingRight: '2rem' }}>
          <img 
            src={venue.image} 
            alt={venue.name}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '12px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.35rem' }}>
              {venue.categoryName || venue.category}
            </span>
            <h2 id="venue-modal-title" style={{ fontSize: '1.3rem', lineHeight: 1.25 }}>{venue.name}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '4px' }}>
              <MapPin size={13} style={{ flexShrink: 0 }} />
              {venue.address}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
              <Clock size={13} style={{ flexShrink: 0 }} />
              Open Hours: {venue.openHours}
            </p>
          </div>
        </div>

        {/* Live Counters & Queue Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Active Counters</span>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {venue.activeCounters} / {venue.totalCounters}
            </p>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Waiting Tokens</span>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
              {venue.currentQueueLength} People
            </p>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Avg Service Time</span>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px' }}>
              {venue.avgServiceTimeMins} Mins
            </p>
          </div>
        </div>

        {/* Departments / Service Counters List */}
        <h3 style={{ fontSize: '0.98rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          Select Service Counter to Join Queue
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.25rem' }}>
          {departments.map((dept) => (
            <div 
              key={dept.id || dept._id}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 0.95rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dept.name}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                    Prefix: {dept.prefix}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Average service duration ~{dept.avgTime} mins per customer
                </p>
              </div>

              <button
                type="button"
                onClick={() => onBookDepartment(venue, dept)}
                className="btn-primary"
                style={{ fontSize: '0.8rem', height: '34px', minHeight: '34px', padding: '0 0.85rem' }}
              >
                <Ticket size={13} />
                <span>Book Token</span>
              </button>
            </div>
          ))}
        </div>

        {/* Hourly Traffic Breakdown */}
        <h3 style={{ fontSize: '0.98rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BarChart2 size={16} style={{ color: 'var(--emerald)' }} />
          Hourly Customer Traffic (Today)
        </h3>

        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '0.85rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.35rem',
            height: '90px',
            paddingTop: '0.5rem',
          }}>
            {trafficData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                <div 
                  style={{
                    width: '100%',
                    height: `${Math.max(8, Math.round((item.count / 80) * 100))}%`,
                    background: item.isPeak ? 'var(--rose)' : 'var(--text-primary)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                  title={`${item.hour}: ${item.count} estimated visitors`}
                />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.hour.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--rose)' }} /> Peak Hours
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-primary)' }} /> Normal Traffic
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
