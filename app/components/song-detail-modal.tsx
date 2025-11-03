import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { 
  X, ExternalLink, Palette, Music, User, Disc,
  Activity, Smile, Mic2, Guitar, Volume2, BarChart3, AudioWaveform, Gauge, KeyboardMusic, SquareActivity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotifyTrack } from '../utils/interfaces'

interface SongDetailModalProps {
  track: SpotifyTrack | null
  isOpen: boolean
  onClose: () => void
  onAlbumClick?: (albumName: string) => void
}

export const SongDetailModal = ({ track, isOpen, onClose, onAlbumClick }: SongDetailModalProps) => {
  const [fullTrack, setFullTrack] = useState<SpotifyTrack | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Normalize artists field from backend (string -> string[])
  const normalizeTrack = (t: any): SpotifyTrack => {
    const artists = Array.isArray(t?.artists)
      ? t.artists
      : typeof t?.artists === 'string'
        ? t.artists.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    return {
      id: t.id ?? t.spotifyId ?? '',
      title: t.title ?? t.track_name ?? t.name ?? '',
      artists,
      album: t.album?.name ?? t.album_name ?? '',
      albumId: t.albumId ?? t.spotifyAlbumId,
      albumCover: t.albumCover,
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

  // Fetch enriched stats from backend when modal opens
  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !track?.id) return
      setLoadingStats(true)
      try {
        const res = await fetch(`/api/data/collection/single?id=${encodeURIComponent(track.id)}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json().catch(() => null)
          const got = data?.track ?? null
          if (got) {
            setFullTrack(normalizeTrack(got))
          }
        }
      } catch (e) {
        console.warn('Failed to fetch track details', e)
      } finally {
        setLoadingStats(false)
      }
    }
    fetchDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, track?.id])

  const shown = useMemo<SpotifyTrack | null>(() => {
    return fullTrack ?? track ?? null
  }, [fullTrack, track])

  if (!isOpen || !track) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const copyColorToClipboard = async (color: number[]) => {
    const rgbString = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    try {
      await navigator.clipboard.writeText(rgbString)
    } catch (err) {
      console.error('Failed to copy color to clipboard:', err)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Song Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Album Art and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 mx-auto sm:mx-0">
                <Image
                  src={(shown?.albumCover || track.albumCover) || '/placeholder.svg?height=300&width=300'}
                  alt={shown?.album || track.album}
                  fill
                  className="object-cover rounded-xl shadow-lg"
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Music className="h-4 w-4" />
                  <span>Track</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {shown?.title || track.title}
                </h3>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4" />
                  <span>Artist{track.artists.length > 1 ? 's' : ''}</span>
                </div>
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  {(shown?.artists ?? track.artists).join(', ')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Disc className="h-4 w-4" />
                  <span>Album</span>
                </div>
                {onAlbumClick ? (
                  <button
                    onClick={() => onAlbumClick(shown?.album || track.album)}
                    className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-left"
                  >
                    {shown?.album || track.album}
                  </button>
                ) : (
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    {shown?.album || track.album}
                  </p>
                )}
              </div>

              {(shown?.songUrl || track.songUrl) && (
                <div className="pt-2">
                  <Button
                    onClick={() => window.open(shown?.songUrl || track.songUrl, '_blank')}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Spotify
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Track Stats Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Track Stats
              </h4>
              {loadingStats && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">refreshing…</span>
              )}
              {shown?.audio_features_status && (
                <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" title="Audio features processing status">
                  {shown.audio_features_status}
                </span>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(() => {
                const pct = (v: any) => {
                  let n = Number(v)
                  if (!Number.isFinite(n)) return '—'
                  // Accept either 0–1 or 0–100 inputs and format with one decimal
                  if (n <= 1) n = n * 100
                  else if (n > 100) n = 100
                  return `${n.toFixed(1)}%`
                }
                const stats: Array<{ key: keyof SpotifyTrack; label: string; icon: React.ReactNode; format: (v: any) => string; tip: string }> = [
                  { key: 'danceability', label: 'Danceability', icon: <BarChart3 className="h-4 w-4" />, format: pct, tip: 'How suitable the track is for dancing (0–1)' },
                  { key: 'energy', label: 'Energy', icon: <Gauge className="h-4 w-4" />, format: pct, tip: 'Intensity and activity (0–1)' },
                  { key: 'valence', label: 'Valence', icon: <Smile className="h-4 w-4" />, format: pct, tip: 'Musical positiveness (0–1)' },
                  { key: 'acousticness', label: 'Acoustic', icon: <KeyboardMusic className="h-4 w-4" />, format: pct, tip: 'Likelihood track is acoustic (0–1)' },
                  { key: 'instrumentalness', label: 'Instrumental', icon: <Guitar className="h-4 w-4" />, format: pct, tip: 'Likelihood of no vocals (0–1)' },
                  { key: 'speechiness', label: 'Speechiness', icon: <Mic2 className="h-4 w-4" />, format: pct, tip: 'Presence of spoken words (0–1)' },
                  { key: 'liveness', label: 'Liveness', icon: <SquareActivity className="h-4 w-4" />, format: pct, tip: 'Presence of an audience (0–1)' },
                  { key: 'loudness', label: 'Loudness', icon: <Volume2 className="h-4 w-4" />, format: (v) => `${Number(v).toFixed(1)} dB`, tip: 'Overall track loudness (dB)' },
                  { key: 'tempo', label: 'Tempo', icon: <AudioWaveform className="h-4 w-4" />, format: (v) => `${Math.round(Number(v))} BPM`, tip: 'Estimated beats per minute' },
                ]

                const items = stats
                  .filter(s => (shown as any)?.[s.key] !== undefined && (shown as any)?.[s.key] !== null)
                  .map(s => {
                    const value = (shown as any)[s.key]
                    return (
                      <div key={String(s.key)} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="text-gray-600 dark:text-gray-300" title={s.tip}>{s.icon}</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white" title={s.tip}>{s.format(value)}</div>
                        </div>
                      </div>
                    )
                  })

                // Key and mode shown together if available
                const keyVal = shown?.key
                const modeVal = shown?.mode
                if (typeof keyVal === 'number') {
                  const KEYS = ['C','C# / Db','D','D# / Eb','E','F','F# / Gb','G','G# / Ab','A','A# / Bb','B']
                  const keyName = KEYS[keyVal] ?? String(keyVal)
                  const modeName = modeVal === 1 ? 'Major' : modeVal === 0 ? 'Minor' : undefined
                  items.push(
                    <div key="key" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-gray-600 dark:text-gray-300" title="Musical key and mode"><KeyboardMusic className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Key{typeof modeVal === 'number' ? ' / Mode' : ''}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{keyName}{modeName ? ` • ${modeName}` : ''}</div>
                      </div>
                    </div>
                  )
                }

                // Time signature (if present)
                if (typeof shown?.time_signature === 'number') {
                  items.push(
                    <div key="signature" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-gray-600 dark:text-gray-300" title="Time signature"><Music className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Time Signature</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{shown.time_signature}</div>
                      </div>
                    </div>
                  )
                }

                return items
              })()}
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Color Palette
              </h4>
            </div>
            
            <div className="space-y-3">
              {(shown?.colourPalette || track.colourPalette).map((color: number[], index: number) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  onClick={() => copyColorToClipboard(color)}
                  title="Click to copy RGB value"
                >
                  <div 
                    className="w-12 h-12 rounded-lg shadow-md border-2 border-white dark:border-gray-600 flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      rgb({color[0]}, {color[1]}, {color[2]})
                    </div>
                    <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                      #{color[0].toString(16).padStart(2, '0')}{color[1].toString(16).padStart(2, '0')}{color[2].toString(16).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to copy
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> Click on any color to copy its RGB value to your clipboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
