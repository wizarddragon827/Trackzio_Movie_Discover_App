import React, { useState, useEffect, useCallback } from 'react';
import { WishlistProvider } from './context/WishlistContext';
import { useDebounce } from './hooks/useDebounce';
import { api } from './api/client';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterBar from './components/FilterBar';
import MoodSelector from './components/MoodSelector';
import MovieGrid from './components/MovieGrid';
import MovieDetailsModal from './components/MovieDetailsModal';
import TrailerModal from './components/TrailerModal';
import WishlistView from './components/WishlistView';
import CollectionsView from './components/CollectionsView';
import SurpriseMeModal from './components/SurpriseMeModal';
import Toast from './components/Toast';
import { Film } from 'lucide-react';

function MovieAppContent() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'collections' | 'wishlist'
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [activeTrailerKey, setActiveTrailerKey] = useState(null);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [category, setCategory] = useState('trending');
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [collections, setCollections] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collectionTitle, setCollectionTitle] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState('');

  // Movie Results & Pagination State
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Fetch official genres, moods, and collections on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const [gData, mData, cData] = await Promise.all([
          api.getGenres().catch(() => ({ genres: [] })),
          api.getMoods().catch(() => ({ moods: [] })),
          api.getCollections().catch(() => ({ collections: [] })),
        ]);
        if (gData.genres) setGenres(gData.genres);
        if (mData.moods) setMoods(mData.moods);
        if (cData.collections) setCollections(cData.collections);
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Check if any filtering is active
  const hasActiveFilters = Boolean(
    selectedGenre ||
    selectedMood ||
    selectedCollection ||
    selectedYear ||
    minRating ||
    sortBy !== 'popularity.desc'
  );

  const resetFilters = useCallback(() => {
    setSelectedGenre('');
    setSelectedMood('');
    setSelectedCollection('');
    setCollectionTitle('');
    setSelectedYear('');
    setMinRating('');
    setSortBy('popularity.desc');
  }, []);

  // Main movie fetch logic
  const fetchMovies = useCallback(
    async (currentPage = 1, isAppend = false) => {
      try {
        if (isAppend) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        let res;

        // If search query is present
        if (debouncedSearch && debouncedSearch.trim()) {
          res = await api.searchMovies({
            query: debouncedSearch.trim(),
            page: currentPage,
          });
        }
        // If filters applied (genre, mood, collection, year, minRating, custom sort)
        else if (hasActiveFilters) {
          res = await api.discoverMovies({
            genre: selectedGenre,
            year: selectedYear,
            minRating,
            mood: selectedMood,
            collection: selectedCollection,
            sortBy,
            page: currentPage,
          });
        }
        // Default category browsing (trending, popular, top-rated, etc.)
        else {
          res = await api.getCategory(category, currentPage);
        }

        const newResults = res.results || [];

        if (isAppend) {
          setMovies((prev) => [...prev, ...newResults]);
        } else {
          setMovies(newResults);
          if (!debouncedSearch && newResults.length > 0 && currentPage === 1) {
            const spotlight = newResults.find((m) => m.backdropUrl) || newResults[0];
            setHeroMovie(spotlight);
          }
        }

        setTotalPages(res.totalPages || 1);
        setPage(currentPage);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError(err.message || 'Failed to fetch movies. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      debouncedSearch,
      hasActiveFilters,
      selectedGenre,
      selectedMood,
      selectedCollection,
      selectedYear,
      minRating,
      sortBy,
      category,
    ]
  );

  // Trigger fetch on filter / search / category change
  useEffect(() => {
    fetchMovies(1, false);
  }, [fetchMovies]);

  // Load More Handler
  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchMovies(page + 1, true);
    }
  };

  // When clicking on a collection from CollectionsView
  const handleSelectCollection = (colId, title) => {
    resetFilters();
    setSelectedCollection(colId);
    setCollectionTitle(title);
    setActiveTab('discover');
  };

  return (
    <div className="app-layout">
      {/* Top Navbar with brand, search, Surprise Me button, and tabs */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSurpriseMe={() => setIsSurpriseOpen(true)}
      />

      {/* Main Content View */}
      <main>
        {activeTab === 'wishlist' ? (
          /* Wishlist View */
          <WishlistView
            onOpenDetails={(id) => setSelectedMovieId(id)}
            onExploreMore={() => setActiveTab('discover')}
          />
        ) : activeTab === 'collections' ? (
          /* Playlists / Curated Collections View */
          <CollectionsView
            collections={collections}
            onSelectCollection={handleSelectCollection}
          />
        ) : (
          /* Discover / Browsing View */
          <div className="container">
            {/* Featured Hero Banner */}
            {!debouncedSearch && heroMovie && !hasActiveFilters && (
              <HeroBanner
                movie={heroMovie}
                onOpenDetails={(id) => setSelectedMovieId(id)}
                onOpenTrailer={(key) => setActiveTrailerKey(key)}
              />
            )}

            {/* Mood & Vibe Discovery Bar */}
            <MoodSelector
              moods={moods}
              selectedMood={selectedMood}
              onSelectMood={(mood) => {
                setSelectedMood(mood);
                setSearchQuery('');
              }}
            />

            {/* Filter and Category Controls */}
            <FilterBar
              category={category}
              setCategory={(cat) => {
                setCategory(cat);
                setSelectedCollection('');
                setCollectionTitle('');
                setSearchQuery('');
              }}
              genres={genres}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              minRating={minRating}
              setMinRating={setMinRating}
              onResetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Section Header */}
            <div className="section-header">
              <h2 className="section-title">
                {debouncedSearch ? (
                  <>Search Results for “{debouncedSearch}”</>
                ) : selectedCollection ? (
                  <>Collection: {collectionTitle}</>
                ) : selectedMood ? (
                  <>
                    Vibe: {moods.find((m) => m.id === selectedMood)?.label || selectedMood}
                  </>
                ) : hasActiveFilters ? (
                  <>Filtered Discovery Results</>
                ) : category === 'trending' ? (
                  <>Trending Movies</>
                ) : category === 'top-rated' ? (
                  <>Top Rated of All Time</>
                ) : category === 'now-playing' ? (
                  <>Now Playing in Theaters</>
                ) : category === 'upcoming' ? (
                  <>Upcoming Releases</>
                ) : (
                  <>Popular Movies</>
                )}
              </h2>
              {!loading && movies.length > 0 && (
                <div className="section-badge">Showing {movies.length} titles</div>
              )}
            </div>

            {/* Movie Grid */}
            <MovieGrid
              movies={movies}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={page < totalPages}
              onLoadMore={handleLoadMore}
              onOpenDetails={(id) => setSelectedMovieId(id)}
              onOpenTrailer={(key) => setActiveTrailerKey(key)}
              onResetFilters={resetFilters}
            />
          </div>
        )}
      </main>

      {/* Surprise Me / Movie Roulette Modal */}
      <SurpriseMeModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onOpenTrailer={(key) => setActiveTrailerKey(key)}
        onOpenDetails={(id) => setSelectedMovieId(id)}
      />

      {/* Movie Details Modal */}
      {selectedMovieId && (
        <MovieDetailsModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onOpenTrailer={(key) => setActiveTrailerKey(key)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
        />
      )}

      {/* Video Trailer Modal */}
      {activeTrailerKey && (
        <TrailerModal
          trailerKey={activeTrailerKey}
          onClose={() => setActiveTrailerKey(null)}
        />
      )}

      {/* Toast Notification Container */}
      <Toast />

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Film size={18} color="var(--accent-amber)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Trackzio Cinema</span>
            <span>&copy; {new Date().getFullYear()} — Next-Gen Movie Discovery</span>
          </div>
          <div>
            120+ Curated Titles &bull; Movie Roulette &bull; Vibe Discovery &bull; Cinema DNA &bull; Where to Watch
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WishlistProvider>
      <MovieAppContent />
    </WishlistProvider>
  );
}
