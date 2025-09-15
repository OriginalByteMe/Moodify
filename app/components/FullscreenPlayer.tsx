"use client"

import Image from "next/image"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { exitFullscreen } from "@/lib/features/spotifySlice"
import { useEffect, useRef, useState } from "react"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import { Share2, X } from "lucide-react"
import { usePathname } from "next/navigation"
import PlayerControls from "@/app/components/PlayerControls"
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch"
import { useTheme } from "@/app/components/ThemeProvider"
import NerdStats from "@/app/components/NerdStats"
import { Button } from "@/components/ui/button"

export default function FullscreenPlayer() {
  const dispatch = useDispatch()
  const isFullscreen = useSelector((s: RootState) => s.spotify.isFullscreenMode)
  const track = useSelector((s: RootState) => s.spotify.selectedTrack)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')
  const pathname = usePathname()
  const { theme } = useTheme()
  const [showStats, setShowStats] = useState(false)

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
      setCopiedUrl(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setCopiedUrl('')
      }, 3000)
    } catch {}
  }


  // Do not render overlay on share pages; those have their own layout
  if (pathname?.startsWith('/share') || pathname?.startsWith('/play')) return null
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
          <ThemeSwitch />
          <button
            onClick={onShare}
            className={`px-4 py-2 rounded-full backdrop-blur font-medium flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600/50'
                : 'bg-white/90 hover:bg-white text-gray-900'
            }`}
            title="Copy shareable link"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={onExit}
            className={`p-2 rounded-full backdrop-blur transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600/50'
                : 'bg-white/90 hover:bg-white text-gray-900'
            }`}
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-[110] max-w-3xl w-full px-6 text-center mt-12 ">
        <div className={`mx-auto w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border ${
          theme === 'dark' ? 'border-white/20' : 'border-gray-900/20'
        }`}>
          <Image src={track.albumCover || '/placeholder.svg?height=300&width=300'} alt={track.title} width={320} height={320} className="w-full h-full object-cover" />
        </div>
        <h1 className={`mt-6 text-3xl sm:text-5xl font-bold drop-shadow-lg ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {track.title}
        </h1>
        <p className={`mt-2 text-lg sm:text-xl ${
          theme === 'dark' ? 'text-white/80' : 'text-gray-700'
        }`}>
          {track.artists?.join(', ')}
        </p>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
        }`}>{track.album}</p>

        {/* Palette with backdrop */}
        <div className="mt-8 max-w-2xl mx-auto rounded-xl p-4 bg-white/60 dark:bg-gray-900/50 backdrop-blur ring-1 ring-black/5 dark:ring-white/10">
          <div className="grid grid-cols-4 gap-3">
            {(track.colourPalette || []).slice(0,5).map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full shadow-lg border-2 ${
                    theme === 'dark' ? 'border-white/30' : 'border-gray-900/30'
                  }`}
                  style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }}
                  title={`rgb(${c[0]}, ${c[1]}, ${c[2]})`}
                />
                <span className={`text-[10px] font-mono ${
                  theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                }`}>{c[0]},{c[1]},{c[2]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nerd stats toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowStats(s => !s)}
            className={`px-4 py-2 rounded-full backdrop-blur font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600/50'
                : 'bg-white/90 hover:bg-white text-gray-900'
            }`}
            aria-expanded={showStats}
            aria-controls="nerd-stats"
          >
            {showStats ? 'Hide nerd stats 🥹' : 'Show nerd stats 🤓'}
          </button>
        </div>

        {/* Nerd stats content */}
        {showStats && (
          <div id="nerd-stats" className="max-w-3xl mx-auto">
            <NerdStats track={track} />
          </div>
        )}
      </div>

      {/* Big player pill bottom center */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[110]">
        <PlayerControls
          track={track}
          variant="large"
        />
      </div>

      {/* Copied toast */}
      {copied && copiedUrl && (
        <div className="absolute top-20 right-6 z-[120] max-w-xs sm:max-w-sm">
          <div className="px-4 py-3 rounded-lg bg-black/80 backdrop-blur text-white text-sm shadow-lg border border-white/10">
            <div className="font-medium mb-1">Link copied!</div>
            <div className="text-xs text-white/70 font-mono break-all">
              {copiedUrl.length > 40 ? `${copiedUrl.substring(0, 40)}...` : copiedUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
