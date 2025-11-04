import type { Metadata } from 'next'
import { getTrackCached } from '@/lib/get-track-cached'
import PlayClient from "./PlayClient"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const track = await getTrackCached(id)

  if (!track) {
    return {
      title: 'Track Not Found | Moodify',
      description: 'Transform your music experience with Moodify. Extract color palettes from Spotify album artwork and enjoy dynamic 3D visualizations.',
    }
  }

  const title = `${track.title} by ${track.artists.join(', ')} | Moodify`
  const description = `Experience ${track.title} with dynamic 3D visualization synchronized to ${track.tempo ? Math.round(track.tempo) + ' BPM' : 'the music'}. Explore the unique color palette extracted from ${track.album || 'the album'} artwork.`

  // Format palette colors for keywords
  const paletteColors = track.colourPalette?.slice(0, 3).map(c => `RGB(${c.join(',')})`) || []

  return {
    title,
    description,
    keywords: [
      track.title,
      ...track.artists,
      track.album || '',
      'music visualization',
      'spotify',
      'color palette',
      '3D music experience',
      'album art colors',
      'music colors',
      'tempo visualization',
      ...paletteColors,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'music.song',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/play/${id}`,
      siteName: 'Moodify',
      images: [
        {
          url: track.albumCover || '/og-image.png',
          width: 640,
          height: 640,
          alt: `${track.title} by ${track.artists.join(', ')} - Album artwork`,
        },
      ],
      audio: track.previewUrl ? {
        url: track.previewUrl,
        type: 'audio/mpeg',
      } : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `${track.artists.join(', ')} • ${track.tempo ? Math.round(track.tempo) + ' BPM' : 'Immersive music experience'}`,
      images: [track.albumCover || '/og-image.png'],
      creator: '@moodify', // Update with your actual Twitter handle
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/play/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default async function PlayPage({ params }: Props) {
  const { id } = await params
  const track = await getTrackCached(id)

  // Generate MusicRecording structured data
  const musicRecordingSchema = track ? {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/play/${id}`,
    name: track.title,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/play/${id}`,
    duration: track.duration_ms ? `PT${Math.floor(track.duration_ms / 1000)}S` : undefined,
    byArtist: track.artists.map(artist => ({
      '@type': 'MusicGroup',
      name: artist,
    })),
    inAlbum: track.album ? {
      '@type': 'MusicAlbum',
      name: track.album,
      image: track.albumCover,
    } : undefined,
    image: track.albumCover,
    audio: track.previewUrl ? {
      '@type': 'AudioObject',
      contentUrl: track.previewUrl,
      encodingFormat: 'audio/mpeg',
    } : undefined,
    genre: 'Music',
    ...(track.tempo && { tempo: `${Math.round(track.tempo)} BPM` }),
  } : null

  return (
    <>
      {musicRecordingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(musicRecordingSchema) }}
        />
      )}
      <PlayClient trackId={id} />
    </>
  )
}
