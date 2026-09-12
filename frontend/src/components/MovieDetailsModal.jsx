import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, Clock, Heart, Play, User, Film } from 'lucide-react';
import { api } from '../api/client';
import { useWishlist } from '../context/WishlistContext';

export default function MovieDetailsModal({ movieId, onClose, onOpenTrailer, onSelectMovie }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMovieDetails(movieId);
        if (isMounted) {
          setMovie(data.movie);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load movie details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (movieId) fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movieId) return null;

  const inWishlist = movie ? isInWishlist(movie.id) : false;
  const year = movie?.releaseDate ? movie.releaseDate.split('-')[0] : '';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        {/* Close button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Film size={48} className="empty-icon" style={{ animation: 'spin 2s linear infinite' }} />
            <p>Loading full movie details...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : movie ? (
          <>
            {/* Modal Backdrop */}
            <div className="modal-hero-backdrop">
              {movie.backdropUrl ? (
                <img
                  src={movie.backdropUrl}
                  alt={movie.title}
                  className="modal-backdrop-img"
                />
              ) : (
                <div style={{ background: '#0e1422', width: '100%', height: '100%' }} />
              )}
              <div className="modal-backdrop-fade" />
            </div>

            {/* Modal Content Body */}
            <div className="modal-body">
              <div className="modal-top-row">
                {/* Poster */}
                <div className="modal-poster-wrap">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} />
                  ) : (
                    <div className="poster-fallback">
                      <Film size={32} />
                      <span>{movie.title}</span>
                    </div>
                  )}
                </div>

                {/* Info Column */}
                <div className="modal-info-col">
                  <h2 className="modal-title">{movie.title}</h2>
                  {movie.tagline && <div className="modal-tagline">“{movie.tagline}”</div>}

                  <div className="modal-quick-meta">
                    {movie.voteAverage > 0 && (
                      <div className="hero-rating-badge">
                        <Star size={15} fill="currentColor" />
                        <span>{movie.voteAverage}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          ({movie.voteCount} votes)
                        </span>
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
                    {movie.director && (
                      <div className="hero-meta-item">
                        <User size={15} />
                        <span>Dir: {movie.director}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="hero-genres" style={{ marginBottom: '1.25rem' }}>
                      {movie.genres.map((g) => (
                        <span key={g.id || g} className="genre-pill-sm">
                          {g.name || g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="modal-actions-row">
                    {movie.trailerKey && (
                      <button
                        className="btn-primary"
                        onClick={() => onOpenTrailer(movie.trailerKey)}
                      >
                        <Play size={17} fill="currentColor" />
                        <span>Watch Trailer</span>
                      </button>
                    )}

                    <button
                      className={`btn-secondary ${inWishlist ? 'in-wishlist' : ''}`}
                      onClick={() => toggleWishlist(movie)}
                    >
                      <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} />
                      <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Plot Synopsis */}
              <h3 className="modal-section-title">Overview</h3>
              <p className="modal-synopsis">{movie.overview}</p>

              {/* Cast Members */}
              {movie.cast && movie.cast.length > 0 && (
                <>
                  <h3 className="modal-section-title">Top Cast</h3>
                  <div className="cast-list">
                    {movie.cast.map((actor, idx) => (
                      <div key={idx} className="cast-item">
                        {actor.profileUrl ? (
                          <img
                            src={actor.profileUrl}
                            alt={actor.name}
                            className="cast-avatar"
                          />
                        ) : (
                          <div className="cast-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="var(--text-muted)" />
                          </div>
                        )}
                        <div className="cast-name" title={actor.name}>
                          {actor.name}
                        </div>
                        <div className="cast-role" title={actor.character}>
                          {actor.character}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Similar Movies */}
              {movie.similar && movie.similar.length > 0 && (
                <>
                  <h3 className="modal-section-title">You Might Also Like</h3>
                  <div className="similar-grid">
                    {movie.similar.map((sim) => (
                      <div
                        key={sim.id}
                        className="similar-card"
                        onClick={() => {
                          if (onSelectMovie) onSelectMovie(sim.id);
                        }}
                      >
                        {sim.posterUrl ? (
                          <img
                            src={sim.posterUrl}
                            alt={sim.title}
                            className="similar-poster"
                          />
                        ) : (
                          <div className="similar-poster poster-fallback" style={{ height: 160 }}>
                            <Film size={20} />
                          </div>
                        )}
                        <div className="similar-title" title={sim.title}>
                          {sim.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
