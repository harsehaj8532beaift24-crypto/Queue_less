import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Ticket,
  Building2,
  Activity,
  Scissors,
  Landmark,
  Utensils,
  Layers
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
  const safeCounters = Math.max(1, venue.activeCounters || 1);
  const queueLen = venue.currentQueueLength ?? 0;
  const avgTime = venue.avgServiceTimeMins || 10;
  const totalWaitEstimate = Math.max(2, Math.round((queueLen * avgTime) / safeCounters));
  const categoryLabel = venue.categoryName || (venue.category ? venue.category.toUpperCase() : 'SERVICE');

  return (
    <article 
      className="glass-panel" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        borderRadius: '12px',
      }}
    >
      {/* Venue Thumbnail Header */}
      <div style={{
        position: 'relative',
        height: '150px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-tertiary)',
      }}>
        <img 
          src={venue.image} 
          alt={venue.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
        
        {/* Subtle top gradient for chip readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
        }}>
          <span 
            className="badge" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.92)', 
              color: '#0F172A',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <IconComponent size={12} style={{ color: 'var(--cyan)' }} />
            {categoryLabel}
          </span>
        </div>

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(6px)',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#92400E',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}>
          <Star size={12} fill="#F59E0B" color="#F59E0B" />
          {venue.rating || 4.5}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ 
        padding: '1.15rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1, 
        justifyContent: 'space-between',
        gap: '0.9rem',
      }}>
        
        {/* Title & Location Header */}
        <div>
          <h3 style={{ 
            fontSize: '1.05rem', 
            color: 'var(--text-primary)', 
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: '0.3rem',
          }}>
            {venue.name}
          </h3>
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <MapPin size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            <span>{venue.address || venue.city}</span>
          </p>
        </div>

        {/* Live Queue Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.55rem 0.6rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              <Users size={12} style={{ color: 'var(--text-secondary)' }} />
              <span>Queue</span>
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {queueLen}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.55rem 0.6rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              <Clock size={12} style={{ color: 'var(--emerald)' }} />
              <span>Est. Wait</span>
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '2px' }}>
              ~{totalWaitEstimate}m
            </p>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.55rem 0.6rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              <Layers size={12} style={{ color: 'var(--cyan)' }} />
              <span>Counters</span>
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {safeCounters}
            </p>
          </div>
        </div>

        {/* Velocity / Notice Tip */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          padding: '0.45rem 0.65rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.35,
        }}>
          <Clock size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {venue.aiTip || `Open: ${venue.openHours || '09:00 AM - 06:00 PM'}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
          <button 
            type="button"
            onClick={() => onSelectVenue(venue)}
            className="btn-secondary" 
            style={{ flex: 1, fontSize: '0.82rem', height: '36px', minHeight: '36px', padding: '0 0.5rem' }}
          >
            Details
          </button>
          
          <button 
            type="button"
            onClick={() => onQuickBook(venue)}
            className="btn-primary" 
            style={{ flex: 1.2, fontSize: '0.82rem', height: '36px', minHeight: '36px', padding: '0 0.5rem' }}
          >
            <Ticket size={14} />
            <span>Join Queue</span>
          </button>
        </div>

      </div>
    </article>
  );
}
