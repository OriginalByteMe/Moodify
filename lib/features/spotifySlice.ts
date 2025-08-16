import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { ISpotifyState, SpotifyTrack, SpotifyAlbum } from '@/app/utils/interfaces';

const initialState: ISpotifyState = {
  tracks: [],
  albums: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  selectedTrack: null,
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
      const newTracks = action.payload.filter(
        newTrack => !state.tracks.some(existingTrack => existingTrack.id === newTrack.id)
      );
      state.tracks = [...state.tracks, ...newTracks];
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