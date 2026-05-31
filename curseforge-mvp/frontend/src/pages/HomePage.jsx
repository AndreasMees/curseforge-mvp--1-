import React from 'react';

function Homepage({ onGameClick, onBrowseClick }) {
  const featuredGames = [
    { 
      id: 'minecraft', 
      name: 'MINECRAFT', 
      mods: '282.1K', 
      downloads: '114.1B', 
      image: '/images/games/download (1).jpg',
      bgColor: '#5e7c16'
    },
    { 
      id: 'wow', 
      name: 'WORLD OF WARCRAFT', 
      mods: '22.5K', 
      downloads: '9.3B', 
      image: '/images/games/download (2).jpg',
      bgColor: '#0078ff'
    },
    { 
      id: 'hytale', 
      name: 'HYTALE', 
      mods: '5.9K', 
      downloads: '26.7M', 
      image: '/images/games/download (3).jpg',
      bgColor: '#ff6b35'
    },
    { 
      id: 'ark', 
      name: 'ARK SURVIVAL ASCENDED', 
      mods: '6.4K', 
      downloads: '1.2B', 
      image: '/images/games/download.jpg',
      bgColor: '#2c8c5a'
    },
    { 
      id: 'inzoi', 
      name: 'INZOI', 
      mods: '3.9K', 
      downloads: '25.0M', 
      image: '/images/games/download (4).jpg',
      bgColor: '#9b59b6'
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          <h1>Explore Thousands of <span className="highlight">Legendary Mods</span></h1>
          <p>
            Discover endless mods for your favorite games, or forge your own and share them with millions.<br />
            CurseForge makes modding easy, safe, and rewarding.
          </p>
          <div className="home-stats">
            <div className="home-stat">
              <div className="stat-number">500K+</div>
              <div className="stat-label">MODS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">100B+</div>
              <div className="stat-label">DOWNLOADS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">134K</div>
              <div className="stat-label">MOD AUTHORS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">$20M+</div>
              <div className="stat-label">PAID TO CREATORS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="home-search-section">
        <div className="home-search-container">
          <div className="home-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for a game..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  onBrowseClick();
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Featured Games with Images */}
      <div className="featured-games">
        <h2>Most Popular Games</h2>
        <div className="featured-grid">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="featured-card"
              onClick={() => onGameClick(game.id)}
            >
              <div className="featured-image">
                <img 
                  src={game.image} 
                  alt={game.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x120/1a1e22/ffffff?text=' + game.name.charAt(0);
                  }}
                />
              </div>
              <div className="featured-info">
                <h3>{game.name}</h3>
                <div className="featured-stats">
                  <span>📦 {game.mods} mods</span>
                  <span>📥 {game.downloads} downloads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="home-cta">
        <div className="cta-content">
          <h2>Ready to start modding?</h2>
          <p>Join millions of creators and players on CurseForge</p>
          <button onClick={onBrowseClick} className="cta-button">
            Browse All Mods →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;