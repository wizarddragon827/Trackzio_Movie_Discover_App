import React, { useState } from 'react';
import { Star, Heart, Film, Play } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function MovieCard({ movie, onOpenDetails, onOpenTrailer }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const inWishlist = isInWishlist(movie.id);
  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';
  const primaryGenre =
    movie.genres && movie.genres.length > 0
      ? movie.genres[0].name || movie.genres[0]
      : '';

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(movie);
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    if (onOpenTrailer && movie.trailerKey) {
      onOpenTrailer(movie.trailerKey);
    } else {
      onOpenDetails(movie.id);
    }
  };

  return (
    <div
      className="movie-card"
      onClick={() => onOpenDetails(movie.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenDetails(movie.id);
        }
      }}
    >
      {/* Poster Wrapper */}
      <div className="poster-wrapper">
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="poster-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="poster-fallback">
            <Film size={36} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{movie.title}</span>
          </div>
        )}

        {/* Rating Badge */}
        {movie.voteAverage > 0 && (
          <div className="card-rating-badge">
            <Star size={12} fill="currentColor" />
            <span>{movie.voteAverage}</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`card-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistClick}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Trailer Play Overlay Button */}
        {movie.trailerKey && (
          <button
            className="card-quick-play-btn"
            onClick={handleTrailerClick}
            title="Watch Trailer"
            aria-label="Watch Trailer"
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Info & Streaming Badges */}
      <div className="card-info">
        <h3 className="card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="card-meta">
          <span>{year || '—'}</span>
          {primaryGenre && <span className="card-genre">{primaryGenre}</span>}
        </div>

        {/* Streaming Providers Pills */}
        {movie.providers && movie.providers.length > 0 && (
          <div className="card-providers-row">
            {movie.providers.slice(0, 2).map((prov) => (
              <span key={prov} className={`provider-badge provider-${prov.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                {prov}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
