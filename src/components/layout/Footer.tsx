import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      paddingTop: '4rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
      borderTop: '1px solid #1e293b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Store size={22} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Campus<span style={{ color: '#2dd4bf' }}>Bazaar</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Your Campus. Your Marketplace. A trustworthy, student-centric marketplace to buy and sell textbooks, gadgets, hostel essentials, and cycles safely.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
              <MapPin size={16} color="#2dd4bf" style={{ flexShrink: 0 }} />
              <span>Lovely Professional University, Phagwara, Punjab</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.1rem' }}>
              Popular Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/search?category=books" style={{ color: '#94a3b8' }}>Books & Study Material</Link></li>
              <li><Link to="/search?category=electronics" style={{ color: '#94a3b8' }}>Electronics & Calculators</Link></li>
              <li><Link to="/search?category=cycles" style={{ color: '#94a3b8' }}>Campus Bicycles</Link></li>
              <li><Link to="/search?category=laptops" style={{ color: '#94a3b8' }}>Laptops & Accessories</Link></li>
              <li><Link to="/search?category=hostel" style={{ color: '#94a3b8' }}>Hostel Essentials</Link></li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.1rem' }}>
              Safety & Trust
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/safety" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ShieldCheck size={16} color="#2dd4bf" /> Safety Guidelines</Link></li>
              <li><Link to="/safety#rules" style={{ color: '#94a3b8' }}>Prohibited Items List</Link></li>
              <li><Link to="/safety#reporting" style={{ color: '#94a3b8' }}>How to Report Scams</Link></li>
              <li><Link to="/safety#tips" style={{ color: '#94a3b8' }}>Safe Campus Handover Spots</Link></li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.1rem' }}>
              Account & Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/sell" style={{ color: '#94a3b8' }}>Sell an Item</Link></li>
              <li><Link to="/profile" style={{ color: '#94a3b8' }}>My Profile & Listings</Link></li>
              <li><Link to="/favorites" style={{ color: '#94a3b8' }}>Saved Favorites</Link></li>
              <li><Link to="/messages" style={{ color: '#94a3b8' }}>Messages & Inquiries</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem'
        }}>
          <p>© {new Date().getFullYear()} CampusBazaar. Built for campus students with passion.</p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
            <span>Verified Student Community</span>
            <span className="desktop-only-nav">•</span>
            <span style={{ color: '#2dd4bf' }}>Open to all valid email domains</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
