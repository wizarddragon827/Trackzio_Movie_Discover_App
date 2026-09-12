import React, { useState, useEffect } from 'react';
import { X, Dices, Play, Heart, Star, Calendar, Clock, RotateCw, Film } from 'lucide-react';
import { api } from '../api/client';
import { useWishlist } from '../context/WishlistContext';

export default function SurpriseMeModal({ isOpen, onClose, onOpenTrailer, onOpenDetails }) {
  const [spinning, setSpinning] = useState(false);
  const [movie, setMovie] = useState(null);
  const [spinTitle, setSpinTitle] = useState('Spinning the Cinema Reel...');
  const { isInWishlist, toggleWishlist } = useWishlist();

  const rollMovie = async () => {
    try {
      setSpinning(true);
      // Quick slot machine effect
      const placeholders = [
        'Interstellar',
        'Parasite',
        'Spider-Man',
        'Oppenheimer',
        'Spirited Away',
        'The Dark Knight',
        'Inception',
        'Pulp Fiction',
        'Blade Runner 2049'
      ];
      let counter = 0;
      const interval = setInterval(() => {
        setSpinTitle(placeholders[counter % placeholders.length]);
        counter++;
      }, 100);

      const res = await api.getRandomMovie();

      setTimeout(() => {
        clearInterval(interval);
        setMovie(res.movie);
        setSpinning(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to get random movie:', err);
      setSpinning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      rollMovie();
    } else {
      setMovie(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const inWishlist = movie ? isInWishlist(movie.id) : false;
  const year = movie?.releaseDate ? movie.releaseDate.split('-')[0] : '';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !spinning) onClose();
      }}
    >
      <div className="modal-card surprise-modal-card">
        <button className="modal-close-btn" onClick={onClose} disabled={spinning} aria-label="Close modal">
          <X size={20} />
        </button>

        {spinning ? (
          <div className="roulette-spin-box">
            <Dices size={56} className="roulette-dice-icon spinning" />
            <h3 className="roulette-spin-title">Finding Your Perfect Movie...</h3>
            <div className="roulette-ticker">{spinTitle}</div>
          </div>
        ) : movie ? (
          <div>
            {/* Backdrop */}
            <div className="modal-hero-backdrop" style={{ height: 220 }}>
              {movie.backdropUrl ? (
                <img src={movie.backdropUrl} alt={movie.title} className="modal-backdrop-img" />
              ) : (
                <div style={{ background: '#0e1422', width: '100%', height: '100%' }} />
              )}
              <div className="modal-backdrop-fade" />
            </div>

            <div className="modal-body" style={{ marginTop: '-60px' }}>
              <div className="modal-top-row">
                <div className="modal-poster-wrap" style={{ width: 140, minWidth: 140 }}>
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} />
                  ) : (
                    <div className="poster-fallback">
                      <Film size={28} />
                    </div>
                  )}
                </div>

                <div className="modal-info-col">
                  <div className="surprise-badge">
                    <Dices size={14} />
                    <span>Your Random Pick</span>
                  </div>

                  <h2 className="modal-title" style={{ fontSize: '1.8rem' }}>
                    {movie.title}
                  </h2>

                  <div className="modal-quick-meta">
                    {movie.voteAverage > 0 && (
                      <div className="hero-rating-badge">
                        <Star size={14} fill="currentColor" />
                        <span>{movie.voteAverage}</span>
                      </div>
                    )}
                    {year && (
                      <div className="hero-meta-item">
                        <Calendar size={14} />
                        <span>{year}</span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="hero-meta-item">
                        <Clock size={14} />
                        <span>{movie.runtime}m</span>
                      </div>
                    )}
                  </div>

                  {movie.genres && movie.genres.length > 0 && (
                    <div className="hero-genres" style={{ marginBottom: '1rem' }}>
                      {movie.genres.map((g) => (
                        <span key={g.id || g} className="genre-pill-sm">
                          {g.name || g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="modal-actions-row">
                    {movie.trailerKey && (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          onClose();
                          onOpenTrailer(movie.trailerKey);
                        }}
                      >
                        <Play size={16} fill="currentColor" />
                        <span>Watch Trailer</span>
                      </button>
                    )}

                    <button
                      className={`btn-secondary ${inWishlist ? 'in-wishlist' : ''}`}
                      onClick={() => toggleWishlist(movie)}
                    >
                      <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                      <span>{inWishlist ? 'Saved' : 'Add to Wishlist'}</span>
                    </button>

                    <button className="btn-secondary" onClick={rollMovie} title="Spin for another title">
                      <RotateCw size={16} />
                      <span>Spin Again</span>
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="modal-section-title" style={{ marginTop: '1rem' }}>
                Synopsis
              </h3>
              <p className="modal-synopsis">{movie.overview}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
