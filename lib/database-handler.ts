import { SpotifyAlbum, SpotifyTrack } from "@/app/utils/interfaces";

const backend_url = process.env.NEXT_PUBLIC_MOODIFY_BACKEND_URL

export const fetchTracksFromDatabase = async (trackIds: string[]): Promise<SpotifyTrack[]> => {
  try {
    const response = await fetch(`${backend_url}/spotify/tracks/bulk`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: trackIds }),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks: ${response.statusText}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching tracks from database:', error);
    return [];
  }
}

export const fetchTrackFromDatabase = async (trackId: string): Promise<SpotifyTrack | null> => {
  try {
    const response = await fetch(`${backend_url}/spotify/tracks/${trackId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.statusText}`);
    }
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching track from database:', error);
    return null;
  }
}

export const uploadTrackToDatabase = async (track: SpotifyTrack): Promise<void> => {
  try {
    const response = await fetch(`${backend_url}/spotify/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // NOTE: The single-track endpoint in the backend requires additional fields
        // like spotifyAlbumId and albumColourPalette. This payload only includes
        // readily available properties; calls to this function may fail unless
        // extended upstream with required fields.
        spotifyId: track.id,
        title: track.title,
        artists: Array.isArray(track.artists) ? track.artists.join(', ') : String(track.artists ?? ''),
        album: track.album,
        albumCover: track.albumCover,
        songUrl: track.songUrl,
        colourPalette: track.colourPalette
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload track: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading track to database:', error);
  }
}

export const uploadTracksToDatabase = async (tracks: SpotifyTrack[]): Promise<any> => {
  const formattedTracks = tracks.map(track => ({
    spotifyId: track.id,
    title: track.title,
    // Backend expects a comma-separated string for artists
    artists: Array.isArray(track.artists) ? track.artists.join(', ') : String(track.artists ?? ''),
    album: track.album,
    albumCover: track.albumCover,
    songUrl: track.songUrl,
    // previewUrl is not part of BulkCreateTracksRequest schema; omit it
    colourPalette: track.colourPalette
  }));

  const response = await fetch(`${backend_url}/spotify/tracks/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedTracks),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to upload tracks: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
  }
  return response.json();
}

// Create a single album in the backend
export const uploadAlbumToDatabase = async (album: {
  spotifyId: string;
  album: string;
  artists: string | string[];
  albumCover?: string;
  colourPalette?: number[][];
}): Promise<any> => {
  const payload = {
    spotifyId: album.spotifyId,
    album: album.album,
    artists: Array.isArray(album.artists) ? album.artists.join(', ') : String(album.artists ?? ''),
    albumCover: album.albumCover,
    colourPalette: album.colourPalette,
  };

  const response = await fetch(`${backend_url}/spotify/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok && response.status !== 200 && response.status !== 201) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to upload album: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
  }
  return response.json();
}

// Convenience helper to upload many albums (no backend bulk endpoint)
export const uploadAlbumsToDatabase = async (albums: Array<{
  spotifyId: string;
  album: string;
  artists: string | string[];
  albumCover?: string;
  colourPalette?: number[][];
}>): Promise<any[]> => {
  if (!albums || albums.length === 0) return [];
  const unique = new Map<string, {
    spotifyId: string; album: string; artists: string | string[]; albumCover?: string; colourPalette?: number[][];
  }>();
  for (const a of albums) {
    if (a.spotifyId && !unique.has(a.spotifyId)) unique.set(a.spotifyId, a);
  }
  return Promise.all(Array.from(unique.values()).map(uploadAlbumToDatabase));
}
