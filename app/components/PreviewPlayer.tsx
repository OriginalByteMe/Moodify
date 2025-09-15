"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { SpotifyTrack } from "@/app/utils/interfaces"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import PlayerControls from "@/app/components/PlayerControls"

type Ctx = {
  play: (track: SpotifyTrack) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  isPlaying: boolean
  currentTrack: SpotifyTrack | null
  duration: number
  currentTime: number
  progress: number
  volume: number
  muted: boolean
  timeLeft: number
  timeLeftFormatted: string
}

const PreviewPlayerContext = createContext<Ctx | null>(null)

export function usePreviewPlayer() {
  const ctx = useContext(PreviewPlayerContext)
  if (!ctx) throw new Error("usePreviewPlayer must be used within PreviewPlayerProvider")
  return ctx
}

export function PreviewPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listenersAttachedRef = useRef(false)
  const handlersRef = useRef<{ onLoaded?: () => void; onTime?: () => void; onEnd?: () => void; onPause?: () => void; onPlay?: () => void }>({})
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, _setVolume] = useState(0.6)
  const [muted, setMuted] = useState(false)

  const attachListeners = () => {
    if (!audioRef.current || listenersAttachedRef.current) return
    const onLoaded = () => setDuration(Number.isFinite(audioRef.current?.duration ?? 0) ? (audioRef.current?.duration || 0) : 0)
    const onTime = () => setCurrentTime(audioRef.current?.currentTime || 0)
    const onEnd = () => setIsPlaying(false)
    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    audioRef.current.addEventListener("loadedmetadata", onLoaded)
    audioRef.current.addEventListener("timeupdate", onTime)
    audioRef.current.addEventListener("ended", onEnd)
    audioRef.current.addEventListener("pause", onPause)
    audioRef.current.addEventListener("play", onPlay)
    handlersRef.current = { onLoaded, onTime, onEnd, onPause, onPlay }
    listenersAttachedRef.current = true
  }

  const detachListeners = () => {
    if (!audioRef.current || !listenersAttachedRef.current) return
    const { onLoaded, onTime, onEnd, onPause, onPlay } = handlersRef.current
    if (onLoaded) audioRef.current.removeEventListener("loadedmetadata", onLoaded)
    if (onTime) audioRef.current.removeEventListener("timeupdate", onTime)
    if (onEnd) audioRef.current.removeEventListener("ended", onEnd)
    if (onPause) audioRef.current.removeEventListener("pause", onPause)
    if (onPlay) audioRef.current.removeEventListener("play", onPlay)
    listenersAttachedRef.current = false
    handlersRef.current = {}
  }

  const ensureAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = "metadata"
    }
    // Always ensure listeners are present
    attachListeners()
    // Keep volume in sync
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume
  }

  // Initialize on mount, cleanup on unmount
  useEffect(() => {
    ensureAudio()
    return () => {
      detachListeners()
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch {}
      }
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to volume/mute changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume
  }, [volume, muted])

  const play = (track: SpotifyTrack) => {
    if (!track?.previewUrl) return
    ensureAudio()
    setCurrentTrack(track)
    setCurrentTime(0)
    setDuration(0)
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

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  const timeLeft = Math.max(0, Math.round((duration - currentTime) || 0))
  const tlMin = Math.floor(timeLeft / 60)
  const tlSec = String(timeLeft % 60).padStart(2, "0")

  const value = useMemo(
    () => ({
      play, pause, resume, stop, setVolume, toggleMute,
      isPlaying, currentTrack, duration, currentTime, progress, volume, muted,
      timeLeft, timeLeftFormatted: `${tlMin}:${tlSec}`
    }),
    [isPlaying, currentTrack, duration, currentTime, progress, volume, muted, timeLeft, tlMin, tlSec]
  )

  const isFullscreen = useSelector((s: RootState) => s.spotify.isFullscreenMode)

  return (
    <PreviewPlayerContext.Provider value={value}>
      {children}
      {/* Hide floating mini-player in immersive mode */}
      {currentTrack && !isFullscreen && (
        <div className="fixed right-4 bottom-4 z-50">
          <PlayerControls
            track={currentTrack}
            variant="mini"
            showCloseButton={true}
            onClose={stop}
          />
        </div>
      )}
    </PreviewPlayerContext.Provider>
  )
}
