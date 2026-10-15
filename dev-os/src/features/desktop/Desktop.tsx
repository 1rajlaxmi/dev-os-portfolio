import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { Window } from '../../components/Window';
import { Dock } from './Dock';
import { TopBar } from './TopBar';
import { Spotlight } from './Spotlight';
import { RecruiterTour } from '../../components/RecruiterTour';
import { openWindow } from '../../store/slices/windowManagerSlice';
import { toggle3DEasterEgg, setTourOpen } from '../../store/slices/settingsSlice';
import { toast } from 'sonner';
import { sound } from '../../utils/sound';

const Explorer = lazy(() => import('../../programs/Explorer/Explorer').then(m => ({ default: m.Explorer })));
const Terminal = lazy(() => import('../../programs/Terminal/Terminal').then(m => ({ default: m.Terminal })));
const Settings = lazy(() => import('../../programs/Settings/Settings').then(m => ({ default: m.Settings })));
const Browser = lazy(() => import('../../programs/Browser/Browser').then(m => ({ default: m.Browser })));
const Resume = lazy(() => import('../../programs/Resume/Resume').then(m => ({ default: m.Resume })));
const Notes = lazy(() => import('../../programs/Notes/Notes').then(m => ({ default: m.Notes })));
const Projects = lazy(() => import('../../programs/Projects/Projects').then(m => ({ default: m.Projects })));
const Contact = lazy(() => import('../../programs/Contact/Contact').then(m => ({ default: m.Contact })));
const Secret3DEasterEgg = lazy(() => import('../../components/Secret3DEasterEgg').then(m => ({ default: m.Secret3DEasterEgg })));
const DSA = lazy(() => import('../../programs/DSA/DSA').then(m => ({ default: m.DSA })));


import {
  Terminal as TerminalIcon,
  FileText,
  Code2,
  Mail,
  Folder,
  Settings as SettingsIcon,
  BarChart2,
} from 'lucide-react';

// Desktop shortcuts (icons on the wallpaper)
const DESKTOP_ICONS = [
  { id: 'resume',   appId: 'resume',   title: 'Resume',        icon: FileText,     },
  { id: 'projects', appId: 'projects', title: 'Projects',       icon: Code2,        },
  { id: 'dsa',      appId: 'dsa',      title: 'DSA Dashboard', icon: BarChart2,    },
  { id: 'explorer', appId: 'explorer', title: 'File Explorer',  icon: Folder,       },
  { id: 'terminal', appId: 'terminal', title: 'Terminal',       icon: TerminalIcon, },
  { id: 'settings', appId: 'settings', title: 'Settings',      icon: SettingsIcon, },
  { id: 'contact',  appId: 'contact',  title: 'Contact Me',    icon: Mail,         },
];



