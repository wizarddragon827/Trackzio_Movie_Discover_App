import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10), // 15 mins default
  dataDir: path.join(__dirname, '..', 'data'),
  wishlistFile: path.join(__dirname, '..', 'data', 'wishlist.json'),
};
