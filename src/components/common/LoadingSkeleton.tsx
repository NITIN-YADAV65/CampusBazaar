import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ width: '100%', height: '210px', borderRadius: 0 }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <div className="skeleton" style={{ width: '40%', height: '22px' }} />
        <div className="skeleton" style={{ width: '85%', height: '18px' }} />
        <div className="skeleton" style={{ width: '60%', height: '14px' }} />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '50px' }} />
          <div className="skeleton" style={{ width: '50px', height: '16px' }} />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid-listings">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
