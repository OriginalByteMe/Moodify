import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ExternalLink, Play, Clock, Calendar, Music, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotifyAlbum, SpotifyTrack } from '../utils/interfaces'
import useSpotify from '@/hooks/useSpotify'

interface AlbumTracksModalProps {
  album: SpotifyAlbum | null
  isOpen: boolean
  onClose: () => void
}

export const AlbumTracksModal = ({ album, isOpen, onClose }: AlbumTracksModalProps) => {
  const [tracks, setTracks] = useState<any[]>([])
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [showPalette, setShowPalette] = useState<string | null>(null)
  const { fetchColourPalette } = useSpotify()

  useEffect(() => {
    if (isOpen && album) {
      fetchAlbumTracks()
    }
  }, [isOpen, album])

  const fetchAlbumTracks = async () => {
    if (!album) return
    
    setIsLoadingTracks(true)
    try {
      const response = await fetch(`/api/spotify/album/${album.id}/tracks`)
      if (response.ok) {
        const data = await response.json()
        const tracksData = data.tracks || []
        
        // Add album cover to each track and fetch color palettes
        const tracksWithCovers = await Promise.all(
          tracksData.map(async (track: any) => {
            const trackWithCover = {
              ...track,
              albumCover: album.albumCover,
              album: album.name
            }
            
            try {
              const trackWithPalette = await fetchColourPalette(trackWithCover)
              return trackWithPalette
            } catch (error) {
              console.error('Error fetching color palette for track:', error)
              return { ...trackWithCover, colourPalette: album.colourPalette }
            }
          })
        )
        
        setTracks(tracksWithCovers)
      }
    } catch (error) {
      console.error('Error fetching album tracks:', error)
    } finally {
      setIsLoadingTracks(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleTrackClick = (track: any) => {
    setSelectedTrack(track)
    // Change the page background using CSS custom properties
    if (track.colourPalette && track.colourPalette.length > 0) {
      const mainColor = track.colourPalette[0]
      const secondaryColor = track.colourPalette[1] || track.colourPalette[0]
      document.documentElement.style.setProperty('--bg-primary', `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`)
      document.documentElement.style.setProperty('--bg-secondary', `rgb(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]})`)
    }
  }

  const togglePalette = (trackId: string) => {
    setShowPalette(showPalette === trackId ? null : trackId)
  }

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (!isOpen || !album) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Album Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Album Info Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 mx-auto sm:mx-0">
                  <Image
                    src={album.albumCover || '/placeholder.svg?height=300&width=300'}
                    alt={album.name}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {album.name}
                  </h3>
                  <p className="text-xl text-gray-800 dark:text-gray-200">
                    {album.artists.join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(album.releaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>{album.totalTracks} tracks</span>
                  </div>
                </div>

                {album.albumUrl && (
                  <div className="pt-2">
                    <Button
                      onClick={() => window.open(album.albumUrl, '_blank')}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in Spotify
                    </Button>
                  </div>
                )}

                {/* Color Palette */}
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Album Colors</h4>
                  <div className="flex gap-2">
                    {album.colourPalette.map((color: number[], index: number) => (
                      <div 
                        key={index}
                        className="w-8 h-8 rounded-lg shadow-md border border-white dark:border-gray-600"
                        style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                        title={`RGB(${color[0]}, ${color[1]}, ${color[2]})`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracks Section */}
          <div className="p-6">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Track List
            </h4>
            
            {isLoadingTracks ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div key={track.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer ${
                        selectedTrack?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                      }`}
                      onClick={() => handleTrackClick(track)}
                    >
                      {/* Track Cover */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={track.albumCover || '/placeholder.svg?height=48&width=48'}
                          alt={track.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {track.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {track.artists.map((artist: any) => artist.name).join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(track.duration_ms)}</span>
                      </div>

                      {/* Color Palette Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePalette(track.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Palette className="w-4 h-4" />
                      </Button>

                      {track.external_urls?.spotify && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(track.external_urls.spotify, '_blank')
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Color Palette Display */}
                    {showPalette === track.id && track.colourPalette && (
                      <div className="ml-16 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Track Colors</div>
                        <div className="flex gap-2">
                          {track.colourPalette.map((color: number[], colorIndex: number) => (
                            <div
                              key={colorIndex}
                              className="flex flex-col items-center gap-1"
                            >
                              <div
                                className="w-8 h-8 rounded-lg shadow-md border border-white dark:border-gray-600"
                                style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                                title={`RGB(${color[0]}, ${color[1]}, ${color[2]})`}
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {color[0]},{color[1]},{color[2]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}