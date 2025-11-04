# The Moodify app
## Your Music, Your Mood, Instantly.

This is a little side project that will retrieve colour palletes from any spotify song, and then alter a background to suite it!

This is also a partial data-collecting project, where I collect the rgb values of every song found and stored in a MongoDB database! The dataset will be public and accessible.

## Tech Stack
- Next.js
- TypeScript
- MongoDB
- TailwindCSS
- Lucide Icons
- Shadcn UI
- Spotify API

## Environment Setup

Copy `.env.example` to `.env.local` and configure the following variables:

### Required Variables
- **`NEXT_PUBLIC_APP_URL`** - Your production URL (e.g., `https://moodify.vercel.app`)
  - **Critical for share link previews** on social media platforms (Ghost CMS, Twitter, Facebook)
  - Ensures Open Graph images resolve correctly
- **`NEXT_PUBLIC_MOODIFY_BACKEND_URL`** - Backend API URL for palette generation and data storage
- **`SPOTIFY_CLIENT_ID`** - Spotify API client ID
- **`SPOTIFY_CLIENT_SECRET`** - Spotify API client secret
- **`SPOTIFY_REFRESH_TOKEN`** - Spotify refresh token for authenticated requests

See [`.env.example`](.env.example) for detailed configuration instructions.

