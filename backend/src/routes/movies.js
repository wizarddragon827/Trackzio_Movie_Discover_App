import express from 'express';
import { movieService } from '../services/movieService.js';

const router = express.Router();

// GET /api/movies/genres
router.get('/genres', async (req, res, next) => {
  try {
    const { data, fromCache } = await movieService.getGenres();
    res.json({
      success: true,
      fromCache,
      genres: data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/moods - Vibe/Mood Explorer
router.get('/moods', (req, res) => {
  const moods = movieService.getMoods();
  res.json({ success: true, moods });
});

// GET /api/movies/collections - Curated Thematic Playlists
router.get('/collections', (req, res) => {
  const collections = movieService.getCollections();
  res.json({ success: true, collections });
});

// GET /api/movies/random - Surprise Me Movie Roulette
router.get('/random', (req, res) => {
  try {
    const { genre, minRating, mood } = req.query;
    const movie = movieService.getRandomMovie({ genre, minRating, mood });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/movies/trending
router.get('/trending', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const { data, fromCache } = await movieService.getCategory('trending', page);
    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/popular
router.get('/popular', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const { data, fromCache } = await movieService.getCategory('popular', page);
    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/top-rated
router.get('/top-rated', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const { data, fromCache } = await movieService.getCategory('top-rated', page);
    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/upcoming
router.get('/upcoming', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const { data, fromCache } = await movieService.getCategory('upcoming', page);
    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/now-playing
router.get('/now-playing', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const { data, fromCache } = await movieService.getCategory('now-playing', page);
    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/discover (Filtering by genre, year, minRating, mood, collection, provider, sorting, pagination)
router.get('/discover', async (req, res, next) => {
  try {
    const { genre, year, minRating, mood, collection, provider, sortBy, page, limit } = req.query;
    const { data, fromCache } = await movieService.discoverMovies({
      genre,
      year,
      minRating,
      mood,
      collection,
      provider,
      sortBy: sortBy || 'popularity.desc',
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });

    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/search (Search by keyword query with pagination)
router.get('/search', async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const { data, fromCache } = await movieService.searchMovies({
      query: q || '',
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });

    res.json({
      success: true,
      fromCache,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id (Detailed information, cast, trailers, recommendations)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, fromCache } = await movieService.getMovieDetails(id);

    if (!data) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.json({
      success: true,
      fromCache,
      movie: data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
