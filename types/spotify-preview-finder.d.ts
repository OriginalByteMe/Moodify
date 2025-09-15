declare module 'spotify-preview-finder' {
  export interface SpotifyPreviewResult {
    name?: string;
    spotifyUrl?: string;
    previewUrls?: string[];
    trackId?: string;
    albumName?: string;
    releaseDate?: string;
    popularity?: number;
    durationMs?: number;
    // Allow additional fields the library may return
    [key: string]: unknown;
  }

  export interface SpotifyPreviewResponse {
    success: boolean;
    results: SpotifyPreviewResult[];
    searchQuery?: string;
    error?: string;
  }

  /**
   * Finds Spotify preview URLs for a track.
   * @param songName The name of the song to search for.
   * @param artistOrLimit Optional artist name (string) or result limit (number).
   * @param limit Optional maximum number of results when the second argument is an artist.
   */
  export default function previewFinder(
    songName: string,
    artistOrLimit?: string | number,
    limit?: number
  ): Promise<SpotifyPreviewResponse>;
}

