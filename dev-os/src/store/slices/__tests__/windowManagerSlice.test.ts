import { describe, it, expect, beforeEach } from 'vitest';
import windowManagerReducer, {
  openWindow,
  closeWindow,
  focusWindow,
  toggleMinimize,
  toggleMaximize,
  updateGeometry,
} from '../windowManagerSlice';

describe('windowManagerSlice Reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = () => ({
    windows: [],
    activeWindowId: null,
  });

  it('should handle openWindow for a new app window', () => {
    const initialState = getInitialState();
    const action = openWindow({
      id: 'terminal',
      appId: 'terminal',
      title: 'Terminal',
    });

    const nextState = windowManagerReducer(initialState, action);

    expect(nextState.windows.length).toBe(1);
    expect(nextState.windows[0].id).toBe('terminal');
    expect(nextState.windows[0].isOpen).toBe(true);
    expect(nextState.activeWindowId).toBe('terminal');
  });

  it('should handle openWindow for an existing window (restore/bring to front)', () => {
    const stateWithWindow = {
      windows: [
        {
          id: 'terminal',
          appId: 'terminal',
          title: 'Terminal',
          zIndex: 100,
          isOpen: false,
          isMinimized: true,
          geometry: { x: 100, y: 100, width: 800, height: 600 },
        },
      ],
      activeWindowId: null,
    };

    const action = openWindow({
      id: 'terminal',
      appId: 'terminal',
      title: 'Terminal Emulator',
    });

    const nextState = windowManagerReducer(stateWithWindow, action);

    expect(nextState.windows.length).toBe(1);
    expect(nextState.windows[0].isOpen).toBe(true);
    expect(nextState.windows[0].isMinimized).toBe(false);
    expect(nextState.windows[0].title).toBe('Terminal Emulator');
    expect(nextState.activeWindowId).toBe('terminal');
  });

  it('should handle closeWindow', () => {
    const stateWithWindows = {
      windows: [
        {
          id: 'terminal',
          appId: 'terminal',
          title: 'Terminal',
          zIndex: 100,
          isOpen: true,
          geometry: { x: 100, y: 100, width: 800, height: 600 },
        },
        {
          id: 'projects',
          appId: 'projects',
          title: 'Projects',
          zIndex: 110,
          isOpen: true,
          geometry: { x: 140, y: 140, width: 800, height: 600 },
        },
      ],
      activeWindowId: 'projects',
    };

    const nextState = windowManagerReducer(stateWithWindows, closeWindow('projects'));

    expect(nextState.windows.length).toBe(1);
    expect(nextState.windows[0].id).toBe('terminal');
    expect(nextState.activeWindowId).toBe('terminal');
  });

  it('should handle focusWindow', () => {
    const stateWithWindows = {
      windows: [
        {
          id: 'terminal',
          appId: 'terminal',
          title: 'Terminal',
          zIndex: 100,
          isOpen: true,
          isMinimized: true,
          geometry: { x: 100, y: 100, width: 800, height: 600 },
        },
        {
          id: 'projects',
          appId: 'projects',
          title: 'Projects',
          zIndex: 110,
          isOpen: true,
          geometry: { x: 140, y: 140, width: 800, height: 600 },
        },
      ],
      activeWindowId: 'projects',
    };

    const nextState = windowManagerReducer(stateWithWindows, focusWindow('terminal'));

    expect(nextState.activeWindowId).toBe('terminal');
    expect(nextState.windows[0].isMinimized).toBe(false);
  });

  it('should handle toggleMinimize and toggleMaximize', () => {
    const stateWithWindow = {
      windows: [
        {
          id: 'settings',
          appId: 'settings',
          title: 'Settings',
          zIndex: 100,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          geometry: { x: 100, y: 100, width: 800, height: 600 },
        },
      ],
      activeWindowId: 'settings',
    };

    let nextState = windowManagerReducer(stateWithWindow, toggleMinimize('settings'));
    expect(nextState.windows[0].isMinimized).toBe(true);
    expect(nextState.activeWindowId).toBeNull();

    nextState = windowManagerReducer(nextState, toggleMaximize('settings'));
    expect(nextState.windows[0].isMaximized).toBe(true);
  });

  it('should handle updateGeometry', () => {
    const stateWithWindow = {
      windows: [
        {
          id: 'settings',
          appId: 'settings',
          title: 'Settings',
          zIndex: 100,
          isOpen: true,
          geometry: { x: 100, y: 100, width: 800, height: 600 },
        },
      ],
      activeWindowId: 'settings',
    };

    const nextState = windowManagerReducer(
      stateWithWindow,
      updateGeometry({ id: 'settings', geometry: { x: 250, y: 300, width: 900 } })
    );

    expect(nextState.windows[0].geometry).toEqual({
      x: 250,
      y: 300,
      width: 900,
      height: 600,
    });
  });
});
