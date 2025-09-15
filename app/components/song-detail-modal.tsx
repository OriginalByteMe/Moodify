import React from 'react'
import Image from 'next/image'
import { X, ExternalLink, Palette, Music, User, Disc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotifyTrack } from '../utils/interfaces'

interface SongDetailModalProps {
  track: SpotifyTrack | null
  isOpen: boolean
  onClose: () => void
  onAlbumClick?: (albumName: string) => void
}

export const SongDetailModal = ({ track, isOpen, onClose, onAlbumClick }: SongDetailModalProps) => {
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
                  src={track.albumCover || '/placeholder.svg?height=300&width=300'}
                  alt={track.album}
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
                  {track.title}
                </h3>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4" />
                  <span>Artist{track.artists.length > 1 ? 's' : ''}</span>
                </div>
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  {track.artists.join(', ')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Disc className="h-4 w-4" />
                  <span>Album</span>
                </div>
                {onAlbumClick ? (
                  <button
                    onClick={() => onAlbumClick(track.album)}
                    className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-left"
                  >
                    {track.album}
                  </button>
                ) : (
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    {track.album}
                  </p>
                )}
              </div>

              {track.songUrl && (
                <div className="pt-2">
                  <Button
                    onClick={() => window.open(track.songUrl, '_blank')}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Spotify
                  </Button>
                </div>
              )}
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
              {track.colourPalette.map((color: number[], index: number) => (
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