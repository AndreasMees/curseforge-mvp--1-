import React from 'react';

function Nav({ user, onAuthClick, onLogout, onFavoritesClick, onBrowseClick, currentView }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={onBrowseClick}>
          <span className="logo-icon">🎮</span>
          <span>Curse<span>Forge</span></span>
        </div>
        <div className="nav-links">
          <a href="#" onClick={onBrowseClick} style={{ color: currentView === 'browse' ? '#f1641e' : '#8b8f95' }}>
            Browse
          </a>
          {user && (
            <a href="#" onClick={onFavoritesClick} style={{ color: currentView === 'favorites' ? '#f1641e' : '#8b8f95' }}>
              My Favorites
            </a>
          )}
          {user ? (
            <div className="user-info">
              <span>👤 {user.username}</span>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <button onClick={onAuthClick} className="auth-btn">Sign In</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;