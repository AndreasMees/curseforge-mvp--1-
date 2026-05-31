import React, { useState, useEffect } from 'react';
import { api } from '../api';

function ModCard({ mod, user, onToast, onClick }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (user) {
      checkFavorite();
      loadCollections();
    }
  }, [user, mod.id]);

  const checkFavorite = async () => {
    try {
      const result = await api.checkFavorite(mod.id);
      console.log(`❤️ Check favorite for ${mod.id}:`, result.isFavorite);
      setIsFavorite(result.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      onToast('Please login to save mods', 'info');
      return;
    }
    
    try {
      if (isFavorite) {
        console.log(`💔 Removing from favorites: ${mod.id}`);
        await api.removeFromFavorites(mod.id);
        setIsFavorite(false);
        onToast('Removed from favorites', 'success');
      } else {
        console.log(`❤️ Adding to favorites: ${mod.id}`, mod);
        await api.addToFavorites(mod.id, mod);
        setIsFavorite(true);
        onToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      onToast(error.message, 'error');
    }
  };

  const handleAddToCollection = async (e, collectionId) => {
    e.stopPropagation();
    try {
      await api.addModToCollection(collectionId, mod.id, mod);
      onToast('Added to collection!', 'success');
      setShowCollectionMenu(false);
    } catch (error) {
      onToast(error.message, 'error');
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    try {
      api.downloadMod(mod.id);
      onToast(`Download started: ${mod.name}`, 'success');
    } catch (error) {
      onToast('Download failed: ' + error.message, 'error');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Kas oled kindel, et soovid selle modi kustutada?')) {
      try {
        await api.deleteMod(mod.id);
        onToast('Mod kustutatud', 'success');
        window.location.reload();
      } catch (error) {
        onToast(error.message, 'error');
      }
    }
  };

  return (
    <div className="mod-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="mod-image">
        {mod.logo_url ? (
          <img src={mod.logo_url} alt={mod.name} className="mod-logo" />
        ) : (
          <div className="mod-image-placeholder">📦</div>
        )}
        <button 
          className={`like-btn ${isFavorite ? 'liked' : ''}`}
          onClick={handleLike}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: isFavorite ? '#ff4444' : 'white',
            transition: 'all 0.2s',
            zIndex: 5
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="mod-content">
        <h3 className="mod-title">{mod.name}</h3>
        <p className="mod-description">{mod.description?.substring(0, 120)}...</p>
        <div className="mod-meta">
          <span className="mod-author">👤 {mod.author_name}</span>
          <span className="mod-downloads">📥 {mod.downloads?.toLocaleString()}</span>
          <span className="mod-version">📦 {mod.version}</span>
        </div>
        <div className="mod-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleDownload} className="download-btn">⬇️ Download</button>
          {user && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCollectionMenu(!showCollectionMenu);
                }}
                className="collection-btn"
              >
                📁 Add to
              </button>
              {showCollectionMenu && collections.length > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  background: '#1a1e22',
                  border: '1px solid #2c3035',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  zIndex: 100,
                  minWidth: '150px'
                }}>
                  {collections.map(col => (
                    <button
                      key={col.id}
                      onClick={(e) => handleAddToCollection(e, col.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {user && mod.author_name === user.username && (
            <button onClick={handleDelete} className="delete-btn">🗑️</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModCard;