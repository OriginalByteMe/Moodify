"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { useDispatch } from "react-redux"
import { enterFullscreen, exitFullscreen, setSelectedTrack } from "@/lib/features/spotifySlice"
import PlayerControls from "@/app/components/PlayerControls"

function normalizeTrack(t: any) {
  if (!t) return null
  const artists = Array.isArray(t?.artists)
    ? t.artists
    : typeof t?.artists === 'string'
      ? t.artists.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  return {
    id: t.id ?? t.spotifyId ?? '',
    title: t.title ?? t.track_name ?? t.name ?? '',
    artists,
    album: t.album ?? t.album_name ?? '',
    albumId: t.albumId ?? t.spotifyAlbumId,
    albumCover: t.albumCover ?? t.album_cover,
    songUrl: t.songUrl ?? t.external_urls?.spotify ?? '',
    previewUrl: t.previewUrl ?? null,
    colourPalette: t.colourPalette ?? [],
    popularity: t.popularity,
    duration_ms: t.duration_ms,
    explicit: t.explicit,
    danceability: t.danceability,
    energy: t.energy,
    key: t.key,
    loudness: t.loudness,
    mode: t.mode,
    speechiness: t.speechiness,
    acousticness: t.acousticness,
    instrumentalness: t.instrumentalness,
    liveness: t.liveness,
    valence: t.valence,
    tempo: t.tempo,
    time_signature: t.time_signature,
    audio_features_status: t.audio_features_status,
  }
}

export default function ShareClient({ track }: { track: SpotifyTrack }) {
  const shown = normalizeTrack(track)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!shown) return
    // Hide global mini player and set selected track for background
    dispatch(enterFullscreen())
    dispatch(setSelectedTrack(shown as any))
    // Don't auto-play on share page - let user control playback manually
    return () => {
      dispatch(exitFullscreen())
      dispatch(setSelectedTrack(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, shown?.id])

  if (!shown) return null

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LavaLampBackground palette={shown.colourPalette} tempo={shown.tempo} trackId={shown.id} />
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
      <div className="relative z-10 max-w-3xl w-full px-6 text-center mx-auto pt-24 pb-40">
        <div className="mx-auto w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <Image src={shown.albumCover || '/placeholder.svg?height=300&width=300'} alt={shown.title} width={320} height={320} className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-5xl font-bold text-white drop-shadow">{shown.title}</h1>
        <p className="mt-2 text-lg sm:text-xl text-white/80">{(shown.artists || []).join(', ')}</p>
        <p className="mt-1 text-sm text-white/60">{shown.album}</p>

        {/* Palette */}
        <div className="mt-8 grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {(shown.colourPalette || []).slice(0,5).map((c: number[], i: number) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full shadow-lg border-2 border-white/30" style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }} />
              <span className="text-[10px] text-white/80 font-mono">{c[0]},{c[1]},{c[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Big player pill bottom center */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
        <PlayerControls
          track={shown}
          variant="large"
        />
      </div>

    </div>
  )
}
