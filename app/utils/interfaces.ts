import { palette } from "@/utils/types";
export interface ISpotifyState {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  selectedTrack: SpotifyTrack | null;
  isFullscreenMode: boolean;
  hasMore: boolean;
  total: number;
  currentQuery: string;
  searchType: 'track' | 'album';
  offset: number;
  modalTrack: SpotifyTrack | null;
  isModalOpen: boolean;
  albumTracksModal: {
    album: SpotifyAlbum | null;
    isOpen: boolean;
  };
  // Client-side cache of search results keyed by raw query
  trackCache?: Record<string, {
    items: SpotifyTrack[];
    total: number;
    hasMore: boolean;
    offset: number;
    ts: number; // unix ms
  }>;
  albumCache?: Record<string, {
    items: SpotifyAlbum[];
    total: number;
    hasMore: boolean;
    offset: number;
    ts: number; // unix ms
  }>;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artists: string[];
  album: string;
  albumId?: string;
  albumCover?: string;
  songUrl: string;
  previewUrl?: string | null;
  colourPalette: palette;
  // Optional Spotify/audio analysis fields
  popularity?: number;
  duration_ms?: number;
  explicit?: boolean;
  danceability?: number;
  energy?: number;
  key?: number;
  loudness?: number;
  mode?: number;
  speechiness?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  valence?: number;
  tempo?: number;
  time_signature?: number;
  track_genre?: string;
  audio_features_status?: 'unprocessed' | 'processing' | 'processed' | 'failed' | 'imported';
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: string[];
  albumCover?: string;
  albumUrl: string;
  releaseDate: string;
  totalTracks: number;
  colourPalette: palette;
  tracks?: SpotifyTrack[];
}

export interface SpotifyStoreContextType {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  error: string | null;
  selectedTrack: SpotifyTrack | null;
}
