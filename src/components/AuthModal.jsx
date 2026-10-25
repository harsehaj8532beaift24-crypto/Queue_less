import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  KeyRound
} from 'lucide-react';
import { authApi } from '../api/client';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // Modes: 'login', 'register', 'forgot', 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Keyboard listener for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await authApi.login(demoEmail, demoPassword);
      if (res.success && res.data) {
        localStorage.setItem('queueless_auth_token', res.data.token);
        localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed. Please verify that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

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
          onAuthSuccess(res.data.user);
          onClose();
        }
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Full name is required.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');

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
          onAuthSuccess(res.data.user);
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await authApi.forgotPassword(email.trim());
        if (res.success) {
          setSuccessMessage(res.message);
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
          setSuccessMessage(res.message);
          setMode('login');
          setPassword('');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication dialog"
    >
      <div
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>
              {mode === 'login' && 'Sign in to QueueLess'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Set new password'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {mode === 'login' && 'Access your virtual tickets and queue history.'}
              {mode === 'register' && 'Join queues remotely and receive live queue notifications.'}
              {mode === 'forgot' && 'Enter your email address to receive a secure password reset token.'}
              {mode === 'reset' && 'Enter your reset token and your new password.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-secondary"
            style={{
              width: '32px',
              height: '32px',
              minHeight: '32px',
              padding: 0,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Evaluation Quick-Fill Accounts */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Quick Evaluation Credentials:
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('customer@queueless.com', 'password123')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', height: '28px', minHeight: '28px', padding: '0 0.6rem' }}
                disabled={loading}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('staff@queueless.com', 'password123')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', height: '28px', minHeight: '28px', padding: '0 0.6rem' }}
                disabled={loading}
              >
                Business Staff
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@queueless.com', 'password123')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', height: '28px', minHeight: '28px', padding: '0 0.6rem' }}
                disabled={loading}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{
            background: 'var(--rose-subtle)',
            border: '1px solid var(--rose-border)',
            color: 'var(--rose-text)',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={{
            background: 'var(--emerald-subtle)',
            border: '1px solid var(--emerald-border)',
            color: 'var(--emerald-text)',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="authFullNameInput">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="authFullNameInput"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="authRoleSelect">Account Type</label>
                <select
                  id="authRoleSelect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">Customer (Join & track queues)</option>
                  <option value="staff">Business Staff (Manage counters & verify tokens)</option>
                  <option value="admin">Administrator (Platform management)</option>
                </select>
              </div>

              <div>
                <label htmlFor="authPhoneInput">Phone Number (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="authPhoneInput"
                    type="tel"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field (for login, register, forgot) */}
          {mode !== 'reset' && (
            <div>
              <label htmlFor="authEmailInput">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  id="authEmailInput"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          )}

          {/* Password field (for login and register) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="authPasswordInput">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.775rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  id="authPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '11px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="authConfirmPasswordInput">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  id="authConfirmPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          )}

          {/* Reset Token & New Password (reset mode) */}
          {mode === 'reset' && (
            <>
              <div>
                <label htmlFor="authResetTokenInput">Reset Token</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="authResetTokenInput"
                    type="text"
                    required
                    placeholder="Enter reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="authNewPasswordInput">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '11px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    id="authNewPasswordInput"
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: '42px', marginTop: '0.4rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === 'login' ? (
              <span>Sign In</span>
            ) : mode === 'register' ? (
              <span>Create Account</span>
            ) : mode === 'forgot' ? (
              <span>Request Reset Token</span>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.825rem' }}>
          {mode === 'login' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Sign up
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Sign in
              </button>
            </p>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Return to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
