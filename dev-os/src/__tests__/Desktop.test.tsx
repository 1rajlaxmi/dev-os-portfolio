import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Desktop } from '../features/desktop/Desktop';

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
        wallpaper: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
        theme: { hue: 270, sat: 80, lit: 65 },
        themeStyle: 'default' as const,
        is3DEasterEggOpen: false,
        isTourOpen: false,
      },
    },
  });
}

describe('Desktop Component — Activity Monitor & New Folder Removal', () => {
  it('should NOT render Activity Monitor as a desktop icon', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );
    // "Activity Monitor" text should not be a desktop icon
    const desktopIcons = document.querySelectorAll('[title*="Activity Monitor"]');
    expect(desktopIcons.length).toBe(0);
  });

  it('should render exactly 7 desktop icons (no Activity Monitor)', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );
    // Each desktop icon has a title starting with "Double-click to open"
    const iconButtons = document.querySelectorAll('[title^="Double-click to open"]');
    expect(iconButtons.length).toBe(7);
  });

  it('should show correct desktop icons: Resume, Projects, DSA, Explorer, Terminal, Settings, Contact', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );
    const expected = ['Resume', 'Projects', 'DSA Dashboard', 'File Explorer', 'Terminal', 'Settings', 'Contact Me'];
    expected.forEach((name) => {
      expect(screen.getByTitle(`Double-click to open ${name}`)).toBeInTheDocument();
    });
  });

  it('should NOT show "New Folder" in the right-click context menu', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    // Right-click to open context menu
    fireEvent.contextMenu(container.firstElementChild!);

    // "New Folder" should NOT appear
    expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
  });

  it('should show "Change Wallpaper", "Enter Fullscreen", "Refresh DevOS" in the context menu', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    fireEvent.contextMenu(container.firstElementChild!);

    expect(screen.getByText('Change Wallpaper')).toBeInTheDocument();
    expect(screen.queryByText(/Fullscreen/i)).toBeInTheDocument();
    expect(screen.getByText('Refresh DevOS')).toBeInTheDocument();
  });

  it('context menu should close after clicking outside', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    fireEvent.contextMenu(container.firstElementChild!);
    expect(screen.getByText('Change Wallpaper')).toBeInTheDocument();

    // Click outside to close
    fireEvent.click(document.body);
    expect(screen.queryByText('Change Wallpaper')).not.toBeInTheDocument();
  });

  it('clicking "Change Wallpaper" in context menu should open Settings window', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <Desktop />
      </Provider>
    );

    fireEvent.contextMenu(container.firstElementChild!);
    fireEvent.click(screen.getByText('Change Wallpaper'));

    const state = store.getState();
    const settingsWindow = state.windowManager.windows.find((w: any) => w.appId === 'settings');
    expect(settingsWindow).toBeDefined();
    expect(settingsWindow?.isOpen).toBe(true);
  });
});
