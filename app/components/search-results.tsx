import { SongCard } from "@/components/song-card"
import { useSelector } from "react-redux"
import { SpotifyTrack } from "@/app/utils/interfaces"

export function SearchResults() {
  const results = useSelector((state: { spotify: { tracks: SpotifyTrack[] } }) => state.spotify.tracks);
  if (!results || results.length === 0) {
    return <div className="mt-8 text-center text-zinc-400">No results found. Try a different search term.</div>
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((track) => (
          <SongCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  )
}
