import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { openWindow } from '../../store/slices/windowManagerSlice';
import { setTourOpen } from '../../store/slices/settingsSlice';
import { sound } from '../../utils/sound';

interface HistoryLine {
  id: string;
  text: string | React.ReactNode;
  isCommand?: boolean;
  isError?: boolean;
}

const APP_MAP: Record<string, { appId: string; title: string }> = {
  terminal: { appId: 'terminal', title: 'Terminal' },
  browser: { appId: 'browser', title: 'Web Browser' },
  projects: { appId: 'projects', title: 'Projects' },
  contact: { appId: 'contact', title: 'Contact' },
  resume: { appId: 'resume', title: 'Resume' },
  settings: { appId: 'settings', title: 'Settings' },
  dsa: { appId: 'dsa', title: 'DSA Dashboard' },
  notes: { appId: 'notes', title: 'Notes' },
  explorer: { appId: 'explorer', title: 'File Explorer' },
};



const TypewriterLine = ({ text, speed = 8 }: { text: string; speed?: number }) => {
  const isTest = import.meta.env.MODE === 'test';
  const [displayed, setDisplayed] = useState(isTest ? text : '');

  useEffect(() => {
    if (isTest) return;
    let index = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      // Emit subtle retro teletype print chatter every 4 characters
      if (index % 4 === 0) {
        sound.playTeletypeTick();
      }
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayed}</>;
};

export const Terminal = () => {
  const dispatch = useAppDispatch();
  const vfsFiles = useAppSelector((state) => state.vfs.files);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([
    { id: '1', text: 'DevOS Terminal v2.0.0 — Connected to Express Server' },
    { id: '2', text: 'Type "help" for available commands. Use ↑/↓ to navigate history.' },
    { id: '3', text: '' },
  ]);
  const [isWaiting, setIsWaiting] = useState(false);

  // Command history for ↑/↓ navigation
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const addLine = useCallback((text: string, opts?: { isCommand?: boolean; isError?: boolean }) => {
    if (opts?.isError) {
      sound.playErrorChime();
    } else if (!opts?.isCommand && typeof text === 'string' && text.trim().length > 0) {
      sound.playTerminalPrint();
    }
    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, ...opts },
    ]);
  }, []);

  const processCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    sound.playTerminalEnter();

    // Add to command history
    setCmdHistory((prev) => [trimmedCmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    // Echo the command
    addLine(`guest@devos:~$ ${trimmedCmd}`, { isCommand: true });

    // ── Easter Eggs ───────────────────────────────────────────────
    if (trimmedCmd.toLowerCase().startsWith('sudo ')) {
      addLine(`Nice try. This incident will be reported. 🚨`, { isError: true });
      return;
    }
    
    if (trimmedCmd.toLowerCase() === 'whoami') {
      addLine(`guest (or maybe a curious explorer 🕵️‍♂️)`);
      return;
    }

    if (trimmedCmd.toLowerCase() === 'do a barrel roll') {
      addLine(`Whoooosh! 🛩️`);
      const terminalEl = document.getElementById('terminal-container');
      if (terminalEl) {
        terminalEl.style.transition = 'transform 1s ease-in-out';
        terminalEl.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          terminalEl.style.transition = 'none';
          terminalEl.style.transform = 'rotate(0deg)';
        }, 1000);
      }
      return;
    }

    if (trimmedCmd.toLowerCase() === 'rm -rf /') {
      addLine(`Please don't delete me... 🥺`);
      return;
    }

    if (trimmedCmd.toLowerCase() === '404') {
      dispatch(openWindow({ id: 'browser', appId: 'browser', title: 'Web Browser' }));
      addLine(`Opening DevOS Browser... try searching 'projects' or 'about' 🌐`);
      return;
    }

    // ── Client-side only commands ────────────────────────────────
    if (trimmedCmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }

    // ── ls command — client-side VFS fallback ────────────────────
    const parts = trimmedCmd.trim().split(/\s+/);

    // ── sfx command — CLI command to enable/disable/check SFX ────
    if (parts[0].toLowerCase() === 'sfx') {
      const subCmd = (parts[1] || '').toLowerCase();
      if (subCmd === 'on' || subCmd === 'enable' || subCmd === '1') {
        sound.setMuted(false);
        sound.playSuccessChime();
        addLine('[SFX] Sound effects ENABLED 🔊');
      } else if (subCmd === 'off' || subCmd === 'disable' || subCmd === '0' || subCmd === 'mute') {
        sound.setMuted(true);
        addLine('[SFX] Sound effects DISABLED 🔇');
      } else if (subCmd === 'toggle') {
        const isMutedNow = sound.isMuted();
        sound.setMuted(!isMutedNow);
        if (isMutedNow) sound.playSuccessChime();
        addLine(isMutedNow ? '[SFX] Sound effects ENABLED 🔊' : '[SFX] Sound effects DISABLED 🔇');
      } else {
        const statusStr = sound.isMuted() ? 'DISABLED (Muted) 🔇' : 'ENABLED (Active) 🔊';
        addLine(`[SFX] Sound effects are currently ${statusStr}\nUsage: sfx on | sfx off | sfx toggle | sfx status`);
      }
      return;
    }
    if (parts[0].toLowerCase() === 'ls') {
      const targetName = parts.slice(1).join(' ').trim() || null;
      let items;
      if (!targetName) {
        // Root-level items: parentId === null or parentId === 'root' (VFS uses 'root' as home)
        items = vfsFiles.filter((f) => f.parentId === null || f.parentId === 'root');
      } else {
        const folder = vfsFiles.find(
          (f) => f.type === 'folder' && f.name.toLowerCase() === targetName.toLowerCase()
        );
        if (!folder) {
          addLine(`ls: ${targetName}: No such file or directory`, { isError: true });
          return;
        }
        items = vfsFiles.filter((f) => f.parentId === folder.id);
      }
      const lines = items.map((f) => (f.type === 'folder' ? `📁 ${f.name}/` : `📄 ${f.name}`));
      addLine(lines.join('\n') || '(empty directory)');
      return;
    }

    // ── open <app> — handled client-side ─────────────────────────
    if (parts[0].toLowerCase() === 'open' && parts[1]) {
      const target = parts[1].toLowerCase();
      const appEntry = APP_MAP[target];
      if (appEntry) {
        dispatch(openWindow({ id: appEntry.appId, ...appEntry }));
        addLine(`Opening ${appEntry.title}...`);
      } else {
        addLine(
          `open: unknown app "${parts[1]}"\nAvailable: ${Object.keys(APP_MAP).join(', ')}`,
          { isError: true }
        );
      }
      return;
    }

    // ── Send to backend ────────────────────────────────────────────
    setIsWaiting(true);
    const startTime = performance.now();

    try {
      const data = await apiService.executeTerminalCommand(trimmedCmd);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Handle special server directives
      if (data.output === '__PING_RESPONSE__') {
        addLine(`pong! Server connection established. Latency: ${latency}ms`);
        return;
      }

      if (data.output === '__START_TOUR__') {
        dispatch(setTourOpen(true));
        addLine('Starting Recruiter 1-Click Guided Tour... 🚀');
        return;
      }

      if (typeof data.output === 'string' && data.output.startsWith('__OPEN_APP__:')) {
        const target = data.output.split(':')[1].toLowerCase();
        const appEntry = APP_MAP[target];
        if (appEntry) {
          dispatch(openWindow({ id: appEntry.appId, ...appEntry }));
          addLine(`Opening ${appEntry.title}...`);
        } else {
          addLine(`open: unknown app "${target}"`, { isError: true });
        }
        return;
      }

      addLine(data.output ?? '');
    } catch {
      const isDev = import.meta.env.DEV;
      addLine(
        isDev
          ? 'Error: Could not connect to the backend server.\nIs the devos-server running on port 3000?\n  → Run: cd devos-server && npm run dev'
          : 'Error: Could not connect to the backend server.\nThe backend may be waking up from idle (free cloud tiers take ~30s). Please try again shortly.',
        { isError: true }
      );
    } finally {
      setIsWaiting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isWaiting) {
      processCommand(input);
      setInput('');
      return;
    }

    // Arrow Up — go back in history
    if (e.key === 'ArrowUp') {
      sound.playTabSwitch();
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex] ?? '');
      return;
    }

    // Arrow Down — go forward in history
    if (e.key === 'ArrowDown') {
      sound.playTabSwitch();
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex] ?? '');
      return;
    }

    // Organic tactile mechanical typing sound
    if (!['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      sound.playKeypress(e.key);
    }
  };

  return (
    <div
      id="terminal-container"
      className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm shadow-inner cursor-text transform origin-center"
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {/* Title Bar */}
      <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d] select-none">
        <TerminalIcon size={14} className="text-gray-400 mr-2" />
        <span className="text-xs text-gray-400">guest@devos: ~ (Remote Connection · port 3000)</span>
        {isWaiting && (
          <span className="ml-auto text-xs text-indigo-400 animate-pulse">processing...</span>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 p-4 overflow-y-auto space-y-0.5">
        {history.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.isCommand
                ? 'text-green-400'
                : line.isError
                ? 'text-red-400'
                : 'text-gray-300'
            }`}
          >
            {typeof line.text === 'string' && !line.isCommand ? (
              <TypewriterLine text={line.text} />
            ) : (
              line.text
            )}
          </div>
        ))}

        {/* Input Row */}
        <div className="flex items-center pt-1">
          <span className="text-green-400 mr-2 shrink-0">guest@devos:~$</span>
          <input
            id="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isWaiting}
            className="flex-1 bg-transparent outline-none border-none text-[#d4d4d4] caret-green-400 disabled:opacity-40"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
};