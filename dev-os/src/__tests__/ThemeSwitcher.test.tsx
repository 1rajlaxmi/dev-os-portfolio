import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Desktop } from '../features/desktop/Desktop';
import { TopBar } from '../features/desktop/TopBar';
import { Settings } from '../programs/Settings/Settings';

function createTestStore(initialThemeStyle = 'default') {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      windowManager: windowManagerReducer,
      admin: adminReducer,
      vfs: vfsReducer,
    },
    preloadedState: {
      settings: {
        wallpaper: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=90&w=3840&auto=format&fit=crop',
        theme: { hue: 270, sat: 80, lit: 65 },
        themeStyle: initialThemeStyle as any,
        is3DEasterEggOpen: false,
        isTourOpen: false,
      },
    },
  });
}

describe('UI Theme Switcher System Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render default theme style initially on Desktop container', () => {
    const store = createTestStore('default');
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    const desktopEl = container.querySelector('[data-theme-style]');
    expect(desktopEl).not.toBeNull();
    expect(desktopEl?.getAttribute('data-theme-style')).toBe('default');
  });

  it('should update data-theme-style on Desktop container when theme changes to neobrutalism', () => {
    const store = createTestStore('default');
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    // Open theme menu from TopBar button
    const themeBtn = screen.getByTitle('Switch UI Style / Theme');
    fireEvent.click(themeBtn);

    // Click Neo Brutalism from topbar dropdown menu
    const neoButtons = screen.getAllByText(/Neo Brutalism/i);
    fireEvent.click(neoButtons[0]);

    const desktopEl = container.querySelector('[data-theme-style]');
    expect(desktopEl?.getAttribute('data-theme-style')).toBe('neobrutalism');
  });

  it('should allow switching between themes in Settings window', () => {
    const store = createTestStore('default');
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    // Click UI Themes tab in Settings sidebar
    const themesTabBtn = screen.getByText('UI Themes');
    fireEvent.click(themesTabBtn);

    // Verify all 5 remaining themes are present
    expect(screen.getAllByText(/Neo Brutalism/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Neon Cyberpunk/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Doodle Sketchbook/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MySpace/i).length).toBeGreaterThan(0);

    // Confirm removed themes are NOT shown
    expect(screen.queryByText(/Minimalist/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dark Mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Light Mode/i)).not.toBeInTheDocument();

    // Click Doodle Sketchbook option
    fireEvent.click(screen.getAllByText(/Doodle Sketchbook/i)[0]);
    expect(store.getState().settings.themeStyle).toBe('doodle');
  });

  it('should switch to MySpace (Web 1.0) and Neon Cyberpunk correctly in store state', () => {
    const store = createTestStore('default');
    render(
      <Provider store={store}>
        <TopBar />
      </Provider>
    );

    const themeBtn = screen.getByTitle('Switch UI Style / Theme');

    // Switch to MySpace
    fireEvent.click(themeBtn);
    fireEvent.click(screen.getAllByText(/MySpace/i)[0]);
    expect(store.getState().settings.themeStyle).toBe('myspace');

    // Switch to Neon
    fireEvent.click(themeBtn);
    fireEvent.click(screen.getAllByText(/Neon Cyberpunk/i)[0]);
    expect(store.getState().settings.themeStyle).toBe('neon');

    // Minimal, Dark, Light options should no longer exist in the menu
    fireEvent.click(themeBtn);
    expect(screen.queryByText(/Minimalist/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dark Mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Light Mode/i)).not.toBeInTheDocument();
  });
});
