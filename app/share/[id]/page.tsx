import { notFound } from "next/navigation"
import { Metadata } from "next"
import ShareClient from "./ShareClient"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { getTrackCached } from "@/lib/get-track-cached"
import { buildTrackMetadata } from "@/lib/track-metadata"

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  return buildTrackMetadata(params.id, 'share')
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const id = params.id
  const track: SpotifyTrack | null = await getTrackCached(id)
  if (!track) return notFound()

  return <ShareClient track={track} />
}
