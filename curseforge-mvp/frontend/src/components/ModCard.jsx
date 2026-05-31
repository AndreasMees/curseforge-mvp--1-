import React from 'react';
import { api } from '../api';

function ModCard({ mod, user, onToast, onClick }) {
  const handleDownload = (e) => {
    e.stopPropagation();
    try {
      // This will trigger direct download from CurseForge CDN
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
          <div className="mod-image-placeholder">
            📦
          </div>
        )}
      </div>
      <div className="mod-content">
        <h3 className="mod-title">{mod.name}</h3>
        <p className="mod-description">
          {mod.description?.substring(0, 120)}...
        </p>
        <div className="mod-meta">
          <span className="mod-author">👤 {mod.author_name}</span>
          <span className="mod-downloads">📥 {mod.downloads?.toLocaleString()}</span>
          <span className="mod-version">📦 {mod.version}</span>
        </div>
        <div className="mod-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleDownload} className="download-btn">
            ⬇️ Download Mod
          </button>
          {user && mod.author_name === user.username && (
            <button onClick={handleDelete} className="delete-btn">
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModCard;