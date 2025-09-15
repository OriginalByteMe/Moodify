"use client"

import React from "react"
import {
  Activity,
  Smile,
  Mic2,
  Guitar,
  Volume2,
  AudioWaveform,
  Gauge,
  KeyboardMusic,
  SquareActivity,
  Music,
  BarChart3
} from "lucide-react"
import { SpotifyTrack } from "@/app/utils/interfaces"

type Props = {
  track: SpotifyTrack
}

const pct = (v: any) => {
  let n = Number(v)
  if (!Number.isFinite(n)) return "—"
  if (n <= 1) n = n * 100
  else if (n > 100) n = 100
  return `${n.toFixed(1)}%`
}

export default function NerdStats({ track }: Props) {
  const items: Array<{ key: keyof SpotifyTrack; label: string; icon: React.ReactNode; tip: string; format?: (v: any) => string; animate?: string }>
    = [
      { key: 'danceability', label: 'Danceability', icon: <BarChart3 className="h-4 w-4" />, tip: 'How suitable the track is for dancing (0–1)', animate: 'animate-bounce' },
      { key: 'energy', label: 'Energy', icon: <Gauge className="h-4 w-4" />, tip: 'Intensity and activity (0–1)', animate: 'animate-pulse' },
      { key: 'valence', label: 'Valence', icon: <Smile className="h-4 w-4" />, tip: 'Musical positiveness (0–1)', animate: 'animate-pulse' },
      { key: 'acousticness', label: 'Acoustic', icon: <KeyboardMusic className="h-4 w-4" />, tip: 'Likelihood track is acoustic (0–1)', animate: 'animate-pulse' },
      { key: 'instrumentalness', label: 'Instrumental', icon: <Guitar className="h-4 w-4" />, tip: 'Likelihood of no vocals (0–1)', animate: 'animate-pulse' },
      { key: 'speechiness', label: 'Speechiness', icon: <Mic2 className="h-4 w-4" />, tip: 'Presence of spoken words (0–1)', animate: 'animate-pulse' },
      { key: 'liveness', label: 'Liveness', icon: <SquareActivity className="h-4 w-4" />, tip: 'Presence of an audience (0–1)', animate: 'animate-pulse' },
      { key: 'loudness', label: 'Loudness', icon: <Volume2 className="h-4 w-4" />, tip: 'Overall track loudness (dB)', format: (v) => `${Number(v).toFixed(1)} dB`, animate: 'animate-pulse' },
      { key: 'tempo', label: 'Tempo', icon: <AudioWaveform className="h-4 w-4" />, tip: 'Estimated beats per minute', format: (v) => `${Math.round(Number(v))} BPM`, animate: 'animate-pulse' },
    ]

  const elements: React.ReactNode[] = []

  for (const it of items) {
    const value = (track as any)?.[it.key]
    if (value === undefined || value === null) continue
    elements.push(
      <div key={String(it.key)} className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 backdrop-blur ring-1 ring-black/5 dark:ring-white/10">
        <div className={`text-gray-700 dark:text-gray-300 ${it.animate || ''}`} title={it.tip}>
          {it.icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">{it.label}</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white" title={it.tip}>{it.format ? it.format(value) : pct(value)}</div>
        </div>
      </div>
    )
  }

  // Key/Mode combined
  if (typeof track?.key === 'number') {
    const KEYS = ['C','C# / Db','D','D# / Eb','E','F','F# / Gb','G','G# / Ab','A','A# / Bb','B']
    const keyName = KEYS[track.key] ?? String(track.key)
    const modeName = track.mode === 1 ? 'Major' : track.mode === 0 ? 'Minor' : undefined
    elements.push(
      <div key="key" className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 backdrop-blur ring-1 ring-black/5 dark:ring-white/10">
        <div className="text-gray-700 dark:text-gray-300" title="Musical key and mode"><KeyboardMusic className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">Key{typeof track?.mode === 'number' ? ' / Mode' : ''}</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{keyName}{modeName ? ` • ${modeName}` : ''}</div>
        </div>
      </div>
    )
  }

  if (typeof track?.time_signature === 'number') {
    elements.push(
      <div key="signature" className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 backdrop-blur ring-1 ring-black/5 dark:ring-white/10">
        <div className="text-gray-700 dark:text-gray-300" title="Time signature"><Music className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">Time Signature</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{track.time_signature}</div>
        </div>
      </div>
    )
  }

  // Intentionally exclude duration as it may reflect preview length, not full track length

  if (typeof track?.popularity === 'number') {
    elements.push(
      <div key="popularity" className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 backdrop-blur ring-1 ring-black/5 dark:ring-white/10">
        <div className="text-gray-700 dark:text-gray-300" title="Spotify popularity (0–100)"><BarChart3 className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">Popularity</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(track.popularity)}</div>
        </div>
      </div>
    )
  }

  if (!elements.length) return null

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {elements}
      </div>
    </div>
  )
}
