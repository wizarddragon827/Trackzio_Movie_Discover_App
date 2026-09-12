import React from 'react';
import { Compass, Award, Heart, Dices } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenSurpriseMe,
}) {
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {/* Discover Tab */}
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => setActiveTab('discover')}
      >
        <Compass size={20} />
        <span>Discover</span>
      </button>

      {/* Playlists Tab */}
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'collections' ? 'active' : ''}`}
        onClick={() => setActiveTab('collections')}
      >
        <Award size={20} />
        <span>Playlists</span>
      </button>

      {/* Surprise Me Roulette button */}
      <button
        type="button"
        className="mobile-nav-item surprise-item"
        onClick={onOpenSurpriseMe}
        title="Surprise Me Roulette"
      >
        <div className="mobile-surprise-icon-wrap">
          <Dices size={20} />
        </div>
        <span>Surprise</span>
      </button>

      {/* Wishlist Tab */}
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
        onClick={() => setActiveTab('wishlist')}
      >
        <div className="mobile-wishlist-icon-wrap">
          <Heart
            size={20}
            fill={activeTab === 'wishlist' ? 'currentColor' : 'none'}
          />
          {wishlistCount > 0 && (
            <span className="mobile-nav-badge">{wishlistCount}</span>
          )}
        </div>
        <span>Wishlist</span>
      </button>
    </nav>
  );
}
