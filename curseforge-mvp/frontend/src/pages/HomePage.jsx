import React, { useState, useEffect } from 'react';
import { api } from '../api';

function Homepage({ onGameClick, onBrowseClick }) {
  const [gameStats, setGameStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getGameStats();
        setGameStats(stats);
      } catch (error) {
        console.error('Error fetching game stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const featuredGames = [
    { 
      id: 'minecraft', 
      name: 'MINECRAFT', 
      image: '/images/games/download (1).jpg',
      bgColor: '#5e7c16'
    },
    { 
      id: 'wow', 
      name: 'WORLD OF WARCRAFT', 
      image: '/images/games/download (2).jpg',
      bgColor: '#0078ff'
    },
    { 
      id: 'ark', 
      name: 'ARK SURVIVAL ASCENDED', 
      image: '/images/games/download.jpg',
      bgColor: '#2c8c5a'
    },
    { 
      id: 'inzoi', 
      name: 'INZOI', 
      image: '/images/games/download (4).jpg',
      bgColor: '#9b59b6'
    },
    { 
      id: 'hytale', 
      name: 'HYTALE', 
      image: '/images/games/download (3).jpg',
      bgColor: '#ff6b35'
    }
  ];

  return (
    <div className="homepage">
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
              <div className="stat-label">TOTAL MODS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">100B+</div>
              <div className="stat-label">DOWNLOADS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">134K</div>
              <div className="stat-label">AUTHORS</div>
            </div>
            <div className="home-stat">
              <div className="stat-number">$20M+</div>
              <div className="stat-label">PAID TO CREATORS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="featured-games">
        <h2>Most Popular Games</h2>
        <div className="featured-grid">
          {featuredGames.map((game) => {
            const stats = gameStats[game.id] || { modCount: 0, downloads: 0 };
            return (
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
                    <span>Mods: {formatNumber(stats.modCount)}</span>
                    <span>Downloads: {formatNumber(stats.downloads)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-cta">
        <div className="cta-content">
          <h2>Ready to start modding?</h2>
          <p>Join millions of creators and players on CurseForge</p>
          <button onClick={onBrowseClick} className="cta-button">
            Browse All Mods
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;