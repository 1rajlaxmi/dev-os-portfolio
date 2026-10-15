import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Spotlight } from '../features/desktop/Spotlight';

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
        wallpaper: '',
        theme: { hue: 270, sat: 80, lit: 65 },
        themeStyle: 'default' as const,
        is3DEasterEggOpen: false,
        isTourOpen: false,
      },
    },
  });
}

// Helper: fire the open-spotlight custom window event
function fireOpenSpotlight() {
  act(() => {
    window.dispatchEvent(new Event('open-spotlight'));
  });
}

// Helper: fire Ctrl+K on window
function fireCtrlK() {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
    );
  });
}

describe('Spotlight Component — Activity Monitor Removed', () => {
  it('should not render anything when closed', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    expect(screen.queryByPlaceholderText('Search apps or files...')).not.toBeInTheDocument();
  });

  it('should open when Ctrl+K is pressed', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireCtrlK();
    expect(screen.getByPlaceholderText('Search apps or files...')).toBeInTheDocument();
  });

  it('should open via the "open-spotlight" custom event (TopBar search button)', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();
    expect(screen.getByPlaceholderText('Search apps or files...')).toBeInTheDocument();
  });

  it('should close when Escape key event is fired on window', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();
    expect(screen.getByPlaceholderText('Search apps or files...')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(screen.queryByPlaceholderText('Search apps or files...')).not.toBeInTheDocument();
  });

  it('should show all 8 registered apps by default when open (no Activity Monitor)', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Web Browser')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('DSA Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('File Explorer')).toBeInTheDocument();
  });

  it('should NOT show Activity Monitor in Spotlight results', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();
    expect(screen.queryByText('Activity Monitor')).not.toBeInTheDocument();
  });

  it('should show exactly 8 result items when open with no query', () => {
    const store = createTestStore();
    const { container } = render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    const resultItems = container.querySelectorAll('.max-h-80 button');
    expect(resultItems.length).toBe(8);
  });

  it('should filter results when user types a search query', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    const input = screen.getByPlaceholderText('Search apps or files...');
    fireEvent.change(input, { target: { value: 'term' } });

    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
  });

  it('searching "dsa" should show DSA Dashboard', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    fireEvent.change(
      screen.getByPlaceholderText('Search apps or files...'),
      { target: { value: 'dsa' } }
    );
    expect(screen.getByText('DSA Dashboard')).toBeInTheDocument();
  });

  it('searching "activity" should show no app results and display No results message', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    // No VFS files contain "activity" in their name either
    fireEvent.change(
      screen.getByPlaceholderText('Search apps or files...'),
      { target: { value: 'activity monitor' } }
    );
    expect(screen.queryByText('Activity Monitor')).not.toBeInTheDocument();
    expect(screen.getByText(/No results for/i)).toBeInTheDocument();
  });

  it('should open a window when a result item is clicked', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    // Click the Terminal result (text label)
    const terminalResult = screen.getAllByText('Terminal')[0];
    fireEvent.click(terminalResult);

    const state = store.getState();
    expect(state.windowManager.windows.find((w: any) => w.appId === 'terminal')).toBeDefined();
  });

  it('should close Spotlight after clicking a result', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    const terminalResult = screen.getAllByText('Terminal')[0];
    fireEvent.click(terminalResult);

    expect(screen.queryByPlaceholderText('Search apps or files...')).not.toBeInTheDocument();
  });

  it('should show No results message when query matches nothing', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    fireEvent.change(
      screen.getByPlaceholderText('Search apps or files...'),
      { target: { value: 'xyznonexistentthing99' } }
    );
    expect(screen.getByText(/No results for/i)).toBeInTheDocument();
  });

  it('clicking the backdrop overlay should close Spotlight', () => {
    const store = createTestStore();
    const { container } = render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();
    expect(screen.getByPlaceholderText('Search apps or files...')).toBeInTheDocument();

    // The outer backdrop div has onClick={close}
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(screen.queryByPlaceholderText('Search apps or files...')).not.toBeInTheDocument();
  });

  it('should handle ArrowDown key navigation in the results list', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    const input = screen.getByPlaceholderText('Search apps or files...');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // No error should be thrown; the selection index moves without crashing
    expect(screen.getByPlaceholderText('Search apps or files...')).toBeInTheDocument();
  });

  it('Enter key should trigger the currently selected result action', () => {
    const store = createTestStore();
    render(<Provider store={store}><Spotlight /></Provider>);
    fireOpenSpotlight();

    const input = screen.getByPlaceholderText('Search apps or files...');
    // Default selectedIndex is 0 = Terminal; press Enter to open it
    fireEvent.keyDown(input, { key: 'Enter' });

    const state = store.getState();
    // First app in registry is terminal
    expect(state.windowManager.windows.length).toBeGreaterThan(0);
  });
});
