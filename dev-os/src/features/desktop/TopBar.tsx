import { useEffect, useState, useRef } from 'react';
import { Wifi, Battery, Search, Target, Palette, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { focusWindow, openWindow } from '../../store/slices/windowManagerSlice';
import { setAuthModalOpen } from '../../store/slices/adminSlice';
import { setThemeStyle, type ThemeStyle } from '../../store/slices/settingsSlice';
import { sound } from '../../utils/sound';

const THEMES: { id: ThemeStyle; name: string; icon: string }[] = [
  { id: 'default',      name: 'Default (DevOS)',  icon: '💻' },
  { id: 'neobrutalism', name: 'Neo Brutalism',   icon: '⚡' },
  { id: 'neon',         name: 'Neon Cyberpunk',  icon: '🌆' },
  { id: 'doodle',       name: 'Doodle Sketch',   icon: '✏️' },
  { id: 'myspace',      name: 'MySpace (Web 1.0)',icon: '👾' },
];


const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="text-sm font-medium tabular-nums">
      {time.toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })}
    </span>
  );
};

interface TopBarProps {
  onStartTour?: () => void;
}

export const TopBar = ({ onStartTour }: TopBarProps) => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.windowManager.windows);
  const activeId = useAppSelector((state) => state.windowManager.activeWindowId);
  const themeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const minimizedWindows = windows.filter((w) => w.isMinimized);
  const activeWindow = windows.find((w) => w.id === activeId && !w.isMinimized);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [batteryClicks, setBatteryClicks] = useState(0);
  const batteryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBatteryClick = () => {
    const nextCount = batteryClicks + 1;
    setBatteryClicks(nextCount);

    if (batteryTimerRef.current) clearTimeout(batteryTimerRef.current);
    batteryTimerRef.current = setTimeout(() => setBatteryClicks(0), 1500);

    if (nextCount >= 3) {
      sound.playEasterEgg();
      setBatteryClicks(0);
      dispatch(setAuthModalOpen(true));
    } else {
      sound.playClick();
    }
  };

  const openContact = () => {
    dispatch(openWindow({ id: 'contact', appId: 'contact', title: 'Contact Me' }));
  };

  return (
    <div className={`absolute top-0 left-0 right-0 h-8 z-[9000] px-4 flex items-center justify-between select-none ${
      themeStyle !== 'default' ? 'theme-topbar' : 'bg-black/50 backdrop-blur-2xl border-b border-white/8 text-gray-200'
    }`}>

      {/* Left: OS Name + Recruiter Tour + Open to Work + active app name */}
      <div className="flex items-center gap-3">
        <div className="font-bold text-sm tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent shrink-0">
          DevOS
        </div>

        {/* 🎯 Recruiter Tour Button */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/40 border-t-white/30 text-indigo-200
              hover:from-indigo-500/50 hover:to-purple-500/50 hover:text-white hover:border-indigo-300
              transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(99,102,241,0.25)] cursor-pointer"
            title="Start 1-Click Guided Recruiter Tour"
          >
            <Target size={13} className="text-indigo-400" />
            <span>🎯 Recruiter Tour</span>
          </button>
        )}

        {/* 🟢 Open to Work Badge */}
        <button
          onClick={openContact}
          title="Open to full-time opportunities — click to contact"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            bg-green-500/15 border border-green-500/30 border-t-green-400/40 text-green-300
            hover:bg-green-500/25 hover:border-green-400/50 hover:text-green-200
            transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span>Open to Work</span>
        </button>

        {/* Active window name — macOS menu-bar style */}
        {activeWindow && (
          <>
            <div className="w-px h-3 bg-current opacity-20" />
            <span className="text-sm font-semibold transition-all duration-200">
              {activeWindow.title}
            </span>
          </>
        )}

        {/* Minimised windows taskbar pills */}
        {minimizedWindows.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-px h-3 bg-current opacity-20 mr-1" />
            {minimizedWindows.map((win) => (
              <button
                key={win.id}
                onClick={() => dispatch(focusWindow(win.id))}
                title={`Restore ${win.title}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
                  bg-white/8 border border-white/10 border-t-white/20
                  hover:bg-indigo-500/20 hover:border-indigo-400/30 active:scale-95
                  transition-all duration-150 max-w-[110px] cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="truncate">{win.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: theme switcher + system tray + clock */}
      <div className="flex items-center gap-4">
        {/* Quick Theme Switcher Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer bg-indigo-500/20 border-indigo-400/40 border-t-indigo-300/50 text-indigo-200 hover:bg-indigo-500/30 active:scale-95 shadow-sm"
            title="Switch UI Style / Theme"
          >
            <Palette size={13} className="text-indigo-400" />
            <span className="capitalize">{THEMES.find(t => t.id === themeStyle)?.name || 'Theme'}</span>
          </button>

          {/* Floating Theme Menu */}
          {isThemeMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#18181b] border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 text-xs z-[9999] text-zinc-100 font-sans">
              <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-800">
                Select Theme Style
              </p>
              {THEMES.map((t) => {
                const isActive = themeStyle === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playThemeChange();
                      dispatch(setThemeStyle(t.id));
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-indigo-600/30 transition-colors ${
                      isActive ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                    {isActive && <Check size={13} className="text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            title="Search (Ctrl+K)"
            onClick={() => {
              sound.playSpotlightOpen();
              window.dispatchEvent(new CustomEvent('open-spotlight'));
            }}
            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center justify-center"
          >
            <Search size={13} />
          </button>
        </div>

        <div className="w-px h-3.5 bg-current opacity-20" />

        <div className="flex items-center gap-2">
          <Wifi size={13} />
          <button
            onClick={handleBatteryClick}
            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center justify-center"
          >
            <Battery size={13} />
          </button>
        </div>

        <LiveClock />
      </div>
    </div>
  );
};