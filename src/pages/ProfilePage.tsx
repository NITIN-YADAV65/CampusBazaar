import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Package, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Camera, 
  Check,
  ShoppingCart,
  GraduationCap,
  Home,
  Calendar,
  MoreVertical,
  Eye,
  X,
  ArrowRight,
  ExternalLink,
  Laptop,
  BookOpen,
  Bike,
  Gamepad2,
  Armchair,
  Headphones,
  Smartphone,
  Shirt,
  Trophy,
  Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSafeAvatarUrl, DEFAULT_AVATAR_URL } from '../lib/avatar';
import '../styles/profile.css';

// Helper to map listing category to clean Lucide icon matching the design reference
const getCategoryIcon = (categorySlugOrId?: string) => {
  const cat = (categorySlugOrId || '').toLowerCase();
  if (cat.includes('laptop')) return <Laptop size={14} color="currentColor" />;
  if (cat.includes('book')) return <BookOpen size={14} color="currentColor" />;
  if (cat.includes('cycle') || cat.includes('bike')) return <Bike size={14} color="currentColor" />;
  if (cat.includes('phone') || cat.includes('mobile')) return <Smartphone size={14} color="currentColor" />;
  if (cat.includes('furniture') || cat.includes('chair')) return <Armchair size={14} color="currentColor" />;
  if (cat.includes('gaming') || cat.includes('game') || cat.includes('ps5')) return <Gamepad2 size={14} color="currentColor" />;
  if (cat.includes('fashion') || cat.includes('cloth')) return <Shirt size={14} color="currentColor" />;
  if (cat.includes('sport')) return <Trophy size={14} color="currentColor" />;
  if (cat.includes('audio') || cat.includes('ear') || cat.includes('head')) return <Headphones size={14} color="currentColor" />;
  if (cat.includes('vehicle') || cat.includes('car')) return <Car size={14} color="currentColor" />;
  return <Package size={14} color="currentColor" />;
};

// Helper functions to prevent example/mock values from appearing as actual values
const cleanPhone = (val?: string | null): string => {
  if (!val) return '';
  const trimmed = val.trim();
  return trimmed === '+91 98765 43210' ? '' : trimmed;
};

