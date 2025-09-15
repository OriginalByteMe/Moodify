"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { Pause, Play } from "lucide-react"
import { usePreviewPlayer } from "@/app/components/PreviewPlayer"
import { useDispatch } from "react-redux"
import { enterFullscreen, exitFullscreen, setSelectedTrack } from "@/lib/features/spotifySlice"

export default function ShareClient({ track }: { track: SpotifyTrack }) {
  const dispatch = useDispatch()
  const { isPlaying, play, pause, resume } = usePreviewPlayer()

  useEffect(() => {
    // Hide global mini player and set selected track for background
    dispatch(enterFullscreen())
    dispatch(setSelectedTrack(track))
    // Try to start playback (may be blocked)
    if (track.previewUrl) {
      try { play(track) } catch {}
    }
    return () => {
      dispatch(exitFullscreen())
      dispatch(setSelectedTrack(null))
    }
  }, [dispatch, play, track])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LavaLampBackground palette={track.colourPalette} tempo={track.tempo} trackId={track.id} />
      {/* Top-left logo and CTA */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Moodify" width={40} height={40} />
          <span className="text-white/90 font-semibold text-lg hidden sm:inline">Moodify</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Link href="/" className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur font-medium">Try other songs →</Link>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-40 px-6 text-center">
        <div className="mx-auto w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <Image src={track.albumCover || '/placeholder.svg?height=300&width=300'} alt={track.title} width={320} height={320} className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-5xl font-bold text-white drop-shadow">{track.title}</h1>
        <p className="mt-2 text-lg sm:text-xl text-white/80">{track.artists?.join(', ')}</p>
        <p className="mt-1 text-sm text-white/60">{track.album}</p>

        {/* Palette */}
        <div className="mt-8 grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {(track.colourPalette || []).slice(0,5).map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full shadow-lg border-2 border-white/30" style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }} />
              <span className="text-[10px] text-white/80 font-mono">{c[0]},{c[1]},{c[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Big player pill bottom center */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
        <div className="w-[92%] sm:w-[640px] px-4 py-3 rounded-full bg-white/95 text-gray-900 shadow-2xl border border-gray-200 backdrop-blur flex items-center gap-4">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200">
            <Image src={track.albumCover || '/placeholder.svg?height=40&width=40'} alt={track.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{track.title}</div>
            <div className="text-xs text-gray-600 truncate">{track.artists?.join(', ')}</div>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${isPlaying ? 'bg-green-600 w-1/2' : 'bg-gray-300 w-0'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {track.previewUrl ? (
              <button onClick={isPlaying ? pause : resume} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            ) : (
              <span className="text-xs text-gray-600">No preview</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

