export interface OSWindow {
  id: string;          // Unique instance ID (e.g., 'terminal-1')
  appId: string;       // The underlying application (e.g., 'terminal')
  title: string;       // Display title in the window header
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}