import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/product/CategoryCard';
import type { ListingCondition } from '../lib/database.types';

export const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, addListing } = useMarketplace();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('Good');
  const [location, setLocation] = useState('LPU Campus, Phagwara');
  const [contactPreference, setContactPreference] = useState('In-app Chat');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Image handler (max 5 images)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    
    if (images.length + selectedFiles.length > 5) {
      setErrors({ images: 'Maximum 5 images allowed per listing.' });
      return;
    }

    const newImages = [...images, ...selectedFiles].slice(0, 5);
    setImages(newImages);

    // Create preview URLs
    const previews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!selectedCategory) {
        newErrors.category = 'Please choose a category for your item.';
      }
    } else if (step === 2) {
      if (images.length === 0) {
        newErrors.images = 'Please upload at least 1 image of your item.';
      }
    } else if (step === 3) {
      if (!title.trim()) newErrors.title = 'Product title is required.';
      else if (title.length < 5) newErrors.title = 'Title must be at least 5 characters.';
      
      if (!description.trim()) newErrors.description = 'Description is required.';
      else if (description.length < 15) newErrors.description = 'Please provide a clearer description (min 15 chars).';

      if (!price) newErrors.price = 'Price is required.';
      else if (Number(price) < 0) newErrors.price = 'Price cannot be negative.';

      if (!location.trim()) newErrors.location = 'Campus location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5: Publish
  const handlePublish = async () => {
    setIsSubmitting(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + 15 : p));
    }, 200);

    try {
      const { error } = await addListing(
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition,
          category_id: selectedCategory,
          location: location.trim(),
          contact_preference: contactPreference,
        },
        images
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      setCurrentStep(5); // Show success state
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrors({ form: err?.message || 'Failed to publish listing. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryName = categories.find(c => c.id === selectedCategory)?.name || '';

  return (
    <div className="container" style={{ maxWidth: '820px', paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Title & Progress Wizard */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Sell Something on CampusBazaar
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Reach thousands of verified students around Lovely Professional University
        </p>

        {/* Step Indicator */}
        {currentStep < 5 && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1.75rem',
              width: '100%',
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}>
              {[
                { num: 1, label: 'Category' },
                { num: 2, label: 'Photos' },
                { num: 3, label: 'Details' },
                { num: 4, label: 'Preview' }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: currentStep === step.num 
                        ? 'var(--primary)' 
                        : currentStep > step.num 
                          ? 'var(--success)' 
                          : 'var(--bg-muted)',
                      color: currentStep >= step.num ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      transition: 'all var(--transition-fast)',
                      flexShrink: 0
                    }}>
                      {currentStep > step.num ? <Check size={16} /> : step.num}
                    </div>
                    <span className="desktop-only-nav" style={{
                      fontSize: '0.8125rem',
                      fontWeight: currentStep === step.num ? 700 : 500,
                      color: currentStep === step.num ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div style={{
                      flex: '1 1 12px',
                      minWidth: '10px',
                      maxWidth: '42px',
                      height: '2px',
                      backgroundColor: currentStep > step.num ? 'var(--success)' : 'var(--border-strong)'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile active step label */}
            <div className="mobile-only-nav" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
              Step {currentStep} of 4: {[ '', 'Choose Category', 'Add Photos', 'Item Details', 'Preview Listing' ][currentStep]}
            </div>
          </>
        )}
      </div>

      {errors.form && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {errors.form}
        </div>
      )}

      {/* STEP 1: SELECT CATEGORY */}
      {currentStep === 1 && (
        <div className="card" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Step 1: Choose a Category
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Select the category that best matches your item
          </p>

          {errors.category && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {errors.category}
            </p>
          )}

          <div className="grid-categories" style={{ marginBottom: '2rem' }}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                selected={selectedCategory === category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleNext} className="btn btn-primary btn-lg" disabled={!selectedCategory}>
              <span>Continue to Photos</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD UP TO 5 IMAGES */}
      {currentStep === 2 && (
        <div className="card" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Step 2: Add Photos (up to 5)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Good, bright campus photos sell 3x faster. The first photo will be the main display cover.
          </p>

          {errors.images && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {errors.images}
            </p>
          )}

          {/* Upload Dropzone */}
          {images.length < 5 && (
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1.5rem',
              border: '2px dashed var(--primary)',
              backgroundColor: '#f0fdfa',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'background-color 0.2s ease'
            }}>
              <Upload size={36} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Click or drag images to upload
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                PNG, JPG, WEBP up to 5MB each ({5 - images.length} remaining)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {imagePreviews.map((src, index) => (
                <div key={index} style={{
                  position: 'relative',
                  paddingTop: '100%',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <img src={src} alt={`Upload ${index + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {index === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleBack} className="btn btn-outline">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button onClick={handleNext} className="btn btn-primary btn-lg" disabled={images.length === 0}>
              <span>Continue to Details</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS (Title, description, price, condition, location, contact) */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Step 3: Item Details
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Category: <strong>{categoryName}</strong> • {images.length} photo(s) selected
          </p>

          {/* Product Title */}
          <div className="form-group">
            <label className="form-label">Product Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Hero Sprint Cycle with lock / Casio 991EX Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Mention semester, model year, condition details, reasons for selling, and what accessories are included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Price & Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Price in ₹ *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Item Condition *</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
              >
                <option value="New">New (Unopened / Never Used)</option>
                <option value="Like New">Like New (Mint Condition)</option>
                <option value="Good">Good (Minor wear, fully functional)</option>
                <option value="Used">Used (Visible wear, functional)</option>
              </select>
            </div>
          </div>

          {/* Campus Location */}
          <div className="form-group">
            <label className="form-label">Campus Location for Handover *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. UniMall / Boys Hostel BH-4 / Block 34 / Law Gate"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          {/* Contact Preference */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Preference</label>
              <select
                className="form-select"
                value={contactPreference}
                onChange={(e) => setContactPreference(e.target.value)}
              >
                <option value="In-app Chat">In-app Chat (Recommended)</option>
                <option value="Chat or Phone">Chat or Phone</option>
                <option value="Phone Only">Phone Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button onClick={handleBack} className="btn btn-outline">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button onClick={handleNext} className="btn btn-primary btn-lg">
              <span>Preview Listing</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW & PUBLISH */}
      {currentStep === 4 && (
        <div className="card" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Eye size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Step 4: Preview Your Listing
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Review your listing before publishing it to the campus marketplace
          </p>

          {/* Preview Box */}
          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '2rem',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
              <div style={{ backgroundColor: '#0f172a', height: '280px' }}>
                <img
                  src={imagePreviews[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {categoryName}
                    </span>
                    <span className="badge badge-like-new">{condition}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h3>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    ₹{Number(price).toLocaleString('en-IN')}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {description}
                  </p>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span>📍 {location}</span> • <span>Preferred: {contactPreference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar during submit */}
          {isSubmitting && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <span>Uploading images & publishing to Supabase...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: 'var(--primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleBack} className="btn btn-outline" disabled={isSubmitting}>
              <ArrowLeft size={16} />
              <span>Edit Details</span>
            </button>
            <button onClick={handlePublish} className="btn btn-sell btn-lg" disabled={isSubmitting}>
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PUBLISH SUCCESS */}
      {currentStep === 5 && (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Your Listing is Live!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            "<strong>{title}</strong>" is now visible to all students on CampusBazaar. Interested buyers can message you directly.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/profile')} className="btn btn-outline">
              View in My Profile
            </button>
            <button onClick={() => navigate('/search')} className="btn btn-primary">
              Browse Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
