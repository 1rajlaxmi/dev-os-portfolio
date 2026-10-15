import { io } from 'socket.io-client';

// Determine the backend socket server URL
const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    try {
      const url = new URL(import.meta.env.VITE_API_URL);
      return url.origin;
    } catch {
      // Fall through if URL parsing fails
    }
  }
  return import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;
};

export const socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
