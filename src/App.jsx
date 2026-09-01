import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { VenueCard } from './components/VenueCard';
import { VenueModal } from './components/VenueModal';
import { BookingModal } from './components/BookingModal';
import { TokenCard } from './components/TokenCard';
import { AdminDashboard } from './components/AdminDashboard';
import { JSShowcaseModal } from './components/JSShowcaseModal';
import { Footer } from './components/Footer';

import { CATEGORIES } from './data/initialData';
import { getStoredVenues, saveStoredVenues, getStoredUserTokens, saveStoredUserTokens, getStoredTheme, saveStoredTheme } from './utils/storage';
import { predictWaitTime } from './utils/aiPredictor';

import { 
  Search, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap,
  Building2,
  Ticket,
  Filter,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [venues, setVenues] = useState(() => getStoredVenues());
  const [tokens, setTokens] = useState(() => getStoredUserTokens());
  const [theme, setTheme] = useState(() => getStoredTheme());
  
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'tokens', 'admin'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [venueModal, setVenueModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [showJsShowcase, setShowJsShowcase] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      title: 'Welcome to QueueLess!',
      message: 'Explore venues or book a remote token to skip physical waiting lines.',
      time: 'Just now',
    }
  ]);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredVenues(venues);
  }, [venues]);

  useEffect(() => {
    saveStoredUserTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    saveStoredTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Add Notification
  const addNotification = (title, message) => {
    const newNotif = {
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  // Quick Book Trigger
  const handleQuickBook = (venue) => {
    const firstDept = venue.departments[0];
    setBookingModal({ venue, department: firstDept });
  };

  // Open Department Book
  const handleBookDepartment = (venue, department) => {
    setVenueModal(null);
    setBookingModal({ venue, department });
  };

  // Confirm New Token Booking
  const handleConfirmBooking = (newBooking) => {
    setTokens(prev => [newBooking, ...prev]);
    
    // Update venue queue count
    setVenues(prev => prev.map(v => {
      if (v.id === newBooking.venueId) {
        return { ...v, currentQueueLength: v.currentQueueLength + 1 };
      }
      return v;
    }));

    setBookingModal(null);
    setActiveTab('tokens');
    addNotification('Token Generated!', `Token ${newBooking.tokenId} created for ${newBooking.venueName}.`);
  };

  // Cancel Token
  const handleCancelToken = (tokenId) => {
    setTokens(prev => prev.map(t => t.tokenId === tokenId ? { ...t, status: 'CANCELLED' } : t));
    addNotification('Token Cancelled', `Token ${tokenId} has been cancelled.`);
  };

  // Push back token (delay 10 mins)
  const handlePushBackToken = (tokenId) => {
    setTokens(prev => prev.map(t => {
      if (t.tokenId === tokenId) {
        return {
          ...t,
          peopleAhead: t.peopleAhead + 2,
          position: t.position + 2,
          estimatedWaitMins: t.estimatedWaitMins + 10,
        };
      }
      return t;
    }));
    addNotification('Queue Pushed Back', `Token ${tokenId} moved back by +10 mins.`);
  };

  // Simulate Next Token Advancement
  const handleSimulateStep = (tokenId) => {
    setTokens(prev => prev.map(t => {
      if (t.tokenId === tokenId && t.peopleAhead > 0) {
        const newAhead = t.peopleAhead - 1;
        const newStatus = newAhead === 0 ? 'CALLING' : 'WAITING';
        if (newAhead === 0) {
          addNotification('🔔 YOUR TURN NOW!', `Token ${t.tokenId} is called to the service counter!`);
        }
        return {
          ...t,
          peopleAhead: newAhead,
          position: Math.max(1, t.position - 1),
          estimatedWaitMins: Math.max(0, t.estimatedWaitMins - 4),
          status: newStatus,
        };
      }
      return t;
    }));
  };

  // Admin Updates
  const handleUpdateVenue = (venueId, updates) => {
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...updates } : v));
  };

  const handleUpdateTokenStatus = (tokenId, newStatus) => {
    setTokens(prev => prev.map(t => t.tokenId === tokenId ? { ...t, status: newStatus } : t));
    addNotification('Token Status Updated', `Token ${tokenId} status changed to ${newStatus}.`);
  };

  const handleAddWalkInToken = (walkInToken) => {
    setTokens(prev => [walkInToken, ...prev]);
    setVenues(prev => prev.map(v => {
      if (v.id === walkInToken.venueId) {
        return { ...v, currentQueueLength: v.currentQueueLength + 1 };
      }
      return v;
    }));
    addNotification('Walk-in Token Issued', `Token ${walkInToken.tokenId} created at desk.`);
  };

  // Filtered Venues List
  const filteredVenues = venues.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesQuery = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const activeUserTokens = tokens.filter(t => t.status !== 'CANCELLED' && t.status !== 'COMPLETED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tokensCount={activeUserTokens.length}
        theme={theme}
        toggleTheme={toggleTheme}
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
        openJsShowcase={() => setShowJsShowcase(true)}
      />

      {/* Main Body */}
      <main style={{ flexGrow: 1, padding: '2rem 0' }}>
        <div className="app-container">

          {/* TAB 1: EXPLORE VENUES & BOOK QUEUE */}
          {activeTab === 'explore' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Hero Banner Header */}
              <div className="glass-panel animate-slide-down" style={{
                padding: '2.5rem 2rem',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)',
              }}>
                <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
                  <span className="badge badge-indigo" style={{ marginBottom: '0.6rem' }}>
                    <Sparkles size={14} /> Smart Virtual Token System
                  </span>
                  <h1 style={{ fontSize: '2.4rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                    Skip Physical Lines. <br />
                    <span className="gradient-text">Queue Remotely From Anywhere.</span>
                  </h1>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Book remote virtual tokens for Hospitals, Banks, Salons, Govt Offices & Cafeterias. Get real-time AI wait time predictions and turn alerts directly on your phone!
                  </p>

                  {/* Search Bar Input */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--card-hover-border)',
                    borderRadius: '16px',
                    padding: '0.4rem 0.5rem 0.4rem 1rem',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '520px',
                  }}>
                    <Search size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginRight: '0.5rem' }} />
                    <input 
                      type="text"
                      placeholder="Search hospitals, banks, salons, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.5rem' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.85rem', borderRadius: '999px', whiteSpace: 'nowrap' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Venues Grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.3rem' }}>
                    Available Queues ({filteredVenues.length})
                  </h2>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Live status updated
                  </span>
                </div>

                {filteredVenues.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                    <Building2 size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <h3>No matching venues found</h3>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try adjusting your search query or category filter.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                  }}>
                    {filteredVenues.map((venue) => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        onSelectVenue={(v) => setVenueModal(v)}
                        onQuickBook={handleQuickBook}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MY VIRTUAL TOKENS VIEW */}
          {activeTab === 'tokens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 1rem auto' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
                  Live Digital Wallet
                </span>
                <h2 style={{ fontSize: '1.8rem' }}>Your Active Virtual Tokens</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Track live position updates, QR ticket check-ins, and AI arrival predictions in real-time.
                </p>
              </div>

              {tokens.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                  <Ticket size={56} style={{ color: 'var(--accent-primary)', opacity: 0.6, marginBottom: '1rem' }} />
                  <h3>No Virtual Tokens Issued Yet</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
                    You haven't booked any remote queue tokens. Browse available venues to join a queue!
                  </p>
                  <button onClick={() => setActiveTab('explore')} className="btn-primary" style={{ margin: '0 auto' }}>
                    Explore Venues & Book Queue
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {tokens.map((token) => (
                    <TokenCard
                      key={token.tokenId}
                      token={token}
                      onCancelToken={handleCancelToken}
                      onPushBackToken={handlePushBackToken}
                      onSimulateStep={handleSimulateStep}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUSINESS ADMIN PORTAL */}
          {activeTab === 'admin' && (
            <AdminDashboard
              venues={venues}
              tokens={tokens}
              onUpdateVenue={handleUpdateVenue}
              onUpdateTokenStatus={handleUpdateTokenStatus}
              onAddWalkInToken={handleAddWalkInToken}
            />
          )}

        </div>
      </main>

      {/* Modals */}
      {venueModal && (
        <VenueModal 
          venue={venueModal}
          onClose={() => setVenueModal(null)}
          onBookDepartment={handleBookDepartment}
        />
      )}

      {bookingModal && (
        <BookingModal
          venue={bookingModal.venue}
          department={bookingModal.department}
          onClose={() => setBookingModal(null)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {showJsShowcase && (
        <JSShowcaseModal onClose={() => setShowJsShowcase(false)} />
      )}

      {/* Footer */}
      <Footer openJsShowcase={() => setShowJsShowcase(true)} />

    </div>
  );
}
