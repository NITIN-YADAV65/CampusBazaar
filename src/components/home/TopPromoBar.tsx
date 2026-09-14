import React from 'react';

export const TopPromoBar: React.FC = () => {
  return (
    <section 
      aria-label="Campus Promotions"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-promo)',
        borderBottom: '1px solid var(--border-promo)',
        paddingTop: '1.25rem',
        paddingBottom: '1.25rem',
        overflow: 'hidden'
      }}
    >
      {/* Subtle decorative background flourishes */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.7,
          overflow: 'hidden'
        }}
      >
        {/* Playful dashed swirl on left */}
        <path
          d="M30 45 C45 20, 75 25, 60 55 C50 70, 20 65, 40 40"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          fill="none"
          opacity="0.35"
        />
        {/* Tiny paper airplane */}
        <path
          d="M22 45 L34 38 L27 49 L28 44 Z"
          fill="#10b981"
          opacity="0.4"
        />
        {/* Dashed flourish on right */}
        <path
          d="M840 30 C870 15, 910 25, 930 45"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          fill="none"
          opacity="0.3"
        />
      </svg>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%'
          }}
          className="promo-scroll-container"
        >
          {/* 1. CARD 1: Leaving Hostel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-promo-card)',
              padding: '0.6rem 1.15rem',
              borderRadius: '9999px',
              border: '1.5px solid var(--border-promo-card)',
              boxShadow: 'var(--shadow-promo-card)',
              flexShrink: 0,
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            {/* Box / Hostel Belongings SVG Icon */}
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="pb-box-face" x1="10" y1="20" x2="38" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
              </defs>
              {/* Plant Leaves sprouting out */}
              <path d="M16 18C14 11 20 8 22 13C24 9 30 11 28 17" fill="#10b981" />
              {/* Blue notebook sticking out */}
              <rect x="23" y="10" width="8" height="15" rx="1" fill="#3b82f6" transform="rotate(15 23 10)" />
              {/* Cardboard Box */}
              <rect x="8" y="20" width="32" height="22" rx="3" fill="url(#pb-box-face)" />
              {/* Box Flap Overhang */}
              <polygon points="6,20 42,20 38,24 10,24" fill="#fbbf24" />
              {/* Center Packing Tape */}
              <rect x="21" y="20" width="6" height="22" fill="#10b981" fillOpacity="0.85" />
            </svg>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Leaving hostel?
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Sell your stuff to another{' '}
                <span
                  style={{
                    backgroundColor: 'var(--bg-promo-badge)',
                    color: 'var(--text-promo-badge)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  LPU student.
                </span>
              </div>
            </div>
          </div>

          {/* 2. CARD 2: Need Books */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-promo-card)',
              padding: '0.6rem 1.15rem',
              borderRadius: '9999px',
              border: '1.5px solid var(--border-promo-card)',
              boxShadow: 'var(--shadow-promo-card)',
              flexShrink: 0,
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            {/* Stack of Books SVG */}
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
              {/* Bottom Book (Cyan) */}
              <rect x="8" y="30" width="32" height="8" rx="2" fill="#0284c7" />
              <rect x="12" y="32" width="26" height="4" fill="#ffffff" fillOpacity="0.9" />
              {/* Middle Book (Crimson / Coral) */}
              <rect x="10" y="22" width="28" height="7" rx="2" fill="#f43f5e" />
              <rect x="13" y="24" width="23" height="3" fill="#fff1f2" />
              {/* Top Book (Amber) */}
              <rect x="12" y="14" width="24" height="7" rx="2" fill="#f59e0b" />
              <rect x="15" y="16" width="19" height="3" fill="#fef3c7" />
              {/* Bookmark ribbon */}
              <path d="M22 14V26L24.5 24L27 26V14H22Z" fill="#10b981" />
            </svg>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Need books for next semester?
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Find them on{' '}
                <span style={{ color: 'var(--color-promo-brand)', fontWeight: 800 }}>CampusBazaar.</span>
              </div>
            </div>
          </div>

          {/* 3. CARD 3: Don't Throw It Away */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-promo-card)',
              padding: '0.6rem 1.15rem',
              borderRadius: '9999px',
              border: '1.5px solid var(--border-promo-card)',
              boxShadow: 'var(--shadow-promo-card)',
              flexShrink: 0,
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            {/* Green Recycle Bin SVG */}
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="pb-bin-body" x1="12" y1="18" x2="36" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10b981" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
              {/* Green Bin Can */}
              <polygon points="12,18 36,18 33,40 15,40" fill="url(#pb-bin-body)" />
              {/* Lid Rim */}
              <rect x="10" y="14" width="28" height="4" rx="1.5" fill="#047857" />
              {/* White Recycling Emblem */}
              <path
                d="M24 23L27 27H21L24 23Z M21 28L18 32L21 34 M27 28L30 32L27 34"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Don&apos;t throw it away.
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Sell it to someone{' '}
                <span
                  style={{
                    backgroundColor: 'var(--bg-promo-badge)',
                    color: 'var(--text-promo-badge)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  on campus.
                </span>
              </div>
            </div>
          </div>

          {/* 4. SLOGAN (Far Right): Same Campus More Possibilities */}
          <div
            className="desktop-only-nav"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginLeft: 'auto',
              flexShrink: 0,
              paddingLeft: '0.5rem',
              position: 'relative'
            }}
          >
            <div
              style={{
                fontFamily: "'Segoe Script', 'Caveat', 'Comic Sans MS', cursive",
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                transform: 'rotate(-2deg)'
              }}
            >
              Same Campus
            </div>
            <div
              style={{
                fontFamily: "'Segoe Script', 'Caveat', 'Comic Sans MS', cursive",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                transform: 'rotate(-2deg)',
                position: 'relative'
              }}
            >
              More Possibilities
              {/* Handwritten curved green underline accent */}
              <svg
                width="120"
                height="12"
                viewBox="0 0 120 12"
                fill="none"
                style={{ position: 'absolute', bottom: '-8px', left: '2px' }}
              >
                <path
                  d="M2 5 C35 9, 85 9, 118 3"
                  stroke="#10b981"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Little playful green sparkle accents */}
            <span style={{ position: 'absolute', top: '-4px', right: '-12px', color: '#10b981', fontSize: '1rem' }}>
              ✦
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
