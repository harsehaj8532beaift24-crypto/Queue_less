import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
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
      }}
    >
      {/* Venue Thumbnail Header */}
      <div style={{
        position: 'relative',
        height: '160px',
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
            transition: 'transform 0.4s ease',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(9, 13, 22, 0.92) 0%, rgba(9, 13, 22, 0.2) 60%, transparent 100%)',
        }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
        }}>
          <span className="badge badge-indigo" style={{ background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(8px)' }}>
            <IconComponent size={13} />
            {categoryLabel}
          </span>
        </div>

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.2rem 0.55rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--amber)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}>
          <Star size={13} fill="var(--amber)" />
          {venue.rating || 4.5}
        </div>

        {/* Venue Title Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '12px',
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            color: '#ffffff', 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {venue.name}
          </h3>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#cbd5e1', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            marginTop: '1px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <MapPin size={12} style={{ flexShrink: 0 }} />
            {venue.address || venue.city}
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ 
        padding: '1.1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1, 
        justifyContent: 'space-between',
        gap: '0.85rem',
      }}>
        
        {/* Live Queue Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.6rem 0.75rem',
            borderRadius: '9px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              <Users size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Queue Length</span>
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {queueLen} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>waiting</span>
            </p>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.6rem 0.75rem',
            borderRadius: '9px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              <Clock size={13} style={{ color: 'var(--emerald)' }} />
              <span>Est. Wait</span>
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '2px' }}>
              ~{totalWaitEstimate} <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>mins</span>
            </p>
          </div>
        </div>

        {/* AI Insight Pill */}
        <div style={{
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '0.45rem 0.7rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--accent-primary)',
          lineHeight: 1.35,
        }}>
          <Sparkles size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {venue.aiTip || 'Optimal queue conditions active today.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button 
            type="button"
            onClick={() => onSelectVenue(venue)}
            className="btn-secondary" 
            style={{ flex: 1, fontSize: '0.825rem', height: '36px', minHeight: '36px', padding: '0 0.5rem' }}
          >
            View Details
          </button>
          
          <button 
            type="button"
            onClick={() => onQuickBook(venue)}
            className="btn-primary" 
            style={{ flex: 1, fontSize: '0.825rem', height: '36px', minHeight: '36px', padding: '0 0.5rem' }}
          >
            <Zap size={14} />
            Join Queue
          </button>
        </div>

      </div>
    </article>
  );
}
