import { SpotifyTrack } from "@/app/utils/interfaces";

const backend_url = process.env.COLOUR_PALETTE_URL || 'http://localhost:5050'

export const fetchTracksFromDatabase = async (trackIds: string[]): Promise<SpotifyTrack[]> => {
  try {
    const response = await fetch(`${backend_url}/spotify`, {
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
    const response = await fetch(`${backend_url}/spotify/${trackId}`, {
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
    const response = await fetch(`${backend_url}/spotify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "sptifyId": track.id,
        "title": track.title,
        "artists": track.artists,
        "album": track.album,
        "albumCover": track.albumCover,
        "songUrl": track.songUrl,
        "colourPalette": track.colourPalette
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload track: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading track to database:', error);
  }
}

export const uploadTracksToDatabase = async (tracks: SpotifyTrack[]): Promise<void> => {
  try {
    const formattedTracks = tracks.map(track => ({
      spotifyId: track.id,
      title: track.title,
      artists: track.artists,
      album: track.album,
      albumCover: track.albumCover,
      songUrl: track.songUrl,
      colourPalette: track.colourPalette
    }));

    const response = await fetch(`${backend_url}/spotify/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedTracks),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload tracks: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading tracks to database:', error);
  }
}