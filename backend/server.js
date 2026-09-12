import express from 'express';
import cors from 'cors';
import { config } from './src/config.js';
import moviesRouter from './src/routes/movies.js';
import wishlistRouter from './src/routes/wishlist.js';
import { cacheService } from './src/services/cacheService.js';
import { databaseService } from './src/services/databaseService.js';
import { movieService } from './src/services/movieService.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// System Health & Telemetry endpoint
app.get('/api/health', (req, res) => {
  const cacheStats = cacheService.getStats();
  const dbStats = databaseService.getStats();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apiConfigured: movieService.isConfigured,
    dataSource: movieService.isConfigured ? 'TheMovieDatabase (TMDB API v3)' : 'Curated Resilient Catalog Engine',
    cache: cacheStats,
    wishlist: dbStats,
  });
});

// Mount Routes
app.use('/api/movies', moviesRouter);
app.use('/api/wishlist', wishlistRouter);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🎬 Trackzio Movie Discovery API Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`🔌 TMDB External API: ${movieService.isConfigured ? 'CONFIGURED (Live API active)' : 'NOT CONFIGURED (Using Curated Resilient Fallback Engine)'}`);
  console.log(`💾 Wishlist Storage: ${config.wishlistFile}`);
  console.log(`⚡ In-Memory Cache: TTL ${config.cacheTtlSeconds}s active with request deduplication`);
  console.log('====================================================');
});

export default app;
