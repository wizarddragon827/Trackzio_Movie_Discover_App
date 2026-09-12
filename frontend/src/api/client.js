const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Robust fetch wrapper with JSON parsing and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Movies
  getGenres() {
    return request('/movies/genres');
  },

  getMoods() {
    return request('/movies/moods');
  },

  getCollections() {
    return request('/movies/collections');
  },

  getRandomMovie({ genre, minRating, mood } = {}) {
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (minRating) params.set('minRating', minRating);
    if (mood) params.set('mood', mood);
    const qs = params.toString();
    return request(`/movies/random${qs ? `?${qs}` : ''}`);
  },

  getCategory(category = 'trending', page = 1) {
    return request(`/movies/${category}?page=${page}`);
  },

  discoverMovies({ genre, year, minRating, mood, collection, provider, sortBy, page = 1, limit = 20 }) {
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (year) params.set('year', year);
    if (minRating) params.set('minRating', minRating);
    if (mood) params.set('mood', mood);
    if (collection) params.set('collection', collection);
    if (provider) params.set('provider', provider);
    if (sortBy) params.set('sortBy', sortBy);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    return request(`/movies/discover?${params.toString()}`);
  },

  searchMovies({ query, page = 1, limit = 20 }) {
    const params = new URLSearchParams();
    params.set('q', query);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    return request(`/movies/search?${params.toString()}`);
  },

  getMovieDetails(id) {
    return request(`/movies/${id}`);
  },

  // Wishlist
  getWishlist({ search, status, genre, sortBy } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (genre) params.set('genre', genre);
    if (sortBy) params.set('sortBy', sortBy);
    const qs = params.toString();
    return request(`/wishlist${qs ? `?${qs}` : ''}`);
  },

  addToWishlist(movie) {
    return request('/wishlist', {
      method: 'POST',
      body: JSON.stringify(movie),
    });
  },

  updateWishlist(movieId, updates) {
    return request(`/wishlist/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  removeFromWishlist(movieId) {
    return request(`/wishlist/${movieId}`, {
      method: 'DELETE',
    });
  },

  importWishlist(items) {
    return request('/wishlist/import', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  getHealth() {
    return request('/health');
  },
};
