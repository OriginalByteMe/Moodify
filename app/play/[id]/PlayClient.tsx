"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { Pause, Play, Share2, X } from "lucide-react"
import { usePreviewPlayer } from "@/app/components/PreviewPlayer"
import { useDispatch } from "react-redux"
import { enterFullscreen, exitFullscreen, setSelectedTrack } from "@/lib/features/spotifySlice"

function normalizeTrack(t: any) {
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

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { useGetTrackByIdQuery, tracksApi } from '@/lib/services/tracksApi'

export default function PlayClient({ trackId }: { trackId: string }) {
  const selected = useSelector((s: RootState) => s.spotify.selectedTrack)
  const preexisting = useSelector((s: RootState) => s.spotify.tracks.find(t => t.id === trackId))
  const albumTracks = useSelector((s: RootState) => s.spotify.albums.flatMap(album => album.tracks || []))
  const fromAlbums = albumTracks.find(t => t.id === trackId)
  const initial = selected?.id === trackId ? selected : preexisting || fromAlbums || null
  const { data, isFetching } = useGetTrackByIdQuery(trackId, { skip: !!initial })
  const shown = normalizeTrack(initial || data)
  const router = useRouter()
  const dispatch = useDispatch()
  const { isPlaying, play, pause, resume } = usePreviewPlayer()
  const [leaving, setLeaving] = useState(false)
  const [entered, setEntered] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Enter immersive mode: hide mini-player, set track, try autoplay
    if (!shown) return
    dispatch(enterFullscreen())
    dispatch(setSelectedTrack(shown as any))

    // Only show entrance animation after track is loaded
    const timer = setTimeout(() => setEntered(true), initial ? 10 : 100)

    if (shown?.previewUrl) {
      try { play(shown as any) } catch {}
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      dispatch(exitFullscreen())
      dispatch(setSelectedTrack(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, shown?.id])

  const handleBack = () => {
    setLeaving(true)
    setTimeout(() => router.back(), 250)
  }

  const onShare = async () => {
    try {
      const url = `${window.location.origin}/share/${encodeURIComponent(shown?.id || trackId)}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-300 ease-out ${entered && !leaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {shown && (
        <LavaLampBackground palette={shown.colourPalette} tempo={shown.tempo} trackId={shown.id} />
      )}

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Moodify" width={40} height={40} />
          <span className="text-white/90 font-semibold text-lg hidden sm:inline">Moodify</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur font-medium flex items-center gap-2"
            title="Copy shareable link"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 max-w-3xl w-full px-6 text-center mx-auto pt-24 pb-40">
        <div className="mx-auto w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <Image src={(shown?.albumCover) || '/placeholder.svg?height=300&width=300'} alt={shown?.title || ''} width={320} height={320} className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-5xl font-bold text-white drop-shadow">{shown?.title || ''}</h1>
        <p className="mt-2 text-lg sm:text-xl text-white/80">{(shown?.artists || []).join(', ')}</p>
        <p className="mt-1 text-sm text-white/60">{shown?.album || ''}</p>

        {/* Palette */}
        <div className="mt-8 grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {(shown?.colourPalette || []).slice(0,5).map((c: number[], i: number) => (
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
            <Image src={(shown?.albumCover) || '/placeholder.svg?height=40&width=40'} alt={shown?.title || ''} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{shown?.title || ''}</div>
            <div className="text-xs text-gray-600 truncate">{(shown?.artists || []).join(', ')}</div>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${isPlaying ? 'bg-green-600 w-1/2' : 'bg-gray-300 w-0'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shown?.previewUrl ? (
              <button onClick={isPlaying ? pause : resume} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            ) : (
              <span className="text-xs text-gray-600">No preview</span>
            )}
          </div>
        </div>
      </div>

      {copied && (
        <div className="absolute top-20 right-6 z-20 px-3 py-2 rounded bg-black/70 text-white text-sm">Link copied!</div>
      )}
    </div>
  )
}
