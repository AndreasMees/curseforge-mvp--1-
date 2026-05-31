import React, { useState, useEffect } from 'react';
import { api } from '../api';

function ModModal({ mod, onClose, onToast }) {
  const [description, setDescription] = useState('');
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    loadModDetails();
    loadModFiles();
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

  const loadModFiles = async () => {
    try {
      const filesData = await api.getModFiles(mod.id);
      setFiles(filesData);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleDownload = () => {
    api.downloadMod(mod.id);
    onToast(`Downloading ${mod.name}...`, 'success');
  };

  const handleVersionDownload = (file) => {
    api.downloadSpecificVersion(mod.id, file.id);
    onToast(`Downloading ${file.name}...`, 'success');
    setShowFiles(false);
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

        {/* Version selector */}
        {files.length > 1 && !showFiles && (
          <div style={{ padding: '0 1.5rem' }}>
            <button 
              onClick={() => setShowFiles(true)}
              style={{
                background: '#25292e',
                color: '#f1641e',
                border: '1px solid #f1641e',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              📁 Other versions ({files.length} available)
            </button>
          </div>
        )}

        {showFiles && files.length > 1 && (
          <div className="modal-description">
            <h3>Available Versions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleVersionDownload(file)}
                  style={{
                    background: '#25292e',
                    border: '1px solid #2c3035',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: 'white', fontWeight: '500' }}>{file.name}</div>
                    <div style={{ color: '#8b8f95', fontSize: '0.75rem' }}>
                      Minecraft {file.gameVersion?.[0] || 'Any'}
                    </div>
                  </div>
                  <div style={{ color: '#f1641e' }}>↓ {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </button>
              ))}
              <button 
                onClick={() => setShowFiles(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b8f95',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Hide versions
              </button>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-download-btn" onClick={handleDownload}>
            ⬇️ Download Latest Version
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