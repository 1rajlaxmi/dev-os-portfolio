import { useState, useEffect } from 'react';
import { Target, ChevronRight, ChevronLeft, X, Sparkles, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import { useAppDispatch } from '../hooks/useStore';
import { openWindow, focusWindow } from '../store/slices/windowManagerSlice';
import { PROFILE } from '../data/profile';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    title: 'Step 1: Developer Profile',
    subtitle: 'Full Stack Developer Intern @ AIDEOA · MCA Graduate',
    appId: 'resume',
    appTitle: 'Resume',
    description: 'Explore Rajlaxmi\'s full-stack development experience, technical skills in React, TypeScript, Node.js, Express, and competitive programming highlights.',
    emoji: '📄',
  },
  {
    step: 2,
    title: 'Step 2: Technical Projects',
    subtitle: 'RoomieOS & ChitChat — Real-Time Applications',
    appId: 'projects',
    appTitle: 'Projects',
    description: 'Review real-time architecture built with WebSockets (Socket.io), MongoDB Atlas, JWT authentication, and PayU payment gateway integration.',
    emoji: '🚀',
  },
  {
    step: 3,
    title: 'Step 3: DSA & Problem Solving',
    subtitle: '400+ Problems · AIR 5124 Codekaze · College Rank Under 45',
    appId: 'dsa',
    appTitle: 'DSA Dashboard',
    description: 'See 400+ problems solved across GFG, LeetCode, and HackerRank — broken down by category with real code solutions and algorithmic approaches.',
    emoji: '🏆',
  },
  {
    step: 4,
    title: 'Step 4: Get In Touch',
    subtitle: 'Open to full-time opportunities · Available now',
    appId: 'contact',
    appTitle: 'Contact Me',
    description: 'Connect via LinkedIn, GitHub, or send a direct message. Rajlaxmi is actively seeking full-time Full Stack Developer roles.',
    emoji: '📬',
  },
];

export const RecruiterTour = ({ isOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const activeStep = STEPS[currentStepIdx];
  const isLastStep = currentStepIdx + 1 === STEPS.length;

  // Auto-open the target app when step changes
  useEffect(() => {
    if (isOpen && !showIntro && activeStep) {
      dispatch(openWindow({ id: activeStep.appId, appId: activeStep.appId, title: activeStep.appTitle }));
      dispatch(focusWindow(activeStep.appId));
    }
  }, [isOpen, currentStepIdx, showIntro, dispatch, activeStep]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setShowIntro(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    sound.playTourStep();
    if (showIntro) {
      setShowIntro(false);
      return;
    }
    if (!isLastStep) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playTourStep();
    if (currentStepIdx > 0) setCurrentStepIdx((prev) => prev - 1);
    else setShowIntro(true);
  };

  const openLinkedIn = () => {
    if (!PROFILE.linkedin.startsWith('YOUR_')) {
      window.open(PROFILE.linkedin, '_blank');
    } else {
      dispatch(openWindow({ id: 'contact', appId: 'contact', title: 'Contact Me' }));
    }
    onClose();
  };

  const openContactApp = () => {
    dispatch(openWindow({ id: 'contact', appId: 'contact', title: 'Contact Me' }));
    dispatch(focusWindow('contact'));
    onClose();
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9800] w-full max-w-lg px-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1a1a22]/97 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">

        {/* Subtle gradient header accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Progress bar (thin) */}
        {!showIntro && (
          <div className="absolute top-0.5 left-0 h-0.5 bg-indigo-400/60 transition-all duration-500 rounded-full"
            style={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
          />
        )}

        <div className="p-5">
          {showIntro ? (
            /* ── Intro Card ── */
            <div className="text-center space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg">
                    <Target size={16} />
                  </div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} />
                    Recruiter 1-Click Tour
                  </span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="text-4xl">👋</div>
              <div>
                <h3 className="text-lg font-black text-white">Hi! I'm Rajlaxmi.</h3>
                <p className="text-sm text-indigo-300 font-medium mt-1">In the next 2 minutes, I'll show you why you should interview me.</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/8">
                This guided tour will walk you through my <strong className="text-gray-200">Resume</strong>, <strong className="text-gray-200">Projects</strong>, <strong className="text-gray-200">DSA Stats</strong>, and <strong className="text-gray-200">Contact</strong> — opening each app automatically.
              </p>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  <span>Start Tour</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* ── Step Card ── */
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{activeStep.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{activeStep.title}</h3>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                        {currentStepIdx + 1}/{STEPS.length}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-300 font-medium">{activeStep.subtitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                {activeStep.description}
              </p>

              {/* Last step CTA buttons */}
              {isLastStep && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={openLinkedIn}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                  >
                    <Calendar size={13} />
                    Schedule a Call
                  </button>
                  <button
                    onClick={openContactApp}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
                  >
                    <MessageSquare size={13} />
                    Send a Message
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentStepIdx ? 'w-6 bg-indigo-400' : idx < currentStepIdx ? 'w-2 bg-emerald-400' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>

                  {!isLastStep && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  )}

                  {isLastStep && (
                    <button
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all active:scale-95"
                    >
                      <CheckCircle size={14} />
                      <span>Finish</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
