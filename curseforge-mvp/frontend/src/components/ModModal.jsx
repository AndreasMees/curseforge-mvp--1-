import React, { useState, useEffect } from 'react';
import { api } from '../api';

function ModModal({ mod, onClose, onToast }) {
  const [description, setDescription] = useState('');
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModDetails();
  }, [mod.id]);

  const loadModDetails = async () => {
    setLoading(true);
    try {
      const [descData, galleryData] = await Promise.all([
        api.getModDescription(mod.id),
        api.getModGallery(mod.id)
      ]);
      
      setDescription(descData.description || 'No description available');
      setGallery(galleryData.gallery || []);
      setError(null);
    } catch (err) {
      console.error('Error loading mod details:', err);
      setError('Failed to load mod details');
      setDescription(mod.description || 'No description available');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (mod.curseforge_url) {
      window.open(mod.curseforge_url, '_blank');
      onToast('Opening CurseForge...', 'success');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          {mod.logo_url && (
            <img src={mod.logo_url} alt={mod.name} className="modal-logo" />
          )}
          <div className="modal-header-info">
            <h2>{mod.name}</h2>
            <div className="modal-meta">
              <span className="meta-author">👤 {mod.author_name}</span>
              <span className="meta-downloads">📥 {mod.downloads?.toLocaleString() || 0}</span>
              <span className="meta-version">📦 {mod.version || 'Latest'}</span>
            </div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="modal-gallery">
            <div className="gallery-main">
              <img 
                src={gallery[activeImage]?.url} 
                alt={gallery[activeImage]?.title || mod.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="gallery-thumbnails">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${activeImage === idx ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img.thumbnail || img.url} alt={`Screenshot ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="modal-loading">
            <div className="spinner-small"></div>
            <p>Loading mod details...</p>
          </div>
        )}

        {!loading && (
          <div className="modal-description">
            <h3>Description</h3>
            <div className="description-content">
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p>{mod.description || 'No description available'}</p>
              )}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="modal-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-download-btn" onClick={handleDownload}>
            📥 Download from CurseForge
          </button>
          <button className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModModal;