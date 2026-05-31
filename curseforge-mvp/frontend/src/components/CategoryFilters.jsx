import React, { useState } from 'react';

function CategoryFilters({ onCategoryChange }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { id: 'all', name: 'All Mods', icon: '🎮', color: '#f1641e' },
    { id: 'combat', name: 'Combat', icon: '⚔️', color: '#e74c3c' },
    { id: 'magic', name: 'Magic', icon: '🔮', color: '#9b59b6' },
    { id: 'tech', name: 'Technology', icon: '🔧', color: '#3498db' },
    { id: 'adventure', name: 'Adventure', icon: '🗺️', color: '#2ecc71' },
    { id: 'building', name: 'Building', icon: '🏗️', color: '#f39c12' },
    { id: 'farming', name: 'Farming', icon: '🌾', color: '#27ae60' },
    { id: 'storage', name: 'Storage', icon: '📦', color: '#1abc9c' },
    { id: 'transport', name: 'Transport', icon: '🚂', color: '#e67e22' },
    { id: 'utility', name: 'Utility', icon: '⚙️', color: '#7f8c8d' },
    { id: 'cosmetic', name: 'Cosmetic', icon: '✨', color: '#e91e63' },
    { id: 'library', name: 'Library', icon: '📚', color: '#34495e' }
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId === 'all' ? '' : categoryId);
  };

  const visibleCategories = expanded ? categories : categories.slice(0, 6);

  return (
    <div className="category-filters">
      <div className="category-filters-header">
        <div className="category-filters-title">
          <span className="category-icon">🏷️</span>
          <span>Filter by Category</span>
        </div>
        <button 
          className="category-expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
      </div>
      <div className="category-buttons">
        {visibleCategories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <span className="category-btn-icon">{cat.icon}</span>
            <span className="category-btn-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilters;