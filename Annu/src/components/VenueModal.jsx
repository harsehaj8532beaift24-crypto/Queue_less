import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  BarChart2, 
  Sparkles, 
  CheckCircle,
  Zap,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { generateHourlyTraffic } from '../utils/aiPredictor';

export function VenueModal({ venue, onClose, onBookDepartment }) {
  if (!venue) return null;

  const trafficData = generateHourlyTraffic(venue.id);

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header Banner */}
        <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.5rem' }}>
          <img 
            src={venue.image} 
            alt={venue.name}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
              {venue.categoryName}
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>{venue.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '4px' }}>
              <MapPin size={14} />
              {venue.address}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
              <Clock size={14} />
              Open Hours: {venue.openHours}
            </p>
          </div>
        </div>

        {/* Live Counters & Queue Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Counters</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {venue.activeCounters} / {venue.totalCounters}
            </p>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Waiting Tokens</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
              {venue.currentQueueLength} People
            </p>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Service Time</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '2px' }}>
              {venue.avgServiceTimeMins} Mins
            </p>
          </div>
        </div>

        {/* Departments / Service Counters List */}
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
          Select Service Counter to Join Queue
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {venue.departments.map((dept) => (
            <div 
              key={dept.id}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dept.name}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Prefix: {dept.prefix}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Average service duration ~{dept.avgTime} mins per customer
                </p>
              </div>

              <button
                onClick={() => onBookDepartment(venue, dept)}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                <Zap size={14} />
                Book Token
              </button>
            </div>
          ))}
        </div>

        {/* AI Traffic Load Breakdown */}
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BarChart2 size={18} style={{ color: 'var(--emerald)' }} />
          AI Traffic Forecast (Today)
        </h3>

        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.4rem',
            height: '100px',
            paddingTop: '1rem',
          }}>
            {trafficData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div 
                  style={{
                    width: '100%',
                    height: `${(item.count / 80) * 100}%`,
                    background: item.isPeak ? 'var(--rose)' : 'var(--accent-primary)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${item.hour}: ${item.count} estimated visitors`}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.hour.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)' }} /> Peak Hours
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} /> Normal Traffic
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
