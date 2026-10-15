import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface StatsOverlayProps {
  onComplete: () => void;
}

const STATS = [
  { label: 'DSA Problems Solved', value: 400, suffix: '+', color: 'from-indigo-500 to-purple-500', textColor: 'text-indigo-300' },
  { label: 'Real-Time Projects Built', value: 2, suffix: '', color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-300' },
  { label: 'Payment Gateways Integrated', value: 1, suffix: '', color: 'from-amber-500 to-orange-500', textColor: 'text-amber-300' },
  { label: 'National Contest Rank', value: 5124, suffix: '', prefix: 'AIR ', color: 'from-pink-500 to-rose-500', textColor: 'text-pink-300' },
];

function useCountUp(target: number, duration: number = 1400, active: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, duration, active]);

  return count;
}

const StatCard = ({ stat, index, active }: { stat: typeof STATS[0]; index: number; active: boolean }) => {
  const count = useCountUp(stat.value, 1400 + index * 200, active);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div className={`text-4xl font-black tabular-nums mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
        {stat.prefix ?? ''}{count.toLocaleString()}{stat.suffix}
      </div>
      <div className={`text-xs font-medium text-center ${stat.textColor} uppercase tracking-wider`}>
        {stat.label}
      </div>
    </div>
  );
};

export const StatsOverlay = ({ onComplete }: StatsOverlayProps) => {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleFinish = () => {
    sound.playClick();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('devos_has_booted', 'true');
    }
    onComplete();
  };

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setVisible(true), 50);
    // Start counters
    const t2 = setTimeout(() => setActive(true), 300);
    // Auto dismiss after 5s
    const t3 = setTimeout(() => handleFinish(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') handleFinish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999998] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0f0a1e 0%, #050508 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
      onClick={handleFinish}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-3xl w-full px-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-widest uppercase">
            <Sparkles size={16} />
            <span>Initializing Developer Profile</span>
            <Sparkles size={16} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Rajlaxmi <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">@ DevOS</span>
          </h1>
          <p className="text-gray-400 text-sm">Full Stack Developer · MCA · AIDEOA Intern</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} active={active} />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold
            shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]
            transition-all duration-300 active:scale-95"
        >
          <span>Enter DevOS</span>
          <ChevronRight size={16} />
        </button>

        <p className="text-gray-600 text-xs">Press any key or click anywhere to continue</p>
      </div>
    </div>
  );
};
