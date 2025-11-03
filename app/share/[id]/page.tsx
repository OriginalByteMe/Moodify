import { notFound } from "next/navigation"
import { Metadata } from "next"
import ShareClient from "./ShareClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { getTrackCached } from "@/lib/get-track-cached"

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const track = await getTrackCached(params.id)

  if (!track) {
    return {
      title: 'Track Not Found - Moodify',
      description: 'Pick a song, paint the mood.',
    }
  }

  // Format palette colors for description
  const paletteStr = track.colourPalette
    ?.slice(0, 3)
    .map(c => `RGB(${c.join(',')})`)
    .join(' • ') || 'Vibrant colors'

  // Build stats description
  const statsStr = [
    typeof track.tempo === 'number' ? `Tempo: ${Math.round(track.tempo)} BPM` : null,
    typeof track.energy === 'number' ? `Energy: ${track.energy.toFixed(2)}` : null,
    typeof track.danceability === 'number'
      ? `Danceability: ${track.danceability.toFixed(2)}`
      : null,
  ]
    .filter(Boolean)
    .join(' • ') || 'Stats unavailable'

  const details = [paletteStr, statsStr].filter(Boolean).join(' • ')

  const description = [`Listen to ${track.title} by ${track.artists.join(', ')}`, details]
    .filter(Boolean)
    .join(' • ')

  return {
    title: `${track.title} by ${track.artists.join(', ')} - Moodified`,
    description,
    openGraph: {
      title: `${track.title} - Moodified`,
      description: [`By ${track.artists.join(', ')}`, details].filter(Boolean).join(' • '),
      images: [
        {
          url: `/share/${params.id}/opengraph-image`,
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
      title: `${track.title} - Moodified`,
      description: [`By ${track.artists.join(', ')}`, details].filter(Boolean).join(' • '),
      images: [`/share/${params.id}/opengraph-image`],
    },
  }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const id = params.id
  const track: SpotifyTrack | null = await getTrackCached(id)
  if (!track) return notFound()

  return <ShareClient track={track} />
}
