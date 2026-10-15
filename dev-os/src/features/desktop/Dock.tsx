import { useState } from 'react';
import { Terminal, Folder, FileText, Settings, Globe, Code2, Mail, BarChart2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { openWindow } from '../../store/slices/windowManagerSlice';
import { sound } from '../../utils/sound';


const APPS = [
  { id: 'terminal',  title: 'Terminal',       icon: Terminal,  appId: 'terminal'  },
  { id: 'explorer',  title: 'File Explorer',  icon: Folder,    appId: 'explorer'  },
  { id: 'projects',  title: 'Projects',       icon: Code2,     appId: 'projects'  },
  { id: 'dsa',       title: 'DSA Dashboard',  icon: BarChart2, appId: 'dsa'       },
  { id: 'browser',   title: 'Web Browser',    icon: Globe,     appId: 'browser'   },
  { id: 'resume',    title: 'Resume',         icon: FileText,  appId: 'resume'    },
  { id: 'contact',   title: 'Contact',        icon: Mail,      appId: 'contact'   },
  { id: 'settings',  title: 'Settings',       icon: Settings,  appId: 'settings'  },
] as const;



// Magnification curve: how much a neighbour scales based on distance (0-2)
function getMagnification(hoveredIndex: number | null, index: number): number {
  if (hoveredIndex === null) return 1;
  const dist = Math.abs(index - hoveredIndex);
  if (dist === 0) return 1.65;
  if (dist === 1) return 1.30;
  if (dist === 2) return 1.12;
  return 1;
}

export const Dock = () => {
  const dispatch = useAppDispatch();
  const windows = useAppSelector((state) => state.windowManager.windows);
  const themeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAppClick = (app: (typeof APPS)[number]) => {
    sound.playWindowOpen();
    dispatch(openWindow({ id: app.id, appId: app.appId, title: app.title }));
  };


  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[50]">
      <div
        className={`flex items-end gap-1.5 px-4 py-2 ${
          themeStyle !== 'default'
            ? 'theme-dock shadow-2xl'
            : 'bg-[#1a1a1a]/70 backdrop-blur-2xl border border-white/12 border-t-white/25 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
        }`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {APPS.map((app, index) => {
          const Icon = app.icon;
          const isOpen = windows.some((w) => w.appId === app.appId && w.isOpen && !w.isMinimized);
          const isMinimized = windows.some((w) => w.appId === app.appId && w.isMinimized);
          const scale = getMagnification(hoveredIndex, index);
          // translateY: larger icons lift up to keep dock bottom-aligned
          const lift = (scale - 1) * 22;

          return (
            <div
              key={app.id}
              className="relative flex flex-col items-center justify-end"
              style={{ height: 56 }}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {/* Tooltip */}
              <div
                className="absolute pointer-events-none whitespace-nowrap px-2.5 py-1 bg-zinc-950/90 text-zinc-50 text-xs rounded-lg border border-zinc-800 shadow-md transition-all duration-150"
                style={{
                  bottom: `calc(100% + ${lift + 6}px)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              >
                {app.title}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
              </div>

              {/* Icon button */}
              <button
                onClick={() => handleAppClick(app)}
                title={app.title}
                style={{
                  transform: `scale(${scale}) translateY(-${lift / scale}px)`,
                  transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transformOrigin: 'bottom center',
                }}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/10 active:scale-90 transition-colors duration-150 cursor-pointer"
              >
                <Icon size={26} className={`transition-colors ${
                  themeStyle === 'doodle' || themeStyle === 'neobrutalism' || themeStyle === 'myspace'
                    ? 'text-slate-900 font-bold'
                    : 'text-gray-200 group-hover:text-white'
                }`} />

                {/* Active dot */}
                {isOpen && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_6px_rgba(129,140,248,0.9)]" />
                )}
                {/* Minimized dot */}
                {isMinimized && !isOpen && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-500 rounded-full" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};