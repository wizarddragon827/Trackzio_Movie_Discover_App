import React, { useState, useMemo, useRef } from 'react';
import {
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Star,
  Trash2,
  Film,
  Search,
  ArrowUpDown,
  Download,
  Upload,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../api/client';

export default function WishlistView({ onOpenDetails, onExploreMore }) {
  const { wishlist, stats, updateItem, toggleWishlist, refreshWishlist, showToast } = useWishlist();
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'want_to_watch' | 'watched'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('added_desc');
  const fileInputRef = useRef(null);

  // Local state for editing notes
  const [notesState, setNotesState] = useState({});

  const filteredItems = useMemo(() => {
    let result = [...wishlist];

    // Status
    if (filterStatus === 'watched') {
      result = result.filter((item) => item.watched === true);
    } else if (filterStatus === 'want_to_watch') {
      result = result.filter((item) => !item.watched);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.overview?.toLowerCase().includes(q) ||
          item.userNotes?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating_desc':
          return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'user_rating_desc':
          return (b.userRating || 0) - (a.userRating || 0);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'release_desc':
          return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case 'added_desc':
        default:
          return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
      }
    });

    return result;
  }, [wishlist, filterStatus, searchQuery, sortBy]);

  const handleNoteChange = (movieId, text) => {
    setNotesState((prev) => ({ ...prev, [movieId]: text }));
  };

  const handleNoteBlur = (movieId) => {
    const text = notesState[movieId];
    if (text !== undefined) {
      updateItem(movieId, { userNotes: text });
    }
  };

  // Export Wishlist as JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wishlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trackzio_wishlist_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Wishlist exported successfully!', 'success');
  };

  // Import Wishlist from JSON
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const items = Array.isArray(parsed) ? parsed : parsed.items || [];
          const res = await api.importWishlist(items);
          if (res.success) {
            showToast(res.message || 'Wishlist imported!', 'success');
            refreshWishlist();
          }
        } catch {
          showToast('Invalid JSON file format', 'error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      showToast('Failed to read file', 'error');
    }
    // reset input
    e.target.value = '';
  };

  return (
    <div className="container" style={{ minHeight: '75vh', paddingBottom: '4rem' }}>
      {/* Header Banner & Cinema DNA Stats */}
      <div className="wishlist-header-banner">
        <div className="wishlist-banner-top">
          <div>
            <h2>Your Personal Watchlist</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Persistent cinema tracker synced with local database. Monitor watch progress, add custom notes, and track your personal ratings.
            </p>
          </div>

          <div className="wishlist-backup-actions">
            <button className="btn-secondary" onClick={handleExport} title="Download backup JSON">
              <Download size={15} />
              <span>Export JSON</span>
            </button>
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} title="Restore from JSON">
              <Upload size={15} />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleFileImport}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="wishlist-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Film size={22} />
            </div>
            <div>
              <div className="stat-num">{stats.total || wishlist.length}</div>
              <div className="stat-label">Total Saved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap" style={{ color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="stat-num">{stats.watched || 0}</div>
              <div className="stat-label">Watched ({stats.completionPercentage || 0}%)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="stat-num">{stats.formattedWatchTime || '0h 0m'}</div>
              <div className="stat-label">Total Runtime</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Star size={22} />
            </div>
            <div>
              <div className="stat-num">{stats.averageRating || '—'}</div>
              <div className="stat-label">Avg TMDB Score</div>
            </div>
          </div>
        </div>

        {/* Cinema DNA Progress & Genre Breakdown */}
        {wishlist.length > 0 && (
          <div className="cinema-dna-panel">
            <div className="dna-title-row">
              <div className="dna-header-title">
                <Sparkles size={16} color="var(--accent-amber)" />
                <span>My Cinema DNA &amp; Watch Progress</span>
              </div>
              <span className="dna-runtime-watched">
                Watched: <strong>{stats.formattedWatchedTime || '0h 0m'}</strong> of {stats.formattedWatchTime || '0h 0m'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="dna-progress-track">
              <div
                className="dna-progress-fill"
                style={{ width: `${Math.min(100, stats.completionPercentage || 0)}%` }}
              />
            </div>

            {/* Top Genres Chips */}
            {stats.topGenres && stats.topGenres.length > 0 && (
              <div className="dna-genres-row">
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Top Saved Genres:</span>
                {stats.topGenres.map((g) => (
                  <span key={g.name} className="dna-genre-pill">
                    {g.name} <strong>({g.count})</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls: Filter Status Tabs + Search + Sort */}
      <div className="controls-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-row">
          <div className="category-tabs" style={{ border: 'none', margin: 0, padding: 0 }}>
            <button
              className={`category-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({wishlist.length})
            </button>
            <button
              className={`category-tab-btn ${filterStatus === 'want_to_watch' ? 'active' : ''}`}
              onClick={() => setFilterStatus('want_to_watch')}
            >
              Want to Watch ({stats.wantToWatch || 0})
            </button>
            <button
              className={`category-tab-btn ${filterStatus === 'watched' ? 'active' : ''}`}
              onClick={() => setFilterStatus('watched')}
            >
              Watched ({stats.watched || 0})
            </button>
          </div>

          <div className="filter-selects-group">
            {/* Search within wishlist */}
            <div className="custom-select-box" style={{ padding: '0.35rem 0.75rem' }}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search your saved titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', fontSize: '0.85rem' }}
              />
            </div>

            {/* Sort */}
            <div className="custom-select-box">
              <ArrowUpDown size={14} />
              <select
                className="custom-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="added_desc">Recently Added</option>
                <option value="user_rating_desc">My Personal Rating</option>
                <option value="rating_desc">Highest TMDB Rating</option>
                <option value="release_desc">Release Date</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items List */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <BookmarkCheck className="empty-icon" />
          <h3 className="empty-title">
            {wishlist.length === 0 ? 'Your Wishlist is Empty' : 'No matching saved movies'}
          </h3>
          <p className="empty-desc">
            {wishlist.length === 0
              ? 'Explore our 120+ titles, view trailers, and click the heart icon on any card to save it.'
              : 'Try clearing your search query or switching status filters.'}
          </p>
          {wishlist.length === 0 && onExploreMore && (
            <button className="btn-primary" onClick={onExploreMore}>
              Explore Movies
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredItems.map((item) => {
            const movieId = Number(item.movieId || item.id);
            const currentNote =
              notesState[movieId] !== undefined ? notesState[movieId] : item.userNotes || '';

            return (
              <div key={movieId} className="wishlist-item-card">
                {/* Thumbnail */}
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="wishlist-thumb"
                    onClick={() => onOpenDetails(movieId)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div
                    className="wishlist-thumb poster-fallback"
                    onClick={() => onOpenDetails(movieId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Film size={24} />
                  </div>
                )}

                {/* Details Column */}
                <div className="wishlist-details-col">
                  <div>
                    <div className="wishlist-title-row">
                      <h3
                        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                        onClick={() => onOpenDetails(movieId)}
                      >
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {item.userRating && (
                          <div className="user-score-badge" title="Your personal rating">
                            <span>My Rating:</span> <strong>⭐ {item.userRating}/10</strong>
                          </div>
                        )}
                        {item.voteAverage > 0 && (
                          <div className="hero-rating-badge" style={{ padding: '2px 8px' }} title="TMDB Rating">
                            <Star size={13} fill="currentColor" />
                            <span>{item.voteAverage}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-meta" style={{ marginTop: '0.35rem' }}>
                      <span>{item.releaseDate ? item.releaseDate.split('-')[0] : 'N/A'}</span>
                      {item.runtime && <span>&bull; {item.runtime}m</span>}
                      {item.genres && item.genres.length > 0 && (
                        <span>
                          &bull; {item.genres.map((g) => g.name || g).slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: '#94a3b8',
                        marginTop: '0.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.overview}
                    </p>
                  </div>

                  {/* Rating Selector + Watched + Notes */}
                  <div className="wishlist-actions-bar">
                    {/* Mark as watched */}
                    <button
                      className={`btn-watched-toggle ${item.watched ? 'watched' : ''}`}
                      onClick={() => updateItem(movieId, { watched: !item.watched })}
                      title={item.watched ? 'Mark as Want to Watch' : 'Mark as Watched'}
                    >
                      <CheckCircle2 size={16} />
                      <span>{item.watched ? 'Watched' : 'Mark as Watched'}</span>
                    </button>

                    {/* Personal 10-Star Rating Dropdown */}
                    <div className="custom-select-box" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>
                      <Star size={13} color="var(--accent-amber)" />
                      <select
                        className="custom-select"
                        value={item.userRating || ''}
                        onChange={(e) => updateItem(movieId, { userRating: e.target.value ? Number(e.target.value) : null })}
                        aria-label="Rate this movie"
                      >
                        <option value="">Rate Film</option>
                        {Array.from({ length: 10 }, (_, i) => 10 - i).map((num) => (
                          <option key={num} value={num}>
                            ⭐ {num}/10 {num === 10 ? 'Masterpiece' : num >= 8 ? 'Great' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes Input */}
                    <input
                      type="text"
                      className="notes-input"
                      placeholder="Personal review / notes (e.g. Loved the plot twist!)..."
                      value={currentNote}
                      onChange={(e) => handleNoteChange(movieId, e.target.value)}
                      onBlur={() => handleNoteBlur(movieId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                      }}
                    />

                    {/* Remove button */}
                    <button
                      className="btn-remove-wishlist"
                      onClick={() => toggleWishlist(item)}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
