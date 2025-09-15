import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { SongCard } from "@/components/song-card"
import { AlbumCard } from "@/components/album-card"
import { useSelector, useDispatch } from "react-redux"
import { SpotifyTrack, ISpotifyState } from "@/app/utils/interfaces"
import { setLoadingMore, appendTracks, setHasMore, setTotal, limitTracks, closeModal, closeAlbumTracksModal, setSearchType, clearTracks, clearAlbums, appendAlbums } from '@/lib/features/spotifySlice'
import useSpotify from '@/hooks/useSpotify'
import { SongDetailModal } from './song-detail-modal'
import { AlbumTracksModal } from './album-tracks-modal'

export function SearchResults() {
  const dispatch = useDispatch()
  const { fetchMoreTracks, fetchTracksFromSearch, fetchAlbumsFromSearch } = useSpotify()
  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingTriggerRef = useRef<HTMLDivElement>(null)
  
  const state = useSelector((state: { spotify: ISpotifyState }) => state.spotify)
  const { tracks, albums, isLoadingMore, hasMore, currentQuery, offset, modalTrack, isModalOpen, albumTracksModal, searchType } = state

  const loadMoreItems = useCallback(async () => {
    if (isLoadingMore || !hasMore || !currentQuery) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    dispatch(setLoadingMore(true))
    
    try {
      if (searchType === 'track') {
        const newTracks = await fetchMoreTracks(currentQuery, offset, abortControllerRef.current.signal)
        
        if (newTracks) {
          dispatch(appendTracks(newTracks.items))
          dispatch(setHasMore(newTracks.hasMore))
          dispatch(setTotal(newTracks.total))
          
          // Memory management: limit to 300 tracks
          dispatch(limitTracks(300))
        }
      } else {
        // For albums, we need to implement fetchMoreAlbums in useSpotify
        // For now, disable infinite scroll for albums
        dispatch(setHasMore(false))
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error loading more items:', error)
      }
    } finally {
      dispatch(setLoadingMore(false))
    }
  }, [dispatch, fetchMoreTracks, isLoadingMore, hasMore, currentQuery, offset, searchType])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger 100px before the element comes into view
      }
    )

    if (loadingTriggerRef.current) {
      observer.observe(loadingTriggerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreItems, hasMore, isLoadingMore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const memoizedTracks = useMemo(() => tracks, [tracks])

  const handleCloseModal = useCallback(() => {
    dispatch(closeModal())
  }, [dispatch])

  const handleCloseAlbumTracksModal = useCallback(() => {
    dispatch(closeAlbumTracksModal())
  }, [dispatch])

  const handleAlbumSearch = useCallback((albumName: string) => {
    dispatch(setSearchType('album'))
    dispatch(clearTracks())
    dispatch(clearAlbums())
    dispatch(closeModal())
    // Trigger album search for the album name
    // This will be handled by the search form's useEffect
    window.history.pushState(null, '', `/?q=${encodeURIComponent(albumName)}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [dispatch])

  const currentResults = searchType === 'track' ? tracks : albums
  const memoizedResults = useMemo(() => currentResults, [currentResults])

  if (!currentResults || currentResults.length === 0) {
    return <div className="mt-8 text-center text-zinc-400">No results found. Try a different search term.</div>
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {searchType === 'track' 
          ? memoizedResults.map((track) => (
              <SongCard key={track.id} track={track as SpotifyTrack} />
            ))
          : memoizedResults.map((album) => (
              <AlbumCard key={album.id} album={album as any} />
            ))
        }
      </div>
      
      {/* Loading trigger element */}
      {hasMore && (
        <div ref={loadingTriggerRef} className="mt-8 flex justify-center">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}

      {/* Song Detail Modal */}
      <SongDetailModal
        track={modalTrack}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAlbumClick={handleAlbumSearch}
      />

      {/* Album Tracks Modal */}
      <AlbumTracksModal
        album={albumTracksModal.album}
        isOpen={albumTracksModal.isOpen}
        onClose={handleCloseAlbumTracksModal}
      />
    </div>
  )
}
