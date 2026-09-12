import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../lib/database.types';
import { getCategory3DIcon, getCategoryBgTint } from '../icons/Category3DIcons';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected, onClick }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(0.75rem, 2.5vw, 1rem) clamp(0.5rem, 2vw, 0.75rem)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: selected ? 'var(--primary-light)' : 'var(--bg-surface)',
        border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-subtle)'}`,
        boxShadow: selected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        textAlign: 'center',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0
      }}
      className="category-card-hover"
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {/* Responsive 3D Icon Container */}
      <div 
        className="category-card-icon-box"
        style={{
          width: '100%',
          height: 'clamp(64px, 17vw, 84px)',
          borderRadius: '12px',
          backgroundColor: selected ? 'rgba(13, 148, 136, 0.14)' : getCategoryBgTint(category.id || category.icon || category.slug, category.name),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.65rem',
          transition: 'all var(--transition-fast)',
          overflow: 'hidden',
          padding: '4px',
          boxSizing: 'border-box'
        }}
      >
        {getCategory3DIcon(category.id || category.icon || category.slug, category.name, 68)}
      </div>

      {/* Category Name */}
      <span style={{
        fontSize: 'clamp(0.78rem, 2.3vw, 0.875rem)',
        fontWeight: 600,
        color: selected ? 'var(--primary)' : 'var(--text-primary)',
        lineHeight: 1.25,
        marginBottom: '0.2rem',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        width: '100%',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {category.name}
      </span>

      {/* Item Count */}
      {category.itemCount !== undefined && (
        <span style={{ fontSize: 'clamp(0.625rem, 1.8vw, 0.6875rem)', color: 'var(--text-muted)' }}>
          {category.itemCount} items
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} style={{ height: '100%', width: '100%', minWidth: 0 }}>
        {content}
      </div>
    );
  }

  return (
    <Link to={`/search?category=${category.id}`} style={{ textDecoration: 'none', height: '100%', width: '100%', minWidth: 0, display: 'block' }}>
      {content}
    </Link>
  );
};
