import { Metadata } from 'next'
import { getTrackCached } from '@/lib/get-track-cached'

/**
 * Shared social/link-preview metadata for track pages (/share/[id] and
 * /play/[id]). The OG image route renders the album art on the track's
 * palette so pasted links unfurl with the song's actual colours.
 */
export async function buildTrackMetadata(id: string, basePath: 'share' | 'play'): Promise<Metadata> {
  const track = await getTrackCached(id)

  if (!track) {
    return {
      title: 'Track Not Found - Moodify',
      description: 'Pick a song, paint the mood.',
    }
  }

  const paletteStr = track.colourPalette
    ?.slice(0, 3)
    .map(c => `RGB(${c.join(',')})`)
    .join(' • ') || 'Vibrant colors'

  const statsStr = [
    typeof track.tempo === 'number' ? `Tempo: ${Math.round(track.tempo)} BPM` : null,
    typeof track.energy === 'number' ? `Energy: ${track.energy.toFixed(2)}` : null,
    typeof track.danceability === 'number'
      ? `Danceability: ${track.danceability.toFixed(2)}`
      : null,
    track.mood ? `Mood: ${track.mood}` : null,
  ]
    .filter(Boolean)
    .join(' • ') || 'Stats unavailable'

  const details = [paletteStr, statsStr].filter(Boolean).join(' • ')
  const description = [`Listen to ${track.title} by ${track.artists.join(', ')}`, details]
    .filter(Boolean)
    .join(' • ')
  const imagePath = `/${basePath}/${id}/opengraph-image`

  return {
    title: `🎵 ${track.title} by ${track.artists.join(', ')} - Moodified 🎨`,
    description,
    openGraph: {
      title: `🎵 ${track.title} - Moodified 🎨`,
      description: [`By ${track.artists.join(', ')}`, details].filter(Boolean).join(' • '),
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: `${track.title} by ${track.artists.join(', ')} - color palette visualization`,
        }
      ],
      type: 'music.song',
      siteName: 'Moodify',
    },
    twitter: {
      card: 'summary_large_image',
      title: `🎵 ${track.title} - Moodified 🎨`,
      description: [`By ${track.artists.join(', ')}`, details].filter(Boolean).join(' • '),
      images: [imagePath],
    },
  }
}
