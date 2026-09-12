import React from 'react';
import { Film, AlertCircle, RotateCcw, ChevronDown } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';

export default function MovieGrid({
  movies = [],
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onOpenDetails,
  onOpenTrailer,
  onResetFilters,
  emptyTitle = 'No movies found',
  emptyMessage = 'Try adjusting your search query, genre, mood, or rating filters to discover more titles.',
}) {
  if (loading && (!movies || movies.length === 0)) {
    return (
      <div className="movies-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!loading && movies.length === 0) {
    return (
      <div className="empty-state">
        <Film className="empty-icon" />
        <h3 className="empty-title">{emptyTitle}</h3>
        <p className="empty-desc">{emptyMessage}</p>
        {onResetFilters && (
          <button className="btn-primary" onClick={onResetFilters}>
            <RotateCcw size={16} />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="movies-grid">
        {movies.map((movie, idx) => (
          <MovieCard
            key={`${movie.id}-${idx}`}
            movie={movie}
            onOpenDetails={onOpenDetails}
            onOpenTrailer={onOpenTrailer}
          />
        ))}
      </div>

      {/* Pagination / Load More */}
      {hasMore && (
        <div className="pagination-wrap">
          <button
            className="btn-load-more"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <span>Loading more titles...</span>
            ) : (
              <>
                <span>Load More Movies</span>
                <ChevronDown size={18} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
