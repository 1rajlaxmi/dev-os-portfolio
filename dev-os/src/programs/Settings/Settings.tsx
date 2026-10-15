import { useState, useRef } from 'react';
import { Monitor, Info, Image as ImageIcon, Award, Mail, MapPin, GraduationCap, Briefcase, Sparkles, Plus, Trash2, Palette } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { setTheme, setThemeStyle, toggle3DEasterEgg, type ThemeStyle } from '../../store/slices/settingsSlice';
import { deleteSkill } from '../../store/slices/adminSlice';
import { PROFILE } from '../../data/profile';
import { SkillEditModal } from './SkillEditModal';
import { toast } from 'sonner';
import { sound } from '../../utils/sound';




// ── Brand icons (removed from lucide-react v1+) ────────────────────────────
const GithubIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ── Wallpaper data ──────────────────────────────────────────────────────────
// hue/sat/lit = dominant accent color extracted from each wallpaper visually
type Wallpaper = {
  id: string;
  tag: string;
  name: string;
  url: string;
  hue: number; // HSL hue
  sat: number; // saturation %
  lit: number; // lightness %
};

const wallpapers: Wallpaper[] = [
  // ── 🎨 Abstract ──────────────────────────────────────────────────────────
  {
    id: 'abs-1', tag: '🎨 Abstract', name: 'Neon Purple',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=90&w=3840&auto=format&fit=crop',
    hue: 270, sat: 80, lit: 65,
  },
  {
    id: 'abs-2', tag: '🎨 Abstract', name: 'Electric Blue',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=90&w=3840&auto=format&fit=crop',
    hue: 210, sat: 90, lit: 60,
  },
  {
    id: 'abs-3', tag: '🎨 Abstract', name: 'Liquid Gold',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=90&w=3840&auto=format&fit=crop',
    hue: 38, sat: 90, lit: 60,
  },
  {
    id: 'abs-4', tag: '🎨 Abstract', name: 'Soft Gradient',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=90&w=3840&auto=format&fit=crop',
    hue: 240, sat: 70, lit: 68,
  },
  // ── 🐱 Cute Kittens ──────────────────────────────────────────────────────
  {
    id: 'cat-1', tag: '🐱 Cute Kittens', name: 'Fluffy Tabby',
    url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=90&w=3840&auto=format&fit=crop',
    hue: 30, sat: 70, lit: 62,
  },
  {
    id: 'cat-2', tag: '🐱 Cute Kittens', name: 'Orange Kitten',
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=90&w=3840&auto=format&fit=crop',
    hue: 22, sat: 85, lit: 58,
  },
  {
    id: 'cat-3', tag: '🐱 Cute Kittens', name: 'Sleepy White Cat',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=90&w=3840&auto=format&fit=crop',
    hue: 200, sat: 30, lit: 70,
  },
  {
    id: 'cat-4', tag: '🐱 Cute Kittens', name: 'Curious Kitten',
    url: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=90&w=3840&auto=format&fit=crop',
    hue: 45, sat: 60, lit: 58,
  },
  // ── 🌸 Anime ─────────────────────────────────────────────────────────────
  {
    id: 'ani-1', tag: '🌸 Anime', name: 'Cherry Blossom Lane',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=90&w=3840&auto=format&fit=crop',
    hue: 340, sat: 65, lit: 72,
  },
  {
    id: 'ani-2', tag: '🌸 Anime', name: 'Dreamy Sunrise',
    url: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?q=90&w=3840&auto=format&fit=crop',
    hue: 15, sat: 75, lit: 70,
  },
  {
    id: 'ani-3', tag: '🌸 Anime', name: 'Neon Synthwave',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=3840&auto=format&fit=crop',
    hue: 300, sat: 90, lit: 62,
  },
  {
    id: 'ani-4', tag: '🌸 Anime', name: 'Pastel Twilight',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=90&w=3840&auto=format&fit=crop',
    hue: 260, sat: 60, lit: 72,
  },
  // ── ☁️ Sky & Clouds ───────────────────────────────────────────────────────
  {
    id: 'sky-1', tag: '☁️ Sky & Clouds', name: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=90&w=3840&auto=format&fit=crop',
    hue: 35, sat: 80, lit: 65,
  },
  {
    id: 'sky-2', tag: '☁️ Sky & Clouds', name: 'Blue Heaven',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?q=90&w=3840&auto=format&fit=crop',
    hue: 205, sat: 85, lit: 60,
  },
  {
    id: 'sky-3', tag: '☁️ Sky & Clouds', name: 'Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=90&w=3840&auto=format&fit=crop',
    hue: 155, sat: 70, lit: 55,
  },
  {
    id: 'sky-4', tag: '☁️ Sky & Clouds', name: 'Stormy Drama',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=90&w=3840&auto=format&fit=crop',
    hue: 215, sat: 40, lit: 50,
  },
];

