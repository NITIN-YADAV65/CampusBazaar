import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  PackageSearch,
  Filter
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, categories } = useMarketplace();

  // URL search query parameters
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state if URL search query changes
  React.useEffect(() => {
    if (searchParams.get('q') !== null) {
      setQuery(searchParams.get('q') || '');
    }
    if (searchParams.get('category') !== null) {
      setSelectedCategory(searchParams.get('category') || '');
    }
  }, [searchParams]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Status filter: only active listings appear in search/explore
      if (item.status !== 'active') return false;

      // Keyword search (title + description + location)
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
      }

      // Category filter
      if (selectedCategory && item.category_id !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }

      // Price filter
      const price = Number(item.price);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'lowest_price') return a.price - b.price;
      if (sortBy === 'highest_price') return b.price - a.price;
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [listings, query, selectedCategory, selectedCondition, minPrice, maxPrice, sortBy]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Search Header Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flex: '1 1 200px',
          minWidth: 0,
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-full)',
          padding: '0.625rem 1.25rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <SearchIcon size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by title, keyword, or campus location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
              minWidth: 0
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort by dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-md)' }}
          >
            <option value="newest">Newest First</option>
            <option value="lowest_price">Price: Low to High</option>
            <option value="highest_price">Price: High to Low</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            className="btn btn-outline btn-sm mobile-only-nav"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <SlidersHorizontal size={16} />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }} className="search-layout">
        {/* Left Sidebar Filters */}
        <aside 
          className={`search-sidebar ${!showMobileFilters ? 'search-sidebar-hidden-mobile' : ''}`}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            position: 'sticky',
            top: '90px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Filter Results</h3>
            </div>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.875rem' }}
            >
              <option value="">All Categories ({listings.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
              Item Condition
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['all', 'New', 'Like New', 'Good', 'Used'].map((cond) => (
                <label
                  key={cond}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: selectedCondition === cond ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: selectedCondition === cond ? 600 : 400
                  }}
                >
                  <input
                    type="radio"
                    name="conditionFilter"
                    value={cond}
                    checked={selectedCondition === cond}
                    onChange={() => setSelectedCondition(cond)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{cond === 'all' ? 'All Conditions' : cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
              Price Range (₹)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main>
          {/* Header summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredListings.length}</strong> items
              {selectedCategory && (
                <span> in <strong style={{ color: 'var(--primary)' }}>{categories.find(c => c.id === selectedCategory)?.name}</strong></span>
              )}
            </span>

            {(selectedCategory || selectedCondition !== 'all' || minPrice || maxPrice || query) && (
              <button
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                Clear all active filters
              </button>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {filteredListings.length > 0 ? (
            <div className="grid-listings">
              {filteredListings.map((listing) => (
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <PackageSearch size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No products found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '380px', marginBottom: '1.5rem' }}>
                Try changing your search keywords or easing your price/condition filters to see more results.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
