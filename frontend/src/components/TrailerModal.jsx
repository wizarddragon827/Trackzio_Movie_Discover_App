import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function TrailerModal({ trailerKey, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!trailerKey) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="trailer-modal-card">
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close trailer"
          style={{ top: 12, right: 12 }}
        >
          <X size={20} />
        </button>

        <iframe
          className="trailer-iframe"
          src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title="Movie Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
