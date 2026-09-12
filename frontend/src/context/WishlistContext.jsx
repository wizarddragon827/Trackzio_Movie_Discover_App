import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({ total: 0, watched: 0, wantToWatch: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getWishlist();
      if (data.success) {
        setWishlist(data.items || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('[WishlistContext] Failed to load wishlist:', err);
      // Fallback: check localStorage if server was unreachable
      const saved = localStorage.getItem('trackzio_wishlist_backup');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWishlist(parsed);
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Keep a local backup in localStorage as secondary resilience
  useEffect(() => {
    if (wishlist.length >= 0) {
      localStorage.setItem('trackzio_wishlist_backup', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const isInWishlist = useCallback(
    (movieId) => {
      const id = Number(movieId);
      return wishlist.some((item) => Number(item.movieId || item.id) === id);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (movie) => {
      if (!movie || !movie.id) return;
      const id = Number(movie.id);
      const exists = isInWishlist(id);

      if (exists) {
        // Optimistic removal
        const prev = [...wishlist];
        setWishlist((cur) => cur.filter((item) => Number(item.movieId || item.id) !== id));
        setStats((cur) => ({
          ...cur,
          total: Math.max(0, cur.total - 1),
        }));
        showToast(`Removed "${movie.title}" from Wishlist`, 'info');

        try {
          await api.removeFromWishlist(id);
          loadWishlist(); // refresh stats accurately
        } catch (err) {
          console.error('[WishlistContext] Failed to remove:', err);
          setWishlist(prev);
          showToast('Failed to sync removal with server', 'error');
        }
      } else {
        // Optimistic addition
        const optimisticEntry = {
          id: `wl_${id}`,
          movieId: id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
          genres: movie.genres,
          overview: movie.overview,
          watched: false,
          userNotes: '',
          addedAt: new Date().toISOString(),
        };

        setWishlist((cur) => [optimisticEntry, ...cur]);
        setStats((cur) => ({ ...cur, total: cur.total + 1, wantToWatch: cur.wantToWatch + 1 }));
        showToast(`Added "${movie.title}" to Wishlist!`, 'success');

        try {
          await api.addToWishlist(movie);
          loadWishlist();
        } catch (err) {
          console.error('[WishlistContext] Failed to add:', err);
          setWishlist((cur) => cur.filter((item) => Number(item.movieId || item.id) !== id));
          showToast('Failed to save to server', 'error');
        }
      }
    },
    [wishlist, isInWishlist, showToast, loadWishlist]
  );

  const updateItem = useCallback(
    async (movieId, updates) => {
      const id = Number(movieId);
      // Optimistic update
      setWishlist((cur) =>
        cur.map((item) =>
          Number(item.movieId || item.id) === id ? { ...item, ...updates } : item
        )
      );

      try {
        await api.updateWishlist(id, updates);
        showToast('Wishlist updated', 'success');
        loadWishlist();
      } catch (err) {
        console.error('[WishlistContext] Failed to update item:', err);
        showToast('Failed to update wishlist on server', 'error');
        loadWishlist();
      }
    },
    [showToast, loadWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        stats,
        loading,
        isInWishlist,
        toggleWishlist,
        updateItem,
        refreshWishlist: loadWishlist,
        toast,
        showToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
