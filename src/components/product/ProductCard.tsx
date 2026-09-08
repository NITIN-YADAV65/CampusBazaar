import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, ShieldCheck, Package, Eye } from 'lucide-react';
import type { Listing } from '../../lib/database.types';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ProductCardProps {
  listing: Listing;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const favorited = isFavorite(listing.id);

  const formatTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case 'New': return 'badge-new';
      case 'Like New': return 'badge-like-new';
      case 'Good': return 'badge-good';
      default: return 'badge-used';
    }
  };

  const displayImage = listing.images && listing.images.length > 0 
    ? listing.images[0].image_url 
    : '';

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Image & Badges */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '68%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        {displayImage ? (
          <Link to={`/product/${listing.id}`} style={{ position: 'absolute', inset: 0 }}>
            <img 
              src={displayImage} 
              alt={listing.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              loading="lazy"
            />
          </Link>
        ) : (
          <Link to={`/product/${listing.id}`} style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            textDecoration: 'none',
            color: 'var(--text-muted)'
          }}>
            <Package size={36} strokeWidth={1.5} color="#94a3b8" />
            <span style={{ fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 500 }}>No image provided</span>
          </Link>
        )}

        {/* Condition Badge */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 2 }}>
          <span className={`badge ${getConditionBadgeClass(listing.condition)}`}>
            {listing.condition}
          </span>
        </div>

        {/* Sold Badge if sold */}
        {listing.status === 'sold' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            zIndex: 3
          }}>
            SOLD OUT
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          aria-label={favorited ? 'Remove from saved' : 'Save listing'}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            zIndex: 4,
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart 
            size={18} 
            color={favorited ? '#ef4444' : '#64748b'} 
            fill={favorited ? '#ef4444' : 'none'} 
          />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Title */}
          <Link to={`/product/${listing.id}`}>
            <h3 style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5rem'
            }}>
              {listing.title}
            </h3>
          </Link>

          {/* Location, Time & Analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                <MapPin size={13} color="var(--primary)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.location}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted)', fontSize: '0.725rem', flexShrink: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title={`${listing.views_count || 0} views`}>
                  <Eye size={12} />
                  <span>{listing.views_count || 0}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title={`${listing.likes_count || 0} likes`}>
                  <Heart size={12} fill={(listing.likes_count || 0) > 0 ? '#ef4444' : 'none'} color={(listing.likes_count || 0) > 0 ? '#ef4444' : 'currentColor'} />
                  <span>{listing.likes_count || 0}</span>
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="var(--text-muted)" />
              <span>{formatTimeAgo(listing.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <img 
              src={listing.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
              alt={listing.seller?.full_name || 'Seller'} 
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {listing.seller?.full_name?.split(' ')[0] || 'Campus Student'}
            </span>
          </div>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#059669', fontWeight: 600, fontSize: '0.6875rem' }}>
            <ShieldCheck size={13} />
            Verified
          </span>
        </div>
      </div>
    </div>
  );
};
