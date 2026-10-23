import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/client';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(demoEmail, demoPassword);
      if (res.success && res.data) {
        localStorage.setItem('queueless_auth_token', res.data.token);
        localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await authApi.login(email.trim(), password);
      } else {
        if (!name.trim()) throw new Error('Full Name is required');
        res = await authApi.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim(),
        });
      }

      if (res.success && res.data) {
        localStorage.setItem('queueless_auth_token', res.data.token);
        localStorage.setItem('queueless_current_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="glass-modal animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.3rem' }}>
              <Sparkles size={12} /> Secure Authentication
            </span>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
              {isLogin ? 'Sign in to QueueLess' : 'Create New Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Fast-Login Pills */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px dashed var(--accent-primary)',
          borderRadius: '12px',
          padding: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            ⚡ Fast Coursework Evaluator Login:
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer@queueless.com', 'password123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              disabled={loading}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('staff@queueless.com', 'password123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              disabled={loading}
            >
              🎫 Staff
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@queueless.com', 'password123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              disabled={loading}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--rose)',
            color: 'var(--rose)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.4rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.75rem' }}
                >
                  <option value="customer">Customer (Book & track queues)</option>
                  <option value="staff">Business Staff (Manage queues & verify QR)</option>
                  <option value="admin">Administrator (Full control & Analytics)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.4rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
