import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import { VenueCard } from './components/VenueCard';
import { VenueModal } from './components/VenueModal';
import { BookingModal } from './components/BookingModal';
import { TokenCard } from './components/TokenCard';
import { AdminDashboard } from './components/AdminDashboard';
import { JSShowcaseModal } from './components/JSShowcaseModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

import { CATEGORIES, INITIAL_VENUES } from './data/initialData';
import { 
  getStoredVenues, 
  saveStoredVenues, 
  getStoredUserTokens, 
  saveStoredUserTokens, 
  getStoredTheme, 
  saveStoredTheme 
} from './utils/storage';

import { 
  authApi, 
  businessApi, 
  queueApi, 
  tokenApi, 
  notificationApi, 
  getSocket 
} from './api/client';

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
  ArrowRight,
  Wifi,
  WifiOff,
  RefreshCw
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('queueless_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Server & Realtime Connection State
  const [isServerConnected, setIsServerConnected] = useState(false);
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

  // Add Notification
  const addNotification = (title, message) => {
    const newNotif = {
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch Venues from Real MongoDB Backend
  const loadVenuesFromBackend = useCallback(async () => {
    try {
      const res = await businessApi.getAll(selectedCategory, searchQuery);
      if (res.success && res.data && res.data.length > 0) {
        setVenues(res.data);
        setIsServerConnected(true);
      }
    } catch {
      // Retain stored fallback venues if backend is momentarily unreachable
    }
  }, [selectedCategory, searchQuery]);

  // Fetch User Tokens from Real Backend
  const loadTokensFromBackend = useCallback(async () => {
    try {
      const res = await tokenApi.getMyTokens();
      if (res.success && res.data) {
        setTokens(res.data);
      }
    } catch {
      // Keep local tokens fallback
    }
  }, []);

  // Initial Data Fetch & Auth Verification
  useEffect(() => {
    loadVenuesFromBackend();
    loadTokensFromBackend();

    // Verify session
    const token = localStorage.getItem('queueless_auth_token');
    if (token) {
      authApi.getMe()
        .then(res => {
          if (res.success && res.data?.user) {
            setCurrentUser(res.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('queueless_auth_token');
          localStorage.removeItem('queueless_current_user');
          setCurrentUser(null);
        });
    }
  }, [loadVenuesFromBackend, loadTokensFromBackend]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    let socket;
    try {
      socket = getSocket();

      socket.on('connect', () => {
        setIsServerConnected(true);
        if (currentUser?._id) {
          socket.emit('subscribe_user', currentUser._id);
        }
      });

      socket.on('disconnect', () => {
        setIsServerConnected(false);
      });

      // Listen for queue updates
      socket.on('queue_updated', () => {
        loadVenuesFromBackend();
        loadTokensFromBackend();
      });

      socket.on('business_queue_updated', () => {
        loadVenuesFromBackend();
        loadTokensFromBackend();
      });

      // Listen for personal notifications
      socket.on('new_notification', (notif) => {
        addNotification(notif.title, notif.message);
      });
    } catch (err) {
      console.warn('Socket connection warning:', err);
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('queue_updated');
        socket.off('business_queue_updated');
        socket.off('new_notification');
      }
    };
  }, [currentUser, loadVenuesFromBackend, loadTokensFromBackend]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    addNotification('Logged in', `Welcome back, ${user.name}!`);
    loadTokensFromBackend();
  };

  const handleLogout = () => {
    localStorage.removeItem('queueless_auth_token');
    localStorage.removeItem('queueless_current_user');
    setCurrentUser(null);
    addNotification('Signed out', 'You have been logged out.');
  };

  // Quick Book Trigger
  const handleQuickBook = (venue) => {
    const firstDept = venue.departments && venue.departments.length > 0
      ? venue.departments[0]
      : { id: 'd1', name: 'General Desk', avgTime: 10, prefix: 'GEN' };
    setBookingModal({ venue, department: firstDept });
  };

  // Open Department Book
  const handleBookDepartment = (venue, department) => {
    setVenueModal(null);
    setBookingModal({ venue, department });
  };

  // Confirm New Token Booking (MongoDB API Call with Fallback)
  const handleConfirmBooking = async (bookingData) => {
    setIsSubmittingBooking(true);
    try {
      const qId = bookingData.queueId;
      if (qId) {
        // Real Backend Booking Call
        const res = await queueApi.join(qId, {
          customerName: bookingData.customerName,
          phone: bookingData.phone,
          partySize: bookingData.partySize,
          isPriority: bookingData.isPriority,
          priorityReason: bookingData.priorityReason,
        });

        if (res.success && res.data) {
          const createdToken = res.data;
          setTokens(prev => [createdToken, ...prev]);
          addNotification('Token Generated!', `Token ${createdToken.tokenNumber} created in MongoDB for ${bookingData.venueName}.`);
        }
      } else {
        // Fallback local booking
        const randomNum = Math.floor(100 + Math.random() * 900);
        const tokenId = `QL-${bookingData.department?.prefix || 'TOK'}-${randomNum}`;
        const newBooking = {
          _id: `tok_${Date.now()}`,
          tokenId,
          tokenNumber: tokenId,
          venueId: bookingData.venueId,
          venueName: bookingData.venueName,
          departmentName: bookingData.departmentName,
          customerName: bookingData.customerName,
          phone: bookingData.phone,
          partySize: bookingData.partySize,
          isPriority: bookingData.isPriority,
          priorityReason: bookingData.priorityReason,
          position: (bookingData.venue.currentQueueLength || 0) + 1,
          peopleAhead: bookingData.venue.currentQueueLength || 0,
          estimatedWaitMinutes: bookingData.aiEstimatedMins || 10,
          status: 'waiting',
          issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          qrCodeData: JSON.stringify({ tokenId, venue: bookingData.venueName, customer: bookingData.customerName }),
        };
        setTokens(prev => [newBooking, ...prev]);
        addNotification('Token Generated!', `Token ${tokenId} created for ${bookingData.venueName}.`);
      }

      setBookingModal(null);
      setActiveTab('tokens');
      loadVenuesFromBackend();
    } catch (err) {
      addNotification('Booking Error', err.message || 'Could not complete token booking');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Cancel Token
  const handleCancelToken = async (tokenId) => {
    try {
      await tokenApi.cancel(tokenId);
    } catch {
      // Local fallback
    }
    setTokens(prev => prev.map(t => (t._id === tokenId || t.tokenId === tokenId) ? { ...t, status: 'cancelled' } : t));
    addNotification('Token Cancelled', `Token has been cancelled.`);
  };

  // Push back token (delay 10 mins)
  const handlePushBackToken = async (tokenId) => {
    try {
      await tokenApi.pushBack(tokenId, 10);
    } catch {
      // Local fallback
    }
    setTokens(prev => prev.map(t => {
      if (t._id === tokenId || t.tokenId === tokenId) {
        return {
          ...t,
          peopleAhead: (t.peopleAhead || 0) + 2,
          position: (t.position || 1) + 2,
          estimatedWaitMinutes: (t.estimatedWaitMinutes || t.estimatedWaitMins || 10) + 10,
        };
      }
      return t;
    }));
    addNotification('Queue Pushed Back', `Token moved back by +10 mins.`);
  };

  // Advance Queue / Call Next Step
  const handleSimulateStep = async (tokenId) => {
    const targetToken = tokens.find(t => t._id === tokenId || t.tokenId === tokenId);
    if (!targetToken) return;

    if (targetToken.queue?._id || targetToken.queue) {
      try {
        const qId = targetToken.queue?._id || targetToken.queue;
        await queueApi.callNext(qId);
        loadTokensFromBackend();
        return;
      } catch {
        // Fallback to local advancement
      }
    }

    setTokens(prev => prev.map(t => {
      if ((t._id === tokenId || t.tokenId === tokenId) && (t.peopleAhead || 0) > 0) {
        const newAhead = (t.peopleAhead || 1) - 1;
        const newStatus = newAhead === 0 ? 'calling' : 'waiting';
        if (newAhead === 0) {
          addNotification('🔔 YOUR TURN NOW!', `Token ${t.tokenNumber || t.tokenId} is called to the service counter!`);
        }
        return {
          ...t,
          peopleAhead: newAhead,
          position: Math.max(1, (t.position || 1) - 1),
          estimatedWaitMinutes: Math.max(0, (t.estimatedWaitMinutes || t.estimatedWaitMins || 10) - 4),
          status: newStatus,
        };
      }
      return t;
    }));
  };

  // Admin Updates
  const handleUpdateVenue = async (venueId, updates) => {
    try {
      if (updates.activeCounters !== undefined) {
        const targetVenue = venues.find(v => (v.id || v._id) === venueId);
        const qId = targetVenue?.departments?.[0]?.queueId;
        if (qId) {
          await queueApi.updateCounters(qId, updates.activeCounters);
        }
      }
    } catch {
      // Local fallback
    }
    setVenues(prev => prev.map(v => (v.id || v._id) === venueId ? { ...v, ...updates } : v));
  };

  const handleUpdateTokenStatus = async (tokenId, newStatus) => {
    try {
      await tokenApi.updateStatus(tokenId, newStatus);
      loadTokensFromBackend();
    } catch {
      // Local fallback
    }
    setTokens(prev => prev.map(t => (t._id === tokenId || t.tokenId === tokenId) ? { ...t, status: newStatus } : t));
    addNotification('Token Status Updated', `Token status changed to ${newStatus}.`);
  };

  const handleAddWalkInToken = (walkInToken) => {
    setTokens(prev => [walkInToken, ...prev]);
    addNotification('Walk-in Token Issued', `Token ${walkInToken.tokenNumber || walkInToken.tokenId} created at desk.`);
  };

  // Filtered Venues List
  const filteredVenues = venues.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesQuery = (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (v.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (v.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const activeUserTokens = tokens.filter(t => {
    const s = (t.status || '').toLowerCase();
    return s !== 'cancelled' && s !== 'completed';
  });

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
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        isServerConnected={isServerConnected}
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
                    <Sparkles size={14} /> Smart Virtual Queue Management
                  </span>
                  <h1 style={{ fontSize: '2.4rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                    Skip Physical Lines. <br />
                    <span className="gradient-text">Queue Remotely From Anywhere.</span>
                  </h1>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Book remote virtual tokens for Hospitals, Banks, Salons, Govt Offices & Cafeterias. Get real-time AI wait time predictions, QR check-in codes, and turn alerts directly on your device!
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: isServerConnected ? 'var(--emerald)' : 'var(--text-secondary)' }}>
                      {isServerConnected ? '● MongoDB Synced' : '○ Standalone Mode'}
                    </span>
                    <button 
                      onClick={loadVenuesFromBackend}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      title="Refresh from MongoDB"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
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
                        key={venue.id || venue._id}
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
                  Track live position updates, encrypted QR check-ins, and data-driven AI arrival predictions.
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
                      key={token._id || token.tokenId}
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
          isSubmitting={isSubmittingBooking}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showJsShowcase && (
        <JSShowcaseModal
          isOpen={showJsShowcase}
          onClose={() => setShowJsShowcase(false)}
        />
      )}

      {/* Footer */}
      <Footer openJsShowcase={() => setShowJsShowcase(true)} />

    </div>
  );
}