const cleanHostel = (val?: string | null): string => {
  if (!val) return '';
  const trimmed = val.trim();
  return trimmed === 'Block 11, Room 204' ? '' : trimmed;
};

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, isEmailVerified, refreshProfile } = useAuth();
  const { listings, favorites, deleteListing, markAsSold } = useMarketplace();
  const navigate = useNavigate();

  // Active tab state: 'active' | 'sold' | 'saved'
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'saved'>('active');

  // Edit Profile Modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active menu dropdown on listing cards
  const [openMenuListingId, setOpenMenuListingId] = useState<string | null>(null);

  // Contact Preferences toggles
  const [preferEmail, setPreferEmail] = useState(() => {
    return localStorage.getItem('cb_pref_email') !== 'false';
  });
  const [preferPhone, setPreferPhone] = useState(() => {
    return localStorage.getItem('cb_pref_phone') !== 'false';
  });

  // Hidden file input for avatar uploading
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile data when loaded
  useEffect(() => {
    const rawSavedHostel = user?.id ? localStorage.getItem(`cb_hostel_${user.id}`) : null;
    const rawMetadataHostel = (user?.user_metadata as any)?.hostel || '';
    const savedHostel = cleanHostel(rawSavedHostel);
    const metadataHostel = cleanHostel(rawMetadataHostel);

    if (profile) {
      setEditName(profile.full_name || 'Campus Student');
      setEditPhone(cleanPhone(profile.phone));
      setEditBio(profile.bio || '');
      setEditHostel(savedHostel || metadataHostel || '');
      setEditAvatarUrl(getSafeAvatarUrl(profile.avatar_url, ''));
    } else if (user) {
      setEditName(user.user_metadata?.full_name || 'Campus Student');
      setEditPhone(cleanPhone(user.user_metadata?.phone));
      setEditHostel(savedHostel || metadataHostel || '');
      setEditAvatarUrl(getSafeAvatarUrl(user.user_metadata?.avatar_url, ''));
    }
  }, [profile, user]);

  // Close 3-dots action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuListingId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter listings for the current user
  const currentUserId = user?.id;
  const myListings = listings.filter(
    listing => Boolean(currentUserId && listing.seller_id === currentUserId)
  );
  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');
  const savedListings = listings.filter(l => favorites.includes(l.id));

  // Calculate real aggregate listing statistics
  const totalListingViews = myListings.reduce((sum, l) => sum + (l.views_count || 0), 0);
  const totalListingLikes = myListings.reduce((sum, l) => sum + (l.likes_count || 0), 0);

  // Format member since date (e.g. "September 2024")
  const memberSinceFormatted = React.useMemo(() => {
    const rawDate = user?.created_at || profile?.created_at;
    if (!rawDate) return 'September 2024';
    try {
      const d = new Date(rawDate);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'September 2024';
    }
  }, [user?.created_at, profile?.created_at]);

  // Handle avatar image file selection and local preview
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setActionError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    // Clean up previous blob preview if present
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    setActionError(null);
  };

  const handleCloseModal = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
    setSelectedAvatarFile(null);
    setEditAvatarUrl(getSafeAvatarUrl(profile?.avatar_url, ''));

    // Reset modal input fields to current saved data (or empty)
    const rawSavedHostel = user?.id ? localStorage.getItem(`cb_hostel_${user.id}`) : null;
    const rawMetadataHostel = (user?.user_metadata as any)?.hostel || '';
    const savedHostel = cleanHostel(rawSavedHostel);
    const metadataHostel = cleanHostel(rawMetadataHostel);

    setEditName(profile?.full_name || user?.user_metadata?.full_name || 'Campus Student');
    setEditPhone(cleanPhone(profile?.phone || user?.user_metadata?.phone));
    setEditBio(profile?.bio || '');
    setEditHostel(savedHostel || metadataHostel || '');
    setIsEditingProfile(false);
  };

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setActionError(null);

    let finalAvatarUrl: string | null = getSafeAvatarUrl(profile?.avatar_url, null as any);

    // 1. If user selected a new file, upload to Supabase Storage 'listing-images' bucket under /avatars
    if (selectedAvatarFile && isSupabaseConfigured && user) {
      try {
        const fileExt = selectedAvatarFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, selectedAvatarFile, {
            contentType: selectedAvatarFile.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          setActionError(`Failed to upload avatar: ${uploadError.message}`);
          setSavingProfile(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          finalAvatarUrl = urlData.publicUrl;
        }
      } catch (err: any) {
        console.error('Avatar storage exception:', err);
        setActionError(`Avatar upload error: ${err.message || 'Unknown error'}`);
        setSavingProfile(false);
        return;
      }
    } else if (editAvatarUrl && editAvatarUrl.trim()) {
      // User entered an external image link
      const safe = getSafeAvatarUrl(editAvatarUrl.trim(), null as any);
      if (safe) {
        finalAvatarUrl = safe;
      }
    }

    // 2. Update Supabase public.profiles table
    const cleanedPhone = cleanPhone(editPhone);
    const { error } = await updateProfile({
      full_name: editName.trim(),
      phone: cleanedPhone || null,
      bio: editBio.trim() || null,
      avatar_url: finalAvatarUrl
    });

    // 3. Persist hostel information in localStorage and auth user_metadata
    if (user?.id) {
      const trimmedHostel = cleanHostel(editHostel);
      if (trimmedHostel) {
        localStorage.setItem(`cb_hostel_${user.id}`, trimmedHostel);
      } else {
        localStorage.removeItem(`cb_hostel_${user.id}`);
      }
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: editName.trim(),
              phone: cleanedPhone || null,
              hostel: trimmedHostel || null,
              avatar_url: finalAvatarUrl
            }
          });
        } catch (authErr) {
          console.warn('Could not sync user_metadata:', authErr);
        }
      }
    }

    setSavingProfile(false);
    if (error) {
      setActionError(error.message || 'Failed to update profile.');
    } else {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      setSelectedAvatarFile(null);
      setIsEditingProfile(false);
      await refreshProfile();
    }
  };

  // Handle Mark as Sold
  const handleMarkAsSold = async (listingId: string) => {
    setActionError(null);
    setOpenMenuListingId(null);
    const { error } = await markAsSold(listingId);
    if (error) {
      console.error('Failed to mark listing as sold:', error);
      setActionError('Could not mark listing as sold. Please try again.');
    }
  };

  // Handle Delete Listing
  const handleDeleteListing = async (listingId: string) => {
    setOpenMenuListingId(null);
    if (!window.confirm('Are you sure you want to permanently remove this listing?')) return;
    setActionError(null);
    const { error } = await deleteListing(listingId);
    if (error) {
      console.error('Failed to delete listing:', error);
      setActionError('Could not delete listing. Please try again.');
    }
  };

  const handleToggleEmailPref = (val: boolean) => {
    setPreferEmail(val);
    localStorage.setItem('cb_pref_email', String(val));
  };

  const handleTogglePhonePref = (val: boolean) => {
    setPreferPhone(val);
    localStorage.setItem('cb_pref_phone', String(val));
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || editName || 'Campus Student';
  const displayPhone = cleanPhone(profile?.phone || user?.user_metadata?.phone || editPhone);
  const displayEmail = user?.email || 'student@lpu.in';
  const displayBio = profile?.bio || editBio || 'A passionate student at LPU. Interested in tech, games, and always up for a good deal. Buying, selling, and connecting with fellow students. Let\'s make campus life easier together!';
  const displayAvatar = getSafeAvatarUrl(profile?.avatar_url || user?.user_metadata?.avatar_url);
  const displayHostel = cleanHostel(editHostel) || 'Not specified';

  return (
    <div className="profile-container">
      {/* Action Error Banner */}
      {actionError && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid #fecaca'
        }}>
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* ============================================================
          1. PROFILE HERO
          ============================================================ */}
      <div className="profile-hero-card">
        {/* Campus Header Banner */}
        <div 
          className="profile-banner"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80')`
          }}
        >
          <div className="profile-banner-overlay" />
          <div className="profile-banner-text">
            <div className="profile-banner-quote">Same Campus</div>
            <div className="profile-banner-quote">
              <span className="profile-banner-quote-sub">More Possibilities</span>
            </div>
            <div className="profile-banner-tags">Buy • Sell • Connect</div>
          </div>
        </div>

        {/* Hero Bottom Body */}
        <div className="profile-hero-body">
          <div className="profile-hero-left">
            {/* Circular Avatar with Camera badge */}
            <div className="profile-avatar-wrapper">
              <img
                src={displayAvatar}
                alt={displayName}
                className="profile-avatar-img"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_AVATAR_URL) {
                    target.src = DEFAULT_AVATAR_URL;
                  }
                }}
              />
              <button
                type="button"
                className="profile-avatar-camera-btn"
                onClick={() => setIsEditingProfile(true)}
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* User Meta Details */}
            <div className="profile-user-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{displayName}</h1>
                {isEmailVerified ? (
                  <span className="profile-verified-badge">
                    <CheckCircle size={14} />
                    <span>Verified Email</span>
                  </span>
                ) : (
                  <span className="profile-unverified-badge">
                    <AlertTriangle size={14} />
                    <span>Verification Pending</span>
                  </span>
                )}
              </div>

              <div className="profile-meta-row">
                <div className="profile-meta-item">
                  <Mail size={15} />
                  <span>{displayEmail}</span>
                </div>
                {displayPhone && (
                  <div className="profile-meta-item">
                    <Phone size={15} />
                    <span>{displayPhone}</span>
                  </div>
                )}
                <div className="profile-meta-item">
                  <MapPin size={15} />
                  <span>Lovely Professional University</span>
                </div>
              </div>

              <div className="profile-student-tags">
                Student • Buyer • Seller • Always Exploring
              </div>
            </div>
          </div>

          {/* Edit Profile CTA Button */}
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="profile-edit-btn"
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          2. PROFILE STATS (Real Database Metrics)
          ============================================================ */}
      <div className="profile-stats-grid">
        {/* Active Listings */}
        <div className="profile-stat-card">
          <div className="profile-stat-icon-box profile-stat-icon-green">
            <Package size={22} />
          </div>
          <div>
            <div className="profile-stat-value">{activeListings.length}</div>
            <div className="profile-stat-label">Active Listings</div>
          </div>
        </div>

        {/* Items Sold */}
        <div className="profile-stat-card">
          <div className="profile-stat-icon-box profile-stat-icon-teal">
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="profile-stat-value">{soldListings.length}</div>
            <div className="profile-stat-label">Items Sold</div>
          </div>
        </div>

        {/* Total Views */}
        <div className="profile-stat-card">
          <div className="profile-stat-icon-box profile-stat-icon-amber">
            <Eye size={22} />
          </div>
          <div>
            <div className="profile-stat-value">{totalListingViews}</div>
            <div className="profile-stat-label">Total Views</div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="profile-stat-card">
          <div className="profile-stat-icon-box profile-stat-icon-pink">
            <Heart size={22} fill={totalListingLikes > 0 ? '#ef4444' : 'none'} />
          </div>
          <div>
            <div className="profile-stat-value">{totalListingLikes}</div>
            <div className="profile-stat-label">Total Likes</div>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. MAIN CONTENT: TWO-COLUMN LAYOUT
          ============================================================ */}
      <div className="profile-main-grid">
        {/* Left Column: About Me & Contact Preferences */}
        <div className="profile-left-col">
          {/* About Me Card */}
          <div className="profile-side-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">About Me</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="profile-card-edit-icon"
                title="Edit About Me"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <p className="profile-bio-text">{displayBio}</p>

            <div className="profile-details-list">
              <div className="profile-detail-item">
                <GraduationCap size={18} className="profile-detail-icon" />
                <div className="profile-detail-content">
                  <span className="profile-detail-label">University</span>
                  <span className="profile-detail-value">Lovely Professional University</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <Home size={18} className="profile-detail-icon" />
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Hostel Information</span>
                  <span className="profile-detail-value">{displayHostel}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <Calendar size={18} className="profile-detail-icon" />
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">{memberSinceFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Preferences Card */}
          <div className="profile-side-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Contact Preferences</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="profile-card-edit-icon"
                title="Configure preferences"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div className="profile-pref-subtitle">
              I prefer to be contacted via:
            </div>

            <div className="profile-pref-row">
              <span className="profile-pref-label">
                <Mail size={16} color="#059669" />
                <span>Email</span>
              </span>
              <label className="profile-toggle">
                <input 
                  type="checkbox" 
                  checked={preferEmail} 
                  onChange={(e) => handleToggleEmailPref(e.target.checked)} 
                />
                <span className="profile-toggle-slider" />
              </label>
            </div>

            <div className="profile-pref-row">
              <span className="profile-pref-label">
                <Phone size={16} color="#059669" />
                <span>Phone</span>
              </span>
              <label className="profile-toggle">
                <input 
                  type="checkbox" 
                  checked={preferPhone} 
                  onChange={(e) => handleTogglePhonePref(e.target.checked)} 
                />
                <span className="profile-toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Marketplace Activity Tabs & Listings */}
        <div className="profile-listings-card">
          {/* Tabs Navigation */}
          <div className="profile-tabs-header">
            <div className="profile-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`profile-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              >
                My Listings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sold')}
                className={`profile-tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
              >
                Sold Items
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              >
                Saved Items
              </button>
            </div>

            <Link 
              to={activeTab === 'saved' ? '/favorites' : '/search'} 
              className="profile-view-all-link"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Tab 1: My Listings (Active) */}
          {activeTab === 'active' && (
            <div>
              {activeListings.length > 0 ? (
                <div className="profile-listings-grid">
                  {activeListings.map((listing) => {
                    const imageUrl = listing.images?.[0]?.image_url || '';
                    const isMenuOpen = openMenuListingId === listing.id;

                    return (
                      <div key={listing.id} className="profile-listing-item">
                        {/* Listing Image with Active Badge */}
                        <div className="profile-listing-img-container">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              className="profile-listing-img"
                              loading="lazy"
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8'
                            }}>
                              <Package size={28} />
                            </div>
                          )}
                          <span className="profile-listing-status-badge">
                            <Check size={11} strokeWidth={3} />
                            <span>Active</span>
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="profile-listing-content">
                          <div className="profile-listing-title-row">
                            <h4 className="profile-listing-title" title={listing.title}>
                              {listing.title}
                            </h4>

                            {/* 3-dots actions menu button */}
                            <div style={{ position: 'relative' }}>
                              <button
                                type="button"
                                className="profile-listing-menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuListingId(isMenuOpen ? null : listing.id);
                                }}
                                title="Listing options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Dropdown menu */}
                              {isMenuOpen && (
                                <div 
                                  className="profile-listing-menu-dropdown"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="profile-listing-menu-action"
                                    onClick={() => navigate(`/product/${listing.id}`)}
                                  >
                                    <ExternalLink size={13} />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="profile-listing-menu-action"
                                    onClick={() => handleMarkAsSold(listing.id)}
                                  >
                                    <CheckCircle size={13} />
                                    <span>Mark as Sold</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="profile-listing-menu-action danger"
                                    onClick={() => handleDeleteListing(listing.id)}
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="profile-listing-price">
                            ₹ {listing.price.toLocaleString('en-IN')}
                          </div>

                          {/* Category with Lucide Icon */}
                          <div className="profile-listing-meta-row">
                            {getCategoryIcon(listing.category_id || listing.category?.slug)}
                            <span>{listing.category?.name || listing.category_id || 'Campus Item'}</span>
                          </div>

                          {/* Footer: Location & Counts */}
                          <div className="profile-listing-footer">
                            <span className="profile-listing-location">
                              <MapPin size={12} />
                              <span>{listing.location ? listing.location.split(',')[0] : 'LPU'}</span>
                            </span>

                            <div className="profile-listing-counts">
                              <span className="profile-listing-count-item" title={`${listing.views_count || 0} views`}>
                                <Eye size={12} />
                                <span>{listing.views_count || 0}</span>
                              </span>
                              <span className="profile-listing-count-item" title={`${listing.likes_count || 0} likes`}>
                                <Heart size={12} fill={(listing.likes_count || 0) > 0 ? '#ef4444' : 'none'} color={(listing.likes_count || 0) > 0 ? '#ef4444' : 'currentColor'} />
                                <span>{listing.likes_count || 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <Package size={44} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    No Active Listings
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Have books, electronics, or campus gear you no longer need?
                  </p>
                  <Link to="/sell" className="btn btn-primary btn-sm">
                    Post New Listing
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Sold Items */}
          {activeTab === 'sold' && (
            <div>
              {soldListings.length > 0 ? (
                <div className="profile-listings-grid">
                  {soldListings.map((listing) => {
                    const imageUrl = listing.images?.[0]?.image_url || '';

                    return (
                      <div key={listing.id} className="profile-listing-item" style={{ opacity: 0.85 }}>
                        <div className="profile-listing-img-container">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              className="profile-listing-img"
                              loading="lazy"
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8'
                            }}>
                              <Package size={28} />
                            </div>
                          )}
                          <span className="profile-listing-status-badge sold">
                            <span>Sold</span>
                          </span>
                        </div>

                        <div className="profile-listing-content">
                          <h4 className="profile-listing-title" title={listing.title}>
                            {listing.title}
                          </h4>
                          <div className="profile-listing-price" style={{ color: 'var(--text-muted)' }}>
                            ₹ {listing.price.toLocaleString('en-IN')}
                          </div>
                          <div className="profile-listing-meta-row">
                            {getCategoryIcon(listing.category_id || listing.category?.slug)}
                            <span>{listing.category?.name || listing.category_id || 'Item'}</span>
                          </div>
                          <div className="profile-listing-footer">
                            <span className="profile-listing-location">
                              <MapPin size={12} />
                              <span>{listing.location ? listing.location.split(',')[0] : 'LPU'}</span>
                            </span>
                            <div className="profile-listing-counts">
                              <span className="profile-listing-count-item" title={`${listing.views_count || 0} views`}>
                                <Eye size={12} />
                                <span>{listing.views_count || 0}</span>
                              </span>
                              <span className="profile-listing-count-item" title={`${listing.likes_count || 0} likes`}>
                                <Heart size={12} fill={(listing.likes_count || 0) > 0 ? '#ef4444' : 'none'} color={(listing.likes_count || 0) > 0 ? '#ef4444' : 'currentColor'} />
                                <span>{listing.likes_count || 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
                  <ShoppingCart size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    No Sold Items Yet
                  </h4>
                  <p style={{ fontSize: '0.875rem' }}>
                    Items you mark as sold will be safely recorded here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Saved Items */}
          {activeTab === 'saved' && (
            <div>
              {savedListings.length > 0 ? (
                <div className="profile-listings-grid">
                  {savedListings.map((listing) => {
                    const imageUrl = listing.images?.[0]?.image_url || '';

                    return (
                      <Link 
                        key={listing.id} 
                        to={`/product/${listing.id}`}
                        className="profile-listing-item"
                      >
                        <div className="profile-listing-img-container">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              className="profile-listing-img"
                              loading="lazy"
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8'
                            }}>
                              <Package size={28} />
                            </div>
                          )}
                          <span className="profile-listing-status-badge">
                            <Heart size={11} fill="#ef4444" color="#ef4444" />
                            <span>Saved</span>
                          </span>
                        </div>

                        <div className="profile-listing-content">
                          <h4 className="profile-listing-title" title={listing.title}>
                            {listing.title}
                          </h4>
                          <div className="profile-listing-price">
                            ₹ {listing.price.toLocaleString('en-IN')}
                          </div>
                          <div className="profile-listing-meta-row">
                            {getCategoryIcon(listing.category_id || listing.category?.slug)}
                            <span>{listing.category?.name || listing.category_id || 'Item'}</span>
                          </div>
                          <div className="profile-listing-footer">
                            <span className="profile-listing-location">
                              <MapPin size={12} />
                              <span>{listing.location ? listing.location.split(',')[0] : 'LPU'}</span>
                            </span>
                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.725rem' }}>
                              View Item →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <Heart size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    No Saved Items
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Click the heart icon on any product in the marketplace to save it.
                  </p>
                  <Link to="/search" className="btn btn-outline btn-sm">
                    Explore Marketplace
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          5. EDIT PROFILE MODAL / DRAWER
          ============================================================ */}
      {isEditingProfile && (
        <div 
          className="profile-modal-backdrop"
          onClick={handleCloseModal}
        >
          <div 
            className="profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Edit Profile</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="profile-modal-close-btn"
                aria-label="Close edit profile"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="profile-modal-body">
              {/* Profile Avatar Upload / Preview */}
              <div className="profile-modal-avatar-section">
                <div 
                  className="profile-modal-avatar-wrapper"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to choose a new photo"
                >
                  <img
                    src={avatarPreviewUrl || getSafeAvatarUrl(editAvatarUrl || profile?.avatar_url)}
                    alt="Preview"
                    className="profile-modal-avatar-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_AVATAR_URL) {
                        target.src = DEFAULT_AVATAR_URL;
                      }
                    }}
                  />
                  <div className="profile-modal-avatar-badge">
                    <Camera size={14} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="profile-modal-avatar-hint"
                  style={{ background: 'none', border: 'none' }}
                >
                  Change Profile Photo
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />

                {/* Optional secondary URL input toggle */}
                <button
                  type="button"
                  onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.725rem',
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  {showAvatarUrlInput ? 'Hide image URL field' : 'Or enter image link'}
                </button>

                {showAvatarUrlInput && (
                  <div style={{ width: '100%', marginTop: '0.5rem' }}>
                    <input
                      type="url"
                      className="profile-form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="profile-form-group">
                <label className="profile-form-label">Full Name</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Vishal Yadav"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="profile-form-group">
                <label className="profile-form-label">Phone Number</label>
                <input
                  type="tel"
                  className="profile-form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 7388583656"
                />
              </div>

              {/* Bio */}
              <div className="profile-form-group">
                <label className="profile-form-label">Bio</label>
                <textarea
                  className="profile-form-textarea"
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell campus buyers & sellers about yourself..."
                />
              </div>

              {/* Hostel Information */}
              <div className="profile-form-group">
                <label className="profile-form-label">Hostel Information</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editHostel}
                  onChange={(e) => setEditHostel(e.target.value)}
                  placeholder="e.g. Block 11, Room 204"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="profile-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="profile-modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="profile-modal-save-btn"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
