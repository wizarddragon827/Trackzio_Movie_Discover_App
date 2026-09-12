import React from 'react';
import { Play, Heart, Star, Calendar, Clock, Info } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function HeroBanner({ movie, onOpenDetails, onOpenTrailer }) {
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!movie) return null;

  const inWishlist = isInWishlist(movie.id);
  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';

  return (
    <section className="hero-banner">
      {/* Backdrop */}
      {movie.backdropUrl ? (
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="hero-backdrop-img"
        />
      ) : (
        <div className="hero-backdrop-img" style={{ background: '#101726' }} />
      )}
      <div className="hero-overlay" />

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-tag">Featured Spotlight</div>
        <h1 className="hero-title">{movie.title}</h1>

        <div className="hero-meta">
          {movie.voteAverage > 0 && (
            <div className="hero-rating-badge">
              <Star size={15} fill="currentColor" />
              <span>{movie.voteAverage}</span>
            </div>
          )}
          {year && (
            <div className="hero-meta-item">
              <Calendar size={15} />
              <span>{year}</span>
            </div>
          )}
          {movie.runtime && (
            <div className="hero-meta-item">
              <Clock size={15} />
              <span>{movie.runtime}m</span>
            </div>
          )}
          {movie.genres && movie.genres.length > 0 && (
            <div className="hero-genres">
              {movie.genres.slice(0, 3).map((g) => (
                <span key={g.id || g} className="genre-pill-sm">
                  {g.name || g}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="hero-overview">{movie.overview}</p>

        <div className="hero-buttons">
          {movie.trailerKey && (
            <button
              className="btn-primary"
              onClick={() => onOpenTrailer(movie.trailerKey)}
              id="hero-watch-trailer-btn"
            >
              <Play size={18} fill="currentColor" />
              <span>Watch Trailer</span>
            </button>
          )}

          <button
            className={`btn-secondary ${inWishlist ? 'in-wishlist' : ''}`}
            onClick={() => toggleWishlist(movie)}
            id="hero-wishlist-toggle-btn"
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => onOpenDetails(movie.id)}
            title="More Information"
          >
            <Info size={18} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </section>
  );
}
