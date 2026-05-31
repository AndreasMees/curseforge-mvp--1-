import React, { useState, useEffect } from 'react';
import { api } from './api';
import ModCard from './components/ModCard';
import Nav from './components/Nav';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import './index.css';

function App() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('minecraft');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadMods(1);
  }, [selectedGame, searchQuery, sortBy]);

  const loadMods = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.getMods({
        game: selectedGame,
        q: searchQuery,
        sort: sortBy,
        page: page,
        limit: 50
      });
      
      setMods(response.mods || []);
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.totalPages || 1);
      setHasMore(response.hasMore || false);
      
      console.log(`📄 Loaded page ${response.currentPage}, has more: ${response.hasMore}`);
    } catch (error) {
      console.error('❌ Viga:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadMods(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (hasMore || currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuth = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    showToast(`Tere tulemast, ${userData.username}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    showToast('Oled välja logitud', 'info');
  };

  const games = [
    { id: 'minecraft', name: 'Minecraft', icon: '⛏️' },
    { id: 'wow', name: 'World of Warcraft', icon: '🗡️' },
    { id: 'valheim', name: 'Valheim', icon: '🪓' },
    { id: 'stardew', name: 'Stardew Valley', icon: '🌾' },
    { id: 'skyrim', name: 'Skyrim', icon: '🐉' },
    { id: 'factorio', name: 'Factorio', icon: '🏭' },
    { id: 'rimworld', name: 'RimWorld', icon: '🌍' },
    { id: 'kerbal', name: 'Kerbal Space Program', icon: '🚀' }
  ];

  return (
    <div className="app">
      <Nav 
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <div className="hero">
        <div className="hero-content">
          <h1>Browse <span className="highlight">{games.find(g => g.id === selectedGame)?.name || 'Minecraft'}</span> Mods</h1>
          <p>Discover, download, and share the best mods for your favorite games</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search mods... (e.g., 'dungeons', 'magic', 'tech')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={() => loadMods(1)}>🔍 Search</button>
          </div>
        </div>
      </div>
      
      <div className="game-categories">
        <div className="categories-wrapper">
          {games.map(game => (
            <button
              key={game.id}
              className={`game-category ${selectedGame === game.id ? 'active' : ''}`}
              onClick={() => setSelectedGame(game.id)}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{game.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="filters-bar">
        <div className="filters-left">
          <span className="results-count">{mods.length} mods on page {currentPage}</span>
        </div>
        <div className="filters-right">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">🔥 Most Popular</option>
            <option value="new">🆕 Newest</option>
            <option value="downloads">📥 Most Downloads</option>
          </select>
        </div>
      </div>
      
      <div className="mods-container">
        <div className="mods-grid">
          {mods.map(mod => (
            <ModCard key={mod.id} mod={mod} user={user} onToast={showToast} />
          ))}
        </div>
      </div>
      
      {/* Pagination Component */}
      {!loading && mods.length > 0 && (
        <div className="pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {currentPage > 2 && (
              <button onClick={() => goToPage(1)} className="page-btn">1</button>
            )}
            {currentPage > 3 && <span className="page-dots">...</span>}
            
            {currentPage > 1 && (
              <button onClick={() => goToPage(currentPage - 1)} className="page-btn">
                {currentPage - 1}
              </button>
            )}
            
            <button className="page-btn active">{currentPage}</button>
            
            {hasMore && (
              <button onClick={() => goToPage(currentPage + 1)} className="page-btn">
                {currentPage + 1}
              </button>
            )}
            {hasMore && currentPage + 2 <= totalPages && (
              <button onClick={() => goToPage(currentPage + 2)} className="page-btn">
                {currentPage + 2}
              </button>
            )}
            
            {hasMore && <span className="page-dots">...</span>}
            {hasMore && totalPages > currentPage + 2 && (
              <button onClick={() => goToPage(totalPages)} className="page-btn">
                {totalPages}
              </button>
            )}
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={!hasMore}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
      
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading mods...</p>
        </div>
      )}
      
      {!loading && mods.length === 0 && (
        <div className="no-results">
          <div className="no-results-content">
            <h3>No mods found</h3>
            <p>Try different search terms or browse another category</p>
          </div>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
          onToast={showToast}
        />
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;