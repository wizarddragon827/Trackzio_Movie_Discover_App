import express from 'express';
import { databaseService } from '../services/databaseService.js';

const router = express.Router();

// GET /api/wishlist - Get all wishlist movies with filtering, search, and sort
router.get('/', (req, res, next) => {
  try {
    const { search, status, genre, sortBy } = req.query;
    const items = databaseService.getAll({ search, status, genre, sortBy });
    const stats = databaseService.getStats();

    res.json({
      success: true,
      stats,
      count: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/wishlist/stats - Get summary stats & Cinema DNA metrics
router.get('/stats', (req, res, next) => {
  try {
    const stats = databaseService.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/wishlist/export - Export entire wishlist as JSON
router.get('/export', (req, res, next) => {
  try {
    const items = databaseService.getAll();
    const stats = databaseService.getStats();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="trackzio_wishlist.json"');
    res.json({
      exportedAt: new Date().toISOString(),
      stats,
      items,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/import - Import wishlist items from JSON
router.post('/import', (req, res, next) => {
  try {
    const items = req.body?.items || req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Expected an array of items to import.' });
    }

    const result = databaseService.importAll(items);
    res.json({
      success: true,
      message: `Successfully imported ${result.addedCount} movies.`,
      stats: databaseService.getStats(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/wishlist/check/:id - Check if a movie is currently in wishlist
router.get('/check/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const item = databaseService.getById(id);
    res.json({
      success: true,
      inWishlist: item !== null,
      item,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist - Add movie to persistent wishlist
router.post('/', (req, res, next) => {
  try {
    const movie = req.body;
    if (!movie || !movie.id) {
      return res.status(400).json({ success: false, message: 'Movie ID and data are required.' });
    }

    const saved = databaseService.add(movie);
    res.status(201).json({
      success: true,
      message: 'Movie added to wishlist.',
      item: saved,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/wishlist/:id - Update watched status, notes, or userRating
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const updated = databaseService.update(id, updates);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found in wishlist.' });
    }

    res.json({
      success: true,
      message: 'Wishlist item updated successfully.',
      item: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:id - Remove movie from wishlist
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = databaseService.remove(id);

    if (!removed) {
      return res.status(404).json({ success: false, message: 'Movie not found in wishlist.' });
    }

    res.json({
      success: true,
      message: 'Movie removed from wishlist.',
      movieId: Number(id),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
