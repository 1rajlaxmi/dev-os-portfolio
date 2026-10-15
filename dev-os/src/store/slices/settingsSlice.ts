import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeStyle = 'default' | 'neobrutalism' | 'neon' | 'doodle' | 'myspace';


interface ThemePayload {
  url: string;
  hue: number;
  sat: number;
  lit: number;
}

interface SettingsState {
  wallpaper: string;
  theme: { hue: number; sat: number; lit: number };
  themeStyle: ThemeStyle;
  is3DEasterEggOpen: boolean;
  isTourOpen: boolean;
}

const initialState: SettingsState = {
  wallpaper: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=90&w=3840&auto=format&fit=crop',
  theme: { hue: 270, sat: 80, lit: 65 },
  themeStyle: 'default',
  is3DEasterEggOpen: false,
  isTourOpen: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemePayload>) => {
      state.wallpaper = action.payload.url;
      state.theme = { hue: action.payload.hue, sat: action.payload.sat, lit: action.payload.lit };
    },
    setThemeStyle: (state, action: PayloadAction<ThemeStyle>) => {
      state.themeStyle = action.payload;
    },
    setWallpaper: (state, action: PayloadAction<string>) => {
      state.wallpaper = action.payload;
    },
    toggle3DEasterEgg: (state, action: PayloadAction<boolean>) => {
      state.is3DEasterEggOpen = action.payload;
    },
    setTourOpen: (state, action: PayloadAction<boolean>) => {
      state.isTourOpen = action.payload;
    },
  },
});

export const { setTheme, setThemeStyle, setWallpaper, toggle3DEasterEgg, setTourOpen } = settingsSlice.actions;
export default settingsSlice.reducer;