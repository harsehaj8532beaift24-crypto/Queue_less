import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  ChevronRight,
  Zap,
  Building2,
  Activity,
  Scissors,
  Landmark,
  Utensils
} from 'lucide-react';

const CATEGORY_ICONS = {
  hospital: Activity,
  bank: Building2,
  salon: Scissors,
  govt: Landmark,
  cafeteria: Utensils,
};

export function VenueCard({ venue, onSelectVenue, onQuickBook }) {
  const IconComponent = CATEGORY_ICONS[venue.category] || Building2;
  const totalWaitEstimate = Math.max(2, Math.round((venue.currentQueueLength * venue.avgServiceTimeMins) / venue.activeCounters));

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Venue Thumbnail Header */}
      <div style={{
        position: 'relative',
        height: '160px',
        overflow: 'hidden',
      }}>
        <img 
          src={venue.image} 
          alt={venue.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 60%)',
        }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          gap: '0.4rem',
        }}>
          <span className="badge badge-indigo" style={{ backdropFilter: 'blur(8px)', background: 'rgba(11, 15, 25, 0.7)' }}>
            <IconComponent size={14} />
            {venue.categoryName}
          </span>
        </div>

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--amber)',
        }}>
          <Star size={14} fill="var(--amber)" />
          {venue.rating}
        </div>

        {/* Bottom Title on Image */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
        }}>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
            {venue.name}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
            <MapPin size={12} />
            {venue.address}
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        
        {/* Live Queue Status Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.65rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              <Users size={14} style={{ color: 'var(--accent-primary)' }} />
              Queue Length
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>
              {venue.currentQueueLength} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>waiting</span>
            </p>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.65rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              <Clock size={14} style={{ color: 'var(--emerald)' }} />
              Est. Wait Time
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', color: 'var(--emerald)' }}>
              ~{totalWaitEstimate} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>mins</span>
            </p>
          </div>
        </div>

        {/* AI Insight Pill */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          marginBottom: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--accent-primary)',
        }}>
          <Sparkles size={16} style={{ flexShrink: 0 }} />
          <span>{venue.aiTip}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            onClick={() => onSelectVenue(venue)}
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
          >
            View Details
          </button>
          
          <button 
            onClick={() => onQuickBook(venue)}
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <Zap size={15} />
            Join Queue
          </button>
        </div>

      </div>
    </div>
  );
}
