import { combineReducers, configureStore } from "@reduxjs/toolkit";
import spotifySlice from "@/lib/features/spotifySlice";
import colourPaletteSlice from "@/lib/features/colourPaletteSlice";
import { tracksApi } from "@/lib/services/tracksApi";

export type RootState = ReturnType<typeof combinedReducer>;

export const combinedReducer = combineReducers({ 
  spotify: spotifySlice,
  colourPalette: colourPaletteSlice,
  [tracksApi.reducerPath]: tracksApi.reducer,
});

// Create store with optional preloaded state
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: combinedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(tracksApi.middleware),
    preloadedState,
  });
}

// Use setupStore for actual store instance
export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
