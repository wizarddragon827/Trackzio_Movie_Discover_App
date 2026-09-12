# Trackzio Cinema — Next-Gen Movie Discovery Application

A production-grade, full-stack movie discovery and streaming guide built with **React** and **Node.js**. Trackzio Cinema delivers a high-end, responsive dark cinema experience featuring a massive 120+ film catalog, interactive movie roulette, mood-based discovery, curated thematic playlists, streaming availability badges, personal 10-star ratings, an analytical **Cinema DNA** dashboard, and persistent wishlist storage with full JSON backup & restore.

![Trackzio Cinema Preview](file:///C:/Users/DARSHAN%20I%20S/.gemini/antigravity-ide/brain/a175fd9b-3cab-4232-80ec-d7db9bf3ca39/home_movie_cards_1789215086474.png)

---

## Table of Contents
1. [Overview & User Experience](#overview--user-experience)
2. [Flagship Special Functionalities](#flagship-special-functionalities)
3. [Architecture & System Design](#architecture--system-design)
4. [Key Technical Decisions](#key-technical-decisions)
5. [Resilience & Real-World Edge Case Handling](#resilience--real-world-edge-case-handling)
6. [Database & Persistence Model](#database--persistence-model)
7. [Setup & Installation](#setup--installation)
8. [API Documentation](#api-documentation)
9. [Assumptions Made](#assumptions-made)
10. [Known Limitations](#known-limitations)
11. [AI Transparency Statement](#ai-transparency-statement)
12. [Future Roadmap & Improvements](#future-roadmap--improvements)

---

## Overview & User Experience

Trackzio Cinema is designed to feel like an authentic, commercial-grade entertainment product rather than a bare-bones API wrapper:

- **Effortless Discovery**: Browse categories (*Trending This Week*, *Popular*, *Top Rated*, *Now Playing*, *Upcoming*) without needing to type a query.
- **Spotlight Hero Banner**: Features dynamic backdrop art, IMDb-style ratings, runtime, genre tags, streaming provider badges, quick trailer playback, and one-click wishlist toggling.
- **Instant Search & Deep Multi-Attribute Filtering**: Debounced search input (350ms) paired with multi-parameter filtering:
  - 18 official movie genres (Action, Sci-Fi, Animation, Drama, Crime, Fantasy, etc.)
  - Release year selectors (1970s to 2025+)
  - Minimum rating threshold (0.0 to 9.0+)
  - Sorting by Popularity, Rating, Release Date, and Title
- **Rich Movie Details Modal**: Deep-dive view with high-res backdrop, directors, full synopsis, top cast members with headshots and character roles, embedded YouTube trailers, streaming provider badges, and similar movie recommendations.
- **Persistent Wishlist**: Wishlist items are saved persistently to a local backend database (`backend/data/wishlist.json`), surviving browser refreshes and server reboots. Includes watchlist statistics, status filters (*Want to Watch* vs. *Watched*), inline personal notes, and real-time counter badges.
- **Navigation Context Preservation**: Switching between browsing categories, viewing details, and modifying the wishlist preserves filter selections and scroll positions.

---

## Flagship Special Functionalities

### 1. 🎲 "Surprise Me" (Movie Roulette)
Can't decide what to watch? The **Surprise Me** feature opens an animated movie roulette modal with a slot-spinning effect. Users can optionally lock in a specific genre or spin across all films. The selected winner displays full details, where it's streaming, a direct button to watch the trailer, and one-click wishlist toggling.

### 2. 🎭 Mood & Vibe Discovery Engine
Discover films by how you want to feel. 7 emoji-tagged mood filters instantly surface matching cinema:
- ⚡ **Adrenaline Rush** (Action, Adventure, High Stakes)
- 🧠 **Mind-Bending** (Sci-Fi, Psychological Thrillers, Mystery)
- ✨ **Feel-Good** (Heartwarming Animation, Uplifting Drama)
- 🥺 **Deep & Emotional** (Award-winning Dramas, Poignant Narratives)
- 😱 **Spine-Chilling** (Horror, Dark Suspense, Supernatural)
- 😂 **Pure Laughs** (Comedy, Lighthearted Romps)
- 🌙 **Cozy & Dreamy** (Studio Ghibli, Fantasy, Whimsical Escapism)

### 3. 🏆 Curated Thematic Playlists & Collections
Dedicated **Playlists** tab showcasing hand-crafted collections curated by film buffs:
- **Christopher Nolan Mind-Benders** (*Inception*, *Interstellar*, *Oppenheimer*, *The Prestige*, *Memento*)
- **Academy Award Best Picture Winners** (*Parasite*, *Everything Everywhere All at Once*, *Gladiator*, *Schindler's List*)
- **Studio Ghibli Magic** (*Spirited Away*, *Princess Mononoke*, *Howl's Moving Castle*, *My Neighbor Totoro*)
- **90s Cult Classics** (*Pulp Fiction*, *The Matrix*, *Fight Club*, *The Big Lebowski*, *The Silence of the Lambs*)
- **Epic Sci-Fi Odysseys** (*Dune: Part Two*, *Blade Runner 2049*, *2001: A Space Odyssey*, *Arrival*, *The Matrix*)
- **Edge-of-Your-Seat Thrillers** (*Se7en*, *Zodiac*, *Sicario*, *No Country for Old Men*, *Parasite*)

Clicking any collection opens its curated film set directly in the discovery view.

### 4. 📺 "Where to Watch" Streaming Badges
Every movie card and modal displays authentic streaming provider badges indicating availability (e.g., **Netflix**, **Prime Video**, **Max**, **Disney+**, **Apple TV+**, **Hulu**, **Criterion Channel**).

### 5. 📊 "Cinema DNA" Dashboard
Built right into the Wishlist, this analytics suite calculates:
- **Total Watch Time**: Calculates the combined runtime of all saved films (in both hours and minutes).
- **Watch Progress**: Visual progress bar indicating the percentage of your wishlist that has been marked as watched.
- **Top Favorite Genres**: Automatically breaks down your taste profile by calculating the most frequent genres across your saved movies.

### 6. ⭐ Personal 10-Star Rating System
Unlike standard platforms that only show public critic scores, Trackzio Cinema allows users to record their own **1–10 star personal rating** for any saved film. Ratings are instantly saved to the database and displayed alongside community scores.

### 7. 💾 Wishlist Backup & Restore (JSON Export & Import)
True data ownership:
- **Export**: One-click download of your entire wishlist (including watch status, personal notes, and custom star ratings) as a clean, formatted JSON file.
- **Import / Restore**: Drag-and-drop or upload a previously exported JSON backup to restore or merge saved films with duplicate detection and schema validation.

---

## Architecture & System Design

```
[ Client Layer (React + Vite SPA) ]
   │
   ├─► Debounced Search & Multi-Attribute Filter Controls
   ├─► Mood & Vibe Selector (7 Curated Emotional Filters)
   ├─► "Surprise Me" Slot-Reel Roulette Modal
   ├─► Curated Collections & Thematic Playlists View
   ├─► Optimistic UI State (WishlistContext & Instant Toasts)
   ├─► Cinema DNA Analytics Engine & 10-Star Rating Widget
   ├─► JSON Wishlist Export & Import System
   │
   ▼ (RESTful HTTP / JSON)
[ Backend Abstraction Layer (Node.js + Express) ]
   │
   ├─► In-Memory TTL Cache (NodeCache: 15m - 24h)
   ├─► In-Flight Request Deduplication Pool (Prevents upstream call thundering)
   ├─► Data Normalization Layer (Cleanses schemas, resolves CDN posters & trailers)
   │
   ├─► [ Persistent Storage (Atomic JSON DB) ] ── (Wishlist, Notes, Watched, Ratings)
   │
   └─► [ External Movie Service / Fallback Engine ]
          ├──► [ TMDB API v3 ] (When API key is supplied & reachable)
          └──► [ 121+ Movie Curated Catalog Engine ] (100% offline & resilient fallback)
```

### Why a Dedicated Backend Abstraction Layer?
1. **API Key Security**: The client never communicates with third-party movie APIs directly, preventing API key exposure in browser network requests.
2. **Schema Normalization**: Third-party APIs frequently deliver inconsistent field names (e.g. `vote_average` vs `rating`, `first_air_date` vs `release_date`, relative image paths like `/xyz.jpg`). The backend normalizes all movie entities into a single, predictable schema.
3. **Bandwidth & Rate-Limit Optimization**: Multi-tier caching ensures identical queries (e.g. repeated homepage visits or popular searches) return in **<3ms** directly from RAM.
4. **Resilient Fallbacks**: If the external API is slow, rate-limited (HTTP 429), or completely down/blocked by network policies, the backend seamlessly falls back to an embedded catalog of 121 top movies across all 18 genres without crashing the user interface.

---

## Key Technical Decisions

| Decision | Alternative Considered | Rationale |
|---|---|---|
| **React + Vite** | Next.js, CRA | Lightning-fast development server (400ms startup), lightweight client-side bundle, clean SPA navigation without complex SSR overhead. |
| **Vanilla CSS Design System** | TailwindCSS | Complete control over cinematic glassmorphism, responsive CSS grids, CSS variables, and bespoke micro-animations without external CSS framework bloat. |
| **Atomic File-Backed Persistence** | SQLite (`better-sqlite3`), MongoDB | Zero-native compilation required on Windows/macOS/Linux; writes to `.tmp` files before renaming atomically, ensuring corruption-free persistence across server restarts. |
| **In-Flight Request Deduplication** | Traditional cache only | If multiple users simultaneously query the same new movie, traditional caches would trigger redundant upstream calls. Deduplication registers an active Promise map so subsequent requests share the single in-flight call. |
| **Optimistic UI Updates** | Pessimistic server-await | Heart/Wishlist clicks instantly toggle visually in the UI and badge counter, while syncing in the background. If a network failure occurs, the state automatically rolls back with a toast alert. |
| **Slot Roulette Animation** | Static modal popup | Adds a delightful gamified touch to movie discovery, making decision paralysis fun to overcome. |

---

## Resilience & Real-World Edge Case Handling

1. **Slow or Unavailable External API**:
   - Backend implements request timeouts (6-second cutoff) with fallback to curated high-fidelity seed movies across all 18 official genres.
2. **Rate Limiting (HTTP 429)**:
   - Upstream rate limits are caught gracefully and served from the cache or local catalog.
3. **Rapid Filter / Search Changes**:
   - Frontend leverages `useDebounce` (350ms) to avoid firing requests on every keystroke.
4. **Missing or Incomplete Metadata**:
   - Built-in fallback gradients and SVG icons trigger if a movie poster URL 404s or is absent.
   - Defaults are provided for missing runtimes, synopses, and genre arrays.
5. **Long Movie Titles & Layout Stability**:
   - Card titles and genre badges use CSS ellipsis truncation (`text-overflow: ellipsis`) and native `title` tooltips to maintain responsive card heights.

---

## Database & Persistence Model

Wishlist data is saved to `backend/data/wishlist.json`.

### Wishlist Item Schema
```json
{
  "id": "wl_693134",
  "movieId": 693134,
  "title": "Dune: Part Two",
  "posterUrl": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  "backdropUrl": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg",
  "releaseDate": "2024-02-27",
  "voteAverage": 8.2,
  "voteCount": 4890,
  "genres": [
    { "id": 878, "name": "Science Fiction" },
    { "id": 12, "name": "Adventure" }
  ],
  "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani...",
  "runtime": 166,
  "watched": true,
  "userNotes": "Spectacular sound design and world building!",
  "userRating": 9,
  "providers": ["Max", "Apple TV+"],
  "addedAt": "2026-09-12T10:05:00.000Z",
  "updatedAt": "2026-09-12T12:15:30.000Z"
}
```

*Data Stored vs. Retrieved*:
- **Stored Locally**: Full movie snapshot (title, poster, rating, genres, providers) + user-specific state (`watched`, `userNotes`, `userRating`, `addedAt`). Storing snapshot metadata ensures the wishlist remains **100% accessible and functional even if the external movie service is completely offline**.
- **Retrieved Dynamically**: Up-to-date recommendations, latest cast listings, and live streaming providers.

---

## Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/wizarddragon827/Trackzio_Movie_Discover_App.git
cd Trackzio_Movie_Discover_App
```

### 2. Install Dependencies
You can install both backend and frontend dependencies in one command from the project root:
```bash
npm run install:all
```
*Or manually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables (Optional)
The application works **100% out-of-the-box** using its curated 121-movie catalog without needing any API keys or network connection.

To optionally connect to live TMDB data:
1. Create a free API key at [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api).
2. Open `backend/.env` and add your key:
```env
PORT=5000
TMDB_API_KEY=your_tmdb_api_key_here
CACHE_TTL_SECONDS=900
```

### 4. Run the Application
In separate terminal windows, start the backend and frontend:

**Terminal 1 (Backend API)**:
```bash
npm run dev:backend
# Starts Express server on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
npm run dev:frontend
# Starts Vite dev server on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Documentation

### Movies Endpoints (`/api/movies`)

- `GET /api/movies/trending?page=1` — Returns weekly trending movies.
- `GET /api/movies/popular?page=1` — Returns popular movies.
- `GET /api/movies/top-rated?page=1` — Returns all-time top-rated movies.
- `GET /api/movies/now-playing?page=1` — Returns current theatrical releases.
- `GET /api/movies/upcoming?page=1` — Returns upcoming releases.
- `GET /api/movies/genres` — Returns list of official movie genres.
- `GET /api/movies/discover?genre=28&year=2024&minRating=7.0&sortBy=vote_average.desc&mood=adrenaline&collection=nolan&page=1` — Deep filtered discovery supporting genres, release year, minimum rating, sorting, mood, and collection filters.
- `GET /api/movies/search?q=Dune&page=1` — Keyword search across titles, directors, and synopsis.
- `GET /api/movies/random?genre=878` — Returns a random movie for the Surprise Me roulette (optionally filtered by genre).
- `GET /api/movies/moods` — Returns the 7 curated mood definitions with icons and descriptions.
- `GET /api/movies/collections` — Returns curated thematic playlists with preview movies.
- `GET /api/movies/collections/:id` — Returns movies inside a specific curated collection.
- `GET /api/movies/:id` — Full details for a movie including cast, director, trailer keys, streaming providers, and similar recommendations.

### Wishlist Endpoints (`/api/wishlist`)

- `GET /api/wishlist` — Retrieve all saved movies (supports `search`, `status`, `genre`, `sortBy`).
- `GET /api/wishlist/stats` — Returns aggregate metrics & Cinema DNA analytics (`total`, `watched`, `wantToWatch`, `averageRating`, `totalRuntimeMinutes`, `watchedRuntimeMinutes`, `completionPercentage`, `topGenres`).
- `GET /api/wishlist/check/:id` — Check if a specific movie is in the user's wishlist.
- `POST /api/wishlist` — Save a movie snapshot to the persistent wishlist.
- `POST /api/wishlist/import` — Bulk import/restore wishlist items from a JSON payload.
- `PUT /api/wishlist/:id` — Update `watched` status (boolean), `userNotes` (string), or `userRating` (1–10 integer).
- `DELETE /api/wishlist/:id` — Remove a movie from the wishlist.

### Telemetry (`/api/health`)
- `GET /api/health` — Returns system status, cache hit/miss counts, catalog size, active memory footprint, and data source status.

---

## Assumptions Made

1. **User Identity**: The wishlist is single-user / local workspace scoped (persisted in `backend/data/wishlist.json`). In a multi-tenant production environment, user authentication (JWT/OAuth) and user IDs would partition the wishlist table.
2. **Video Playback**: Third-party YouTube trailers are embedded using YouTube's official privacy-enhanced nocookie embed player (`https://www.youtube-nocookie.com/embed/{trailerKey}`).
3. **Data Freshness**: Movie metadata (genres, synopses, cast) changes infrequently, making a 15-minute cache TTL an optimal balance between responsiveness and upstream rate limits.

---

## Known Limitations

1. **TMDB Regional Restrictions**: Some YouTube trailers may have geographic viewing restrictions applied by film distributors on YouTube.
2. **Pagination Depth**: Discover pagination is capped at page 500 in accordance with TMDB API guidelines.
3. **Single-Node File Locking**: The JSON storage mechanism uses atomic file replacement suitable for single-instance Node.js deployments. For distributed multi-instance clusters, a database like PostgreSQL or Redis would be preferred.

---

## AI Transparency Statement

Used AI to understand the third-party API documentation, explore resilient request caching patterns, generate initial API boilerplate, and troubleshoot request handling. The full-stack API architecture, database persistence design, component hierarchy, and cinema design system were based on my own decisions.

---

## Future Roadmap & Improvements

- [x] **Curated Thematic Playlists**: Implemented 6 hand-picked playlists (Nolan, Oscars, Ghibli, 90s, Sci-Fi, Thrillers).
- [x] **Surprise Me Roulette**: Implemented slot-style random movie picker.
- [x] **Mood-Based Discovery**: Implemented 7 emotional vibe filters.
- [x] **Cinema DNA Watch Analytics**: Implemented total watch time, completion %, and top genres.
- [x] **Personal Star Ratings**: Implemented 1–10 star rating system in persistent storage.
- [x] **Wishlist Backup & Restore**: Implemented full JSON export & import.
- [ ] **User Authentication & Multi-User Profiles**: Add JWT-based auth to support individual user accounts and multiple separate wishlists.
- [ ] **PWA / Offline Service Worker**: Add Service Worker caching for complete offline browsing capability on mobile devices.