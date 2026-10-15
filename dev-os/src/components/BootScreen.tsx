import { useState, useEffect, useCallback } from 'react';
import { FastForward, ChevronRight } from 'lucide-react';
import { sound } from '../utils/sound';

// ── Boot phases ────────────────────────────────────────────────────────────────
// Each phase has a label (for the progress display) and a set of terminal lines
const PHASES = [
  {
    label: 'Initializing BIOS',
    lines: [
      'DevOS BIOS Revision 3.1.0',
      'Copyright (C) 2026 DevOS Corporation',
      '',
      'CPU: WebAssembly V8 Engine @ 4.2 GHz',
      'Memory Test: 16384K OK  (3200 MHz DDR4 SODIMM)',
    ],
  },
  {
    label: 'Loading Kernel',
    lines: [
      'Initializing React 19 Kernel ............. OK',
      'Loading Redux Toolkit .................... OK',
      'Mounting Virtual File System (VFS) ....... OK',
    ],
  },
  {
    label: 'Starting Services',
    lines: [
      'Starting Window Manager .................. OK',
      'Starting Terminal Emulator ............... OK',
      'Starting AIDEOA full-stack integrations .. OK',
      'Loading user profile ..................... OK',
    ],
  },
  {
    label: 'Starting Desktop',
    lines: [
      '',
      'System workspace authenticated.',
      'Boot complete. Starting desktop environment...',
    ],
  },
];

const ALL_LINES = PHASES.flatMap((p) => p.lines);
const TOTAL = ALL_LINES.length;

interface BootScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const BootScreen = ({ onComplete, onSkip }: BootScreenProps) => {
  const [logs, setLogs]         = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState(PHASES[0].label);
  const [done, setDone]         = useState(false);

  const handleSkip = useCallback(() => {
    sound.playStartupChime();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('devos_has_booted', 'true');
    }
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  }, [onSkip, onComplete]);

  // Press Escape to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    let lineIndex = 0;

    const interval = setInterval(() => {
      if (lineIndex < TOTAL) {
        const line = ALL_LINES[lineIndex];
        setLogs((prev) => [...prev, line]);
        lineIndex++;

        // Compute which phase we're in
        let accumulated = 0;
        for (const phase of PHASES) {
          accumulated += phase.lines.length;
          if (lineIndex <= accumulated) {
            setPhaseLabel(phase.label);
            break;
          }
        }
        setProgress(Math.round((lineIndex / TOTAL) * 100));
      } else {
        clearInterval(interval);
        setDone(true);
        sound.playStartupChime();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('devos_has_booted', 'true');
        }
        setTimeout(onComplete, 900);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col overflow-hidden select-none"
      style={{ background: '#030303', fontFamily: "'Courier New', monospace" }}
    >
      {/* ── Top controls: Skip Intro ── */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2.5">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-indigo-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95 group"
          title="Skip intro boot animation and jump directly to DevOS (Esc)"
        >
          <FastForward size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Skip Intro</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 group-hover:text-white border border-white/10 font-mono">
            Esc
          </span>
          <ChevronRight size={13} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ── Terminal log area ── */}
      <div className="flex-1 overflow-hidden p-8 pb-0">
        <div className="max-w-2xl space-y-1">
          {logs.map((log, i) => (
            <div
              key={i}
              className="text-sm leading-relaxed"
              style={{
                color: log.includes('OK') ? '#4ade80'
                  : log.startsWith('DevOS') || log.startsWith('Copyright') ? '#a5b4fc'
                  : log === '' ? undefined
                  : '#9ca3af',
                animationName: 'fadeIn',
                animationDuration: '0.15s',
                animationFillMode: 'both',
              }}
            >
              {log || '\u00a0'}
            </div>
          ))}

          {/* Blinking cursor */}
          {!done && (
            <div
              className="inline-block w-2 h-4 mt-1"
              style={{ background: '#6366f1', animation: 'blink 1s step-end infinite' }}
            />
          )}
        </div>
      </div>

      {/* ── Progress bar + status ── */}
      <div className="p-8 space-y-3">
        {/* Phase label */}
        <div className="flex items-center justify-between text-xs" style={{ color: '#6366f1' }}>
          <span className="font-semibold tracking-wider uppercase">{phaseLabel}</span>
          <span className="font-mono tabular-nums">{progress}%</span>
        </div>

        {/* Bar track */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.7)',
            }}
          />
        </div>

        {/* OS branding */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
            DEVOS v2.0
          </span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
            Portfolio Edition · React 19 + Redux Toolkit
          </span>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
};