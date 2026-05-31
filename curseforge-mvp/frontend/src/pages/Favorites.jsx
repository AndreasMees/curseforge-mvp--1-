import React, { useState, useEffect } from 'react';
import { api } from '../api';

function Favorites({ user, onToast }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      console.log('📥 Loading favorites...');
      const data = await api.getFavorites();
      console.log('✅ Favorites data:', data);
      console.log('📊 Number of favorites:', data.length);
      setFavorites(data);
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      onToast('Failed to load favorites: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (modId, e) => {
    e.stopPropagation();
    try {
      await api.removeFromFavorites(modId);
      onToast('Removed from favorites', 'success');
      loadFavorites(); // Reload after removal
    } catch (error) {
      onToast('Failed to remove', 'error');
    }
  };

  // Kui kasutaja pole sisse loginud
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>🔒 Please login to see your favorites</h2>
        <p>Sign in to save and manage your favorite mods!</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#f1641e',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  // Laadimise ajal
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading favorites...</p>
      </div>
    );
  }

  // Kui lemmikud puuduvad
  if (favorites.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>❤️ No favorites yet</h2>
        <p>Click the heart button (❤️) on any mod to save it here!</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#f1641e',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Browse Mods
        </button>
      </div>
    );
  }

  // Kuva lemmikud
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <h1>❤️ My Favorites</h1>
      <p style={{ color: '#8b8f95', marginBottom: '2rem' }}>
        {favorites.length} saved mod{favorites.length !== 1 ? 's' : ''}
      </p>

      <div className="mods-grid">
        {favorites.map((fav) => (
          <div key={fav.id} className="mod-card" style={{ position: 'relative' }}>
            <div className="mod-image">
              {fav.mod_logo_url ? (
                <img src={fav.mod_logo_url} alt={fav.mod_name} className="mod-logo" />
              ) : (
                <div className="mod-image-placeholder">📦</div>
              )}
            </div>
            <div className="mod-content">
              <h3 className="mod-title">{fav.mod_name}</h3>
              <p className="mod-description">
                Saved on {new Date(fav.created_at).toLocaleDateString()}
              </p>
              <div className="mod-meta">
                <span className="mod-author">👤 {fav.mod_author || 'Unknown'}</span>
              </div>
              <div className="mod-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.curseforge.com/minecraft/mc-mods/${fav.mod_id}`, '_blank');
                  }} 
                  className="download-btn"
                >
                  ⬇️ View on CurseForge
                </button>
                <button 
                  onClick={(e) => removeFromFavorites(fav.mod_id, e)} 
                  className="delete-btn"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;