export const Desktop = () => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.windowManager.windows);
  const wallpaper = useAppSelector((state) => state.settings.wallpaper);
  const theme = useAppSelector((state) => state.settings.theme);
  const themeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');
  const is3DEasterEggOpen = useAppSelector((state) => state.settings.is3DEasterEggOpen);
  const isTourOpen = useAppSelector((state) => state.settings.isTourOpen);

  // Build CSS variables from the active theme so the whole OS syncs
  const themeVars = {
    '--accent':      `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%)`,
    '--accent-dim':  `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit - 10}%)`,
    '--accent-glow': `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.35)`,
    '--accent-bg':   `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.15)`,
    '--accent-border':`hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.4)`,
  } as React.CSSProperties;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isBarrelRolling, setIsBarrelRolling] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  const closeContextMenu = () => { if (contextMenu) setContextMenu(null); };

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, [contextMenu]);

  // Konami Code Easter Egg
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          sound.playEasterEgg();
          setIsBarrelRolling(true);
          setTimeout(() => setIsBarrelRolling(false), 2000); // Reset after 2 seconds
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Play retro OS startup sound on desktop load and page refresh
  useEffect(() => {
    sound.playStartupChime();
  }, []);

  // First-visit hint — shown once per session
  useEffect(() => {
    if (!sessionStorage.getItem('devos_hint_shown')) {
      sessionStorage.setItem('devos_hint_shown', '1');
      setTimeout(() => {
        toast('👆 Double-click any icon to open an app', {
          description: 'Or use Ctrl+K to search. Right-click the desktop for more options.',
          duration: 5000,
        });
      }, 1200);
    }
  }, []);

  const openApp = (id: string, appId: string, title: string) => {
    sound.playWindowOpen();
    dispatch(openWindow({ id, appId, title }));
  };

  // Route a window's appId to its component
  const renderApp = (win: (typeof windows)[number]) => {
    let Component;
    switch (win.appId) {
      case 'terminal':  Component = <Terminal />; break;
      case 'explorer':  Component = <Explorer />; break;
      case 'settings':  Component = <Settings />; break;
      case 'browser':   Component = <Browser />; break;
      case 'resume':    Component = <Resume />; break;
      case 'notes':     Component = <Notes fileId={win.fileId} fileName={win.title} />; break;
      case 'projects':  Component = <Projects />; break;
      case 'contact':   Component = <Contact />; break;
      case 'dsa':       Component = <DSA />; break;

      default:
        Component = (
          <div className="flex flex-col items-center justify-center h-full font-mono text-sm text-green-400 bg-[#1e1e1e]">
            <p className="text-gray-400">Welcome to {win.title}</p>
            <p className="mt-2 text-xs">$ devos --start {win.appId}</p>
            <p className="animate-pulse mt-1">_</p>
          </div>
        );
    }
    return (
      <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500 text-sm">Loading app...</div>}>
        {Component}
      </Suspense>
    );
  };


  const getOverlayClass = (style: string) => {
    switch (style) {
      case 'neobrutalism':
        return 'bg-[#feee00]/30 backdrop-contrast-125 backdrop-saturate-150';
      case 'neon':
        return 'bg-[#080711]/70 backdrop-blur-[2px] shadow-[inset_0_0_100px_rgba(0,240,255,0.25)]';
      case 'doodle':
        return 'bg-[#faf6ee]/85 backdrop-blur-sm';
      case 'myspace':
        return 'bg-[#000033]/70 backdrop-blur-none';
      default:
        return 'bg-black/38 backdrop-blur-[1px]';
    }
  };

  return (
    <div
      data-theme-style={themeStyle}
      className={`relative h-screen w-screen overflow-hidden bg-cover bg-center transition-all duration-700 ease-in-out ${isBarrelRolling ? 'duration-[2000ms] rotate-[360deg]' : ''}`}
      style={{ backgroundImage: `url(${wallpaper})`, ...themeVars }}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper theme backdrop overlay filter */}
      <div className={`absolute inset-0 transition-all duration-500 pointer-events-none ${getOverlayClass(themeStyle)}`} />

      <TopBar onStartTour={() => dispatch(setTourOpen(true))} />
      <Spotlight />
      <RecruiterTour isOpen={isTourOpen} onClose={() => dispatch(setTourOpen(false))} />


      {/* Desktop Icons (top-left, below TopBar) */}
      <div className="absolute top-12 left-6 flex flex-col gap-1 z-10">
        {DESKTOP_ICONS.map((icon) => {
          const Icon = icon.icon;
          const isLightOrSpecial = themeStyle === 'doodle' || themeStyle === 'neobrutalism';
          return (
            <button
              key={icon.id}
              onDoubleClick={() => openApp(icon.id, icon.appId, icon.title)}
              className="flex flex-col items-center gap-1.5 w-18 p-2 rounded-xl
                hover:bg-white/10 active:scale-95 transition-all duration-150 group select-none cursor-pointer"
              title={`Double-click to open ${icon.title}`}
            >
              <div className={`p-2.5 rounded-2xl border transition-all ${
                themeStyle === 'neobrutalism'
                  ? 'bg-[#ffde59] border-2 border-black text-black shadow-[3px_3px_0px_#000]'
                  : themeStyle === 'doodle'
                  ? 'bg-[#fffdf9] border-2 border-dashed border-slate-800 text-slate-900 shadow-sm'
                  : themeStyle === 'myspace'
                  ? 'bg-[#c0c0c0] border-2 border-white text-black border-r-black border-b-black font-mono shadow-sm'
                  : themeStyle === 'neon'
                  ? 'bg-[#0d0b18]/80 border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_#00f0ff]'
                  : 'bg-white/10 border-white/12 border-t-white/20 text-gray-100 group-hover:bg-white/20 group-hover:border-white/30 shadow-lg'
              }`}>
                <Icon size={24} />
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${
                isLightOrSpecial ? 'text-slate-900 font-bold' : 'text-gray-200 group-hover:text-white'
              }`}>
                {icon.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="absolute z-[9500] w-52 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 text-sm text-gray-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-indigo-500/30 hover:text-white transition-colors rounded-sm"
            onClick={() => { openApp('settings', 'settings', 'Settings'); setContextMenu(null); }}
          >
            Change Wallpaper
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-indigo-500/30 hover:text-white transition-colors rounded-sm"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else if (document.exitFullscreen) {
                document.exitFullscreen();
              }
              setContextMenu(null);
            }}
          >
            {document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
          <div className="h-px bg-white/10 my-1 mx-3" />
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-sm"
            onClick={() => {
              sound.playStartupChime();
              setTimeout(() => window.location.reload(), 150);
            }}
          >
            Refresh DevOS
          </button>
        </div>
      )}

      {/* Window Layer */}
      <div id="window-root" className="absolute inset-0 pointer-events-none">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <Window windowState={win}>
              {renderApp(win)}
            </Window>
          </div>
        ))}
      </div>


      <Dock />

      {/* Secret 3D WebGL Easter Egg Full Desktop Overlay */}
      {is3DEasterEggOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[9999999] bg-[#09090d]/95 flex items-center justify-center text-white font-mono text-sm">Loading 3D Matrix...</div>}>
          <Secret3DEasterEgg isOpen={is3DEasterEggOpen} onClose={() => dispatch(toggle3DEasterEgg(false))} />
        </Suspense>
      )}
    </div>
  );
};