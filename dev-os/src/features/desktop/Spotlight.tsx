import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Terminal, Folder, Globe, FileText, Settings, Code2, Mail, Command, File, BarChart2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { openWindow } from '../../store/slices/windowManagerSlice';
import { sound } from '../../utils/sound';


interface SearchResult {
  id: string;
  label: string;
  subtitle: string;
  type: 'app' | 'file';
  action: () => void;
  icon: React.ElementType;
}

const APP_REGISTRY = [
  { id: 'terminal', title: 'Terminal', subtitle: 'Command line interface', icon: Terminal, appId: 'terminal' },
  { id: 'explorer', title: 'File Explorer', subtitle: 'Browse the virtual file system', icon: Folder, appId: 'explorer' },
  { id: 'browser', title: 'Web Browser', subtitle: 'Browse the web', icon: Globe, appId: 'browser' },
  { id: 'projects', title: 'Projects', subtitle: 'View my portfolio projects', icon: Code2, appId: 'projects' },
  { id: 'resume', title: 'Resume', subtitle: 'View my resume PDF', icon: FileText, appId: 'resume' },
  { id: 'dsa', title: 'DSA Dashboard', subtitle: '400+ problems solved · AIR 5124 · Platform stats', icon: BarChart2, appId: 'dsa' },
  { id: 'contact', title: 'Contact', subtitle: 'Get in touch', icon: Mail, appId: 'contact' },
  { id: 'settings', title: 'Settings', subtitle: 'About me & personalization', icon: Settings, appId: 'settings' },
];



export const Spotlight = () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const allVfsFiles = useAppSelector((state) => state.vfs.files);
  const vfsFiles = useMemo(() => allVfsFiles.filter((f) => f.type === 'file'), [allVfsFiles]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    // Custom event trigger (from TopBar Search button)
    const handleOpenEvent = () => {
      setIsOpen((prev) => !prev);
      setQuery('');
      setSelectedIndex(0);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-spotlight', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-spotlight', handleOpenEvent);
    };
  }, []);

  // Build results
  const results: SearchResult[] = query
    ? [
        ...APP_REGISTRY.filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.subtitle.toLowerCase().includes(query.toLowerCase())
        ).map((a) => ({
          id: `app-${a.id}`,
          label: a.title,
          subtitle: a.subtitle,
          type: 'app' as const,
          icon: a.icon,
          action: () => {
            sound.playWindowOpen();
            dispatch(openWindow({ id: a.appId, appId: a.appId, title: a.title }));
            close();
          },
        })),
        ...vfsFiles
          .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
          .map((f) => ({
            id: `file-${f.id}`,
            label: f.name,
            subtitle: 'Open in Notes viewer',
            type: 'file' as const,
            icon: File,
            action: () => {
              sound.playWindowOpen();
              dispatch(openWindow({ id: `notes-${f.id}`, appId: 'notes', title: f.name, fileId: f.id }));
              close();
            },
          })),
      ]
    : APP_REGISTRY.map((a) => ({
        id: `app-${a.id}`,
        label: a.title,
        subtitle: a.subtitle,
        type: 'app' as const,
        icon: a.icon,
        action: () => {
          sound.playWindowOpen();
          dispatch(openWindow({ id: a.appId, appId: a.appId, title: a.title }));
          close();
        },
      }));

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      sound.playTabSwitch();
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      sound.playTabSwitch();
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[selectedIndex]?.action();
    } else if (!['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
      sound.playKeypress(e.key);
    }
  };

  // Reset selected index when query changes
  useEffect(() => setSelectedIndex(0), [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9600] flex items-start justify-center pt-[18vh] px-4 bg-black/30 backdrop-blur-sm"
      onClick={close}
    >

      <div
        className="w-full max-w-xl bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-white/8">
          <Search size={18} className="text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Search apps or files..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-200 placeholder-gray-600 font-sans"
            autoFocus
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">
            <Command size={11} />K
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {query && results.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">
              No results for "{query}"
            </div>
          )}

          {!query && (
            <p className="px-5 py-2 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Apps</p>
          )}

          {query && results.some((r) => r.type === 'app') && (
            <p className="px-5 py-1.5 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Apps</p>
          )}

          {results.filter((r) => r.type === 'app').map((result) => {
            const Icon = result.icon;
            const globalIndex = results.indexOf(result);
            return (
              <button
                key={result.id}
                onClick={result.action}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
                className={`w-full flex items-center gap-4 px-5 py-3 transition-colors text-left
                  ${selectedIndex === globalIndex ? 'bg-indigo-600/25' : 'hover:bg-white/5'}`}
              >
                <div className={`p-1.5 rounded-lg ${selectedIndex === globalIndex ? 'bg-indigo-500/30' : 'bg-white/8'}`}>
                  <Icon size={16} className={selectedIndex === globalIndex ? 'text-indigo-300' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${selectedIndex === globalIndex ? 'text-white' : 'text-gray-300'}`}>{result.label}</p>
                  <p className="text-xs text-gray-500">{result.subtitle}</p>
                </div>
              </button>
            );
          })}

          {results.some((r) => r.type === 'file') && (
            <p className="px-5 py-1.5 mt-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold border-t border-white/5 pt-2">Files</p>
          )}

          {results.filter((r) => r.type === 'file').map((result) => {
            const Icon = result.icon;
            const globalIndex = results.indexOf(result);
            return (
              <button
                key={result.id}
                onClick={result.action}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
                className={`w-full flex items-center gap-4 px-5 py-3 transition-colors text-left
                  ${selectedIndex === globalIndex ? 'bg-indigo-600/25' : 'hover:bg-white/5'}`}
              >
                <div className={`p-1.5 rounded-lg ${selectedIndex === globalIndex ? 'bg-indigo-500/30' : 'bg-white/8'}`}>
                  <Icon size={16} className={selectedIndex === globalIndex ? 'text-indigo-300' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${selectedIndex === globalIndex ? 'text-white' : 'text-gray-300'}`}>{result.label}</p>
                  <p className="text-xs text-gray-500">{result.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/8 text-[10px] text-gray-600">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};