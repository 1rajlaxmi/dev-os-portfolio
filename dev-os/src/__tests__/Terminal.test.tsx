import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Terminal } from '../programs/Terminal/Terminal';

// Mock apiService so we don't make real HTTP requests
vi.mock('../services/api', () => ({
  apiService: {
    executeTerminalCommand: vi.fn(async (cmd: string) => {
      if (cmd === 'help')  return { output: 'DevOS Terminal v2.5 — Available Commands' };
      if (cmd === 'whoami') return { output: 'Rajlaxmi — Full Stack Developer' };
      if (cmd === 'ping')  return { output: '__PING_RESPONSE__' };
      return { output: `devos: command not found: ${cmd}` };
    }),
  },
}));

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

function typeCommand(input: HTMLElement, cmd: string) {
  fireEvent.change(input, { target: { value: cmd } });
  fireEvent.keyDown(input, { key: 'Enter' });
}

describe('Terminal Component', () => {
  it('should render terminal with initial welcome message', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    expect(screen.getByText(/DevOS Terminal v2.0.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Type "help"/i)).toBeInTheDocument();
  });

  it('should have an input field for typing commands', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input');
    expect(input).toBeInTheDocument();
  });

  it('should echo the command typed by the user', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'whoami');
    expect(screen.getByText(/guest@devos:~\$ whoami/i)).toBeInTheDocument();
  });

  it('should handle "clear" command and empty the terminal history', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'clear');
    // After clear, the initial welcome lines should be gone
    expect(screen.queryByText(/DevOS Terminal v2.0.0/i)).not.toBeInTheDocument();
  });

  it('should handle "sudo" easter egg', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'sudo rm -rf /');
    await waitFor(() => {
      expect(screen.getByText(/Nice try. This incident will be reported/i)).toBeInTheDocument();
    });
  });

  it('should handle "whoami" easter egg (client-side)', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'whoami');
    await waitFor(() => {
      expect(screen.getByText(/curious explorer/i)).toBeInTheDocument();
    });
  });

  it('should handle "rm -rf /" easter egg', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'rm -rf /');
    await waitFor(() => {
      expect(screen.getByText(/Please don't delete me/i)).toBeInTheDocument();
    });
  });

  // ── sfx CLI command tests ───────────────────────────────────────────────

  it('sfx: should display current sfx status and usage', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'sfx');
    await waitFor(() => {
      expect(screen.getByText(/\[SFX\] Sound effects are currently/i)).toBeInTheDocument();
      expect(screen.getByText(/Usage: sfx on \| sfx off \| sfx toggle \| sfx status/i)).toBeInTheDocument();
    });
  });

  it('sfx on: should enable sound effects', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'sfx on');
    await waitFor(() => {
      expect(screen.getByText(/\[SFX\] Sound effects ENABLED 🔊/i)).toBeInTheDocument();
    });
  });

  it('sfx off: should disable sound effects', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'sfx off');
    await waitFor(() => {
      expect(screen.getByText(/\[SFX\] Sound effects DISABLED 🔇/i)).toBeInTheDocument();
    });
  });

  // ── ls command (client-side VFS) ─────────────────────────────────────────

  it('ls: should list root VFS contents without calling the backend', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'ls');
    await waitFor(() => {
      expect(screen.getByText(/📁 Home/)).toBeInTheDocument();
    });
  });

  it('ls <Projects>: should list items inside the Projects folder', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'ls Projects');
    await waitFor(() => {
      expect(screen.getByText(/📁 PULSE_NET/)).toBeInTheDocument();
    });
  });

  it('ls <nonexistent>: should show an error for invalid directory', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'ls nonexistentfolder');
    await waitFor(() => {
      expect(screen.getByText(/ls: nonexistentfolder: No such file or directory/i)).toBeInTheDocument();
    });
  });

  it('ls <Code Snippets>: should list code snippet files', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'ls Code Snippets');
    await waitFor(() => {
      expect(screen.getByText(/📄 SocketIO_Handler.js/)).toBeInTheDocument();
    });
  });

  // ── open command ──────────────────────────────────────────────────────────

  it('open terminal: should open Terminal window and print message', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'open terminal');
    await waitFor(() => {
      expect(screen.getByText(/Opening Terminal/i)).toBeInTheDocument();
    });
    const state = store.getState();
    expect(state.windowManager.windows.find((w: any) => w.appId === 'terminal')).toBeDefined();
  });

  it('open browser: should open Web Browser window', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'open browser');
    await waitFor(() => {
      expect(screen.getByText(/Opening Web Browser/i)).toBeInTheDocument();
    });
  });

  it('open activity: should show error — activity monitor removed from APP_MAP', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'open activity');
    await waitFor(() => {
      expect(screen.getByText(/unknown app "activity"/i)).toBeInTheDocument();
    });
  });

  it('open unknown: should show unknown app error with available apps list', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'open xyz');
    await waitFor(() => {
      expect(screen.getByText(/unknown app "xyz"/i)).toBeInTheDocument();
    });
  });

  // ── Command history navigation ────────────────────────────────────────────

  it('ArrowUp should navigate to previous command', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;

    typeCommand(input, 'clear');
    typeCommand(input, 'whoami');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('whoami');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('clear');
  });

  it('ArrowDown should navigate forward in command history', () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;

    typeCommand(input, 'clear');
    typeCommand(input, 'whoami');

    fireEvent.keyDown(input, { key: 'ArrowUp' }); // whoami
    fireEvent.keyDown(input, { key: 'ArrowUp' }); // clear
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // whoami
    expect(input.value).toBe('whoami');
  });

  // ── Backend command integration ───────────────────────────────────────────

  it('should send "help" to backend and display response', async () => {
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'help');
    await waitFor(() => {
      expect(screen.getByText(/DevOS Terminal v2.5/i)).toBeInTheDocument();
    });
  });

  it('should show error message when backend is unreachable', async () => {
    const { apiService } = await import('../services/api');
    vi.mocked(apiService.executeTerminalCommand).mockRejectedValueOnce(
      new Error('Network Error')
    );
    const store = createTestStore();
    render(<Provider store={store}><Terminal /></Provider>);
    const input = document.getElementById('terminal-input') as HTMLInputElement;
    typeCommand(input, 'skills');
    await waitFor(() => {
      expect(screen.getByText(/Error: Could not connect to the backend server/i)).toBeInTheDocument();
    });
  });
});
