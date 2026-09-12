import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PlusCircle, 
  ShieldCheck, 
  Zap, 
  Users, 
  Sparkles, 
  CheckCircle, 
  PackageCheck, 
  ChevronRight, 
  Clock, 
  ThumbsUp,
  PackageSearch,
  MapPin
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/product/CategoryCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { TopPromoBar } from '../components/home/TopPromoBar';

export const HomePage: React.FC = () => {
  const { listings, categories, loadingListings } = useMarketplace();

  // ONLY active listings for marketplace home
  const activeListings = listings.filter(l => l.status === 'active');

  // Featured listings: highest viewed active items
  const featuredListings = [...activeListings]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4);

  // Recently added listings: newest active items
  const recentListings = [...activeListings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Recommended for you: good condition or additional active items
  const recommendedListings = activeListings.length > 4
    ? activeListings.slice(2, 6)
    : activeListings.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
      {/* TOP FLOATING PROMO BAR */}
      <TopPromoBar />

      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        paddingTop: '0.75rem',
        paddingBottom: 'clamp(1.5rem, 4vw, 3.5rem)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div 
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              alignItems: 'center',
              gap: 'clamp(1.75rem, 4vw, 3.5rem)'
            }}
          >
            {/* Left Hero Content */}
            <div>
              {/* Eyebrow Header Line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <span style={{ width: '28px', height: '3px', backgroundColor: '#0d9488', borderRadius: '2px', display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#0f766e', textTransform: 'uppercase' }}>
                  WELCOME TO CAMPUSBAZAAR
                </span>
              </div>

              {/* Main Headline */}
              <h1 style={{
                fontSize: 'clamp(1.85rem, 5vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: '1rem'
              }}>
                Buy. Sell. Connect.<br />
                <span style={{ color: '#0d9488' }}>Grow Together.</span>
              </h1>

              {/* Supporting Text */}
              <p style={{
                fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
                maxWidth: '520px'
              }}>
                Your one-stop marketplace for everything on campus.<br />
                Books, electronics, furniture, and more — by LPU students, for LPU students.
              </p>

              {/* Four Trust Points */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.875rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>Safe & Local</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>Verified Students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>Zero Commission</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>On-Campus Only</span>
                </div>
              </div>

              {/* Two Action CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <Link 
                  to="/search" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.28)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f766e';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 148, 136, 0.38)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0d9488';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.28)';
                  }}
                >
                  <span>Explore Items</span>
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/sell" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    backgroundColor: '#e6f9f3',
                    color: '#0f766e',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    border: '1.5px solid #ccfbf1',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ccfbf1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#e6f9f3';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Sell Something</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.16)',
                border: '1px solid rgba(226, 232, 240, 0.9)'
              }}>
                <img 
                  src="/Campus_image/campus_home_image.jpeg" 
                  alt="LPU campus students collaborating" 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="heading-section">Popular Categories</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Explore campus essentials categorized for your convenience
            </p>
          </div>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid-categories">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED LISTINGS */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="heading-section">Featured Listings</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Trending products with high campus interest
              </p>
            </div>
          </div>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
            <span>See more</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loadingListings ? (
          <ProductGridSkeleton count={4} />
        ) : featuredListings.length > 0 ? (
          <div className="grid-listings">
            {featuredListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
            color: 'var(--text-secondary)'
          }}>
            <PackageSearch size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Featured Items Yet
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Have something to sell? Post your item to be featured here!
            </p>
            <Link to="/sell" className="btn btn-primary btn-sm">
              List Item Now
            </Link>
          </div>
        )}
      </section>

      {/* 4. RECENTLY ADDED */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ccfbf1',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h2 className="heading-section">Recently Added</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Fresh listings posted by students
              </p>
            </div>
          </div>
          <Link to="/search?sort=newest" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
            <span>Browse latest</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loadingListings ? (
          <ProductGridSkeleton count={4} />
        ) : recentListings.length > 0 ? (
          <div className="grid-listings">
            {recentListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
            color: 'var(--text-secondary)'
          }}>
            <PackageSearch size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Recent Listings Yet
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Be the first to list an item on the LPU campus marketplace!
            </p>
            <Link to="/sell" className="btn btn-primary btn-sm">
              Sell an Item
            </Link>
          </div>
        )}
      </section>

      {/* 5. RECOMMENDED FOR YOU */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ThumbsUp size={18} />
            </div>
            <div>
              <h2 className="heading-section">Recommended For You</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Top deals in study books, electronics & hostel essentials
              </p>
            </div>
          </div>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
            <span>Explore all</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loadingListings ? (
          <ProductGridSkeleton count={4} />
        ) : recommendedListings.length > 0 ? (
          <div className="grid-listings">
            {recommendedListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
            color: 'var(--text-secondary)'
          }}>
            <PackageSearch size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Items to Recommend Yet
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Explore other categories or list something you want to sell.
            </p>
            <Link to="/sell" className="btn btn-sell btn-sm">
              Sell Something
            </Link>
          </div>
        )}
      </section>

      {/* 6. HOW CAMPUSBAZAAR WORKS */}
      <section style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)',
        paddingBottom: 'clamp(2.5rem, 5vw, 4.5rem)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(1.5rem, 4vw, 3rem) auto' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Simple & Transparent
            </span>
            <h2 className="heading-section" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              How CampusBazaar Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Designed specifically for campus life. Zero shipping delays, zero middleman fees.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'clamp(1rem, 3vw, 2rem)'
          }}>
            <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ccfbf1',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <PackageCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                1. List in Under 2 Minutes
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Snap photos of your books, gadgets, or cycle. Choose category, condition, price, and publish.
              </p>
            </div>

            <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                2. Chat Directly & Safely
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Chat with verified students right inside the app. Negotiate, confirm item details, and coordinate timings.
              </p>
            </div>

            <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                3. Inspect & Handover on Campus
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Meet at popular campus locations like UniMall or your hostel entrance. Inspect the item and pay on the spot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SAFETY TIPS BANNER */}
      <section className="container">
        <div 
          className="safety-banner-card"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            alignItems: 'center',
            gap: '1.5rem'
          }}
        >
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#2dd4bf',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}>
              <ShieldCheck size={18} />
              <span>CAMPUS SAFETY FIRST</span>
            </div>
            <h3 style={{ fontSize: '1.625rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.75rem' }}>
              Trade Safely. Protect Yourself & Your Peers.
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Always meet in daylight at populated campus spots like UniMall, Central Library, or main academic gates. Never wire money before seeing the item.
            </p>
            <Link to="/safety" className="btn btn-outline" style={{ color: '#ffffff', borderColor: '#334155' }}>
              Read Complete Safety Rules
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle size={18} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Inspect calculators, laptops, and cycles before transferring funds.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle size={18} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Keep all negotiations inside CampusBazaar chat for transparent records.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle size={18} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>Report suspicious accounts or fake listings instantly to campus moderators.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
