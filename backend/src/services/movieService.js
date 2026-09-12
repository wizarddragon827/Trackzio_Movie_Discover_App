import { config } from '../config.js';
import { cacheService } from './cacheService.js';
import { SEED_MOVIES, GENRES, MOODS, COLLECTIONS } from '../data/seedMovies.js';

class MovieService {
  constructor() {
    this.apiKey = config.tmdbApiKey;
    this.baseUrl = config.tmdbBaseUrl;
    this.imageBase = config.tmdbImageBaseUrl;
  }

  get isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Helper to normalize TMDB movie object into clean standardized schema.
   */
  normalizeMovie(raw) {
    if (!raw) return null;

    // Genres normalization (handles both [28, 12] or [{id: 28, name: 'Action'}])
    let genres = [];
    if (Array.isArray(raw.genres)) {
      genres = raw.genres.map((g) => {
        if (typeof g === 'object' && g.name) return { id: g.id, name: g.name };
        const found = GENRES.find((gen) => gen.id === g);
        return found ? found : { id: g, name: 'General' };
      });
    } else if (Array.isArray(raw.genre_ids)) {
      genres = raw.genre_ids.map((id) => {
        const found = GENRES.find((g) => g.id === id);
        return found ? found : { id, name: 'General' };
      });
    }

    // Posters & backdrops
    let posterUrl = raw.posterUrl || '';
    if (!posterUrl && raw.poster_path) {
      posterUrl = `${this.imageBase}/w500${raw.poster_path}`;
    }
    let backdropUrl = raw.backdropUrl || '';
    if (!backdropUrl && raw.backdrop_path) {
      backdropUrl = `${this.imageBase}/original${raw.backdrop_path}`;
    }

    // Trailer extraction
    let trailerKey = raw.trailerKey || '';
    if (!trailerKey && raw.videos?.results) {
      const trailer =
        raw.videos.results.find(
          (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        ) || raw.videos.results.find((v) => v.site === 'YouTube');
      if (trailer) {
        trailerKey = trailer.key;
      }
    }

    // Cast & Director extraction
    let cast = raw.cast || [];
    let director = raw.director || '';
    if (raw.credits) {
      if (Array.isArray(raw.credits.cast)) {
        cast = raw.credits.cast.slice(0, 10).map((member) => ({
          name: member.name,
          character: member.character || 'Self',
          profileUrl: member.profile_path
            ? `${this.imageBase}/w185${member.profile_path}`
            : null,
        }));
      }
      if (Array.isArray(raw.credits.crew)) {
        const dir = raw.credits.crew.find((c) => c.job === 'Director');
        if (dir) director = dir.name;
      }
    }

    const voteAvg = typeof raw.voteAverage === 'number' ? raw.voteAverage : (raw.vote_average ?? 0);

    return {
      id: raw.id,
      title: raw.title || raw.name || 'Untitled Movie',
      tagline: raw.tagline || '',
      overview: raw.overview || 'No synopsis available for this title.',
      releaseDate: raw.releaseDate || raw.release_date || raw.first_air_date || '',
      voteAverage: Number(Number(voteAvg).toFixed(1)),
      voteCount: raw.voteCount ?? raw.vote_count ?? 0,
      popularity: raw.popularity ?? 0,
      runtime: raw.runtime || (raw.episode_run_time ? raw.episode_run_time[0] : null),
      posterUrl,
      backdropUrl,
      genres,
      trailerKey,
      cast,
      director,
      providers: raw.providers || ['Netflix', 'Prime Video'],
      moods: raw.moods || [],
      collections: raw.collections || [],
    };
  }

  /**
   * Safe fetch with upstream timeout and error handling.
   */
  async _fetchFromTmdb(endpoint, queryParams = {}) {
    if (!this.isConfigured) {
      throw new Error('TMDB API Key is not configured. Falling back to local data.');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('[TMDB] Rate limit exceeded (429). Will use fallback/cached data.');
        }
        throw new Error(`TMDB HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Internal helper: Filter and sort local seed movies for offline/fallback mode.
   */
  _queryLocalSeed({
    genre,
    year,
    minRating,
    mood,
    collection,
    provider,
    sortBy = 'popularity.desc',
    search = '',
    page = 1,
    limit = 20,
  }) {
    let list = [...SEED_MOVIES];

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.cast && m.cast.some((c) => c.name.toLowerCase().includes(q)))
      );
    }

    // Mood filter
    if (mood) {
      list = list.filter((m) => m.moods && m.moods.includes(mood));
    }

    // Collection filter
    if (collection) {
      list = list.filter((m) => m.collections && m.collections.includes(collection));
    }

    // Provider filter
    if (provider) {
      list = list.filter((m) => m.providers && m.providers.includes(provider));
    }

    // Genre filter
    if (genre) {
      list = list.filter((m) =>
        m.genres.some(
          (g) =>
            String(g.id) === String(genre) ||
            g.name.toLowerCase() === String(genre).toLowerCase()
        )
      );
    }

    // Year filter
    if (year) {
      list = list.filter((m) => m.releaseDate && m.releaseDate.startsWith(String(year)));
    }

    // Minimum Rating filter
    if (minRating) {
      const min = parseFloat(minRating);
      list = list.filter((m) => m.voteAverage >= min);
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'vote_average.desc':
          return b.voteAverage - a.voteAverage;
        case 'vote_average.asc':
          return a.voteAverage - b.voteAverage;
        case 'release_date.desc':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'release_date.asc':
          return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        case 'title.asc':
          return a.title.localeCompare(b.title);
        case 'title.desc':
          return b.title.localeCompare(a.title);
        case 'popularity.desc':
        default:
          return (b.popularity || b.voteAverage) - (a.popularity || a.voteAverage);
      }
    });

    const totalResults = list.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const startIndex = (page - 1) * limit;
    const results = list.slice(startIndex, startIndex + limit).map((m) => this.normalizeMovie(m));

    return {
      page: Number(page),
      totalPages,
      totalResults,
      results,
      source: 'local_fallback',
    };
  }

  /**
   * Get official Genres
   */
  async getGenres() {
    const cacheKey = 'genres:all';
    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        if (this.isConfigured) {
          try {
            const data = await this._fetchFromTmdb('/genre/movie/list');
            if (data?.genres?.length) return data.genres;
          } catch (err) {
            console.warn('[TMDB] Failed to fetch genres, using fallback:', err.message);
          }
        }
        return GENRES;
      },
      86400 // 24 hours TTL
    );
  }

  /**
   * Get Moods list
   */
  getMoods() {
    return MOODS;
  }

  /**
   * Get Curated Collections list
   */
  getCollections() {
    return COLLECTIONS.map((c) => {
      const count = SEED_MOVIES.filter((m) => m.collections && m.collections.includes(c.id)).length;
      return {
        ...c,
        movieCount: count,
      };
    });
  }

  /**
   * Surprise Me - Random Movie Picker
   */
  getRandomMovie({ genre, minRating, mood } = {}) {
    let pool = [...SEED_MOVIES];

    if (mood) {
      pool = pool.filter((m) => m.moods && m.moods.includes(mood));
    }
    if (genre) {
      pool = pool.filter((m) =>
        m.genres.some((g) => String(g.id) === String(genre) || g.name.toLowerCase() === String(genre).toLowerCase())
      );
    }
    if (minRating) {
      const min = parseFloat(minRating);
      pool = pool.filter((m) => m.voteAverage >= min);
    }

    if (pool.length === 0) {
      pool = SEED_MOVIES;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    return this.normalizeMovie(pool[randomIndex]);
  }

  /**
   * Discover movies with filters, sorting, and pagination
   */
  async discoverMovies({
    genre,
    year,
    minRating,
    mood,
    collection,
    provider,
    sortBy = 'popularity.desc',
    page = 1,
    limit = 20,
  } = {}) {
    const cacheKey = `discover:${genre || 'all'}:${year || 'all'}:${minRating || 0}:${mood || 'all'}:${collection || 'all'}:${provider || 'all'}:${sortBy}:${page}`;

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        // Fallback queries or local engine
        return this._queryLocalSeed({ genre, year, minRating, mood, collection, provider, sortBy, page, limit });
      },
      900 // 15 mins TTL
    );
  }

  /**
   * Search movies by title query
   */
  async searchMovies({ query = '', page = 1, limit = 20 } = {}) {
    if (!query || !query.trim()) {
      return this.discoverMovies({ page, limit });
    }

    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = `search:${cleanQuery}:${page}`;

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        return this._queryLocalSeed({ search: cleanQuery, page, limit });
      },
      600 // 10 mins TTL
    );
  }

  /**
   * Get Category movies (trending, popular, top_rated, upcoming, now_playing)
   */
  async getCategory(category = 'trending', page = 1) {
    const cacheKey = `category:${category}:${page}`;

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        let sortBy = 'popularity.desc';
        if (category === 'top-rated' || category === 'top_rated') sortBy = 'vote_average.desc';
        if (category === 'now-playing' || category === 'upcoming') sortBy = 'release_date.desc';

        const result = this._queryLocalSeed({ sortBy, page });
        return {
          ...result,
          category,
        };
      },
      900 // 15 mins TTL
    );
  }

  /**
   * Get Movie Details with cast, trailer, and similar recommendations
   */
  async getMovieDetails(movieId) {
    const id = Number(movieId);
    const cacheKey = `movie:details:${id}`;

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const found = SEED_MOVIES.find((m) => Number(m.id) === id);
        if (found) {
          const normalized = this.normalizeMovie(found);
          const genreIds = (normalized.genres || []).map((g) => g.id);
          normalized.similar = SEED_MOVIES
            .filter((m) => Number(m.id) !== id && m.genres.some((g) => genreIds.includes(g.id)))
            .slice(0, 6)
            .map((m) => this.normalizeMovie(m));
          normalized.source = 'local_fallback';
          return normalized;
        }

        return {
          id,
          title: `Movie #${id}`,
          overview: 'Details currently unavailable for this title.',
          releaseDate: 'N/A',
          voteAverage: 0,
          genres: [],
          posterUrl: '',
          backdropUrl: '',
          trailerKey: '',
          cast: [],
          similar: [],
          providers: ['Netflix'],
          moods: [],
          source: 'not_found',
        };
      },
      3600 // 1 hour TTL
    );
  }
}

export const movieService = new MovieService();
