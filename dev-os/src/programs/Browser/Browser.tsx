import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Search,
  Globe,
  FileText,
  Code2,
  Mail,
  Settings,
  Terminal,
  BarChart2,
  Folder,
  ExternalLink,
  Wifi,
  WifiOff,
  X,
  Hash,
  User,
  Briefcase,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useAppDispatch } from "../../hooks/useStore";
import { openWindow } from "../../store/slices/windowManagerSlice";
import { PROFILE } from "../../data/profile";
import { sound } from "../../utils/sound";

// ─── Internal Navigation Registry ────────────────────────────────────────────
// Everything navigable inside DevOS

export type InternalPage =
  | "devos://home"
  | "devos://about"
  | "devos://projects"
  | "devos://skills"
  | "devos://achievements"
  | "devos://contact"
  | "devos://resume"
  | "devos://dsa"
  | "devos://terminal"
  | "devos://explorer"
  | "devos://github"
  | "devos://linkedin";

interface Suggestion {
  id: string;
  label: string;
  subtitle: string;
  url: string;
  icon: React.ElementType;
  action?: () => void;
  keywords: string[];
}

const NEW_TAB = "devos://home";

function isExternalUrl(input: string): boolean {
  const t = input.trim().toLowerCase();
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("www.") ||
    (t.includes(".") &&
      !t.includes(" ") &&
      !t.startsWith("devos://") &&
      !t.startsWith("/"))
  );
}

// ─── Sarcastic Blocked Page ───────────────────────────────────────────────────

const snarkyLines = [
  "Oh wow, you actually tried. Respect the audacity.",
  "This isn't Chrome. It's a vibe.",
  "The Internet is out there. You're in here. Very different.",
  "Sir, this is a portfolio OS. Not a browser.",
  "Nice URL. Would be a shame if this wasn't the internet.",
  "Error 418: I'm a teapot. Also, wrong dimension.",
  "Excellent attempt. 0/10, wrong reality.",
  "You thought this opened Google? That's adorable.",
  "The WiFi password here is: 'hire-me-please'",
  "Connecting to the internet... lol no.",
];

const BlockedPage = ({
  url,
  onGoHome,
}: {
  url: string;
  onGoHome: () => void;
}) => {
  const line = useMemo(() => snarkyLines[Math.floor(Math.random() * snarkyLines.length)], []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] text-center px-8 select-none overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing circle behind icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl scale-150" />
        <div className="relative w-24 h-24 rounded-3xl bg-[#1a1a2e] border border-indigo-500/30 flex items-center justify-center shadow-2xl">
          <WifiOff size={40} className="text-indigo-400" />
        </div>
        {/* Bouncing X badge */}
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <X size={14} className="text-white" />
        </div>
      </div>

      {/* Main heading */}
      <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
        Nice Try, Explorer 🕵️
      </h1>
      <p className="text-indigo-400 font-mono text-sm mb-6 px-4 max-w-md leading-relaxed">
        "{line}"
      </p>

      {/* The URL they attempted */}
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl mb-8 max-w-sm w-full overflow-hidden">
        <Wifi size={13} className="text-red-400 shrink-0" />
        <span className="text-xs text-red-300/80 font-mono truncate">{url}</span>
        <span className="ml-auto text-[10px] text-red-500/60 shrink-0 font-bold">BLOCKED</span>
      </div>

      {/* Info card */}
      <div className="max-w-sm w-full bg-[#141428]/80 border border-indigo-500/20 rounded-2xl p-5 mb-6 backdrop-blur-sm text-left space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
          📡 DevOS Browser Scope
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          This browser is a <span className="text-white font-medium">portfolio navigator</span>, not a real web browser.
          It can open apps, show portfolio sections, and link to Rajlaxmi's profiles.
        </p>
        <p className="text-xs text-gray-600">
          Want the real internet? You're already on it — just open a new tab in your <em>actual</em> browser. Wild concept, we know.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-900/40"
        >
          <Home size={15} />
          Back to DevOS Home
        </button>
      </div>

      {/* Fun stat at bottom */}
      <p className="absolute bottom-6 text-[11px] text-gray-700 font-mono">
        devos://error/external-url-detected · skill: creativity
      </p>
    </div>
  );
};

