import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
  isOpen: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  fileId?: string; // Used by the Notes app to know which file to fetch
  geometry: WindowGeometry;
}

interface WindowManagerState {
  windows: WindowState[];
  activeWindowId: string | null;
}

// ── localStorage persistence ──────────────────────────────────────────────────
const STORAGE_KEY = 'devos_window_manager';

function loadState(): Partial<WindowManagerState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WindowManagerState;
    // When we restore, close all windows (user must reopen them)
    // but we keep the geometry so reopened windows restore their size/position
    return {
      windows: parsed.windows.map((w) => ({
        ...w,
        isOpen: false,
        isMinimized: false,
      })),
      activeWindowId: null,
    };
  } catch {
    return {};
  }
}

function saveState(state: WindowManagerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

// Default geometry for brand-new windows (cascaded by zIndex offset)
function defaultGeometry(offset: number): WindowGeometry {
  return {
    x: 120 + offset * 24,
    y: 60 + offset * 24,
    width: 800,
    height: 600,
  };
}

const restoredState = loadState();

const initialState: WindowManagerState = {
  windows: restoredState.windows ?? [],
  activeWindowId: restoredState.activeWindowId ?? null,
};

const BASE_Z_INDEX = 100;
const MAX_WINDOW_Z_INDEX = 8000;

function renormalizeWindows(windows: WindowState[], targetActiveId: string | null) {
  if (windows.length === 0) return;
  const sorted = [...windows].sort((a, b) => a.zIndex - b.zIndex);
  sorted.forEach((win, index) => {
    win.zIndex = BASE_Z_INDEX + index * 10;
  });
  if (targetActiveId) {
    const active = windows.find((w) => w.id === targetActiveId);
    if (active) {
      const highestOther = Math.max(BASE_Z_INDEX, ...windows.filter((w) => w.id !== targetActiveId).map((w) => w.zIndex));
      active.zIndex = Math.min(MAX_WINDOW_Z_INDEX, highestOther + 10);
    }
  }
}

export const windowManagerSlice = createSlice({
  name: 'windowManager',
  initialState,
  reducers: {
    openWindow: (
      state,
      action: PayloadAction<{ id: string; appId: string; title: string; fileId?: string }>
    ) => {
      const existing = state.windows.find((w) => w.id === action.payload.id);

      if (existing) {
        existing.isOpen = true;
        existing.isMinimized = false;
        existing.appId = action.payload.appId;
        existing.title = action.payload.title;
        if (action.payload.fileId) existing.fileId = action.payload.fileId;
        if (!existing.geometry || !existing.geometry.width || !existing.geometry.height) {
          existing.geometry = defaultGeometry(state.windows.length);
        }
      } else {

        // Check if we have persisted geometry for this window id
        const savedGeom = (restoredState.windows ?? []).find(
          (w) => w.id === action.payload.id
        )?.geometry;

        state.windows.push({
          ...action.payload,
          zIndex: BASE_Z_INDEX,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          geometry: savedGeom ?? defaultGeometry(state.windows.length),
        });
      }
      state.activeWindowId = action.payload.id;
      renormalizeWindows(state.windows, action.payload.id);
      saveState(state as WindowManagerState);
    },

    closeWindow: (state, action: PayloadAction<string>) => {
      state.windows = state.windows.filter((w) => w.id !== action.payload);
      if (state.activeWindowId === action.payload) {
        state.activeWindowId = state.windows.length > 0 ? state.windows[state.windows.length - 1].id : null;
      }
      renormalizeWindows(state.windows, state.activeWindowId);
      saveState(state as WindowManagerState);
    },

    focusWindow: (state, action: PayloadAction<string>) => {
      const win = state.windows.find((w) => w.id === action.payload);
      if (win) {
        win.isOpen = true;
        win.isMinimized = false;
        state.activeWindowId = action.payload;
        renormalizeWindows(state.windows, action.payload);
      }
      saveState(state as WindowManagerState);
    },



    toggleMinimize: (state, action: PayloadAction<string>) => {
      const win = state.windows.find((w) => w.id === action.payload);
      if (win) {
        win.isMinimized = !win.isMinimized;
        if (win.isMinimized && state.activeWindowId === action.payload) {
          state.activeWindowId = null;
        }
      }
      saveState(state as WindowManagerState);
    },

    toggleMaximize: (state, action: PayloadAction<string>) => {
      const win = state.windows.find((w) => w.id === action.payload);
      if (win) {
        win.isMaximized = !win.isMaximized;
      }
      saveState(state as WindowManagerState);
    },

    /** Called after a drag or resize to persist the new geometry */
    updateGeometry: (
      state,
      action: PayloadAction<{ id: string; geometry: Partial<WindowGeometry> }>
    ) => {
      const win = state.windows.find((w) => w.id === action.payload.id);
      if (win) {
        win.geometry = { ...win.geometry, ...action.payload.geometry };
      }
      saveState(state as WindowManagerState);
    },
  },
});

export const {
  openWindow,
  closeWindow,
  focusWindow,
  toggleMinimize,
  toggleMaximize,
  updateGeometry,
} = windowManagerSlice.actions;
export default windowManagerSlice.reducer;