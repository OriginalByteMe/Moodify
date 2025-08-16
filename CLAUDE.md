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
- `/api/data/collection/bulk` - Handles bulk track data operations
- `/api/data/collection/single` - Handles single track operations
- `/api/data/palette-picker` - Manages color palette operations

**Component Architecture**
- Theme system with dark/light mode support
- Reusable UI components in `app/components/ui/`
- Search functionality with debounced input
- Dynamic background rendering based on color palettes

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