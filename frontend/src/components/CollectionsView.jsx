import React from 'react';
import { Award, Film, ArrowRight } from 'lucide-react';

export default function CollectionsView({ collections = [], onSelectCollection }) {
  return (
    <div className="container" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
      <div className="wishlist-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award size={26} color="var(--accent-amber)" />
          <h2>Curated Thematic Collections</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Handcrafted playlists celebrating master directors, legendary film eras, award champions, and iconic sagas.
        </p>
      </div>

      <div className="collections-grid">
        {collections.map((col) => (
          <div
            key={col.id}
            className="collection-card"
            onClick={() => onSelectCollection(col.id, col.title)}
            role="button"
            tabIndex={0}
          >
            {/* Backdrop */}
            <div className="collection-backdrop-wrap">
              <img src={col.backdropUrl} alt={col.title} className="collection-backdrop-img" />
              <div className="collection-overlay" />
            </div>

            {/* Content */}
            <div className="collection-content">
              <div className="collection-badge">{col.badge}</div>
              <h3 className="collection-title">{col.title}</h3>
              <p className="collection-desc">{col.desc}</p>
              <div className="collection-footer">
                <span className="collection-count">{col.movieCount} Films</span>
                <div className="collection-explore-btn">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
