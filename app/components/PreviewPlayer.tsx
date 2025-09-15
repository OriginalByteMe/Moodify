"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react"
import { SpotifyTrack } from "@/app/utils/interfaces"

type Ctx = {
  play: (track: SpotifyTrack) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setVolume: (v: number) => void
  isPlaying: boolean
  currentTrack: SpotifyTrack | null
}

const PreviewPlayerContext = createContext<Ctx | null>(null)

export function usePreviewPlayer() {
  const ctx = useContext(PreviewPlayerContext)
  if (!ctx) throw new Error("usePreviewPlayer must be used within PreviewPlayerProvider")
  return ctx
}

export function PreviewPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, _setVolume] = useState(0.6)
  const [muted, setMuted] = useState(false)

  // Lazily create audio element on first use (client-only)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = "metadata"
      audioRef.current.volume = volume
     
      const onLoaded = () => setDuration(audioRef.current?.duration || 0)
      const onTime = () => setCurrentTime(audioRef.current?.currentTime || 0)
      const onEnd = () => {
        setIsPlaying(false)
      }
      const onPause = () => setIsPlaying(false)
      const onPlay = () => setIsPlaying(true)
      audioRef.current.addEventListener("loadedmetadata", onLoaded)
      audioRef.current.addEventListener("timeupdate", onTime)
      audioRef.current.addEventListener("ended", onEnd)
      audioRef.current.addEventListener("pause", onPause)
      audioRef.current.addEventListener("play", onPlay)

      return () => {
        audioRef.current?.removeEventListener("loadedmetadata", onLoaded)
        audioRef.current?.removeEventListener("timeupdate", onTime)
        audioRef.current?.removeEventListener("ended", onEnd)
        audioRef.current?.removeEventListener("pause", onPause)
        audioRef.current?.removeEventListener("play", onPlay)
      }
    }
  }, [volume])

  const play = (track: SpotifyTrack) => {
    if (!track?.previewUrl) return
    setCurrentTrack(track)
    setCurrentTime(0)
    setDuration(0)
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    if (audioRef.current) {
      try {
        audioRef.current.src = track.previewUrl
        audioRef.current.currentTime = 0
        audioRef.current.volume = muted ? 0 : volume
        void audioRef.current.play()
      } catch (e) {
        console.warn("[PreviewPlayer] play failed", e)
      }
    }
  }

  const pause = () => {
    try {
      audioRef.current?.pause()
    } catch {}
  }

  const resume = () => {
    try {
      if (audioRef.current && currentTrack?.previewUrl) {
        void audioRef.current.play()
      }
    } catch {}
  }

  const stop = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setCurrentTrack(null)
    } catch {}
  }

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    _setVolume(clamped)
    setMuted(clamped === 0)
    if (audioRef.current) audioRef.current.volume = clamped
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    if (audioRef.current) audioRef.current.volume = next ? 0 : volume
  }

  const value = useMemo(
    () => ({ play, pause, resume, stop, setVolume, isPlaying, currentTrack }),
    [isPlaying, currentTrack]
  )

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  const timeLeft = Math.max(0, Math.round((duration - currentTime) || 0))
  const tlMin = Math.floor(timeLeft / 60)
  const tlSec = String(timeLeft % 60).padStart(2, "0")

  return (
    <PreviewPlayerContext.Provider value={value}>
      {children}
      {currentTrack && (
        <div className="fixed right-4 bottom-4 z-50">
          <div className="group shadow-xl rounded-full bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 px-3 py-2 flex items-center gap-3 hover:shadow-2xl transition-shadow text-gray-900 dark:text-gray-100">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
              <Image src={currentTrack.albumCover || "/placeholder.svg?height=40&width=40"} alt={currentTrack.title} fill className="object-cover" />
            </div>

            <div className="min-w-[140px] max-w-[220px]">
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {currentTrack.title}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                {currentTrack.artists?.join(", ")}
              </div>
              <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 transition-[width]" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={isPlaying ? pause : resume}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

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

              <div className="text-[10px] tabular-nums text-gray-600 dark:text-gray-400 w-10 text-right">-{tlMin}:{tlSec}</div>

              <button
                aria-label="Close"
                onClick={stop}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </PreviewPlayerContext.Provider>
  )
}
