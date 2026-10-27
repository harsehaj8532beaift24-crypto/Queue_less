import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import { VenueCard } from './components/VenueCard';
import { VenueModal } from './components/VenueModal';
import { BookingModal } from './components/BookingModal';
import { TokenCard } from './components/TokenCard';
import { Footer } from './components/Footer';
import { X } from 'lucide-react';

const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AuthPage = lazy(() => import('./components/AuthPage').then(m => ({ default: m.AuthPage })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const InfoModal = lazy(() => import('./components/InfoModal').then(m => ({ default: m.InfoModal })));
const TokenVerificationView = lazy(() => import('./components/TokenVerificationView').then(m => ({ default: m.TokenVerificationView })));
const QRScannerView = lazy(() => import('./components/QRScannerView').then(m => ({ default: m.QRScannerView })));

import { CATEGORIES } from './data/initialData';
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
  getSocket 
} from './api/client';

import { 
  Search, 
  Building2, 
  Ticket, 
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState(null); // 'faq', 'contact', 'terms'
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [verificationRef, setVerificationRef] = useState(null); // QR pass reference (token number or hash)
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

  // Fetch User Tokens from Real Backend (Synchronizes guest tokens and authenticated tokens)
  const loadTokensFromBackend = useCallback(async () => {
    try {
      const stored = getStoredUserTokens() || [];
      const tokenIds = stored.map(t => t._id || t.tokenNumber || t.tokenId).filter(Boolean);
      const phone = currentUser?.phone || '';
      const res = await tokenApi.getMyTokens(phone, tokenIds.join(','));
      if (res.success && res.data) {
        if (res.data.length > 0) {
          setTokens(res.data);
        } else if (!currentUser && stored.length > 0) {
          setTokens(stored);
        }
      }
    } catch {
      // Keep local tokens fallback
    }
  }, [currentUser]);

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

  // Handle direct sign-in and QR verification navigation via URL
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash || '';
      const path = window.location.pathname || '';
      const search = window.location.search || '';
      const params = new URLSearchParams(search);

      // 1. QR Pass Verification (from mobile camera scan or direct link)
      const pathParts = path.split('/').filter(Boolean);
      let pathTokenRef = null;
      if (pathParts.length >= 2) {
        const prefix = pathParts[0].toLowerCase();
        if (prefix === 'token' || prefix === 'tokens' || prefix === 'verify' || prefix === 'verify-token') {
          pathTokenRef = decodeURIComponent(pathParts.slice(1).join('/'));
        }
      }

      const qrToken = params.get('token');
      const qrHash = params.get('hash');
      const qrVerify = params.get('verify') || params.get('ref') || params.get('tokenId');

      // Prioritize path-based token ID (/token/:tokenId), then explicit token parameter, then verify/ref, then crypto hash
      const resolvedRef = pathTokenRef || qrToken || qrVerify || (qrHash && qrHash.length === 32 ? qrHash : null) || qrHash;
      if (resolvedRef) {
        setVerificationRef(resolvedRef);
      }

      // 2. Direct Auth Page & Tab Navigation via URL
      const lowerHash = hash.toLowerCase();
      const lowerPath = path.toLowerCase();
      const lowerSearch = search.toLowerCase();
      if (
        lowerHash.includes('signup') ||
        lowerHash.includes('register') ||
        lowerPath.includes('signup') ||
        lowerPath.includes('register') ||
        lowerSearch.includes('signup') ||
        lowerSearch.includes('register')
      ) {
        setActiveTab('signup');
        setVerificationRef(null);
      } else if (
        lowerHash.includes('login') ||
        lowerHash.includes('signin') ||
        lowerPath.includes('login') ||
        lowerPath.includes('signin') ||
        lowerSearch.includes('login') ||
        lowerSearch.includes('signin')
      ) {
        setActiveTab('signin');
        setVerificationRef(null);
      } else if (lowerHash.includes('tokens') || lowerPath.includes('tokens')) {
        setActiveTab('tokens');
      } else if (lowerHash.includes('admin') || lowerPath.includes('admin')) {
        setActiveTab('admin');
      } else if (lowerHash.includes('explore')) {
        setActiveTab('explore');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

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

      // Real-time batch position and wait time updates across all clients
      socket.on('tokens_batch_updated', (batch) => {
        if (!Array.isArray(batch)) return;
        setTokens((prev) =>
          prev.map((t) => {
            const match = batch.find(
              (b) =>
                (b._id && (t._id === b._id || t.id === b._id)) ||
                (b.tokenNumber && (t.tokenNumber === b.tokenNumber || t.tokenId === b.tokenNumber))
            );
            return match ? { ...t, ...match } : t;
          })
        );
      });

      // Listen for real-time token state transitions across all connected clients
      socket.on('token_status_changed', (updatedToken) => {
        if (!updatedToken) return;
        setTokens((prev) =>
          prev.map((t) => {
            const match =
              (updatedToken._id && (t._id === updatedToken._id || t.id === updatedToken._id)) ||
              (updatedToken.tokenNumber &&
                (t.tokenNumber === updatedToken.tokenNumber || t.tokenId === updatedToken.tokenNumber));
            return match ? { ...t, ...updatedToken } : t;
          })
        );
        loadTokensFromBackend();
        loadVenuesFromBackend();
        if (updatedToken?.status === 'calling') {
          addNotification('Turn Alert!', `Token ${updatedToken.tokenNumber || ''} is now called to the service counter.`);
        }
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
        socket.off('tokens_batch_updated');
        socket.off('token_status_changed');
        socket.off('new_notification');
      }
    };
  }, [currentUser, loadVenuesFromBackend, loadTokensFromBackend]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    addNotification('Authentication Successful', `Welcome back, ${user.name}!`);
    loadTokensFromBackend();
    if (user.role === 'admin' || user.role === 'staff') {
      setActiveTab('admin');
      window.location.hash = 'admin';
    } else {
      setActiveTab('explore');
      window.location.hash = 'explore';
    }
  };

  const handleNavigateAuth = (mode = 'login') => {
    const target = mode === 'register' ? 'signup' : 'signin';
    setActiveTab(target);
    window.location.hash = target;
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
    let createdToken = null;
    try {
      let qId = bookingData.queueId;
      if (!qId) {
        try {
          if (bookingData.venueId) {
            const qRes = await queueApi.getQueues(bookingData.venueId);
            if (qRes.success && qRes.data && qRes.data.length > 0) {
              const match = qRes.data.find(q =>
                q.service?.prefix === bookingData.department?.prefix ||
                q.name?.toLowerCase().includes(bookingData.departmentName?.toLowerCase())
              );
              qId = match ? match._id : qRes.data[0]._id;
            }
          }

          if (!qId) {
            const allQueues = await queueApi.getQueues();
            if (allQueues.success && allQueues.data && allQueues.data.length > 0) {
              const globalMatch = allQueues.data.find(q =>
                q.service?.prefix === bookingData.department?.prefix ||
                q.name?.toLowerCase().includes(bookingData.departmentName?.toLowerCase())
              );
              qId = globalMatch ? globalMatch._id : allQueues.data[0]._id;
            }
          }
        } catch (lookupErr) {
          console.warn('Queue auto-resolution note:', lookupErr);
        }
      }

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
          createdToken = res.data;
          setTokens(prev => [createdToken, ...prev]);
          addNotification('Token Generated!', `Token ${createdToken.tokenNumber} created in MongoDB for ${bookingData.venueName}.`);
        }
      }

      if (!createdToken) {
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
          qrTokenHash: '3144f0368fe040c383d9a2d44a818223',
          qrCodeData: `${window.location.origin}/token/${encodeURIComponent(tokenId)}?hash=3144f0368fe040c383d9a2d44a818223`,
        };
        createdToken = newBooking;
        setTokens(prev => [newBooking, ...prev]);
        addNotification('Token Generated!', `Token ${tokenId} created for ${bookingData.venueName}.`);
      }

      loadVenuesFromBackend();
      return createdToken;
    } catch (err) {
      addNotification('Booking Error', err.message || 'Could not complete token booking');
      throw err;
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
          addNotification('Your Turn Now', `Token ${t.tokenNumber || t.tokenId} is called to the service counter.`);
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
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
        }}
        tokensCount={activeUserTokens.length}
        theme={theme}
        toggleTheme={toggleTheme}
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
        currentUser={currentUser}
        onOpenAuth={handleNavigateAuth}
        onLogout={handleLogout}
        isServerConnected={isServerConnected}
        onOpenInfo={(tab) => setInfoModalTab(tab || 'faq')}
        onOpenScanner={() => setShowScannerModal(true)}
      />

      {/* Main Body */}
      <main style={{ flexGrow: 1, padding: '2rem 0' }}>
        <div className="app-container">

          {verificationRef ? (
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>Loading token verification...</div>}>
              <TokenVerificationView
                tokenRef={verificationRef}
                onBack={() => {
                  setVerificationRef(null);
                  try {
                    window.history.pushState({}, '', '/');
                  } catch {}
                }}
              />
            </Suspense>
          ) : (
            <>
              {/* TAB 1: EXPLORE VENUES & BOOK QUEUE */}
          {activeTab === 'explore' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Hero Banner Header */}
              <section
                className="glass-panel animate-slide-down"
                aria-label="QueueLess Hero Introduction"
                style={{
                  padding: '2.5rem 2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <span 
                      className="badge badge-indigo"
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Virtual Queue Management
                    </span>
                    <span 
                      className="badge badge-emerald"
                      style={{ fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)' }} />
                      Real-Time Sync Active
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)',
                  }}>
                    Skip Physical Lines. <br />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Queue Remotely From Anywhere.</span>
                  </h1>

                  <p style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    maxWidth: '560px',
                  }}>
                    Browse active hospitals, banks, salons, and offices. Check real-time counter calls, estimate wait times accurately, and receive instant arrival alerts.
                  </p>

                  {/* Search Bar Input */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem 0.45rem 1rem',
                    boxShadow: 'var(--shadow-sm)',
                    maxWidth: '520px',
                    transition: 'border-color 0.15s ease',
                  }}>
                    <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem' }} />
                    <input 
                      type="text"
                      placeholder="Search hospitals, banks, salons, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search venues by name, city, or service"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        height: '28px',
                        padding: 0,
                      }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search input"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </section>


              {/* Category Filter Pills */}
              <div
                role="tablist"
                aria-label="Filter venues by category"
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={isSelected ? 'btn-primary' : 'btn-secondary'}
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.45rem 1rem',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Venues Grid */}
              <section aria-label="Available queues listing">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                      Available Queues ({filteredVenues.length})
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Browse active venues and view live waiting times or book a remote token.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isServerConnected ? 'var(--emerald)' : 'var(--amber)',
                      background: isServerConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      border: isServerConnected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                    }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: isServerConnected ? 'var(--emerald)' : 'var(--amber)',
                      }} />
                      {isServerConnected ? 'MongoDB Live' : 'Standalone'}
                    </span>

                    <button 
                      type="button"
                      onClick={loadVenuesFromBackend}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                      title="Refresh queues from MongoDB"
                      aria-label="Refresh queues from MongoDB"
                    >
                      <RefreshCw size={13} />
                      <span style={{ fontSize: '0.75rem' }}>Refresh</span>
                    </button>
                  </div>
                </div>

                {filteredVenues.length === 0 ? (
                  <div className="glass-panel" style={{
                    textAlign: 'center',
                    padding: '3.5rem 1.5rem',
                    color: 'var(--text-secondary)',
                    borderRadius: '16px',
                  }}>
                    <Building2 size={48} style={{ opacity: 0.35, margin: '0 auto 0.75rem' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      No matching venues found
                    </h3>
                    <p style={{ fontSize: '0.86rem', marginTop: '6px', maxWidth: '380px', margin: '6px auto 1.25rem' }}>
                      We couldn't find any queues matching your search query or selected category.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                      className="btn-secondary"
                      style={{ margin: '0 auto', fontSize: '0.82rem' }}
                    >
                      Reset Filters
                    </button>
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
              </section>

            </div>
          )}

          {/* TAB 2: MY VIRTUAL TOKENS VIEW */}
          {activeTab === 'tokens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 0.5rem auto' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
                  Live Digital Wallet
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Your Active Virtual Tokens</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  Track live queue movements, encrypted QR check-in passes, and dynamic arrival estimations in real-time.
                </p>
              </div>

              {tokens.length === 0 ? (
                <div className="glass-panel" style={{
                  textAlign: 'center',
                  padding: '4rem 1.5rem',
                  maxWidth: '520px',
                  margin: '0 auto',
                  borderRadius: '16px',
                }}>
                  <Ticket size={56} style={{ color: 'var(--accent-primary)', opacity: 0.5, margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Virtual Tokens Issued Yet</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.5 }}>
                    You don't have any active tokens in your digital wallet. Join an active queue remotely from any venue to skip physical waiting lines.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    className="btn-primary"
                    style={{ margin: '0 auto', padding: '0.7rem 1.4rem' }}
                  >
                    Browse Venues & Join Queue
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
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>Loading Staff & Admin Portal...</div>}>
              <AdminDashboard
                venues={venues}
                tokens={tokens}
                onUpdateVenue={handleUpdateVenue}
                onUpdateTokenStatus={handleUpdateTokenStatus}
                onAddWalkInToken={handleAddWalkInToken}
                currentUser={currentUser}
              />
            </Suspense>
          )}

          {/* TAB 4: DEDICATED SIGN IN & SIGN UP PAGE */}
          {(activeTab === 'signin' || activeTab === 'signup') && (
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>Loading Authentication...</div>}>
              <AuthPage
                initialMode={activeTab === 'signup' ? 'register' : 'login'}
                onAuthSuccess={handleAuthSuccess}
                onNavigateHome={() => {
                  setActiveTab('explore');
                  window.location.hash = 'explore';
                }}
                onNavigateTokens={() => {
                  setActiveTab('tokens');
                  window.location.hash = 'tokens';
                }}
              />
            </Suspense>
          )}

            </>
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
          currentUser={currentUser}
        />
      )}

      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        </Suspense>
      )}

      {infoModalTab && (
        <Suspense fallback={null}>
          <InfoModal
            initialTab={infoModalTab}
            onClose={() => setInfoModalTab(null)}
          />
        </Suspense>
      )}

      {showScannerModal && (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={() => setShowScannerModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="glass-modal animate-slide-down"
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '1.75rem', 
              position: 'relative',
              borderRadius: '16px' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowScannerModal(false)}
              aria-label="Close scanner modal"
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
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading QR Scanner...</div>}>
              <QRScannerView 
                onTokenAction={() => {
                  loadVenuesFromBackend();
                  loadTokensFromBackend();
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer 
        onOpenInfo={(tab) => setInfoModalTab(tab || 'faq')} 
        onNavigateAuth={handleNavigateAuth}
      />

    </div>
  );
}
