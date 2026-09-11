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
        justifyContent: 'center',
        padding: '1rem 0.75rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: selected ? 'var(--primary-light)' : 'var(--bg-surface)',
        border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-subtle)'}`,
        boxShadow: selected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        textAlign: 'center',
        height: '100%'
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
      <div style={{
        width: '100%',
        height: '84px',
        borderRadius: '14px',
        backgroundColor: selected ? 'rgba(13, 148, 136, 0.14)' : getCategoryBgTint(category.id || category.icon || category.slug, category.name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem',
        transition: 'all var(--transition-fast)',
        overflow: 'hidden'
      }}>
        {getCategory3DIcon(category.id || category.icon || category.slug, category.name, 72)}
      </div>

      <span style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: selected ? 'var(--primary)' : 'var(--text-primary)',
        lineHeight: 1.25,
        marginBottom: '0.2rem'
      }}>
        {category.name}
      </span>

      {category.itemCount !== undefined && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {category.itemCount} items
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} style={{ height: '100%' }}>
        {content}
      </div>
    );
  }

  return (
    <Link to={`/search?category=${category.id}`} style={{ textDecoration: 'none', height: '100%' }}>
      {content}
    </Link>
  );
};