// ─── Internal Page Renderers ──────────────────────────────────────────────────

const AboutPage = ({ onNavigate }: { onNavigate: (url: string) => void }) => (
  <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] to-[#131320] text-white">
    <div className="max-w-2xl mx-auto pt-14 px-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-900/50">
          👩‍💻
        </div>
        <div>
          <h1 className="text-2xl font-bold">{PROFILE.name}</h1>
          <p className="text-indigo-400 text-sm">{PROFILE.role}</p>
          <p className="text-gray-500 text-xs mt-0.5">{PROFILE.location}</p>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed mb-8 text-sm">{PROFILE.bio}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Education", value: PROFILE.education },
          { label: "University", value: PROFILE.university },
          { label: "Company", value: PROFILE.company },
          { label: "Status", value: "Open to Opportunities 🟢" },
        ].map((item) => (
          <div key={item.label} className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-sm font-medium text-gray-200">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={() => onNavigate("devos://projects")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-sm text-indigo-300 hover:bg-indigo-600/50 transition-all cursor-pointer">
          <Code2 size={14} /> View Projects
        </button>
        <button onClick={() => onNavigate("devos://contact")} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all cursor-pointer">
          <Mail size={14} /> Contact Me
        </button>
      </div>
    </div>
  </div>
);

const ProjectsPage = ({ onNavigate }: { onNavigate: (url: string) => void }) => (
  <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] to-[#131320] text-white">
    <div className="max-w-2xl mx-auto pt-14 px-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <p className="text-gray-500 text-sm mb-8">Things I've built</p>
      <div className="space-y-4">
        {PROFILE.projects.map((p) => (
          <div key={p.id} className={`p-5 bg-gradient-to-br ${p.color} border ${p.borderColor} rounded-2xl`}>
            <h2 className="font-bold text-base mb-1">{p.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.tech.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-white/10 border border-white/15 rounded-full text-[11px] text-gray-300">{t}</span>
              ))}
            </div>
            <div className="flex gap-2">
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <FaGithub size={13} /> GitHub
                </a>
              )}
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <ExternalLink size={11} /> Live
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onNavigate("devos://skills")} className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all cursor-pointer">
        <Hash size={14} /> View Skills
      </button>
    </div>
  </div>
);

