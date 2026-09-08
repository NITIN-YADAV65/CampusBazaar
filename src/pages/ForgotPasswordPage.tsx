import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage('');

    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '4rem', paddingBottom: '5rem' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Reset Link Dispatched</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We've dispatched password recovery instructions to <strong>{email}</strong>. Follow the link inside to set a new password.
            </p>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                margin: '0 auto 1rem auto'
              }}>
                <Store size={22} />
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Reset Password
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Enter your registered campus account email
              </p>
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="name@gmail.com / student@lpu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Recovery Email'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
