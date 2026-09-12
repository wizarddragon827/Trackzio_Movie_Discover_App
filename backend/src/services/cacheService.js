import NodeCache from 'node-cache';
import { config } from '../config.js';

// Cache instance with standard TTL and automatic check period
const cache = new NodeCache({
  stdTTL: config.cacheTtlSeconds,
  checkperiod: 120,
  useClones: false,
});

// Map of in-flight promises to deduplicate concurrent requests
const pendingRequests = new Map();

export const cacheService = {
  get(key) {
    return cache.get(key);
  },

  set(key, value, ttl = config.cacheTtlSeconds) {
    return cache.set(key, value, ttl);
  },

  has(key) {
    return cache.has(key);
  },

  del(key) {
    return cache.del(key);
  },

  flush() {
    return cache.flushAll();
  },

  getStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize,
    };
  },

  /**
   * Fetch with cache and in-flight request deduplication.
   * If an identical request is already pending, subsequent calls share the same promise.
   */
  async getOrFetch(key, fetchFn, ttl = config.cacheTtlSeconds) {
    // 1. Check existing cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      return { data: cached, fromCache: true };
    }

    // 2. Check if a request for this key is currently in-flight
    if (pendingRequests.has(key)) {
      const data = await pendingRequests.get(key);
      return { data, fromCache: true, deduplicated: true };
    }

    // 3. Initiate request and register promise in pendingRequests
    const fetchPromise = (async () => {
      try {
        const result = await fetchFn();
        if (result !== undefined && result !== null) {
          cache.set(key, result, ttl);
        }
        return result;
      } finally {
        pendingRequests.delete(key);
      }
    })();

    pendingRequests.set(key, fetchPromise);
    const data = await fetchPromise;
    return { data, fromCache: false };
  },
};
