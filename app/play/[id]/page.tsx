import { Metadata } from "next"
import PlayClient from "./PlayClient"
import { buildTrackMetadata } from "@/lib/track-metadata"

// Server component wrapper so /play links unfurl with the track's album
// art and palette colours when pasted into chats/editors.
export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  return buildTrackMetadata(params.id, 'play')
}

export default function PlayPage({ params }: { params: { id: string } }) {
  return <PlayClient trackId={params.id} />
}
