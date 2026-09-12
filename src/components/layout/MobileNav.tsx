import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const MobileNav: React.FC = () => {
  const { unreadMessagesCount } = useMarketplace();

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        height: 'calc(var(--mobile-nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box'
      }} 
      className="mobile-only-nav"
    >
      {/* 1. Home */}
      <NavLink 
        to="/" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)',
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none'
        })}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      {/* 2. Search */}
      <NavLink 
        to="/search" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)',
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none'
        })}
      >
        <Search size={20} />
        <span>Search</span>
      </NavLink>

      {/* 3. Sell CTA (Elevated Center) */}
      <NavLink 
        to="/sell" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          marginTop: '-14px',
          textDecoration: 'none'
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)',
          border: '2.5px solid #ffffff',
          flexShrink: 0
        }}>
          <PlusCircle size={24} />
        </div>
        <span style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
          Sell
        </span>
      </NavLink>

      {/* 4. Messages */}
      <NavLink 
        to="/messages" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)',
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none',
          position: 'relative'
        })}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={20} />
          {unreadMessagesCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-8px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 700,
              minWidth: '15px',
              height: '15px',
              padding: '0 3px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
        </div>
        <span>Messages</span>
      </NavLink>

      {/* 5. Profile */}
      <NavLink 
        to="/profile" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)',
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none'
        })}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
