import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GoogleAuthButtonProps {
  label?: string;
  redirectPath?: string;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  redirectPath = '/login',
  onError,
  disabled = false,
}) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const { error } = await signInWithGoogle(redirectPath);
      if (error) {
        console.error('Google sign-in error:', error);
        const userMsg = error.message || 'Failed to sign in with Google. Please try again.';
        if (onError) {
          onError(userMsg);
        }
        setLoading(false);
      }
      // If successful, Supabase handles redirection automatically
    } catch (err: any) {
      console.error('Unexpected Google sign-in exception:', err);
      const userMsg = err?.message || 'An unexpected error occurred during Google sign-in.';
      if (onError) {
        onError(userMsg);
      }
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md, 10px)',
        border: '1.5px solid',
        borderColor: isHovered && !loading && !disabled ? '#cbd5e1' : '#e2e8f0',
        backgroundColor: isHovered && !loading && !disabled ? '#f8fafc' : '#ffffff',
        color: '#1e293b',
        fontSize: '0.9375rem',
        fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        boxShadow: isHovered && !loading && !disabled
          ? '0 3px 8px rgba(0, 0, 0, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.18s ease',
        transform: isHovered && !loading && !disabled ? 'translateY(-1px)' : 'none',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
        userSelect: 'none',
      }}
      aria-label={label}
    >
      {loading ? (
        <>
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary, #0d9488)' }} />
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          {/* Official Google 'G' Multi-Color Logo */}
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
