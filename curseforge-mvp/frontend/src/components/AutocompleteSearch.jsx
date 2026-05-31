import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';

function AutocompleteSearch({ onSearch, onGameClick }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await api.getAutocompleteSuggestions(query);
        setSuggestions(results.slice(0, 8));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <div className="autocomplete-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for mods..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
        />
        {loading && <div className="search-loading"></div>}
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((mod) => (
            <div
              key={mod.id}
              className="autocomplete-item"
              onClick={() => handleSuggestionClick(mod)}
            >
              {mod.logo_url && (
                <img src={mod.logo_url} alt={mod.name} className="autocomplete-icon" />
              )}
              <div className="autocomplete-info">
                <div className="autocomplete-name">{mod.name}</div>
                <div className="autocomplete-meta">
                  Author: {mod.author_name}  Downloads: {mod.downloads.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AutocompleteSearch;