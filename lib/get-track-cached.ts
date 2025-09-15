import { revalidateTag, unstable_cache } from 'next/cache'
import type { SpotifyTrack } from '@/app/utils/interfaces'
import { fetchTrackFromDatabase } from '@/lib/database-handler'
import { getTrackById } from '@/lib/spotify'
import { fetchColourPaletteFromImage } from '@/lib/palette-fetcher'
import { patchTrack } from '@/lib/database-handler'

function normalizeTrack(t: any): SpotifyTrack | null {
  if (!t) return null
  const artists = Array.isArray(t?.artists)
    ? t.artists
    : typeof t?.artists === 'string'
      ? t.artists.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  const id = t.id ?? t.spotifyId
  const title = t.title ?? t.track_name ?? t.name
  if (!id || !title) return null
  return {
    id,
    title,
    artists,
    album: t.album ?? t.album_name ?? '',
    albumId: t.albumId ?? t.spotifyAlbumId,
    albumCover: t.albumCover ?? t.album?.images?.[0]?.url,
    songUrl: t.songUrl ?? t.external_urls?.spotify ?? '',
    previewUrl: t.previewUrl ?? t.preview_url ?? null,
    colourPalette: t.colourPalette ?? [],
    popularity: t.popularity,
    duration_ms: t.duration_ms,
    explicit: t.explicit,
    danceability: t.danceability,
    energy: t.energy,
    key: t.key,
    loudness: t.loudness,
    mode: t.mode,
    speechiness: t.speechiness,
    acousticness: t.acousticness,
    instrumentalness: t.instrumentalness,
    liveness: t.liveness,
    valence: t.valence,
    tempo: t.tempo,
    time_signature: t.time_signature,
    audio_features_status: t.audio_features_status,
  }
}

async function fetchTrack(id: string): Promise<SpotifyTrack | null> {
  // Try backend DB first
  try {
    const t = await fetchTrackFromDatabase(id)
    const n = normalizeTrack(t)
    if (n) return n
  } catch {}
  // Fallback to Spotify API
  try {
    const t = await getTrackById(id)
    const n = normalizeTrack(t)
    if (n) return n
  } catch {}
  return null
}

function trackTag(id: string) {
  return `track:${id}`
}

export function getTrackCached(id: string) {
  const cached = unstable_cache(
    async () => {
      const base = await fetchTrack(id)
      if (!base) return null

      // Ensure palette exists. If missing and we have album art, fetch and persist.
      if ((!base.colourPalette || base.colourPalette.length === 0) && base.albumCover) {
        try {
          const palette = await fetchColourPaletteFromImage(base.albumCover)
          if (Array.isArray(palette) && palette.length > 0) {
            const withPalette: SpotifyTrack = { ...base, colourPalette: palette as number[][] }
            // Best-effort: persist to DB and revalidate tag
            try {
              await patchTrack(base.id, { colourPalette: palette as number[][] })
              revalidateTag(trackTag(id))
            } catch {}
            return withPalette
          }
        } catch {}
      }
      return base
    },
    ['track-by-id', id],
    { revalidate: 60 * 60 * 24, tags: [trackTag(id)] }
  )
  return cached()
}

// Convenience invalidation helper
export function revalidateTrack(id: string) {
  try { revalidateTag(trackTag(id)) } catch {}
}

export { trackTag }
