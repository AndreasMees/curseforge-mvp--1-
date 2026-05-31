import React, { useState, useEffect } from 'react';
import { api } from './api';
import ModCard from './components/ModCard';
import ModModal from './components/ModModal';
import Nav from './components/Nav';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import Favorites from './pages/Favorites';
import Homepage from './pages/Homepage';
import AutocompleteSearch from './components/AutocompleteSearch';
import CategoryFilters from './components/CategoryFilters';
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
  const [selectedMod, setSelectedMod] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');

  console.log('Current view:', currentView);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
  }, []);

  useEffect(() => {
    if (currentView === 'browse') {
      setCurrentPage(1);
      loadMods(1);
    }
  }, [selectedGame, searchQuery, sortBy, selectedCategory, currentView]);

  const loadMods = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.getMods({
        game: selectedGame,
        q: searchQuery,
        sort: sortBy,
        page: page,
        limit: 50,
        category: selectedCategory
      });
      
      setMods(response.mods || []);
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.totalPages || 1);
      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error('Viga:', error);
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
    setCurrentView('home');
  };

  const handleGameClick = (gameId) => {
    setSelectedGame(gameId);
    setCurrentView('browse');
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

  // HOME PAGE VIEW
  if (currentView === 'home') {
    console.log('Showing HOMEPAGE');
    return (
      <>
        <Nav 
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onFavoritesClick={() => setCurrentView('favorites')}
          onBrowseClick={() => setCurrentView('browse')}
          onHomeClick={() => setCurrentView('home')}
          currentView={currentView}
        />
        <Homepage 
          onGameClick={handleGameClick}
          onBrowseClick={() => setCurrentView('browse')}
        />
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
      </>
    );
  }

  // FAVORITES PAGE VIEW
  if (currentView === 'favorites') {
    console.log('Showing FAVORITES');
    return (
      <>
        <Nav 
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onFavoritesClick={() => setCurrentView('favorites')}
          onBrowseClick={() => setCurrentView('browse')}
          onHomeClick={() => setCurrentView('home')}
          currentView={currentView}
        />
        <Favorites user={user} onToast={showToast} />
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
      </>
    );
  }

  // BROWSE PAGE VIEW
  console.log('Showing BROWSE page');
  return (
    <div className="app">
      <Nav 
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onFavoritesClick={() => setCurrentView('favorites')}
        onBrowseClick={() => setCurrentView('browse')}
        onHomeClick={() => setCurrentView('home')}
        currentView={currentView}
      />
      
      <div className="hero">
        <div className="hero-content">
          <h1>Explore <span className="highlight">{games.find(g => g.id === selectedGame)?.name || 'Minecraft'}</span> Mods</h1>
          <p>Discover, download, and share the best mods for your favorite games</p>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">500K+</div>
              <div className="stat-label">MODS</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100B+</div>
              <div className="stat-label">DOWNLOADS</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">134K</div>
              <div className="stat-label">AUTHORS</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-section">
        <AutocompleteSearch 
          onSearch={(query) => {
            setSearchQuery(query);
            loadMods(1);
          }}
          onGameClick={handleGameClick}
        />
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
      
      <CategoryFilters onCategoryChange={setSelectedCategory} />
      
      <div className="filters-bar">
        <div className="filters-left">
          <span className="results-count">{mods.length} mods on page {currentPage}</span>
        </div>
        <div className="filters-right">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="new">Newest</option>
            <option value="downloads">Most Downloads</option>
          </select>
        </div>
      </div>
      
      <div className="mods-container">
        <div className="mods-grid">
          {mods.map(mod => (
            <ModCard 
              key={mod.id} 
              mod={mod} 
              user={user} 
              onToast={showToast}
              onClick={() => setSelectedMod(mod)}
            />
          ))}
        </div>
      </div>
      
      {!loading && mods.length > 0 && (
        <>
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn">
              <span>←</span>
              <span>Previous</span>
            </button>
            <div className="page-numbers">
              {currentPage > 2 && <button onClick={() => goToPage(1)} className="page-btn">1</button>}
              {currentPage > 3 && <span className="page-dots">•••</span>}
              {currentPage > 1 && <button onClick={() => goToPage(currentPage - 1)} className="page-btn">{currentPage - 1}</button>}
              <button className="page-btn active">{currentPage}</button>
              {hasMore && <button onClick={() => goToPage(currentPage + 1)} className="page-btn">{currentPage + 1}</button>}
              {hasMore && currentPage + 2 <= totalPages && <button onClick={() => goToPage(currentPage + 2)} className="page-btn">{currentPage + 2}</button>}
              {hasMore && currentPage + 3 <= totalPages && <span className="page-dots">•••</span>}
            </div>
            <button onClick={nextPage} disabled={!hasMore} className="pagination-btn">
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
          <div className="pagination-info">
            Showing {mods.length} mods on page {currentPage}
          </div>
        </>
      )}
      
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading mods...</p>
        </div>
      )}
      
      {!loading && mods.length === 0 && (
        <div className="no-results">
          <h3>No mods found</h3>
          <p>Try different search terms or browse another category</p>
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
      
      {selectedMod && (
        <ModModal 
          mod={selectedMod} 
          onClose={() => setSelectedMod(null)} 
          onToast={showToast}
        />
      )}
    </div>
  );
}

export default App;