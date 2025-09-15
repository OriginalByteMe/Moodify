import { notFound } from "next/navigation"
import ShareClient from "./ShareClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { getTrackCached } from "@/lib/get-track-cached"

export default async function SharePage({ params }: { params: { id: string } }) {
  const id = params.id
  const track: SpotifyTrack | null = await getTrackCached(id)
  if (!track) return notFound()

  return <ShareClient track={track} />
}
