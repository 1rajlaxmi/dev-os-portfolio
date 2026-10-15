import { describe, it, expect } from 'vitest';
import settingsReducer, {
  setThemeStyle,
  setTheme,
  setWallpaper,
  toggle3DEasterEgg,
  type ThemeStyle,
} from '../settingsSlice';

describe('settingsSlice Reducer', () => {
  const getInitialState = () => ({
    wallpaper: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=90&w=3840&auto=format&fit=crop',
    theme: { hue: 270, sat: 80, lit: 65 },
    themeStyle: 'default' as ThemeStyle,
    is3DEasterEggOpen: false,
    isTourOpen: false,
  });

  it('should return initial state with default themeStyle', () => {
    const state = settingsReducer(undefined, { type: 'unknown' });
    expect(state.themeStyle).toBe('default');
    expect(state.wallpaper).toBeDefined();
    expect(state.theme.hue).toBe(270);
  });

  it('should handle setThemeStyle for all supported themes', () => {
    const themes: ThemeStyle[] = [
      'default',
      'neobrutalism',
      'neon',
      'doodle',
      'myspace',
    ];

    let state = getInitialState();

    themes.forEach((themeStyle) => {
      state = settingsReducer(state, setThemeStyle(themeStyle));
      expect(state.themeStyle).toBe(themeStyle);
    });
  });

  it('should handle setTheme with custom wallpaper and HSL values', () => {
    const state = getInitialState();
    const newTheme = {
      url: 'https://example.com/custom-wallpaper.jpg',
      hue: 200,
      sat: 90,
      lit: 50,
    };

    const nextState = settingsReducer(state, setTheme(newTheme));
    expect(nextState.wallpaper).toBe('https://example.com/custom-wallpaper.jpg');
    expect(nextState.theme).toEqual({ hue: 200, sat: 90, lit: 50 });
  });

  it('should handle setWallpaper', () => {
    const state = getInitialState();
    const nextState = settingsReducer(state, setWallpaper('https://example.com/wp.jpg'));
    expect(nextState.wallpaper).toBe('https://example.com/wp.jpg');
  });

  it('should handle toggle3DEasterEgg', () => {
    const state = getInitialState();
    const nextState = settingsReducer(state, toggle3DEasterEgg(true));
    expect(nextState.is3DEasterEggOpen).toBe(true);
  });
});
