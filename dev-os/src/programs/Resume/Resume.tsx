import { useState } from 'react';
import {
  MapPin, Mail, Download,
  Briefcase, GraduationCap, Code2, Trophy, Zap,
  ExternalLink, ChevronRight,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { PROFILE } from '../../data/profile';
import { useAppSelector } from '../../hooks/useStore';
import { toast } from 'sonner';
import { sound } from '../../utils/sound';

// ── Skill bar ─────────────────────────────────────────────────────────────────
const SkillBar = ({ name, color }: { name: string; color: string }) => (
  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${color}`}>{name}</span>
);

// ── Section header ─────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-lg bg-indigo-500/20">
        <Icon size={14} className="text-indigo-400" />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h2>
      <div className="flex-1 h-px bg-white/8" />
    </div>
    {children}
  </div>
);

export const Resume = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'download'>('view');
  const projects = useAppSelector((state) => state.admin.projects);
  const skills = useAppSelector((state) => state.admin.skills);

  const tabs = [
    { id: 'view' as const, label: 'Interactive' },
    { id: 'download' as const, label: 'PDF Export' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111] text-gray-200 overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playTabSwitch();
                setActiveTab(t.id);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={async () => {
            const res = await fetch('/ResumeRajlaxmi_2026.pdf', { method: 'HEAD' });
            if (!res.ok) {
              sound.playErrorChime();
              toast.warning('Resume PDF not found', {
                description: 'Add ResumeRajlaxmi_2026.pdf to the /public folder to enable downloads.',
                duration: 5000,
              });
            } else {
              sound.playSuccessChime();
              const a = document.createElement('a');
              a.href = '/ResumeRajlaxmi_2026.pdf';
              a.download = 'Rajlaxmi_Resume_2026.pdf';
              a.click();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all duration-150 hover:shadow-lg hover:shadow-indigo-900/40 cursor-pointer"
        >
          <Download size={12} />
          Download PDF
        </button>
      </div>

      {/* ── PDF fallback tab ── */}
      {activeTab === 'download' && (
        <iframe src="/ResumeRajlaxmi_2026.pdf" className="flex-1 border-none" title="Resume PDF" />
      )}

      {/* ── Interactive resume ── */}
      {activeTab === 'view' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">

            {/* ── Header / Hero ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent border border-indigo-500/30 border-t-white/20 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="relative flex items-start gap-6">
                {/* Avatar */}
                <img
                  src="/photo.jpg"
                  alt={PROFILE.name}
                  className="w-18 h-18 rounded-2xl object-cover shadow-xl shadow-indigo-900/50 border border-white/20 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{PROFILE.name}</h1>
                  <p className="text-indigo-300 font-semibold text-base mt-1">{PROFILE.role}</p>
                  <p className="text-gray-300 text-sm mt-3 leading-relaxed">{PROFILE.bio}</p>

                  {/* Contact row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
                    <a href={`mailto:${PROFILE.email}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-indigo-300 transition-colors">
                      <Mail size={12} />{PROFILE.email}
                    </a>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      <MapPin size={12} />{PROFILE.location}
                    </span>
                    {!PROFILE.github.startsWith('YOUR_') && (
                      <a href={PROFILE.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-indigo-300 transition-colors">
                        <FaGithub size={12} />GitHub <ExternalLink size={10} />
                      </a>
                    )}
                    {!PROFILE.linkedin.startsWith('YOUR_') && (
                      <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-indigo-300 transition-colors">
                        <FaLinkedin size={12} />LinkedIn <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Achievements ── */}
            <Section icon={Trophy} title="Achievements">
              <div className="grid grid-cols-3 gap-4">
                {PROFILE.achievements.map((a) => (
                  <div key={a.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 border-t-white/20 text-center shadow-lg">
                    <p className="text-2xl font-extrabold text-white">{a.value}</p>
                    <p className="text-indigo-300 text-xs font-bold mt-1">{a.label}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{a.platform}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Experience ── */}
            <Section icon={Briefcase} title="Experience">
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-1 bottom-1 w-px bg-indigo-500/30" />
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-indigo-500 border-2 border-[#111]" />
                  <div className="p-4 rounded-xl bg-white/4 border border-white/8 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{PROFILE.role}</h3>
                        <p className="text-indigo-400 text-xs mt-0.5">{PROFILE.company}</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 whitespace-nowrap shrink-0">
                        {PROFILE.internshipStart} – Present
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {[
                        'Built responsive UIs with React.js and RESTful APIs with Node.js/Express',
                        'Integrated PayU Payment Gateway with secure hash-verification webhook flow',
                        'Improved organic traffic through structured metadata SEO strategies',
                        'Developed real-time features using Socket.io for live collaborative dashboards',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
                          <ChevronRight size={11} className="text-indigo-400 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Education ── */}
            <Section icon={GraduationCap} title="Education">
              <div className="p-4 rounded-xl bg-white/4 border border-white/8 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 shrink-0">
                  <GraduationCap size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{PROFILE.education}</h3>
                  <p className="text-indigo-400 text-xs mt-0.5">{PROFILE.university}</p>
                  <p className="text-gray-500 text-xs mt-1">Graduated {PROFILE.graduationYear} · {PROFILE.location}</p>
                </div>
              </div>
            </Section>

            {/* ── Projects ── */}
            <Section icon={Zap} title="Projects">
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className={`p-4 rounded-xl border bg-gradient-to-br ${p.color} ${p.borderColor} hover:brightness-110 transition-all`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        {p.github && !p.github.startsWith('YOUR_') && p.github !== '' && (
                          <a href={p.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="View on GitHub">
                            <FaGithub size={13} />
                          </a>
                        )}
                        {p.live && p.live !== '' && !p.live.startsWith('YOUR_') && (
                          <a href={p.live} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-300 transition-colors" title="View live site">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tech.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/15 font-mono">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Skills ── */}
            <Section icon={Code2} title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((tech) => (
                  <SkillBar key={tech.name} name={tech.name} color={tech.color} />
                ))}
              </div>
            </Section>

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-600 pb-2">
              Rajlaxmi Gupta · {PROFILE.email}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};