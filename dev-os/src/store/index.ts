import { configureStore } from '@reduxjs/toolkit';
import windowManagerReducer from './slices/windowManagerSlice';
import settingsReducer from './slices/settingsSlice';
import vfsReducer from './slices/vfsSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    windowManager: windowManagerReducer,
    settings: settingsReducer,
    vfs: vfsReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;