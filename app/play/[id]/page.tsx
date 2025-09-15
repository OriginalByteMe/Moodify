import { notFound } from "next/navigation"
import PlayClient from "./PlayClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { fetchTrackFromDatabase } from "@/lib/database-handler"
import { getTrackById } from "@/lib/spotify"

export default async function PlayPage({ params }: { params: { id: string } }) {
  const id = params.id
  let track: SpotifyTrack | null = null
  try {
    track = await fetchTrackFromDatabase(id)
  } catch {}
  if (!track) {
    try {
      const t = await getTrackById(id)
      if (t) {
        // Transform minimal fields to our shape
        track = {
          id: t.id,
          title: t.name,
          artists: Array.isArray(t.artists) ? t.artists.map((a: any) => a?.name).filter(Boolean) : [],
          album: t.album?.name ?? '',
          albumId: t.album?.id,
          albumCover: t.album?.images?.[0]?.url,
          songUrl: t.external_urls?.spotify ?? '',
          previewUrl: t.previewUrl ?? t.preview_url ?? null,
          colourPalette: [],
        }
      }
    } catch {}
  }
  if (!track) return notFound()
  return <PlayClient track={track} />
}