const CATEGORIES = ['All', '🎨 Abstract', '🐱 Cute Kittens', '🌸 Anime', '☁️ Sky & Clouds'] as const;

// ── Sub-components ──────────────────────────────────────────────────────────
const SidebarBtn = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <button
    onClick={() => {
      sound.playTabSwitch();
      onClick();
    }}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 w-full text-left
      ${active
        ? 'text-white font-medium'
        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
      }`}
    style={active ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : {}}
  >
    <Icon size={15} />
    <span>{label}</span>
  </button>
);

const WallpaperTab = ({
  wallpapers,
  currentWallpaper,
  dispatch,
}: {
  wallpapers: Wallpaper[];
  currentWallpaper: string;
  dispatch: ReturnType<typeof useAppDispatch>;
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const filtered = activeCategory === 'All'
    ? wallpapers
    : wallpapers.filter((w) => w.tag === activeCategory);

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-white mb-4">Choose Wallpaper</h2>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium"
              style={
                isActive
                  ? { background: 'var(--accent-bg)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                  : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((w) => {
          const isActive = currentWallpaper === w.url;
          return (
            <button
              key={w.id}
              onClick={() => {
                sound.playThemeChange();
                dispatch(setTheme({ url: w.url, hue: w.hue, sat: w.sat, lit: w.lit }));
              }}
              className="relative group overflow-hidden rounded-xl border-2 transition-all duration-200"
              style={
                isActive
                  ? { borderColor: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)', transform: 'scale(1.03)' }
                  : { borderColor: 'transparent' }
              }
            >
              <img
                src={w.url}
                alt={w.name}
                className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <p className="text-[10px] font-semibold text-white drop-shadow leading-tight truncate">{w.name}</p>
                <p className="text-[9px] text-gray-300 opacity-80">{w.tag}</p>
              </div>
              {/* Active checkmark */}
              {isActive && (
                <div
                  className="absolute top-1.5 right-1.5 rounded-full p-0.5"
                  style={{ background: 'var(--accent)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

type UIStyleOption = {
  id: ThemeStyle;
  name: string;
  badge: string;
  tagline: string;
  bgPreview: string;
  cardPreview: string;
};

const THEME_STYLE_OPTIONS: UIStyleOption[] = [
  {
    id: 'default',
    name: 'Default (DevOS)',
    badge: '💻 Classic',
    tagline: 'Current DevOS dark glassy style with custom HSL accents & wallpaper',
    bgPreview: 'from-indigo-950 via-slate-900 to-black',
    cardPreview: 'bg-[#1e1e1e] border border-white/20 text-white shadow-md',
  },
  {
    id: 'neobrutalism',
    name: 'Neo Brutalism',
    badge: '⚡ Pop Cyber',
    tagline: 'High contrast yellow/pink pop colors, hard black drop shadows & bold borders',
    bgPreview: 'from-[#feee00] via-[#ff66c4] to-[#00e5ff]',
    cardPreview: 'bg-[#fffdf0] border-2 border-black text-black shadow-[3px_3px_0px_#000]',
  },
  {
    id: 'neon',
    name: 'Neon Cyberpunk',
    badge: '🌆 Synthwave',
    tagline: 'Deep synthwave dark purple, glowing cyan & magenta neon aesthetics',
    bgPreview: 'from-[#080711] via-[#140f2d] to-[#ff007f]',
    cardPreview: 'bg-[#0d0b18] border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_#00f0ff]',
  },
  {
    id: 'doodle',
    name: 'Doodle Sketchbook',
    badge: '✏️ Hand Drawn',
    tagline: 'Warm cream paper notebook texture with sketchy dashed borders & hand fonts',
    bgPreview: 'from-[#faf6ee] to-[#e5e0d8]',
    cardPreview: 'bg-[#fffdf9] border-2 border-dashed border-gray-800 text-gray-900 shadow-[3px_3px_0px_#000]',
  },
  {
    id: 'myspace',
    name: 'MySpace (Web 1.0)',
    badge: '👾 90s Retro',
    tagline: '90s retro starry space background, classic Win95 3D bevelled borders & blue titlebars',
    bgPreview: 'from-[#000033] to-[#000080]',
    cardPreview: 'bg-[#c0c0c0] border-2 border-white text-black border-r-black border-b-black',
  },
];


// ── Main Settings component ─────────────────────────────────────────────────
export const Settings = () => {
  const [activeTab, setActiveTab] = useState('about');
  const dispatch = useAppDispatch();
  const currentWallpaper = useAppSelector((state) => state.settings.wallpaper);
  const currentThemeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');
  const theme = useAppSelector((state) => state.settings.theme);
  const skills = useAppSelector((state) => state.admin.skills);
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // 6-click Easter Egg state
  const [clickCount, setClickCount] = useState(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const handleDevOSClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setClickCount(0), 3000);

    if (nextCount < 6) {
      toast.info(`Quantum Matrix: ${nextCount}/6 taps... Tap ${6 - nextCount} more times!`, {
        id: 'easter-egg-toast',
        duration: 1500,
      });
    } else {
      setClickCount(0);
      toast.success('🎉 SECRET 3D QUANTUM MATRIX UNLOCKED!', { duration: 3000 });
      dispatch(toggle3DEasterEgg(true));
    }
  };


  // CSS vars for this window's accent (mirrors desktop theme)
  const accentVars = {
    '--accent':       `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%)`,
    '--accent-dim':   `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit - 10}%)`,
    '--accent-bg':    `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.18)`,
    '--accent-glow':  `hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.4)`,
    '--accent-border':`hsl(${theme.hue}, ${theme.sat}%, ${theme.lit}%, 0.45)`,
  } as React.CSSProperties;

  const socialLinks = [
    { icon: GithubIcon, label: 'GitHub',   url: PROFILE.github },
    { icon: LinkedinIcon, label: 'LinkedIn', url: PROFILE.linkedin },
    { icon: Mail,        label: 'Email',    url: `mailto:${PROFILE.email}` },
  ];

  return (
    <div className="flex h-full bg-[#1e1e1e] text-gray-200 font-sans select-none relative" style={accentVars}>
      {/* Sidebar */}
      <div className="w-48 bg-[#2a2a2a] border-r border-black/40 p-2 flex flex-col gap-1 shrink-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 py-2 font-semibold">System</p>
        <SidebarBtn active={activeTab === 'about'}    onClick={() => setActiveTab('about')}    icon={Info}      label="About Me" />
        <SidebarBtn active={activeTab === 'developer'} onClick={() => setActiveTab('developer')} icon={Award}    label="Dev Metrics" />
        <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 py-2 font-semibold mt-3">Display</p>
        <SidebarBtn active={activeTab === 'themes'}   onClick={() => setActiveTab('themes')}   icon={Palette}   label="UI Themes" />
        <SidebarBtn active={activeTab === 'personalization'} onClick={() => setActiveTab('personalization')} icon={ImageIcon} label="Wallpaper" />
        <SidebarBtn active={activeTab === 'system'}   onClick={() => setActiveTab('system')}   icon={Monitor}   label="System Info" />

        {/* Live theme swatch */}
        <div className="mt-auto px-3 pb-2">
          <div className="h-px bg-white/5 my-3" />
          <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1.5">Theme Color</p>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-white/20 shadow-lg"
              style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}
            />
            <span className="text-[10px] text-gray-500 font-mono">
              hsl({theme.hue}, {theme.sat}%, {theme.lit}%)
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* ── ABOUT TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-8">
            {/* Profile Card */}
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/4 border border-white/10">
              <img
                src="/photo.jpg"
                alt={PROFILE.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/20 shrink-0"
                style={{ boxShadow: '0 8px 24px var(--accent-glow)' }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white">{PROFILE.name}</h1>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--accent)' }}>{PROFILE.role}</p>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{PROFILE.bio}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: Briefcase,     label: 'Current Role', value: PROFILE.role },
                { icon: GraduationCap, label: 'Education',    value: `${PROFILE.education} — ${PROFILE.university}` },
                { icon: MapPin,        label: 'Location',     value: PROFILE.location },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 px-5 py-4 rounded-xl bg-white/4 border border-white/8">
                  <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-sm text-gray-200 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
                  Tech Stack
                </h2>
                {isAuthenticated && (
                  <button
                    onClick={() => setIsSkillModalOpen(true)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                  >
                    <Plus size={13} />
                    Add Skill
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((tech) => (
                  <div key={tech.name} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${tech.color}`}>
                    <span>{tech.name}</span>
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          sound.playDeleteSound();
                          dispatch(deleteSkill(tech.name));
                          toast.success(`Removed skill "${tech.name}".`);
                        }}
                        className="hover:text-red-300 transition-colors ml-0.5 cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
                Connect
              </h2>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url.startsWith('YOUR_') ? '#' : url}
                    target={url.startsWith('mailto') || url.startsWith('YOUR_') ? '_self' : '_blank'}
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm text-gray-300 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-bg)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <Icon size={15} style={{ color: 'var(--accent)' }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DEV METRICS TAB ────────────────────────────────────────────── */}
        {activeTab === 'developer' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-lg font-semibold text-white">Developer Metrics</h2>

            <div className="grid grid-cols-3 gap-4">
              {PROFILE.achievements.map((a) => (
                <div
                  key={a.label}
                  className="p-5 rounded-xl border text-center"
                  style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                >
                  <p className="text-2xl font-bold text-white">{a.value}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--accent)' }}>{a.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{a.platform}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Project Highlights</h3>
              {PROFILE.projects.map((p) => (
                <div key={p.id} className={`p-5 rounded-xl border bg-gradient-to-br ${p.color} ${p.borderColor}`}>
                  <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.tech.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-gray-400 border border-white/10 font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UI THEMES TAB ────────────────────────────────────────────────── */}
        {activeTab === 'themes' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">UI Styles & Theme Presets</h2>
              <p className="text-xs text-gray-400 mt-1">Select a visual theme style to transform the whole DevOS layout and window aesthetics.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {THEME_STYLE_OPTIONS.map((t) => {
                const isActive = currentThemeStyle === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => dispatch(setThemeStyle(t.id))}
                    className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 group relative overflow-hidden ${
                      isActive
                        ? 'border-indigo-400 bg-white/10 shadow-xl border-t-white/30'
                        : 'border-white/10 border-t-white/20 bg-white/4 hover:bg-white/8 hover:border-white/20 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold text-white tracking-wide truncate mr-1">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-300 font-semibold border border-white/15 shrink-0">
                        {t.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed mb-3">
                      {t.tagline}
                    </p>

                    {/* Live Style Mini Preview Box */}
                    <div className={`mt-3.5 w-full h-16 rounded-xl bg-gradient-to-br ${t.bgPreview} p-2 flex items-center justify-center`}>
                      <div className={`w-3/4 h-10 rounded-lg p-1.5 flex flex-col justify-between text-[9px] font-semibold ${t.cardPreview}`}>
                        <div className="flex justify-between items-center opacity-80">
                          <span>{t.name}</span>
                          <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                        </div>
                        <div className="w-full h-1.5 rounded bg-current opacity-30" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WALLPAPER TAB ──────────────────────────────────────────────── */}
        {activeTab === 'personalization' && (
          <WallpaperTab
            wallpapers={wallpapers}
            currentWallpaper={currentWallpaper}
            dispatch={dispatch}
          />
        )}

        {/* ── SYSTEM INFO TAB ────────────────────────────────────────────── */}
        {activeTab === 'system' && (
          <div className="max-w-2xl space-y-6">
            {/* DevOS Card with 6-click 3D Easter Egg trigger */}
            <div
              onClick={handleDevOSClick}
              className="flex items-center justify-between p-6 rounded-2xl bg-white/4 border border-white/10 hover:border-indigo-500/50 hover:bg-white/8 transition-all cursor-pointer select-none active:scale-[0.98] group relative overflow-hidden"
              title="DevOS Portfolio Edition v2.0 (Click 6 times to unlock Secret 3D Matrix)"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl transition-transform group-hover:scale-110" style={{ background: 'var(--accent-bg)' }}>
                  <Monitor size={40} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">DevOS</h1>
                    {clickCount > 0 && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/40 animate-pulse">
                        {clickCount}/6
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                    <span>Portfolio Edition v2.0</span>
                    <Sparkles size={13} className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-indigo-400 transition-colors font-mono hidden sm:inline">
                [ Tap 6x for 3D ]
              </span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-y-4 text-sm px-2">
              {[
                ['Kernel',          'React 19 + Redux Toolkit'],
                ['Shell',           'DevOS Terminal v2.0'],
                ['Window Manager',  'Redux Window Manager'],
                ['File System',     'Virtual FS (Express REST API)'],
                ['Frontend Build',  'Vite + TypeScript'],
                ['Styling Engine',  'Tailwind CSS v4'],
                ['3D Engine',       'Three.js (WebGL Web Engine)'],
                ['Notifications',   'Sonner Toast Library'],
                ['Backend',         'Node.js + Express.js'],
                ['Theme Engine',    `HSL(${theme.hue}°, ${theme.sat}%, ${theme.lit}%)`],
              ].map(([key, val]) => (
                <div key={key} className="contents">
                  <div className="text-gray-500 flex items-center">{key}</div>
                  <div className="text-gray-200 font-mono text-xs">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SkillEditModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
      />
    </div>
  );
};