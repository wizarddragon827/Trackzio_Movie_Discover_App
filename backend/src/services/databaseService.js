import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

class DatabaseService {
  constructor() {
    this.filePath = config.wishlistFile;
    this.initDatabase();
  }

  initDatabase() {
    try {
      if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify({ items: [] }, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[DB] Failed to initialize persistent storage:', err);
    }
  }

  _read() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { items: [] };
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('[DB] Error reading wishlist database:', err);
      return { items: [] };
    }
  }

  _write(data) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error('[DB] Error writing wishlist database:', err);
      throw new Error('Failed to persist wishlist change.');
    }
  }

  getAll({ search = '', status = 'all', genre = '', sortBy = 'added_desc' } = {}) {
    const db = this._read();
    let items = [...(db.items || [])];

    // Status filter: all, want_to_watch, watched
    if (status === 'watched') {
      items = items.filter((item) => item.watched === true);
    } else if (status === 'want_to_watch') {
      items = items.filter((item) => !item.watched);
    }

    // Genre filter
    if (genre) {
      items = items.filter((item) =>
        item.genres && Array.isArray(item.genres) &&
        item.genres.some((g) =>
          (typeof g === 'string' && g.toLowerCase() === genre.toLowerCase()) ||
          (g.name && g.name.toLowerCase() === genre.toLowerCase()) ||
          (g.id && String(g.id) === String(genre))
        )
      );
    }

    // Search filter (title, overview, notes)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.overview && item.overview.toLowerCase().includes(q)) ||
          (item.userNotes && item.userNotes.toLowerCase().includes(q))
      );
    }

    // Sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case 'added_asc':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'rating_desc':
          return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'user_rating_desc':
          return (b.userRating || 0) - (a.userRating || 0);
        case 'release_desc':
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        case 'added_desc':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

    return items;
  }

  getById(movieId) {
    const db = this._read();
    const id = Number(movieId);
    return db.items.find((item) => Number(item.movieId) === id) || null;
  }

  has(movieId) {
    return this.getById(movieId) !== null;
  }

  add(movie) {
    if (!movie || !movie.id) {
      throw new Error('Valid movie object with id is required.');
    }
    const db = this._read();
    const movieId = Number(movie.id);

    const existingIndex = db.items.findIndex((item) => Number(item.movieId) === movieId);
    const now = new Date().toISOString();

    const entry = {
      id: `wl_${movieId}`,
      movieId: movieId,
      title: movie.title || 'Untitled',
      posterUrl: movie.posterUrl || movie.poster_path || '',
      backdropUrl: movie.backdropUrl || movie.backdrop_path || '',
      releaseDate: movie.releaseDate || movie.release_date || '',
      voteAverage: movie.voteAverage ?? movie.vote_average ?? 0,
      voteCount: movie.voteCount ?? movie.vote_count ?? 0,
      genres: movie.genres || [],
      overview: movie.overview || '',
      runtime: movie.runtime || 120,
      providers: movie.providers || ['Netflix'],
      trailerKey: movie.trailerKey || '',
      watched: false,
      userNotes: '',
      userRating: null,
      addedAt: now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      db.items[existingIndex] = {
        ...entry,
        watched: db.items[existingIndex].watched,
        userNotes: db.items[existingIndex].userNotes,
        userRating: db.items[existingIndex].userRating,
        addedAt: db.items[existingIndex].addedAt,
        updatedAt: now,
      };
      this._write(db);
      return db.items[existingIndex];
    }

    db.items.unshift(entry);
    this._write(db);
    return entry;
  }

  update(movieId, updates) {
    const db = this._read();
    const id = Number(movieId);
    const index = db.items.findIndex((item) => Number(item.movieId) === id);

    if (index === -1) {
      return null;
    }

    const item = db.items[index];
    const allowed = ['watched', 'userNotes', 'userRating'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        item[key] = updates[key];
      }
    }
    item.updatedAt = new Date().toISOString();

    db.items[index] = item;
    this._write(db);
    return item;
  }

  remove(movieId) {
    const db = this._read();
    const id = Number(movieId);
    const initialLen = db.items.length;
    db.items = db.items.filter((item) => Number(item.movieId) !== id);

    if (db.items.length !== initialLen) {
      this._write(db);
      return true;
    }
    return false;
  }

  importAll(items) {
    if (!Array.isArray(items)) throw new Error('Items must be an array.');
    const db = this._read();
    const existingIds = new Set(db.items.map((i) => Number(i.movieId)));

    let addedCount = 0;
    for (const item of items) {
      if (item && (item.movieId || item.id)) {
        const mid = Number(item.movieId || item.id);
        if (!existingIds.has(mid)) {
          db.items.unshift({
            id: `wl_${mid}`,
            movieId: mid,
            title: item.title || 'Untitled',
            posterUrl: item.posterUrl || '',
            backdropUrl: item.backdropUrl || '',
            releaseDate: item.releaseDate || '',
            voteAverage: item.voteAverage || 0,
            voteCount: item.voteCount || 0,
            genres: item.genres || [],
            overview: item.overview || '',
            runtime: item.runtime || 120,
            providers: item.providers || ['Netflix'],
            trailerKey: item.trailerKey || '',
            watched: Boolean(item.watched),
            userNotes: item.userNotes || '',
            userRating: item.userRating || null,
            addedAt: item.addedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          existingIds.add(mid);
          addedCount++;
        }
      }
    }

    this._write(db);
    return { addedCount, total: db.items.length };
  }

  getStats() {
    const db = this._read();
    const total = db.items.length;
    const watched = db.items.filter((i) => i.watched).length;
    const wantToWatch = total - watched;
    const averageRating =
      total > 0
        ? (db.items.reduce((acc, curr) => acc + (curr.voteAverage || 0), 0) / total).toFixed(1)
        : 0;

    // Total Watch Time in minutes and formatted
    const totalMinutes = db.items.reduce((acc, curr) => acc + (curr.runtime || 115), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const formattedWatchTime = `${hours}h ${mins}m`;

    // Watched watch time
    const watchedMinutes = db.items
      .filter((i) => i.watched)
      .reduce((acc, curr) => acc + (curr.runtime || 115), 0);
    const watchedHours = Math.floor(watchedMinutes / 60);
    const watchedMins = watchedMinutes % 60;
    const formattedWatchedTime = `${watchedHours}h ${watchedMins}m`;

    // Completion percentage
    const completionPercentage = total > 0 ? Math.round((watched / total) * 100) : 0;

    // Genre Breakdown for Cinema DNA
    const genreCounts = {};
    for (const item of db.items) {
      if (item.genres && Array.isArray(item.genres)) {
        for (const g of item.genres) {
          const gName = typeof g === 'object' ? g.name : g;
          if (gName) {
            genreCounts[gName] = (genreCounts[gName] || 0) + 1;
          }
        }
      }
    }

    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      watched,
      wantToWatch,
      averageRating: Number(averageRating),
      totalMinutes,
      formattedWatchTime,
      watchedMinutes,
      formattedWatchedTime,
      completionPercentage,
      topGenres,
    };
  }

  clear() {
    this._write({ items: [] });
    return true;
  }
}

export const databaseService = new DatabaseService();
