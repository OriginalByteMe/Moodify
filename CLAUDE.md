# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix

## Architecture Overview

Moodify is a Next.js application that extracts color palettes from Spotify album artwork and creates dynamic backgrounds. The app uses a microservices architecture with a separate backend for data processing.

### Core Data Flow
1. User searches for music via Spotify API (`lib/spotify.ts`)
2. Selected track's album artwork is sent to external palette service (`lib/palette-fetcher.ts`)
3. Color palette is generated and stored in MongoDB via backend API
4. Redux state manages both Spotify data and color palettes
5. Background dynamically updates based on extracted colors

### Key Architecture Components

**State Management**
- Redux Toolkit with two main slices: `spotifySlice` and `colourPaletteSlice`
- Store configuration in `lib/store.ts` with serialization disabled for complex color data
- Provider setup in `app/StoreProvider.tsx`

**External Dependencies**
- Backend API: `NEXT_PUBLIC_MOODIFY_BACKEND_URL` (palette generation and data storage)
- Spotify API: Client credentials flow implemented in `lib/spotify.ts`
- MongoDB: Accessed through backend, not directly from frontend

**API Routes Structure**
- `/api/spotify/search` - Proxies Spotify search requests
- `/api/spotify/album/[id]/tracks` - Fetches album tracks from Spotify
- `/api/data/collection/bulk` - Handles bulk track data operations
- `/api/data/collection/single` - Handles single track operations
- `/api/data/album/bulk` - Handles bulk album data operations
- `/api/data/palette-picker` - Manages color palette operations
- `/api/preview/resolve` - Resolves playable preview URLs (spotify-preview-finder, then iTunes Search fallback)
- `/api/track/[id]` - Individual track data endpoint
- `/api/cache/revalidate` - Cache revalidation endpoint

**Component Architecture**
- Theme system with dark/light mode support
- Reusable UI components in `app/components/ui/`
- Search functionality with debounced input
- Dynamic 3D background rendering using ShaderGradient (`app/components/ui/lavaLampBackground.tsx`), driven by the mood/genre scene engine in `lib/mood-visuals.ts`
- Brand mark component (`app/components/Logo.tsx`) with gradient wordmark styles in `app/styles/globals.css`
- Header component with conditional visibility (`app/components/Header.tsx`)
- Fullscreen player with track visualization (`app/components/FullscreenPlayer.tsx`)
- Preview player with audio controls (`app/components/PreviewPlayer.tsx`)
- Play and Share pages with dynamic routing (`/play/[id]`, `/share/[id]`)

### Environment Variables Required
```
NEXT_PUBLIC_MOODIFY_BACKEND_URL - Backend service URL
SPOTIFY_CLIENT_ID - Spotify API credentials
SPOTIFY_CLIENT_SECRET - Spotify API credentials
SPOTIFY_REFRESH_TOKEN - For authenticated requests
```

### Database Integration
- Track data is stored via backend API calls in `lib/database-handler.ts`
- Backend handles MongoDB operations and palette generation
- Frontend never directly accesses database
- Bulk operations supported for efficient data storage

### Color Palette Processing
- Album artwork URLs are sent to external palette service
- Service returns RGB color arrays (format: `[[r,g,b], [r,g,b], ...]`)
- Default emerald palette used as fallback on errors
- Palettes are stored with track metadata for future retrieval
- 3D backgrounds dynamically adapt to extracted color palettes and track tempo

### Performance Optimizations
- Next.js caching with `unstable_cache` for track data (`lib/get-track-cached.ts`)
- Cache revalidation system with tag-based invalidation
- Spotify preview URL enrichment using `spotify-preview-finder` library
- Track data normalization for consistent API responses

### 3D Visualization Features
- WebGL-based shader gradients using `@shadergradient/react`
- Scene engine (`lib/mood-visuals.ts`): genre families (rock, metal, EDM, hip-hop, pop, R&B, jazz, acoustic, classical, ambient, latin) each define a visual language; multi-genre tracks blend presets proportionally
- Six background renderers, picked per scene (seeded, genre-weighted): ShaderGradient surfaces, a BPM-synced particle field, a noise-displaced morph blob, an equalizer bar floor (EDM/hip-hop), a wireframe ring tunnel (rock/metal, jaggedness follows aggression), and aurora ribbon waves (jazz/classical/ambient) — all in `app/components/ui/backgrounds/`, lazy-loaded, pulsing to the track tempo
- `SceneErrorBoundary` in `lavaLampBackground.tsx` degrades gracefully when WebGL/CDN assets fail: full scene -> no-fetch '3d' lighting -> static palette backdrop
- Pixel dancers (`app/components/PixelDancers.tsx`): hand-drawn 12x16 sprite crew on /play and the fullscreen player; costumes/dance styles from genre families, moves synced to BPM. Platform physics: elements marked `data-dancer-platform` are solid ground — dancers rain in, land on album art/swatches/player pill, bounce off hard throws, walk off edges, snap onto platforms on gentle drops, and show a carried pose while dragged
- Visual QA lab at `/demo` (`?renderer=bars&genre=edm&bpm=128`) renders any scene + dancers with demo data, no Spotify/backend needed
- Mood labels from the backend mood engine bias speed/turbulence/brightness; tempo/energy/valence fine-tune
- Seeded per track with a per-mount variation salt, so each song stays recognisable but never renders the same scene twice
- Track genres come from batched Spotify artist lookups (`lib/spotify.ts`); mood comes from backend `POST /analysis/track`

### Mood Detection
- See `docs/MOOD_WORKFLOW.md` for the full mood-derivation workflow and upgrade paths (lyrics sentiment, Last.fm tags, key/mode detection, pretrained taggers)
- `/api/data/collection/bulk` enriches tracks with audio features via the Modal analyzer, falling back to the backend's first-party `/analysis/track`