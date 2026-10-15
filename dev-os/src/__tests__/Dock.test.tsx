import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Dock } from '../features/desktop/Dock';

function createTestStore() {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      windowManager: windowManagerReducer,
      admin: adminReducer,
      vfs: vfsReducer,
    },
    preloadedState: {
      settings: {
        wallpaper: 'https://example.com/wp.jpg',
        theme: { hue: 270, sat: 80, lit: 65 },
        themeStyle: 'default' as const,
        is3DEasterEggOpen: false,
        isTourOpen: false,
      },
    },
  });
}

describe('Dock Component — Activity Monitor Removed', () => {
  it('should NOT render Activity Monitor in the dock', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Dock />
      </Provider>
    );
    // Activity Monitor tooltip should not appear
    expect(screen.queryByTitle('Activity Monitor')).not.toBeInTheDocument();
  });

  it('should render exactly 8 dock app icons (not 9, since Activity Monitor removed)', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Dock />
      </Provider>
    );
    // Each app in Dock has a title attribute
    const dockButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('title') && btn.getAttribute('title') !== ''
    );
    // Should be 8 apps: Terminal, Explorer, Projects, DSA, Browser, Resume, Contact, Settings
    expect(dockButtons.length).toBe(8);
  });

  it('should contain the expected 8 apps in the dock', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Dock />
      </Provider>
    );
    const expectedApps = [
      'Terminal', 'File Explorer', 'Projects', 'DSA Dashboard',
      'Web Browser', 'Resume', 'Contact', 'Settings',
    ];
    expectedApps.forEach((appTitle) => {
      expect(screen.getByTitle(appTitle)).toBeInTheDocument();
    });
  });

  it('should open a window in store when a dock icon is clicked', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Dock />
      </Provider>
    );

    fireEvent.click(screen.getByTitle('Terminal'));

    const state = store.getState();
    const terminalWindow = state.windowManager.windows.find((w: any) => w.appId === 'terminal');
    expect(terminalWindow).toBeDefined();
    expect(terminalWindow?.isOpen).toBe(true);
  });

  it('should show active dot when an app window is open', () => {
    const store = configureStore({
      reducer: {
        settings: settingsReducer,
        windowManager: windowManagerReducer,
        admin: adminReducer,
        vfs: vfsReducer,
      },
      preloadedState: {
        settings: {
          wallpaper: 'https://example.com/wp.jpg',
          theme: { hue: 270, sat: 80, lit: 65 },
          themeStyle: 'default' as const,
          is3DEasterEggOpen: false,
          isTourOpen: false,
        },
        windowManager: {
          windows: [
            {
              id: 'terminal',
              appId: 'terminal',
              title: 'Terminal',
              zIndex: 100,
              isOpen: true,
              isMinimized: false,
              isMaximized: false,
              geometry: { x: 100, y: 100, width: 800, height: 600 },
            },
          ],
          activeWindowId: 'terminal',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Dock />
      </Provider>
    );

    // The active dot is a small div with indigo color - it should exist
    const activeDots = container.querySelectorAll('.bg-indigo-400.rounded-full');
    expect(activeDots.length).toBeGreaterThan(0);
  });
});
