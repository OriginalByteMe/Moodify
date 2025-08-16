import { palette } from "@/utils/types";
export interface ISpotifyState {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  selectedTrack: SpotifyTrack | null;
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
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artists: string[];
  album: string;
  albumId?: string;
  albumCover?: string;
  songUrl: string;
  colourPalette: palette;
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
