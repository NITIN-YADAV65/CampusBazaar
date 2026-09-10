import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getSafeAvatarUrl, DEFAULT_AVATAR_URL } from '../../lib/avatar';
import { NotificationBell } from '../notifications/NotificationBell';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { favorites, unreadMessagesCount } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close open dropdowns/menus on navigation change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
    setMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
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
          <Sparkles size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span style={{ lineHeight: 1.35 }}>
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
          gap: '1rem'
        }}>
          {/* Logo & Campus Tag */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
            }}>
              <Store size={22} />
            </div>
            <div>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                display: 'block',
                lineHeight: 1.1
              }}>
                Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
              </span>
              <span className="desktop-only-nav" style={{
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

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="desktop-only-nav"
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
          <nav className="desktop-only-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
            <Link 
              to="/search" 
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: location.pathname === '/search' ? 700 : 500 }}
            >
              Explore
            </Link>

            {/* In-App & Push Notifications Bell */}
            <NotificationBell />

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
                  minWidth: '18px',
                  height: '18px',
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
                    src={getSafeAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url)}
                    alt="Profile"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_AVATAR_URL) {
                        target.src = DEFAULT_AVATAR_URL;
                      }
                    }}
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

          {/* Mobile Actions Header (Visible on < 768px) */}
          <div className="mobile-only-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="btn btn-ghost btn-icon"
              style={{ padding: '0.45rem', color: mobileSearchOpen ? 'var(--primary)' : 'var(--text-secondary)' }}
              title="Search"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Notification Bell with Badge on Mobile */}
            <NotificationBell isMobileHeader />

            {/* Messages Icon with Badge */}
            <Link 
              to="/messages" 
              className="btn btn-ghost btn-icon"
              style={{ padding: '0.45rem', position: 'relative' }}
              title="Messages"
              aria-label="Messages"
            >
              <MessageSquare size={20} />
              {unreadMessagesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 2px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Favorites Icon with Badge */}
            <Link 
              to="/favorites" 
              className="btn btn-ghost btn-icon"
              style={{ padding: '0.45rem', position: 'relative' }}
              title="Favorites"
              aria-label="Favorites"
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Hamburger / Close Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-icon"
              style={{ padding: '0.45rem', color: mobileMenuOpen ? 'var(--primary)' : 'var(--text-primary)' }}
              title="Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {mobileSearchOpen && (
          <div className="mobile-search-row" style={{
            padding: '0.65rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-subtle)',
            animation: 'slideDownFade 0.2s ease'
          }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search items, books, cycles, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer" style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            padding: '1rem',
            animation: 'slideDownFade 0.2s ease'
          }}>
            {/* Quick Sell CTA */}
            <Link
              to="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-sell"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.875rem', padding: '0.75rem' }}
            >
              <PlusCircle size={18} />
              <span>Sell Something</span>
            </Link>

            {/* Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  backgroundColor: location.pathname === '/search' ? 'var(--bg-muted)' : 'transparent'
                }}
              >
                <Store size={18} color="var(--primary)" />
                <span>Explore Marketplace</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: location.pathname === '/profile' ? 'var(--bg-muted)' : 'transparent'
                    }}
                  >
                    <UserIcon size={18} color="var(--primary)" />
                    <span>My Profile & Listings ({profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Account'})</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: '#d97706'
                      }}
                    >
                      <ShieldCheck size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--danger)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-outline"
                    style={{ justifyContent: 'center' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center' }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
