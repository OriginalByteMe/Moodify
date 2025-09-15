import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { ISpotifyState, SpotifyTrack, SpotifyAlbum } from '@/app/utils/interfaces';

const initialState: ISpotifyState = {
  tracks: [],
  albums: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  selectedTrack: null,
  isFullscreenMode: false,
  hasMore: false,
  total: 0,
  currentQuery: '',
  searchType: 'track',
  offset: 0,
  modalTrack: null,
  isModalOpen: false,
  albumTracksModal: {
    album: null,
    isOpen: false
  }
};

const spotifySlice = createSlice({
  name: 'spotify',
  initialState,
  reducers: {
    setTracks: (state, action: PayloadAction<SpotifyTrack[]>) => {
      state.tracks = action.payload;
      state.offset = action.payload.length;
    },
    appendTracks: (state, action: PayloadAction<SpotifyTrack[]>) => {
      // Update existing tracks in place (by id), then append truly new ones.
      // This allows us to append placeholder tracks first, and later replace
      // them with versions that include fetched colour palettes without
      // duplicating entries or losing order.
      const updatesById = new Map(action.payload.map(t => [t.id, t]));

      // Update existing items where an updated version exists
      state.tracks = state.tracks.map(existing => {
        const upd = updatesById.get(existing.id);
        return upd ? { ...existing, ...upd } : existing;
      });

      // Append any new items that weren't already present
      const existingIds = new Set(state.tracks.map(t => t.id));
      const toAppend = action.payload.filter(t => !existingIds.has(t.id));
      if (toAppend.length) {
        state.tracks = [...state.tracks, ...toAppend];
      }

      state.offset = state.tracks.length;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedTrack: (state, action: PayloadAction<SpotifyTrack | null>) => {
      state.selectedTrack = action.payload;
    },
    enterFullscreen: (state) => {
      state.isFullscreenMode = true;
    },
    exitFullscreen: (state) => {
      state.isFullscreenMode = false;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    clearTracks: (state) => {
      state.tracks = [];
      state.offset = 0;
      state.hasMore = false;
      state.total = 0;
    },
    limitTracks: (state, action: PayloadAction<number>) => {
      if (state.tracks.length > action.payload) {
        state.tracks = state.tracks.slice(-action.payload);
        state.offset = state.tracks.length;
      }
    },
    openModal: (state, action: PayloadAction<SpotifyTrack>) => {
      state.modalTrack = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.modalTrack = null;
      state.isModalOpen = false;
    },
    setAlbums: (state, action: PayloadAction<SpotifyAlbum[]>) => {
      state.albums = action.payload;
      state.offset = action.payload.length;
    },
    appendAlbums: (state, action: PayloadAction<SpotifyAlbum[]>) => {
      const newAlbums = action.payload.filter(
        newAlbum => !state.albums.some(existingAlbum => existingAlbum.id === newAlbum.id)
      );
      state.albums = [...state.albums, ...newAlbums];
      state.offset = state.albums.length;
    },
    setSearchType: (state, action: PayloadAction<'track' | 'album'>) => {
      state.searchType = action.payload;
    },
    clearAlbums: (state) => {
      state.albums = [];
    },
    openAlbumTracksModal: (state, action: PayloadAction<SpotifyAlbum>) => {
      state.albumTracksModal.album = action.payload;
      state.albumTracksModal.isOpen = true;
    },
    closeAlbumTracksModal: (state) => {
      state.albumTracksModal.album = null;
      state.albumTracksModal.isOpen = false;
    }
  },
});

export const { 
  setTracks, 
  appendTracks, 
  setLoading, 
  setLoadingMore, 
  setError, 
  setSelectedTrack, 
  enterFullscreen,
  exitFullscreen,
  setHasMore, 
  setTotal, 
  setCurrentQuery, 
  clearTracks, 
  limitTracks,
  openModal,
  closeModal,
  setAlbums,
  appendAlbums,
  setSearchType,
  clearAlbums,
  openAlbumTracksModal,
  closeAlbumTracksModal
} = spotifySlice.actions;

export default spotifySlice.reducer;
