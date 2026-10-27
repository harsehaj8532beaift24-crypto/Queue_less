import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Ticket,
  Sparkles,
  Building2,
  Users
} from 'lucide-react';
import { authApi } from '../api/client';

export function AuthPage({ 
  initialMode = 'login', 
  onAuthSuccess, 
  onNavigateHome,
  onNavigateTokens
}) {
  // Modes: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'staff' | 'admin'
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode with props when initialMode changes
  useEffect(() => {
    if (initialMode === 'register') {
      setMode('register');
    } else if (initialMode === 'login') {
      setMode('login');
    }
  }, [initialMode]);

  // Update hash when mode changes
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    if (newMode === 'login') {
      window.location.hash = 'signin';
    } else if (newMode === 'register') {
      window.location.hash = 'signup';
    }
  };

  // One-click demo login
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await authApi.login(demoEmail, demoPassword);
      if (res.success && res.data) {
        localStorage.setItem('queueless_auth_token', res.data.token);
        localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
        setSuccessMessage(`Welcome back, ${res.data.user.name}!`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.data.user);
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed. Please verify that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const res = await authApi.login(email.trim(), password);
        if (res.success && res.data) {
          localStorage.setItem('queueless_auth_token', res.data.token);
          localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
          setSuccessMessage(`Welcome back, ${res.data.user.name}!`);
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
          }, 350);
        }
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        if (password !== confirmPassword) throw new Error('Passwords do not match. Please re-enter.');

        const res = await authApi.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim(),
        });

        if (res.success && res.data) {
          localStorage.setItem('queueless_auth_token', res.data.token);
          localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
          setSuccessMessage(`Account created successfully! Welcome, ${res.data.user.name}.`);
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
          }, 350);
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');
        const res = await authApi.forgotPassword(email.trim());
        if (res.success) {
          setSuccessMessage(res.message || 'Password reset token generated.');
          if (res.resetToken) {
            setResetToken(res.resetToken);
            setMode('reset');
          }
        }
      } else if (mode === 'reset') {
        if (!resetToken.trim()) throw new Error('Reset token is required.');
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters long.');

        const res = await authApi.resetPassword(resetToken.trim(), newPassword);
        if (res.success) {
          setSuccessMessage('Password updated successfully! You can now sign in.');
          setMode('login');
          setPassword('');
          setNewPassword('');
          setResetToken('');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication request failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Top Breadcrumb Navigation */}
      <div style={{
        maxWidth: '520px',
        width: '100%',
        margin: '0 auto 1.25rem auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          type="button"
          onClick={onNavigateHome}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.825rem',
            padding: '0.4rem 0.85rem',
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Explore Venues</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          QueueLess Identity & Auth
        </span>
      </div>

      {/* Main Authentication Card */}
      <div 
        className="glass-panel animate-slide-down"
        style={{
          maxWidth: '520px',
          width: '100%',
          margin: '0 auto',
          padding: '2.25rem 2rem',
          borderRadius: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--btn-primary-bg, #0F172A)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Ticket size={26} />
          </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '0.35rem',
          }}>
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create your QueueLess account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Set a new password'}
          </h1>

          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {mode === 'login' && 'Access your virtual queue passes, live arrival predictions, and active tokens.'}
            {mode === 'register' && 'Join queues remotely from any phone or browser and skip physical waiting lines.'}
            {mode === 'forgot' && 'Enter your email address to receive secure password recovery instructions.'}
            {mode === 'reset' && 'Enter your reset token and your secure new password.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        {(mode === 'login' || mode === 'register') && (
          <div 
            role="tablist"
            aria-label="Authentication modes"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-tertiary)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              gap: '4px',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
              style={{
                height: '38px',
                fontSize: '0.85rem',
                fontWeight: mode === 'login' ? 700 : 500,
                borderRadius: '7px',
                border: mode === 'login' ? undefined : 'none',
                background: mode === 'login' ? undefined : 'transparent',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                justifyContent: 'center',
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
              className={mode === 'register' ? 'btn-primary' : 'btn-secondary'}
              style={{
                height: '38px',
                fontSize: '0.85rem',
                fontWeight: mode === 'register' ? 700 : 500,
                borderRadius: '7px',
                border: mode === 'register' ? undefined : 'none',
                background: mode === 'register' ? undefined : 'transparent',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                justifyContent: 'center',
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* One-Click Demo Credentials Card */}
        {mode === 'login' && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.6rem',
            }}>
              <span style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}>
                <Sparkles size={13} style={{ color: 'var(--amber)' }} />
                Instant Demo Logins
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                1-Click Testing
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.45rem',
            }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('customer@queueless.com', 'password123')}
                disabled={loading}
                className="btn-secondary"
                title="Customer (Alex Johnson) - Remote Token Booking"
                style={{
                  fontSize: '0.75rem',
                  height: '32px',
                  minHeight: '32px',
                  padding: '0 0.5rem',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('staff@queueless.com', 'password123')}
                disabled={loading}
                className="btn-secondary"
                title="Business Staff - Call & Advance Tokens"
                style={{
                  fontSize: '0.75rem',
                  height: '32px',
                  minHeight: '32px',
                  padding: '0 0.5rem',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                Staff Desk
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@queueless.com', 'password123')}
                disabled={loading}
                className="btn-secondary"
                title="System Admin - Full Business Management"
                style={{
                  fontSize: '0.75rem',
                  height: '32px',
                  minHeight: '32px',
                  padding: '0 0.5rem',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div 
            role="alert"
            style={{
              background: 'var(--rose-subtle)',
              border: '1px solid var(--rose-border)',
              color: 'var(--rose-text)',
              padding: '0.75rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div 
            role="status"
            style={{
              background: 'var(--emerald-subtle)',
              border: '1px solid var(--emerald-border)',
              color: 'var(--emerald-text)',
              padding: '0.75rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} noValidate={false}>
          {/* ===================== SIGN UP FIELDS ===================== */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Full Name */}
              <div>
                <label 
                  htmlFor="auth-fullname"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Full Name <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-fullname"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>

              {/* Account Type / Role Selection */}
              <div>
                <label 
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.45rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Account Type <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}>
                  <div
                    onClick={() => setRole('customer')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setRole('customer')}
                    style={{
                      border: role === 'customer' ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                      background: role === 'customer' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <Users size={16} style={{ color: 'var(--text-primary)' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Citizen / Customer</span>
                    </div>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                      Book tokens remotely and monitor live queue wait times.
                    </p>
                  </div>

                  <div
                    onClick={() => setRole('staff')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setRole('staff')}
                    style={{
                      border: role === 'staff' ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                      background: role === 'staff' ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                      <Building2 size={16} style={{ color: 'var(--text-primary)' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Business Staff</span>
                    </div>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                      Manage service desks, call tokens, and view analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label 
                  htmlFor="auth-phone"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Mobile Number <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional for SMS arrival alerts)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== COMMON EMAIL FIELD ===================== */}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="auth-email"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                  color: 'var(--text-primary)',
                }}
              >
                Email Address <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    height: '42px',
                    borderRadius: '8px',
                  }}
                />
              </div>
            </div>
          )}

          {/* ===================== SIGN IN PASSWORD FIELD ===================== */}
          {mode === 'login' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}>
                <label 
                  htmlFor="auth-password"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Password <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.78rem',
                    color: 'var(--cyan-text, #2563EB)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    height: '42px',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* ===================== SIGN UP PASSWORD & CONFIRM ===================== */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="auth-new-password"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Create Password <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      paddingRight: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="auth-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Confirm Password <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-confirm-password"
                    name="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== FORGOT PASSWORD TOKEN INPUT ===================== */}
          {mode === 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="auth-reset-token"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Reset Token <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-reset-token"
                    name="token"
                    type="text"
                    required
                    placeholder="Enter reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="auth-reset-new-password"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  New Password <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    id="auth-reset-new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      paddingRight: '38px',
                      height: '42px',
                      borderRadius: '8px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              height: '44px',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '8px',
              marginTop: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                {mode === 'login' && <span>Sign In to QueueLess</span>}
                {mode === 'register' && <span>Create My Account</span>}
                {mode === 'forgot' && <span>Generate Reset Token</span>}
                {mode === 'reset' && <span>Set New Password</span>}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* BOTTOM SWITCHER & LINKS */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
        }}>
          {mode === 'login' ? (
            <div>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Sign up for free
              </button>
            </div>
          ) : mode === 'register' ? (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Sign in
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back to Sign In
            </button>
          )}

          {/* Continue as Guest option */}
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Prefer to book as a guest? <span style={{ textDecoration: 'underline' }}>Explore Venues without an account →</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
export default AuthPage;
