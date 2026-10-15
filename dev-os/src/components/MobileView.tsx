import { useState } from 'react';
import {
  Code2,
  Trophy,
  Mail,
  User,
  Sparkles,
  Monitor,
  Flame,
  ExternalLink,
  Copy,
  Check,
  Send,
  MapPin,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  Palette,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { PROFILE } from '../data/profile';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { setThemeStyle, type ThemeStyle } from '../store/slices/settingsSlice';
import { ArchitectureDiagram } from '../programs/Projects/ArchitectureDiagram';
import { toast } from 'sonner';
import { sound } from '../utils/sound';

interface Props {
  onSwitchToDesktop: () => void;
}

const MOBILE_THEMES: { id: ThemeStyle; name: string }[] = [
  { id: 'default',      name: 'Default' },
  { id: 'neobrutalism', name: 'Brutalism' },
  { id: 'neon',         name: 'Neon' },
  { id: 'doodle',       name: 'Doodle' },
  { id: 'myspace',      name: 'Web 1.0' },
];

export const MobileView = ({ onSwitchToDesktop }: Props) => {
  const dispatch = useAppDispatch();
  const themeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'dsa' | 'skills' | 'contact'>('overview');
  const [copied, setCopied] = useState(false);
  const [selectedArchProject, setSelectedArchProject] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', subject: '', message: '' });
  const projects = useAppSelector((state) => state.admin.projects);
  const skills = useAppSelector((state) => state.admin.skills);

  const copyEmail = () => {
    sound.playSuccessChime();
    navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    toast.success('Email copied!', { description: PROFILE.email });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      sound.playErrorChime();
      toast.error('Please enter your name and message.');
      return;
    }
    sound.playSuccessChime();
    const mailtoLink = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
      contactForm.subject || 'Portfolio Contact'
    )}&body=${encodeURIComponent(`Hi, I'm ${contactForm.name}.\n\n${contactForm.message}`)}`;
    window.open(mailtoLink, '_blank');
    toast.success('Opening email app! 🚀');
    setContactForm({ name: '', subject: '', message: '' });
  };

  return (
    <div data-theme-style={themeStyle} className={`min-h-screen font-sans pb-24 select-none ${themeStyle !== 'default' ? 'theme-desktop-bg text-gray-900' : 'bg-[#0e0e12] text-gray-200'}`}>
      {/* Top Banner Notice */}
      <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-indigo-300">
          <Sparkles size={14} className="text-indigo-400 shrink-0" />
          <span className="font-medium">Mobile View</span>
        </div>
        <button
          onClick={() => {
            sound.playWindowOpen();
            onSwitchToDesktop();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm transition-all"
        >
          <Monitor size={12} />
          Full OS View
        </button>
      </div>

      {/* Theme Selector Bar */}
      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Palette size={13} className="text-indigo-400 shrink-0" />
        <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Style:</span>
        <div className="flex gap-1.5 shrink-0">
          {MOBILE_THEMES.map((t) => {
            const isActive = themeStyle === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sound.playThemeChange();
                  dispatch(setThemeStyle(t.id));
                }}
                className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8 bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-transparent">
        <div className="flex items-center gap-4">
          <img
            src="/photo.jpg"
            alt={PROFILE.name}
            className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-indigo-900/50 border border-white/20 shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{PROFILE.name}</h1>
            <p className="text-indigo-400 text-xs font-semibold mt-0.5">{PROFILE.tagline}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={11} className="text-indigo-400" /> {PROFILE.location}</span>
            </div>
          </div>
        </div>

        {/* Quick Social Pills */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={copyEmail}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 active:bg-white/10"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-indigo-400" />}
            <span className="font-mono text-[11px] truncate">{PROFILE.email}</span>
          </button>
          <a
            href={PROFILE.github.startsWith('YOUR_') ? '#' : PROFILE.github}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 active:bg-white/10"
          >
            <FaGithub size={16} />
          </a>
          <a
            href={PROFILE.linkedin.startsWith('YOUR_') ? '#' : PROFILE.linkedin}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-400 active:bg-white/10"
          >
            <FaLinkedin size={16} />
          </a>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/8 bg-[#14141a] overflow-x-auto no-scrollbar sticky top-0 z-20">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'projects', label: 'Projects', icon: Code2 },
          { id: 'dsa', label: 'DSA Stats', icon: Trophy },
          { id: 'skills', label: 'Skills', icon: Sparkles },
          { id: 'contact', label: 'Contact', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTabSwitch();
                setActiveTab(tab.id as typeof activeTab);
                setSelectedArchProject(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-gray-400 hover:text-gray-200 active:bg-white/5'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 space-y-5">
        {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/4 border border-white/8 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">About Me</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{PROFILE.bio}</p>
            </div>

            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-3">
                <Briefcase size={16} className="text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Current Role</div>
                  <div className="text-xs font-bold text-white">{PROFILE.role}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-3">
                <GraduationCap size={16} className="text-purple-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Education</div>
                  <div className="text-xs font-bold text-white">{PROFILE.education}</div>
                  <div className="text-[11px] text-gray-400">{PROFILE.university}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {PROFILE.achievements.map((a) => (
                <div key={a.label} className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <div className="text-lg font-black text-white">{a.value}</div>
                  <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mt-0.5">{a.label}</div>
                  <div className="text-[9px] text-gray-400">{a.platform}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROJECTS TAB ────────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {selectedArchProject ? (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedArchProject(null)}
                  className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mb-2"
                >
                  ← Back to Projects List
                </button>
                <ArchitectureDiagram projectId={selectedArchProject} />
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className={`p-4 rounded-2xl border bg-gradient-to-br ${proj.color} ${proj.borderColor} space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold text-white">{proj.title}</h3>
                    <button
                      onClick={() => setSelectedArchProject(proj.id)}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold shrink-0"
                    >
                      <Layers size={11} />
                      Architecture
                    </button>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {proj.tech.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-300 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>

                  {(proj.github || proj.live) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-gray-300 hover:text-white font-medium"
                        >
                          <FaGithub size={13} /> Code Repo
                        </a>
                      )}
                      {proj.live && (
                        <a
                          href={proj.live}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium ml-auto"
                        >
                          <ExternalLink size={12} /> Live Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── DSA TAB ────────────────────────────────────────────────── */}
        {activeTab === 'dsa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 text-center space-y-1">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2">
                <Flame size={22} className="text-orange-400" />
                400+ Problems Solved
              </div>
              <div className="text-xs font-bold text-gray-300">GeeksForGeeks · LeetCode · HackerRank</div>
              <div className="text-[11px] text-amber-300 font-semibold pt-1">🏆 AIR 5124 in CodingNinjas Codekaze</div>
            </div>

            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌿</span>
                  <span className="text-xs font-bold text-white">GeeksForGeeks</span>
                </div>
                <span className="text-xs text-green-300 font-mono font-bold">280+ Solved</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  <span className="text-xs font-bold text-white">LeetCode</span>
                </div>
                <span className="text-xs text-amber-300 font-mono font-bold">80+ Solved</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟢</span>
                  <span className="text-xs font-bold text-white">HackerRank</span>
                </div>
                <span className="text-xs text-cyan-300 font-mono font-bold">5★ Problem Solving</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SKILLS TAB ────────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Tech Stack & Tools</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.name} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${s.color}`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTACT TAB ───────────────────────────────────────────── */}
        {activeTab === 'contact' && (
          <form onSubmit={handleSendContact} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Send Direct Message</h3>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="Your Name *"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 outline-none focus:border-indigo-500/60"
            />
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              placeholder="Subject (Job / Project / Inquiry)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 outline-none focus:border-indigo-500/60"
            />
            <textarea
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="Your Message *"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 outline-none resize-none focus:border-indigo-500/60"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40"
            >
              <Send size={13} /> Send Email Message
            </button>
          </form>
        )}
      </div>

      {/* Floating Bottom Sticky CTA Button */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => {
            sound.playWindowOpen();
            onSwitchToDesktop();
          }}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-2xl shadow-indigo-900/60 border border-indigo-400/40 active:scale-98 transition-all"
        >
          <Monitor size={16} />
          <span>Launch Full DevOS Desktop Simulation</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
