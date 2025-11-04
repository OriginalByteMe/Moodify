import { notFound } from "next/navigation"
import { Metadata } from "next"
import ShareClient from "./ShareClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { getTrackCached } from "@/lib/get-track-cached"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const track = await getTrackCached(id)

  if (!track) {
    return {
      title: 'Track Not Found - Moodify',
      description: 'Discover music through color. Share your favorite tracks with dynamic visualizations on Moodify.',
    }
  }

  // Format palette colors for description
  const paletteStr = track.colourPalette
    ?.slice(0, 3)
    .map(c => `RGB(${c.join(',')})`)
    .join(' • ') || 'Vibrant colors'

  // Build stats description
  const statsStr = [
    track.tempo ? `Tempo: ${Math.round(track.tempo)} BPM` : null,
    track.energy ? `Energy: ${track.energy.toFixed(2)}` : null,
    track.danceability ? `Danceability: ${track.danceability.toFixed(2)}` : null,
  ].filter(Boolean).join(' • ')

  const description = `Check out ${track.title} by ${track.artists.join(', ')} on Moodify! Experience the unique color palette extracted from album artwork with immersive 3D visualization. ${statsStr || paletteStr}`

  return {
    title: `${track.title} by ${track.artists.join(', ')} - Moodified`,
    description,
    keywords: [
      track.title,
      ...track.artists,
      track.album || '',
      'shared music',
      'music visualization',
      'color palette',
      'album colors',
      'spotify share',
    ].filter(Boolean),
    openGraph: {
      title: `${track.title} - Moodified`,
      description: `By ${track.artists.join(', ')} • ${paletteStr}`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/share/${id}`,
      images: [
        {
          url: `/share/${id}/opengraph-image`,
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
      description: `By ${track.artists.join(', ')} • ${statsStr || paletteStr}`,
      images: [`/share/${id}/opengraph-image`],
      creator: '@moodify', // Update with your actual Twitter handle
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moodify.app'}/share/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const track: SpotifyTrack | null = await getTrackCached(id)
  if (!track) return notFound()

  return <ShareClient track={track} />
}
