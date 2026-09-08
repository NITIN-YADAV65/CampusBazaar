import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Cpu, 
  Smartphone, 
  Laptop, 
  Bike, 
  Armchair, 
  Home, 
  Shirt, 
  Trophy, 
  Watch, 
  Car, 
  Package 
} from 'lucide-react';
import type { Category } from '../../lib/database.types';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected, onClick }) => {
  const getCategoryIcon = (iconName: string) => {
    const props = { size: 24 };
    switch (iconName) {
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'Bike': return <Bike {...props} />;
      case 'Armchair': return <Armchair {...props} />;
      case 'Home': return <Home {...props} />;
      case 'Shirt': return <Shirt {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Watch': return <Watch {...props} />;
      case 'Car': return <Car {...props} />;
      default: return <Package {...props} />;
    }
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem 0.75rem',
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
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        backgroundColor: selected ? 'var(--primary)' : 'var(--primary-light)',
        color: selected ? '#ffffff' : 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem',
        transition: 'all var(--transition-fast)'
      }}>
        {getCategoryIcon(category.icon)}
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
