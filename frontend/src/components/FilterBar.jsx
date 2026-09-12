import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Calendar, Star, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { id: 'trending', label: 'Trending This Week' },
  { id: 'popular', label: 'Popular' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'now-playing', label: 'Now Playing' },
  { id: 'upcoming', label: 'Upcoming' },
];

export default function FilterBar({
  category,
  setCategory,
  genres = [],
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  selectedYear,
  setSelectedYear,
  minRating,
  setMinRating,
  onResetFilters,
  hasActiveFilters,
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className="controls-panel">
      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab-btn ${category === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        {/* Genre Pills */}
        <div className="genre-scroll-box">
          <button
            className={`genre-filter-btn ${!selectedGenre ? 'active' : ''}`}
            onClick={() => setSelectedGenre('')}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`genre-filter-btn ${String(selectedGenre) === String(g.id) ? 'active' : ''}`}
              onClick={() => setSelectedGenre(String(selectedGenre) === String(g.id) ? '' : String(g.id))}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Dropdown Filters Group */}
        <div className="filter-selects-group">
          {/* Sort By */}
          <div className="custom-select-box">
            <ArrowUpDown size={15} />
            <select
              className="custom-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort movies by"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Release Date (Newest)</option>
              <option value="release_date.asc">Release Date (Oldest)</option>
              <option value="title.asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Release Year */}
          <div className="custom-select-box">
            <Calendar size={15} />
            <select
              className="custom-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Filter by release year"
            >
              <option value="">All Years</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="custom-select-box">
            <Star size={15} />
            <select
              className="custom-select"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              aria-label="Filter by minimum rating"
            >
              <option value="">Any Rating</option>
              <option value="8.0">⭐ 8.0 & Above</option>
              <option value="7.0">⭐ 7.0 & Above</option>
              <option value="6.0">⭐ 6.0 & Above</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              className="btn-reset-filters"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
