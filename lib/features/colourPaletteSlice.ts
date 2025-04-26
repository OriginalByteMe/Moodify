import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColourPaletteState {
  palette: number[][];
  isCustomPalette: boolean;
}

const initialState: ColourPaletteState = {
  palette: [],
  isCustomPalette: false
};

export const colourPaletteSlice = createSlice({
  name: 'colourPalette',
  initialState,
  reducers: {
    setColourPalette: (state, action: PayloadAction<number[][]>) => {
      state.palette = action.payload;
      state.isCustomPalette = true;
    },
    resetColourPalette: (state) => {
      state.palette = [];
      state.isCustomPalette = false;
    }
  },
});

export const { setColourPalette, resetColourPalette } = colourPaletteSlice.actions;
export default colourPaletteSlice.reducer;
