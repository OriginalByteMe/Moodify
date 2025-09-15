"use client"

import { SpotifyTrack } from "@/app/utils/interfaces";
import { uploadTracksToDatabase } from "@/lib/database-handler";
import { useDispatch } from "react-redux";
import { useCallback } from "react";

const useSpotify = () => {
  const dispatch = useDispatch();

  const demoTracks: SpotifyTrack[] = [
    {
      id: '1',
      title: 'Blinding Lights',
      artists: ['The Weeknd'],
      album: 'Blinding Lights',
      albumCover: '/placeholder.svg?height=40&width=40',
      songUrl: 'https://open.spotify.com',
      colourPalette: [[255, 255, 255], [0, 0, 0], [255, 0, 0], [0, 255, 0]]
    },
    {
      id: '2',
      title: 'Shape of You',
      artists: ['Ed Sheeran'],
      album: 'Shape of You',
      albumCover: '/placeholder.svg?height=40&width=40',
      songUrl: 'https://open.spotify.com',
      colourPalette: [[255, 255, 255], [0, 0, 0], [255, 0, 0], [0, 255, 0]]
    },
    {
      id: '3',
      title: 'Dance Monkey',
      artists: ['Tones and I'],
      album: 'Dance Monkey',
      albumCover: '/placeholder.svg?height=40&width=40',
      songUrl: 'https://open.spotify.com',
      colourPalette: [[255, 255, 255], [0, 0, 0], [255, 0, 0], [0, 255, 0]]
    },
    {
      id: '4',
      title: 'Someone You Loved',
      artists: ['Lewis Capaldi'],
      album: 'Someone You Loved',
      albumCover: '/placeholder.svg?height=40&width=40',
      songUrl: 'https://open.spotify.com',
      colourPalette: [[255, 255, 255], [0, 0, 0], [255, 0, 0], [0, 255, 0]]
    },
    {
      id: '5',
      title: 'Watermelon Sugar',
      artists: ['Harry Styles'],
      album: 'Watermelon Sugar',
      albumCover: '/placeholder.svg?height=40&width=40',
      songUrl: 'https://open.spotify.com',
      colourPalette: [[255, 255, 255], [0, 0, 0], [255, 0, 0], [0, 255, 0]]
    }
  ];

  // Fetch color palette for a single track
    async function fetchColourPalette(track: SpotifyTrack): Promise<SpotifyTrack> {
        if (!track.albumCover) {
        return { ...track, colourPalette: demoTracks[0].colourPalette };
        }
        try {
        const response = await fetch('/api/data/palette-picker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: track.albumCover })
        });
        
        const data = await response.json();
        
        // Handle both successful responses and error responses with fallback palettes
        if (data.palette) {
            let palette = data.palette;
            if (Array.isArray(palette) && palette.length > 0) {
                if (!Array.isArray(palette[0])) {
                palette = palette.map((c: string | number[]) => typeof c === 'string' && c.includes(',') ? c.split(',').map(Number) : Array.isArray(c) ? c : demoTracks[0].colourPalette);
                }
                
                // Log if this was a fallback response
                if (data.fallback) {
                    console.warn('Using fallback palette due to error:', data.error);
                }
                
                return { ...track, colourPalette: palette };
            }
        }
        
        // If no valid palette in response, use default
        return { ...track, colourPalette: demoTracks[0].colourPalette };
        } catch (err) {
        console.error('Error fetching color palette:', err);
        return { ...track, colourPalette: demoTracks[0].colourPalette };
        }
    }
  
  // Fetch recently played tracks with palettes
  async function fetchRecentlyPlayedTracksFromApi(limit: number = 15): Promise<SpotifyTrack[]> {
    try {
      const res = await fetch(`/api/spotify/recently-played?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch recently played tracks');
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        return await Promise.all(data.tracks.map((t: SpotifyTrack) => fetchColourPalette(t)));
      }
      return demoTracks;
    } catch (err) {
      console.error('Error fetching recently played tracks:', err);
      throw err;
    }
  }

  const fetchTracksFromSearch = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    try {
      dispatch({ type: 'spotify/setLoading', payload: true });
      dispatch({ type: 'spotify/setError', payload: null });
      dispatch({ type: 'spotify/clearTracks' });
      dispatch({ type: 'spotify/setCurrentQuery', payload: query });
      
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&offset=0&limit=12`);
      if (!res.ok) throw new Error('Failed to fetch tracks from search');
      
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        // Transform the raw Spotify data to match our SpotifyTrack interface
        const transformedTracks: SpotifyTrack[] = data.items.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((artist: any) => artist.name).join(', '),
          artists: track.artists.map((artist: any) => artist.name),
          album: track.album.name,
          albumId: track.album?.id,
          albumCover: track.album.images[0]?.url || '/placeholder.svg?height=300&width=300',
          songUrl: track.external_urls?.spotify || '',
          previewUrl: track.previewUrl ?? null,
          colourPalette: demoTracks[0].colourPalette // Default palette until we fetch the real one
        }));
        
        // Fetch color palettes for each track
        const tracksWithPalettes = await Promise.all(
          transformedTracks.map(track => fetchColourPalette(track))
        );
        
        dispatch({ type: 'spotify/setTracks', payload: tracksWithPalettes });
        dispatch({ type: 'spotify/setHasMore', payload: data.hasMore });
        dispatch({ type: 'spotify/setTotal', payload: data.total });
        dispatch({ type: 'spotify/setLoading', payload: false });
        
        const bulkRes = await fetch('/api/data/collection/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tracks: tracksWithPalettes }),
        }).catch(console.error)
        if (bulkRes && 'ok' in bulkRes && bulkRes.ok) {
          try {
            const json = await bulkRes.json()
            if (json?.enriched && Array.isArray(json.enriched)) {
              // Merge enriched audio features back into store
              dispatch({ type: 'spotify/appendTracks', payload: json.enriched })
            }
          } catch {}
        }
        // Also create albums for these tracks (no palette here)
        const albumsPayload = (data.items as any[]).map((t: any) => ({
          spotifyId: t.album?.id,
          album: t.album?.name,
          artists: Array.isArray(t.artists) ? t.artists.map((a: any) => a?.name).filter(Boolean).join(', ') : '',
          albumCover: t.album?.images?.[0]?.url
        })).filter((a: any) => a.spotifyId && a.album && a.artists)
        if (albumsPayload.length > 0) {
          await fetch('/api/data/album/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ albums: albumsPayload })
          }).catch(console.error)
        }
        return tracksWithPalettes;
      }
      
      dispatch({ type: 'spotify/setTracks', payload: demoTracks });
      dispatch({ type: 'spotify/setLoading', payload: false });
      return demoTracks;
    } catch (err) {
      console.error('Error fetching tracks from search:', err);
      dispatch({ type: 'spotify/setError', payload: (err as Error).message });
      dispatch({ type: 'spotify/setTracks', payload: demoTracks });
      dispatch({ type: 'spotify/setLoading', payload: false });
      throw err;
    }
  }, [dispatch])

  async function fetchMoreTracks(query: string, offset: number, signal?: AbortSignal): Promise<{ items: SpotifyTrack[], hasMore: boolean, total: number } | null> {
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&offset=${offset}&limit=12`, {
        signal
      });
      
      if (!res.ok) throw new Error('Failed to fetch more tracks');
      
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        // Transform the raw Spotify data to match our SpotifyTrack interface
        const transformedTracks: SpotifyTrack[] = data.items.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((artist: any) => artist.name).join(', '),
          artists: track.artists.map((artist: any) => artist.name),
          album: track.album.name,
          albumId: track.album?.id,
          albumCover: track.album.images[0]?.url || '/placeholder.svg?height=300&width=300',
          songUrl: track.external_urls?.spotify || '',
          previewUrl: track.previewUrl ?? null,
          colourPalette: demoTracks[0].colourPalette // Default palette until we fetch the real one
        }));
        
        // Fetch color palettes for each track in background (non-blocking)
        setTimeout(() => {
          Promise.all(
            transformedTracks.map(track => fetchColourPalette(track))
          ).then(tracksWithPalettes => {
            // Update tracks with palettes in background
            dispatch({ type: 'spotify/appendTracks', payload: tracksWithPalettes });
            
            // Store tracks in database
            fetch('/api/data/collection/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ tracks: tracksWithPalettes }),
            })
            .then(async (res) => {
              if (res && res.ok) {
                try {
                  const json = await res.json()
                  if (json?.enriched && Array.isArray(json.enriched)) {
                    dispatch({ type: 'spotify/appendTracks', payload: json.enriched })
                  }
                } catch {}
              }
            })
            .catch(console.error);
            // Also upsert albums for these tracks
            const albumsPayload = (data.items as any[]).map((t: any) => ({
              spotifyId: t.album?.id,
              album: t.album?.name,
              artists: Array.isArray(t.artists) ? t.artists.map((a: any) => a?.name).filter(Boolean).join(', ') : '',
              albumCover: t.album?.images?.[0]?.url
            })).filter((a: any) => a.spotifyId && a.album && a.artists)
            if (albumsPayload.length > 0) {
              fetch('/api/data/album/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ albums: albumsPayload })
              }).catch(console.error)
            }
          }).catch(console.error);
        }, 100);
        
        return {
          items: transformedTracks,
          hasMore: data.hasMore,
          total: data.total
        };
      }
      
      return null;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      console.error('Error fetching more tracks:', err);
      throw err;
    }
  }

  async function fetchSpotifyTracksAndPalettes() {
    dispatch({ type: 'spotify/setLoading', payload: true });
    try {
      const trackData = await fetchRecentlyPlayedTracksFromApi(4) as SpotifyTrack[];
      const updatedTracks = await Promise.all(
        trackData.map(async (track) => {
          try {
            const paletteResult = await fetchColourPalette(track);
            return { ...track, colourPalette: paletteResult.colourPalette };
          } catch (err) {
            console.error('Error fetching color palette:', err as Error);
            return { ...track, colourPalette: demoTracks[0].colourPalette };
          }
        })
      );
      
      dispatch({ type: 'spotify/setTracks', payload: updatedTracks });
      dispatch({ type: 'spotify/setLoading', payload: false });
    } catch (err) {
      console.error('Error fetching tracks and palettes:', err as Error);
      dispatch({ type: 'spotify/setError', payload: (err as Error).message });
      dispatch({ type: 'spotify/setLoading', payload: false });
      dispatch({ type: 'spotify/setTracks', payload: demoTracks });
    }
  }
  

  const fetchAlbumsFromSearch = useCallback(async (query: string): Promise<any[]> => {
    try {
      dispatch({ type: 'spotify/setLoading', payload: true });
      dispatch({ type: 'spotify/setError', payload: null });
      dispatch({ type: 'spotify/clearAlbums' });
      dispatch({ type: 'spotify/setCurrentQuery', payload: query });
      
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&offset=0&limit=12&type=album`);
      if (!res.ok) throw new Error('Failed to fetch albums from search');
      
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        // Transform the raw Spotify data to match our SpotifyAlbum interface
        const transformedAlbums = data.items.map((album: any) => ({
          id: album.id,
          name: album.name,
          artists: album.artists.map((artist: any) => artist.name),
          albumCover: album.images[0]?.url || '/placeholder.svg?height=300&width=300',
          albumUrl: album.external_urls?.spotify || '',
          releaseDate: album.release_date,
          totalTracks: album.total_tracks,
          colourPalette: demoTracks[0].colourPalette // Default palette until we fetch the real one
        }));
        
        // Fetch color palettes for each album
        const albumsWithPalettes = await Promise.all(
          transformedAlbums.map(async (album: any) => {
            try {
              const paletteResult = await fetchColourPalette({ ...album, albumCover: album.albumCover });
              return { ...album, colourPalette: paletteResult.colourPalette };
            } catch (err) {
              console.error('Error fetching color palette:', err);
              return { ...album, colourPalette: demoTracks[0].colourPalette };
            }
          })
        );
        
        dispatch({ type: 'spotify/setAlbums', payload: albumsWithPalettes });
        dispatch({ type: 'spotify/setHasMore', payload: data.hasMore });
        dispatch({ type: 'spotify/setTotal', payload: data.total });
        dispatch({ type: 'spotify/setLoading', payload: false });

        // Persist albums as well
        try {
          const albumsPayload = albumsWithPalettes.map((a: any) => ({
            spotifyId: a.id,
            album: a.name,
            artists: Array.isArray(a.artists) ? a.artists.join(', ') : String(a.artists ?? ''),
            albumCover: a.albumCover,
            colourPalette: a.colourPalette,
          }))
          if (albumsPayload.length > 0) {
            await fetch('/api/data/album/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ albums: albumsPayload })
            })
          }
        } catch (e) {
          console.error('Error persisting albums:', e)
        }
        
        return albumsWithPalettes;
      }
      
      dispatch({ type: 'spotify/setAlbums', payload: [] });
      dispatch({ type: 'spotify/setLoading', payload: false });
      return [];
    } catch (err) {
      console.error('Error fetching albums from search:', err);
      dispatch({ type: 'spotify/setError', payload: (err as Error).message });
      dispatch({ type: 'spotify/setAlbums', payload: [] });
      dispatch({ type: 'spotify/setLoading', payload: false });
      throw err;
    }
  }, [dispatch])

  return { fetchRecentlyPlayedTracksFromApi, fetchColourPalette, fetchSpotifyTracksAndPalettes, fetchTracksFromSearch, fetchMoreTracks, fetchAlbumsFromSearch };
};


export default useSpotify;
