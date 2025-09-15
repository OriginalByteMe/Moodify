"use client"

import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { exitFullscreen } from "@/lib/features/spotifySlice"
import { useEffect, useMemo, useRef, useState } from "react"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import { Pause, Play, Share2, Volume2, VolumeX, X } from "lucide-react"
import { usePreviewPlayer } from "@/app/components/PreviewPlayer"
import { usePathname } from "next/navigation"

export default function FullscreenPlayer() {
  const dispatch = useDispatch()
  const isFullscreen = useSelector((s: RootState) => s.spotify.isFullscreenMode)
  const track = useSelector((s: RootState) => s.spotify.selectedTrack)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState(false)
  const { isPlaying, pause, resume, currentTrack } = usePreviewPlayer()
  const pathname = usePathname()

  // Close immersive overlay with Escape
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(exitFullscreen())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen, dispatch])

  const onExit = async () => {
    dispatch(exitFullscreen())
  }

  const onShare = async () => {
    if (!track) return
    try {
      // Ensure the track exists in the backend, then copy URL
      await fetch('/api/data/collection/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track })
      }).catch(() => {})
      const url = `${window.location.origin}/share/${encodeURIComponent(track.id)}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const hasPreview = Boolean(track?.previewUrl)

  // Do not render overlay on share pages; those have their own layout
  if (pathname?.startsWith('/share')) return null
  if (!isFullscreen || !track) return null

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center">
      <LavaLampBackground palette={track.colourPalette} tempo={track.tempo} trackId={track.id} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[110]">
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
            onClick={onExit}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur"
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-[110] max-w-3xl w-full px-6 text-center mt-12">
        <div className="mx-auto w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <Image src={track.albumCover || '/placeholder.svg?height=300&width=300'} alt={track.title} width={320} height={320} className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-5xl font-bold text-white drop-shadow">
          {track.title}
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-white/80">
          {track.artists?.join(', ')}
        </p>
        <p className="mt-1 text-sm text-white/60">{track.album}</p>

        {/* Palette */}
        <div className="mt-8 grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {(track.colourPalette || []).slice(0,5).map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full shadow-lg border-2 border-white/30"
                style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }}
                title={`rgb(${c[0]}, ${c[1]}, ${c[2]})`}
              />
              <span className="text-[10px] text-white/80 font-mono">{c[0]},{c[1]},{c[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Big player pill bottom center */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[110]">
        <div className="w-[92%] sm:w-[640px] px-4 py-3 rounded-full bg-white/95 text-gray-900 shadow-2xl border border-gray-200 backdrop-blur flex items-center gap-4">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200">
            <Image src={track.albumCover || '/placeholder.svg?height=40&width=40'} alt={track.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{track.title}</div>
            <div className="text-xs text-gray-600 truncate">{track.artists?.join(', ')}</div>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              {/* Progress handled by default mini player; this is aesthetic */}
              <div className={`h-full ${isPlaying ? 'bg-green-600 w-1/2' : 'bg-gray-300 w-0'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPreview ? (
              <button onClick={isPlaying ? pause : resume} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            ) : (
              <span className="text-xs text-gray-600">No preview</span>
            )}
          </div>
        </div>
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="absolute top-20 right-6 z-[120] px-3 py-2 rounded bg-black/70 text-white text-sm">
          Link copied!
        </div>
      )}
    </div>
  )
}
