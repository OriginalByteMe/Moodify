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
        previewUrl: track.previewUrl,
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
  const formattedTracks = tracks.map(track => {
    const base: any = {
      spotifyId: track.id,
      title: track.title,
      // Backend expects a comma-separated string for artists
      artists: Array.isArray(track.artists) ? track.artists.join(', ') : String(track.artists ?? ''),
      album: track.album,
      albumCover: track.albumCover,
      songUrl: track.songUrl,
      previewUrl: track.previewUrl,
      colourPalette: track.colourPalette,
    };

    // Include optional audio features if present
    const maybeFeatures: Partial<SpotifyTrack> = {
      popularity: track.popularity,
      duration_ms: track.duration_ms,
      explicit: track.explicit,
      danceability: track.danceability,
      energy: track.energy,
      key: track.key,
      loudness: track.loudness,
      mode: track.mode,
      speechiness: track.speechiness,
      acousticness: track.acousticness,
      instrumentalness: track.instrumentalness,
      liveness: track.liveness,
      valence: track.valence,
      tempo: track.tempo,
      time_signature: track.time_signature,
      track_genre: track.track_genre,
      audio_features_status: track.audio_features_status,
    };
    for (const [k, v] of Object.entries(maybeFeatures)) {
      if (v !== undefined && v !== null) base[k] = v;
    }
    return base;
  });

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

// Patch an existing track by Spotify ID
export const patchTrack = async (
  spotifyId: string,
  payload: Partial<{
    title: string;
    artists: string;
    album: string;
    albumCover: string;
    songUrl: string;
    previewUrl: string | null;
    colourPalette: number[][];
    spotifyAlbumId: string;
    albumColourPalette: number[][];
    album_name: string;
    track_name: string;
    popularity: number;
    duration_ms: number;
    explicit: boolean;
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    time_signature: number;
    track_genre: string;
    audio_features_status: 'unprocessed' | 'processing' | 'processed' | 'failed' | 'imported';
  }>
): Promise<any> => {
  try {
    const response = await fetch(`${backend_url}/spotify/tracks/${spotifyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to patch track ${spotifyId}: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error patching track:', error);
    throw error;
  }
}

// Patch an existing album by Spotify ID
export const patchAlbum = async (
  spotifyId: string,
  payload: Partial<{
    album: string;
    artists: string;
    albumCover: string;
    colourPalette: number[][];
  }>
): Promise<any> => {
  try {
    const response = await fetch(`${backend_url}/spotify/albums/${spotifyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to patch album ${spotifyId}: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error patching album:', error);
    throw error;
  }
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
  const json = await response.json().catch(() => ({}));
  // If duplicate (200) and we have palette/cover, try patching to refresh values
  if (response.status === 200) {
    try {
      const patchPayload: any = {};
      if (album.album) patchPayload.album = album.album;
      if (album.artists) patchPayload.artists = Array.isArray(album.artists) ? album.artists.join(', ') : String(album.artists ?? '');
      if (album.albumCover) patchPayload.albumCover = album.albumCover;
      if (album.colourPalette) patchPayload.colourPalette = album.colourPalette;
      if (Object.keys(patchPayload).length > 0) {
        await patchAlbum(album.spotifyId, patchPayload).catch(() => {});
      }
    } catch {}
  }
  return json;
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
