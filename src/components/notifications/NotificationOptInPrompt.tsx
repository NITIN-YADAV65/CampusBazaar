import React, { useState } from 'react';
import { Bell, X, Sparkles, Loader2, Smartphone } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const NotificationOptInPrompt: React.FC = () => {
  const {
    showOptInPrompt,
    dismissOptInPrompt,
    enablePushNotifications,
    isIOSRequired
  } = useNotification();

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showOptInPrompt) return null;

  const handleEnable = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await enablePushNotifications();
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to enable notifications.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(70px, 10vh, 90px)',
        right: '1.25rem',
        zIndex: 1050,
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-strong)',
        padding: '1.25rem',
        animation: 'slideUpFade 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem'
      }}
    >
      {/* Top Header Row with Icon and Close Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.35)',
              flexShrink: 0
            }}
          >
            <Bell size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Stay updated on CampusBazaar
            </h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
              <Sparkles size={12} /> Real-time push alerts
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissOptInPrompt}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Dismiss"
          aria-label="Dismiss notification prompt"
        >
          <X size={18} />
        </button>
      </div>

      {/* Descriptive Text */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
        Get notified about new listings and messages even when you're away from CampusBazaar.
      </p>

      {/* iOS Special Guidance */}
      {isIOSRequired ? (
        <div
          style={{
            backgroundColor: 'var(--bg-muted)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <Smartphone size={16} color="var(--primary)" />
            <span>iPhone / Safari instructions:</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
            <li>Select <strong>Add to Home Screen</strong>.</li>
            <li>Open CampusBazaar from your Home Screen to enable notifications.</li>
          </ol>
        </div>
      ) : (
        /* Action Buttons */
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="btn btn-primary"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '0.6rem 1rem',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <span>Enable Notifications</span>
            )}
          </button>

          <button
            type="button"
            onClick={dismissOptInPrompt}
            className="btn btn-ghost"
            style={{
              padding: '0.6rem 0.85rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)'
            }}
          >
            Not now
          </button>
        </div>
      )}

      {errorMsg && (
        <p style={{ fontSize: '0.75rem', color: 'var(--danger)', margin: 0 }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
};
