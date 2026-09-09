import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  ChevronLeft,
  Eye,
  Check,
  Phone,
  Package
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Listing } from '../lib/database.types';
import { ReportModal } from '../components/common/ReportModal';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, loadingListings, isFavorite, toggleFavorite, recordView } = useMarketplace();
  const { user } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [directListing, setDirectListing] = useState<Listing | null>(null);
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [recordedViewCount, setRecordedViewCount] = useState<number | null>(null);
  const viewRecordedRef = React.useRef(false);

  // Record a real unique view when listing detail page is opened
  React.useEffect(() => {
    if (!id || viewRecordedRef.current) return;
    viewRecordedRef.current = true;

    (async () => {
      const updatedCount = await recordView(id);
      if (typeof updatedCount === 'number') {
        setRecordedViewCount(updatedCount);
      }
    })();
  }, [id, recordView]);

  // Sync or fetch listing directly from Supabase if not yet in state
  React.useEffect(() => {
    if (!id) return;
    const existing = listings.find((item) => item.id === id);
    if (existing) {
      setDirectListing(existing);
      return;
    }

    if (isSupabaseConfigured) {
      setLoadingDirect(true);
      (async () => {
        try {
          // 1. Try full join
          let res = await supabase
            .from('listings')
            .select(`
              *,
              seller:profiles(*),
              images:listing_images(*)
            `)
            .eq('id', id)
            .single();

          // 2. If profiles join fails, try joining images
          if (res.error) {
            res = await supabase
              .from('listings')
              .select(`
                *,
                images:listing_images(*)
              `)
              .eq('id', id)
              .single();
          }

          // 3. If even that fails, try direct listings
          if (res.error) {
            res = await supabase
              .from('listings')
              .select('*')
              .eq('id', id)
              .single();
          }

          if (!res.error && res.data) {
            const itemData: any = { ...res.data };
            // If images were not joined, query listing_images directly
            if (!itemData.images || itemData.images.length === 0) {
              try {
                const { data: imgData } = await supabase
                  .from('listing_images')
                  .select('*')
                  .eq('listing_id', id)
                  .order('position', { ascending: true });
                if (imgData && imgData.length > 0) {
                  itemData.images = imgData;
                }
              } catch (e) {
                console.warn('listing_images lookup skipped:', e);
              }
            }

            setDirectListing({
              ...itemData,
              images: (itemData.images || []).sort((a: any, b: any) => a.position - b.position)
            } as Listing);
          }
        } catch (err) {
          console.error('Error fetching listing directly:', err);
        } finally {
          setLoadingDirect(false);
        }
      })();
    }
  }, [id, listings]);

  const listing = listings.find((item) => item.id === id) || directListing;

  if (loadingListings || loadingDirect) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.5rem auto'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Loading listing details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Listing Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          This item may have been sold or removed by the seller.
        </p>
        <Link to="/search" className="btn btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  const favorited = isFavorite(listing.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleStartChat = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${listing.id}` } });
      return;
    }
    if (user.id === listing.seller_id) {
      navigate('/messages');
      return;
    }
    navigate(`/messages?listingId=${listing.id}&sellerId=${listing.seller_id}`);
  };

  // Similar items in the same category
  const similarItems = listings
    .filter((item) => item.category_id === listing.category_id && item.id !== listing.id)
    .slice(0, 4);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem 0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <Link to="/search" style={{ color: 'var(--text-secondary)' }}>Marketplace</Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {listing.title}
        </span>
      </div>

      {/* Product Detail Layout */}
      <div 
        className="product-detail-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2.5rem',
          marginBottom: '4rem'
        }}
      >
        {/* Left Col: Image Gallery */}
        <div>
          {/* Main Large Image / Placeholder */}
          {images.length > 0 ? (
            <div style={{
              width: '100%',
              height: 'clamp(260px, 55vw, 420px)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <img
                src={images[activeImageIndex]?.image_url}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {listing.status === 'sold' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '2rem'
                }}>
                  THIS ITEM HAS BEEN SOLD
                </div>
              )}
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '420px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              border: '1px dashed var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}>
              <Package size={56} strokeWidth={1.5} color="#94a3b8" />
              <p style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.9375rem' }}>No photos uploaded for this listing</p>
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: `2px solid ${activeImageIndex === idx ? 'var(--primary)' : 'transparent'}`,
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                    backgroundColor: '#f1f5f9'
                  }}
                >
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Product Info & Actions */}
        <div>
          {/* Top category & condition */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)'
            }}>
              {listing.category?.name || 'Campus Listing'}
            </span>
            <span className={`badge badge-${listing.condition.toLowerCase().replace(' ', '-')}`}>
              Condition: {listing.condition}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1rem' }}>
            {listing.title}
          </h1>

          {/* Price */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem'
          }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              (Fixed price • No hidden campus fees)
            </span>
          </div>

          {/* Quick Meta Stats */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{listing.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <span>Posted on {new Date(listing.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={16} color="var(--text-muted)" />
              <span>
                {recordedViewCount !== null ? recordedViewCount : (listing.views_count || 0)} campus views
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Heart size={16} color="#ef4444" fill={favorited || (listing.likes_count || 0) > 0 ? '#ef4444' : 'none'} />
              <span>
                {listing.likes_count || 0} {(listing.likes_count || 0) === 1 ? 'like' : 'likes'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            <button
              onClick={handleStartChat}
              className="btn btn-primary btn-lg"
              style={{ flex: '1 1 200px' }}
              disabled={listing.status === 'sold'}
            >
              <MessageSquare size={20} />
              <span>{user?.id === listing.seller_id ? 'View Messages' : 'Chat with Seller'}</span>
            </button>

            <button
              onClick={async () => {
                if (togglingLike) return;
                setTogglingLike(true);
                await toggleFavorite(listing.id);
                setTogglingLike(false);
              }}
              disabled={togglingLike}
              className="btn btn-outline btn-lg"
              style={{
                borderColor: favorited ? '#ef4444' : 'var(--border-strong)',
                color: favorited ? '#ef4444' : 'var(--text-primary)',
                opacity: togglingLike ? 0.75 : 1,
                cursor: togglingLike ? 'wait' : 'pointer'
              }}
              title={favorited ? 'Unlike this listing' : 'Like this listing'}
            >
              <Heart size={20} fill={favorited ? '#ef4444' : 'none'} color={favorited ? '#ef4444' : 'currentColor'} />
              <span>{favorited ? 'Liked' : 'Like'} ({listing.likes_count || 0})</span>
            </button>

            <button onClick={handleShare} className="btn btn-outline btn-icon btn-lg" title="Share link">
              {copiedLink ? <Check size={20} color="#10b981" /> : <Share2 size={20} />}
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="btn btn-ghost btn-icon btn-lg"
              title="Report listing"
              style={{ color: 'var(--text-muted)' }}
            >
              <Flag size={20} />
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.75rem' }}>Description</h3>
            <div style={{
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              backgroundColor: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              {listing.description}
            </div>
          </div>

          {/* Seller Card */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <img
                  src={listing.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={listing.seller?.full_name || 'Seller'}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {listing.seller?.full_name || 'Campus Student'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    <ShieldCheck size={14} />
                    <span>Verified Campus Member</span>
                  </div>
                </div>
              </div>
            </div>

            {listing.seller?.bio && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                "{listing.seller.bio}"
              </p>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} />
              <span>Contact Preference: {listing.contact_preference || 'In-app Chat'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarItems.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
          <h2 className="heading-section" style={{ marginBottom: '1.5rem' }}>
            More in this Category
          </h2>
          <div className="grid-listings">
            {similarItems.map((item) => (
              <ProductCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      <ReportModal
        listingId={listing.id}
        listingTitle={listing.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};
