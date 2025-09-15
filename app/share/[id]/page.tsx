import { notFound } from "next/navigation"
import ShareClient from "./ShareClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { fetchTrackFromDatabase } from "@/lib/database-handler"

export default async function SharePage({ params }: { params: { id: string } }) {
  const id = params.id
  let track: SpotifyTrack | null = null
  try {
    track = await fetchTrackFromDatabase(id)
  } catch {}

  if (!track) return notFound()

  return <ShareClient track={track} />
}

