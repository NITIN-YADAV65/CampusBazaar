import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Store,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { favorites, unreadMessagesCount } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Configuration Status Banner (if Supabase credentials are not yet configured) */}
      {!isSupabaseConfigured && (
        <div style={{
          background: 'linear-gradient(90deg, #0f172a, #1e293b)',
          color: '#e2e8f0',
          padding: '0.45rem 1rem',
          fontSize: '0.8125rem',
          textAlign: 'center',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={14} color="#f59e0b" />
          <span>
            <strong>CampusBazaar Preview Mode:</strong> Running with sample LPU campus data. Connect Supabase via <code>.env</code> for production backend.
          </span>
        </div>
      )}

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          height: 'var(--navbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          {/* Logo & Campus Tag */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
            }}>
              <Store size={24} />
            </div>
            <div>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                display: 'block',
                lineHeight: 1.1
              }}>
                Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
              </span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#64748b',
                textTransform: 'uppercase'
              }}>
                LPU Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '480px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '1rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text"
              placeholder="Search books, calculators, cycles, electronics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.65rem',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <Link 
              to="/search" 
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: location.pathname === '/search' ? 700 : 500 }}
            >
              Explore
            </Link>

            {/* Messages */}
            <Link 
              to="/messages" 
              className="btn btn-ghost btn-icon"
              title="Messages"
              style={{ position: 'relative' }}
            >
              <MessageSquare size={20} />
              {unreadMessagesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <Link 
              to="/favorites" 
              className="btn btn-ghost btn-icon"
              title="Saved Favorites"
              style={{ position: 'relative' }}
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Sell Something CTA */}
            <Link to="/sell" className="btn btn-sell">
              <PlusCircle size={18} />
              <span>Sell Item</span>
            </Link>

            {/* User Profile or Login CTA */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.25rem 0.75rem 0.25rem 0.35rem',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <img
                    src={profile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt="Profile"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} color="var(--text-secondary)" />
                </button>

                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 0',
                    zIndex: 1100
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {profile?.full_name || user.user_metadata?.full_name || 'Campus Student'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.625rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <UserIcon size={16} />
                      <span>My Profile & Listings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.625rem 1rem',
                          fontSize: '0.875rem',
                          color: '#d97706'
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.25rem' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.625rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};
