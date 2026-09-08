import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const MobileNav: React.FC = () => {
  const { unreadMessagesCount } = useMarketplace();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--mobile-nav-height)',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      padding: '0 0.5rem'
    }} className="mobile-only-nav">
      <NavLink 
        to="/" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: '0.6875rem',
          fontWeight: isActive ? 700 : 500
        })}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink 
        to="/search" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: '0.6875rem',
          fontWeight: isActive ? 700 : 500
        })}
      >
        <Search size={20} />
        <span>Search</span>
      </NavLink>

      {/* Prominent Sell CTA */}
      <NavLink 
        to="/sell" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-18px',
          textDecoration: 'none'
        }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
          border: '3px solid #ffffff'
        }}>
          <PlusCircle size={26} />
        </div>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
          Sell
        </span>
      </NavLink>

      <NavLink 
        to="/messages" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: '0.6875rem',
          fontWeight: isActive ? 700 : 500,
          position: 'relative'
        })}
      >
        <div style={{ position: 'relative' }}>
          <MessageSquare size={20} />
          {unreadMessagesCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 700,
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadMessagesCount}
            </span>
          )}
        </div>
        <span>Messages</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: '0.6875rem',
          fontWeight: isActive ? 700 : 500
        })}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
