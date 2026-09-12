import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Mail, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search || '');
    const desc = hashParams.get('error_description') || searchParams.get('error_description') || hashParams.get('error') || searchParams.get('error');
    return desc ? decodeURIComponent(desc.replace(/\+/g, ' ')) : '';
  });
  const [unverifiedAlert, setUnverifiedAlert] = useState(false);
  const [verificationSuccess] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    const type = hashParams.get('type');
    return type === 'signup' || type === 'email_change';
  });

  const redirectPath = (location.state as any)?.from?.pathname || '/';

  // If user is already authenticated (e.g., Supabase automatically restored session on verification), redirect
  useEffect(() => {
    if (user && !authLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setUnverifiedAlert(false);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setUnverifiedAlert(true);
      } else {
        setErrorMessage(error.message);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '3.5rem', paddingBottom: '5rem' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
          }}>
            <Store size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to continue to CampusBazaar
          </p>
        </div>

        {/* Supabase status note */}
        {!isSupabaseConfigured && (
          <div style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #ccfbf1',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            color: '#0f766e',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Configure Supabase in <code>.env</code> to activate live cloud authentication.</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email verification success notice */}
        {verificationSuccess && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            lineHeight: 1.4
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Email verified successfully! Welcome to CampusBazaar.</span>
          </div>
        )}

        {/* Email verification notice */}
        {unverifiedAlert && (
          <div style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            lineHeight: 1.5
          }}>
            <strong>Email verification required:</strong> Please click the confirmation link sent to your inbox before logging in.
          </div>
        )}

        {/* Google Authentication */}
        <div style={{ marginBottom: '1.25rem' }}>
          <GoogleAuthButton
            label="Continue with Google"
            redirectPath={redirectPath}
            onError={(msg) => setErrorMessage(msg)}
          />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted, #64748b)',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Login Form */}
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative', marginTop: '0.4rem' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm, 4px)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};