const SkillsPage = () => (
  <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] to-[#131320] text-white">
    <div className="max-w-2xl mx-auto pt-14 px-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">Skills & Tech Stack</h1>
      <p className="text-gray-500 text-sm mb-8">Things Rajlaxmi actually uses</p>
      <div className="flex flex-wrap gap-2.5">
        {PROFILE.techStack.map((t) => (
          <span key={t.name} className={`px-4 py-2 rounded-xl text-sm font-semibold border ${t.color}`}>
            {t.name}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const AchievementsPage = () => (
  <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] to-[#131320] text-white">
    <div className="max-w-2xl mx-auto pt-14 px-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">Achievements</h1>
      <p className="text-gray-500 text-sm mb-8">Numbers don't lie</p>
      <div className="grid grid-cols-1 gap-4">
        {PROFILE.achievements.map((a) => (
          <div key={a.label} className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-3xl font-black text-indigo-400 tabular-nums min-w-[80px]">{a.value}</div>
            <div>
              <p className="font-semibold text-white">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.platform}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-3xl font-black text-purple-400 min-w-[80px]">MCA</div>
          <div>
            <p className="font-semibold text-white">Graduate Degree</p>
            <p className="text-xs text-gray-500 mt-0.5">{PROFILE.university}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage = ({ dispatch }: { dispatch: ReturnType<typeof useAppDispatch> }) => (
  <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] to-[#131320] text-white">
    <div className="max-w-2xl mx-auto pt-14 px-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">Contact</h1>
      <p className="text-gray-500 text-sm mb-8">Let's build something</p>
      <div className="space-y-3">
        {[
          { icon: Mail, label: "Email", value: PROFILE.email, href: `mailto:${PROFILE.email}` },
          { icon: FaGithub, label: "GitHub", value: PROFILE.github.replace("https://", ""), href: PROFILE.github },
          { icon: FaLinkedin, label: "LinkedIn", value: PROFILE.linkedin.replace("https://", ""), href: PROFILE.linkedin },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group">
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                <Icon size={18} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</p>
                <p className="text-sm text-gray-200 font-medium truncate">{c.value}</p>
              </div>
              <ExternalLink size={13} className="text-gray-600 group-hover:text-white transition-colors" />
            </a>
          );
        })}
      </div>
      <button
        onClick={() => dispatch(openWindow({ id: "contact", appId: "contact", title: "Contact Me" }))}
        className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
      >
        📬 Open Full Contact Form
      </button>
    </div>
  </div>
);

// ─── Main Browser Component ───────────────────────────────────────────────────

export const Browser = () => {
  const dispatch = useAppDispatch();
  const [navHistory, setNavHistory] = useState<string[]>([NEW_TAB]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUrl = navHistory[historyIndex];
  const isExternal = currentUrl !== NEW_TAB && isExternalUrl(currentUrl);
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navHistory.length - 1;

  // Build the full suggestions registry (internal content only)
  const SUGGESTIONS: Suggestion[] = [
    {
      id: "home", label: "Home", subtitle: "DevOS new tab", url: "devos://home",
      icon: Home, keywords: ["home", "start", "new tab", "devos"],
    },
    {
      id: "about", label: "About Rajlaxmi", subtitle: "Bio, education & background", url: "devos://about",
      icon: User, keywords: ["about", "bio", "who", "rajlaxmi", "background", "education", "mca"],
    },
    {
      id: "projects", label: "Projects", subtitle: "RoomieOS, Chit Chat, AIDEOA work & more", url: "devos://projects",
      icon: Briefcase, keywords: ["projects", "work", "portfolio", "roomieos", "chitchat", "aideoa"],
    },
    {
      id: "skills", label: "Skills", subtitle: "Tech stack: React, Node.js, MongoDB...", url: "devos://skills",
      icon: Hash, keywords: ["skills", "tech", "stack", "react", "node", "mongodb", "typescript", "socket"],
    },
    {
      id: "achievements", label: "Achievements", subtitle: "400+ DSA, AIR 5124, GFG rank", url: "devos://achievements",
      icon: BarChart2, keywords: ["achievements", "dsa", "leetcode", "gfg", "rank", "contest", "competitive"],
    },
    {
      id: "contact", label: "Contact", subtitle: "Email, GitHub, LinkedIn", url: "devos://contact",
      icon: Mail, keywords: ["contact", "email", "reach", "hire", "connect", "linkedin", "github", "social"],
    },
    {
      id: "resume-app", label: "Resume", subtitle: "Open Resume PDF viewer", url: "devos://resume",
      icon: FileText, keywords: ["resume", "cv", "pdf", "download"],
    },
    {
      id: "terminal-app", label: "Terminal", subtitle: "Open the DevOS terminal emulator", url: "devos://terminal",
      icon: Terminal, keywords: ["terminal", "shell", "console", "cli", "command"],
    },
    {
      id: "explorer-app", label: "File Explorer", subtitle: "Browse virtual file system", url: "devos://explorer",
      icon: Folder, keywords: ["explorer", "files", "folder", "fs", "browse"],
    },
    {
      id: "dsa-app", label: "DSA Dashboard", subtitle: "Problem solving stats & platforms", url: "devos://dsa",
      icon: BarChart2, keywords: ["dsa", "dashboard", "leetcode", "geeksforgeeks", "stats", "coding"],
    },
    {
      id: "settings-app", label: "Settings", subtitle: "Customize wallpaper & themes", url: "devos://settings",
      icon: Settings, keywords: ["settings", "wallpaper", "theme", "customize", "preferences"],
    },
    {
      id: "github", label: "GitHub Profile", subtitle: PROFILE.github, url: "devos://github",
      icon: FaGithub, keywords: ["github", "git", "code", "repos", "source"],
    },
    {
      id: "linkedin", label: "LinkedIn Profile", subtitle: PROFILE.linkedin, url: "devos://linkedin",
      icon: FaLinkedin, keywords: ["linkedin", "professional", "connect", "network"],
    },
  ];

  // Update suggestions as user types
  useEffect(() => {
    const q = inputUrl.trim().toLowerCase();
    if (!q || !isFocused) {
      setFilteredSuggestions([]);
      setSelectedIndex(-1);
      return;
    }
    const matches = SUGGESTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q))
    ).slice(0, 7);
    setFilteredSuggestions(matches);
    setSelectedIndex(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputUrl, isFocused]);

  const pushUrl = useCallback(
    (url: string) => {
      const newHistory = [...navHistory.slice(0, historyIndex + 1), url];
      setNavHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setInputUrl("");
      setFilteredSuggestions([]);
      setIsFocused(false);
      inputRef.current?.blur();

      // Open real apps via dispatch for app-type routes
      const appRoutes: Record<string, { appId: string; title: string }> = {
        "devos://terminal": { appId: "terminal", title: "Terminal" },
        "devos://explorer": { appId: "explorer", title: "File Explorer" },
        "devos://resume": { appId: "resume", title: "Resume" },
        "devos://dsa": { appId: "dsa", title: "DSA Dashboard" },
        "devos://settings": { appId: "settings", title: "Settings" },
        "devos://github": { appId: "browser", title: "Web Browser" },   // handled below
        "devos://linkedin": { appId: "browser", title: "Web Browser" }, // handled below
      };

      if (url === "devos://github") {
        window.open(PROFILE.github, "_blank", "noreferrer");
        // Stay on current page, don't push
        setNavHistory(navHistory);
        setHistoryIndex(historyIndex);
        return;
      }
      if (url === "devos://linkedin") {
        window.open(PROFILE.linkedin, "_blank", "noreferrer");
        setNavHistory(navHistory);
        setHistoryIndex(historyIndex);
        return;
      }
      if (appRoutes[url] && url !== "devos://github" && url !== "devos://linkedin") {
        dispatch(openWindow({ id: appRoutes[url].appId, appId: appRoutes[url].appId, title: appRoutes[url].title }));
      }
    },
    [navHistory, historyIndex, dispatch]
  );

  const navigate = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // If it's an internal devos:// url, push it
      if (trimmed.startsWith("devos://")) {
        sound.playTabSwitch();
        pushUrl(trimmed);
        return;
      }

      // Match by label in suggestions
      const match = SUGGESTIONS.find(
        (s) => s.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        sound.playTabSwitch();
        pushUrl(match.url);
        return;
      }

      // If it looks external → show blocked page
      if (isExternalUrl(trimmed)) {
        sound.playErrorChime();
        pushUrl(`devos://blocked?url=${encodeURIComponent(trimmed)}`);
        return;
      }

      // Try fuzzy match
      const fuzzy = SUGGESTIONS.find((s) =>
        s.keywords.some((k) => k.includes(trimmed.toLowerCase()))
      );
      if (fuzzy) {
        pushUrl(fuzzy.url);
        return;
      }

      // Default: show blocked page for anything unrecognized that looks external
      pushUrl(`devos://blocked?url=${encodeURIComponent(trimmed)}`);
    },
    [pushUrl]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      pushUrl(filteredSuggestions[selectedIndex].url);
    } else {
      navigate(inputUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      sound.playTabSwitch();
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      sound.playTabSwitch();
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setFilteredSuggestions([]);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (!['Enter', 'Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      sound.playKeypress(e.key);
    }
  };

  const goBack = () => {
    if (canGoBack) {
      setHistoryIndex(historyIndex - 1);
      setInputUrl("");
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setHistoryIndex(historyIndex + 1);
      setInputUrl("");
    }
  };

  const goHome = () => {
    const newHistory = [...navHistory.slice(0, historyIndex + 1), NEW_TAB];
    setNavHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setInputUrl("");
  };

  const reload = () => {
    // Force re-render by briefly toggling (simulate reload)
    const cur = currentUrl;
    setNavHistory((prev) => [...prev]);
    setHistoryIndex((i) => i); // no-op to trigger re-render
    void cur;
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFilteredSuggestions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Display label for address bar
  const displayLabel = () => {
    if (currentUrl === NEW_TAB) return "";
    if (currentUrl.startsWith("devos://blocked")) return "devos://error · external url";
    const match = SUGGESTIONS.find((s) => s.url === currentUrl);
    return match ? match.url : currentUrl;
  };

  // Render the current page
  const renderPage = () => {
    if (currentUrl === NEW_TAB) return <HomePage onNavigate={navigate} dispatch={dispatch} />;
    if (currentUrl.startsWith("devos://blocked")) {
      const raw = new URLSearchParams(currentUrl.split("?")[1] || "").get("url") || "unknown";
      return <BlockedPage url={decodeURIComponent(raw)} onGoHome={goHome} />;
    }
    if (currentUrl === "devos://about") return <AboutPage onNavigate={navigate} />;
    if (currentUrl === "devos://projects") return <ProjectsPage onNavigate={navigate} />;
    if (currentUrl === "devos://skills") return <SkillsPage />;
    if (currentUrl === "devos://achievements") return <AchievementsPage />;
    if (currentUrl === "devos://contact") return <ContactPage dispatch={dispatch} />;

    // For app-launch routes (terminal, resume, etc.) — show a "launched" confirmation page
    const launched = SUGGESTIONS.find((s) => s.url === currentUrl);
    if (launched) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <launched.icon size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{launched.label}</h2>
          <p className="text-gray-500 text-sm">{launched.subtitle}</p>
          <p className="mt-4 text-indigo-400 text-xs animate-pulse">App launched ✓</p>
        </div>
      );
    }

    return <HomePage onNavigate={navigate} dispatch={dispatch} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-gray-200">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-white/10 select-none">
        <div className="flex items-center gap-0.5">
          <button onClick={goBack} disabled={!canGoBack}
            className={`p-1.5 rounded transition-colors ${canGoBack ? "hover:bg-white/10 text-gray-300 cursor-pointer" : "text-gray-700 cursor-default"}`}
            title="Back">
            <ChevronLeft size={17} />
          </button>
          <button onClick={goForward} disabled={!canGoForward}
            className={`p-1.5 rounded transition-colors ${canGoForward ? "hover:bg-white/10 text-gray-300 cursor-pointer" : "text-gray-700 cursor-default"}`}
            title="Forward">
            <ChevronRight size={17} />
          </button>
          <button onClick={reload}
            className="p-1.5 rounded hover:bg-white/10 text-gray-500 transition-colors cursor-pointer" title="Reload">
            <RotateCw size={14} />
          </button>
          <button onClick={goHome}
            className="p-1.5 rounded hover:bg-white/10 text-gray-500 transition-colors ml-0.5 cursor-pointer" title="Home">
            <Home size={14} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex-1 relative mx-2">
          <form onSubmit={handleSubmit}>
            <div className={`flex items-center gap-2 bg-[#0a0a0a] border rounded-lg px-3 py-1.5 transition-all ${
              isFocused ? "border-indigo-500/60 shadow-[0_0_0_2px_rgba(99,102,241,0.12)]" : "border-white/8"
            }`}>
              {/* Lock/globe icon */}
              <Globe size={12} className={`shrink-0 ${isExternal ? "text-red-500" : "text-indigo-500"}`} />
              <input
                ref={inputRef}
                type="text"
                value={isFocused ? inputUrl : displayLabel()}
                onChange={(e) => setInputUrl(e.target.value)}
                onFocus={() => { setIsFocused(true); setInputUrl(""); }}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                onKeyDown={handleKeyDown}
                placeholder="Search DevOS — try 'projects', 'skills', 'contact'..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-300 font-sans placeholder-gray-700 min-w-0"
                spellCheck={false}
              />
              {isFocused && inputUrl && (
                <button type="button" onClick={() => { setInputUrl(""); setFilteredSuggestions([]); }}
                  className="text-gray-600 hover:text-gray-400 transition-colors shrink-0">
                  <X size={12} />
                </button>
              )}
              <button type="submit" className="shrink-0 p-1 rounded hover:bg-white/10 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">
                <Search size={12} />
              </button>
            </div>
          </form>

          {/* Suggestions dropdown */}
          {isFocused && filteredSuggestions.length > 0 && (
            <div ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1.5 bg-[#181820] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[999]">
              {filteredSuggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      selectedIndex === i ? "bg-indigo-600/25" : "hover:bg-white/5"
                    }`}
                    onMouseDown={() => pushUrl(s.url)}
                    onMouseEnter={() => setSelectedIndex(i)}>
                    <div className={`p-1.5 rounded-lg shrink-0 ${selectedIndex === i ? "bg-indigo-500/25" : "bg-white/6"}`}>
                      <Icon size={13} className={selectedIndex === i ? "text-indigo-300" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedIndex === i ? "text-white" : "text-gray-300"}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{s.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono shrink-0">{s.url}</span>
                  </div>
                );
              })}
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-700">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span className="ml-auto">DevOS internal search</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#0d0d0d]">
        {renderPage()}
      </div>
    </div>
  );
};

// ─── Home / New Tab Page ──────────────────────────────────────────────────────

const HomePage = ({
  onNavigate,
  dispatch,
}: {
  onNavigate: (url: string) => void;
  dispatch: ReturnType<typeof useAppDispatch>;
}) => {
  const QUICK_LINKS = [
    { label: "About", url: "devos://about", icon: User, color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/25", desc: "Bio & background" },
    { label: "Projects", url: "devos://projects", icon: Briefcase, color: "from-green-500/20 to-teal-500/20 border-green-500/25", desc: "What I've built" },
    { label: "Skills", url: "devos://skills", icon: Hash, color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/25", desc: "Tech stack" },
    { label: "Achievements", url: "devos://achievements", icon: BarChart2, color: "from-orange-500/20 to-red-500/20 border-orange-500/25", desc: "DSA & contest stats" },
    { label: "Contact", url: "devos://contact", icon: Mail, color: "from-pink-500/20 to-rose-500/20 border-pink-500/25", desc: "Let's connect" },
  ];

  const APPS = [
    { label: "Resume", appId: "resume", title: "Resume", icon: FileText },
    { label: "Terminal", appId: "terminal", title: "Terminal", icon: Terminal },
    { label: "DSA", appId: "dsa", title: "DSA Dashboard", icon: BarChart2 },
    { label: "Projects", appId: "projects", title: "Projects", icon: Code2 },
    { label: "Settings", appId: "settings", title: "Settings", icon: Settings },
  ];

  return (
    <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#0d0d0d] via-[#0f0f1a] to-[#0d0d0d]">
      <div className="max-w-xl mx-auto pt-12 px-6 pb-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-4 shadow-lg shadow-indigo-900/30">
            <Globe size={26} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white">{PROFILE.name}'s DevOS</h1>
          <p className="text-gray-600 text-sm mt-1">{PROFILE.tagline} · {PROFILE.location}</p>
          <p className="text-[11px] text-indigo-500/60 mt-2 font-mono">devos://home · internal browser</p>
        </div>

        {/* Portfolio sections */}
        <p className="text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-3">Portfolio</p>
        <div className="grid grid-cols-1 gap-2 mb-8">
          {QUICK_LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <button key={l.label} onClick={() => onNavigate(l.url)}
                className={`flex items-center gap-4 p-3.5 bg-gradient-to-r ${l.color} border rounded-xl hover:brightness-125 transition-all group cursor-pointer text-left`}>
                <div className="p-2 bg-white/8 rounded-lg">
                  <Icon size={15} className="text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-200">{l.label}</p>
                  <p className="text-xs text-gray-500">{l.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* App Launcher */}
        <p className="text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-3">Launch App</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {APPS.map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label}
                onClick={() => dispatch(openWindow({ id: a.appId, appId: a.appId, title: a.title }))}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:border-white/20 transition-all cursor-pointer">
                <Icon size={13} />
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Social Links */}
        <p className="text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-3">Open on the Web ↗</p>
        <div className="flex gap-2">
          <a href={PROFILE.github} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
            <FaGithub size={14} /> GitHub
          </a>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition-all cursor-pointer">
            <FaLinkedin size={14} /> LinkedIn
          </a>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[11px] text-gray-700">
          💡 This browser only navigates DevOS content. External URLs will be gently refused.
        </p>
      </div>
    </div>
  );
};