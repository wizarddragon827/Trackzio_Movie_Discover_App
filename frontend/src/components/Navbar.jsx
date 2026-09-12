import React from 'react';
import { Film, Search, X, Heart, Compass, Award, Dices } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ViewModeToggle from './ViewModeToggle';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenSurpriseMe,
  viewMode,
  setViewMode,
}) {
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <a
          href="#"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('discover');
            setSearchQuery('');
          }}
        >
          <div className="brand-icon">
            <Film size={22} />
          </div>
          <div className="brand-name">
            Trackzio<span>Cinema</span>
          </div>
        </a>

        {/* Search input with debounced typing & clear */}
        <div className="search-wrapper">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchSubmit) onSearchSubmit(searchQuery);
            }}
          >
            <div className="search-input-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                id="movie-search-input"
                className="search-input"
                placeholder="Search 120+ movies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === 'wishlist') {
                    // stay in wishlist
                  } else if (activeTab !== 'discover') {
                    setActiveTab('discover');
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Navigation Actions */}
        <nav className="nav-actions">
          {/* View Mode Switcher (Desktop vs Mobile) */}
          <ViewModeToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            className="navbar-view-toggle"
          />

          {/* Surprise Me Roulette button */}
          <button
            className="btn-surprise-me-nav"
            onClick={onOpenSurpriseMe}
            id="nav-surprise-btn"
            title="Random Movie Roulette"
          >
            <Dices size={16} />
            <span>Surprise Me</span>
          </button>

          {/* Discover Tab */}
          <button
            className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Compass size={18} />
            <span>Discover</span>
          </button>

          {/* Collections / Playlists Tab */}
          <button
            className={`nav-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
            id="nav-collections-btn"
          >
            <Award size={18} />
            <span>Playlists</span>
          </button>

          {/* Wishlist Tab */}
          <button
            className={`nav-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
            id="nav-wishlist-btn"
          >
            <Heart
              size={18}
              fill={activeTab === 'wishlist' ? 'currentColor' : 'none'}
            />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="wishlist-badge">{wishlistCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
