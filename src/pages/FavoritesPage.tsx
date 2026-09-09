import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';

export const FavoritesPage: React.FC = () => {
  const { listings, favorites } = useMarketplace();
  const savedListings = listings.filter((item) => favorites.includes(item.id));

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={20} fill="#ef4444" />
            </div>
            <h1 className="heading-section">Saved Favorites</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {savedListings.length} {savedListings.length === 1 ? 'item' : 'items'} saved in your wishlist
          </p>
        </div>

        <Link to="/search" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Browse More</span>
        </Link>
      </div>

      {savedListings.length > 0 ? (
        <div className="grid-listings">
          {savedListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--border-strong)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Heart size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Saved Items Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Browse through books, calculators, bicycles, and accessories, and click the heart icon to save listings for later.
          </p>
          <Link to="/search" className="btn btn-primary">
            Explore Marketplace
          </Link>
        </div>
      )}
    </div>
  );
};
