"use client"

import React from "react"
import Image from "next/image"
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { usePreviewPlayer } from "@/app/components/PreviewPlayer"

interface PlayerControlsProps {
  track: SpotifyTrack
  variant?: "mini" | "large"
  showVolumeControls?: boolean
  showTimeRemaining?: boolean
  showCloseButton?: boolean
  onClose?: () => void
  className?: string
  autoPlayOnMount?: boolean
}

export default function PlayerControls({
  track,
  variant = "large",
  showVolumeControls = true,
  showTimeRemaining = true,
  showCloseButton = false,
  onClose,
  className = "",
  autoPlayOnMount = false
}: PlayerControlsProps) {
  const {
    isPlaying, play, pause, resume, currentTrack, progress, volume, muted,
    toggleMute, setVolume, timeLeftFormatted
  } = usePreviewPlayer()

  React.useEffect(() => {
    if (autoPlayOnMount && track.previewUrl && (!currentTrack || currentTrack.id !== track.id)) {
      play(track)
    }
  }, [autoPlayOnMount, track, currentTrack, play])

  const isCurrentTrack = currentTrack?.id === track.id
  const hasPreview = Boolean(track.previewUrl)

  const handlePlayPause = () => {
    if (!hasPreview) return

    if (isCurrentTrack && isPlaying) {
      pause()
    } else if (isCurrentTrack && !isPlaying) {
      resume()
    } else {
      // Start playing this track (auto-play behavior for ShareClient)
      play(track)
    }
  }

  if (variant === "mini") {
    return (
      <div className={`group shadow-xl rounded-full bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 px-3 py-2 flex items-center gap-3 hover:shadow-2xl transition-shadow text-gray-900 dark:text-gray-100 ${className}`}>
        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
          <Image src={track.albumCover || "/placeholder.svg?height=40&width=40"} alt={track.title} fill className="object-cover" />
        </div>

        <div className="min-w-[140px] max-w-[220px]">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
            {track.title}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
            {track.artists?.join(", ")}
          </div>
          {isCurrentTrack && (
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPause}
            disabled={!hasPreview}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          >
            {isCurrentTrack && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {showVolumeControls && hasPreview && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-green-600"
              />
            </div>
          )}

          {showTimeRemaining && hasPreview && isCurrentTrack && (
            <div className="text-[10px] tabular-nums text-gray-600 dark:text-gray-400 w-10 text-right">-{timeLeftFormatted}</div>
          )}

          {showCloseButton && (
            <button
              aria-label="Close"
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Large variant (for fullscreen, share, and play pages)
  return (
    <div className={`w-[92%] sm:w-[640px] px-4 py-3 rounded-full bg-white/95 text-gray-900 shadow-2xl border border-gray-200 backdrop-blur flex items-center gap-4 ${className}`}>
      <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200">
        <Image src={track.albumCover || '/placeholder.svg?height=40&width=40'} alt={track.title} fill className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{track.title}</div>
        <div className="text-xs text-gray-600 truncate">{track.artists?.join(', ')}</div>
        {isCurrentTrack && (
          <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 transition-[width]" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasPreview ? (
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentTrack && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        ) : (
          <span className="text-xs text-gray-600">No preview</span>
        )}

        {showVolumeControls && hasPreview && (
          <div className="hidden sm:flex items-center gap-1">
            <button
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={toggleMute}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-green-600"
            />
          </div>
        )}

        {showTimeRemaining && hasPreview && isCurrentTrack && (
          <div className="text-xs tabular-nums text-gray-600 w-12 text-right">-{timeLeftFormatted}</div>
        )}
      </div>
    </div>
  )
}