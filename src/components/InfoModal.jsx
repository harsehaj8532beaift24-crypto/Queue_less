import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Phone, 
  MapPin, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How does virtual queue booking work?',
    a: 'You can join a queue remotely from your smartphone or computer before arriving at the venue. Once you select a venue and department, a unique digital token with an encrypted QR code and your initial queue position is generated. Your estimated wait time updates in real time as counters process preceding customers.'
  },
  {
    q: 'When should I arrive at the service counter?',
    a: 'We recommend arriving at the venue when you have 1 to 2 people ahead of you in line. You will receive an on-screen arrival notification and turn alert when the counter staff calls your token number.'
  },
  {
    q: 'What do I need to present upon arrival?',
    a: 'Simply show the digital token screen on your device to the counter staff or security desk. The staff can scan your token QR code using the QueueLess verification tool or search for your token number directly.'
  },
  {
    q: 'What happens if I miss my turn or arrive late?',
    a: 'If a token is called and the customer is not present, counter staff can mark the token as skipped or put it on hold. You can speak directly to the reception staff to be queued into the next available slot, or generate a fresh token.'
  },
  {
    q: 'Can I cancel my token if my plans change?',
    a: 'Yes. Open the "My Tokens" tab and click "Cancel Token". This immediately frees your spot in line and updates the estimated wait time for everyone behind you.'
  },
  {
    q: 'Do I need to create an account to book a token?',
    a: 'No. You can book tokens as a guest using your name and phone number. However, signing in allows you to save and synchronize your booking history across multiple devices and receive account-specific notifications.'
  }
];

export function InfoModal({ initialTab = 'faq', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'faq', 'contact', 'terms'
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
      <div 
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}>
          <div>
            <h2 id="info-modal-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Help & Resources
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Frequently asked questions, direct support, and operational policies.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          padding: '0 1rem',
          gap: '0.5rem',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'faq' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'faq' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <HelpCircle size={15} />
            <span>FAQ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'contact' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'contact' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Mail size={15} />
            <span>Contact Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'terms' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'terms' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={15} />
            <span>Privacy & Policies</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
          
          {/* TAB 1: FAQ */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      style={{
                        width: '100%',
                        padding: '0.9rem 1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <span>{item.q}</span>
                      {isOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 1.1rem 1rem 1.1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.75rem',
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CONTACT */}
          {activeTab === 'contact' && (
            <div>
              {submitted ? (
                <div style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    color: 'var(--emerald)',
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Message Received
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                    Thank you, {formData.name}. Our support team will review your inquiry and respond to <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong> within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {errorMsg && (
                    <div style={{
                      padding: '0.65rem 0.9rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      color: 'var(--rose)',
                      fontSize: '0.8rem',
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="contactName" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Full Name *
                      </label>
                      <input 
                        id="contactName"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="contactEmail" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Email Address *
                      </label>
                      <input 
                        id="contactEmail"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactSubject" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Topic / Subject
                    </label>
                    <select
                      id="contactSubject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Business Partnership">Register My Venue / Business</option>
                      <option value="Feature Feedback">System Feedback or Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contactMessage" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Message *
                    </label>
                    <textarea 
                      id="contactMessage"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your question or how our team can help you..."
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Average response time: under 24 hours.
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 1.4rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <Send size={14} />
                      <span>{sending ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Direct Contact Reference */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} style={{ color: 'var(--text-primary)' }} />
                  <span>support@queueless.local</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} style={{ color: 'var(--text-primary)' }} />
                  <span>Mon-Sat: 08:00 - 20:00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ color: 'var(--text-primary)' }} />
                  <span>Central Operations Hub</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & PRIVACY */}
          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  1. Privacy & Data Minimization
                </h4>
                <p>
                  QueueLess collects only minimal customer details (name and contact number) necessary to identify your spot in line and send queue arrival alerts. Your data is stored securely and is automatically purged after token completion or cancellation.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  2. QR Token Verification & Fair Access
                </h4>
                <p>
                  Each virtual token generates a cryptographically signed verification payload. Tokens are non-transferable and can only be redeemed once at the physical service counter. To prevent queue hoarding, users are limited to two concurrent active tokens across different venues.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  3. Wait Time Estimates
                </h4>
                <p>
                  Estimated wait times are dynamically calculated based on current active service counters and average transaction durations. Real-world wait times may fluctuate depending on the complexity of individual customer consultations.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  4. Business Portal Responsibilities
                </h4>
                <p>
                  Participating venues are responsible for keeping their counter statuses updated in real-time. QueueLess provides automated WebSocket synchronization to guarantee zero latency between counter staff actions and customer devices.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
