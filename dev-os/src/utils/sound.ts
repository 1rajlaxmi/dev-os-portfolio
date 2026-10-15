// Retro OS Sound FX Engine using Web Audio API (Zero external assets, sub-millisecond response)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devos_sound_muted');
      // By default mute is ON (true), unless the user explicitly unmuted (saved === 'false')
      this.muted = saved !== 'false';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('devos_sound_muted', String(muted));
      window.dispatchEvent(
        new CustomEvent('devos-sound-state-change', { detail: { muted } })
      );
    }
  }

  public toggleMute(): boolean {
    const nextState = !this.muted;
    this.setMuted(nextState);
    if (!nextState) {
      // Play warm retro OS startup chime when unmuting
      setTimeout(() => this.playStartupChime(), 50);
    }
    return nextState;
  }

  /** Subtle mechanical click / button interaction */
  public playClick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Audio context error handling
    }
  }

  /** Pleasant retro window open rising chord */
  public playWindowOpen(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Rising three-note arpeggio (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.045 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.18);
      });
    } catch {
      // Silent catch
    }
  }

  /** Soft descending window close swoosh */
  public playWindowClose(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Descending three-note resolution (G5 -> E5 -> C5)
      const freqs = [783.99, 659.25, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0, now + idx * 0.035);
        gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.035 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.15);
      });
    } catch {
      // Silent catch
    }
  }

  /** Playful downward pitch slide when minimizing */
  public playWindowMinimize(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.13);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Silent catch
    }
  }

  /** Metallic magnetic snap when window docks / maximizes */
  public playWindowSnap(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Two quick micro-clicks mimicking a magnetic latch
      [0, 0.035].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980, now + offset);
        osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.03);

        gain.gain.setValueAtTime(0.04, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.035);
      });
    } catch {
      // Silent catch
    }
  }

  /** Ethereal synth chord when switching themes or wallpapers */
  public playThemeChange(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Major 7th shimmer chord (G4, B4, D5, F#5)
      const chord = [392.0, 493.88, 587.33, 739.99];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0, now + idx * 0.03);
        gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.03 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.38);
      });
    } catch {
      // Silent catch
    }
  }

  /** Soft card/tab switch tick */
  public playTabSwitch(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.022);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Silent catch
    }
  }

  /** Sci-fi radar sweep when opening Spotlight (Ctrl+K) */
  public playSpotlightOpen(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.09);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Silent catch
    }
  }

  /** Triumphant celebratory sparkle (Email sent, Copied, PDF download) */
  public playSuccessChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Rising pentatonic arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch {
      // Silent catch
    }
  }

  /** Arcade checkpoint chime for Recruiter Tour steps */
  public playTourStep(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Two crisp crystal dings (G5 -> C6)
      const freqs = [783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } catch {
      // Silent catch
    }
  }

  /** 8-bit retro gaming power-up arpeggio for Easter Eggs */
  public playEasterEgg(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Fast classic 8-bit rising sequence
      const freqs = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.03, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.07);
      });
    } catch {
      // Silent catch
    }
  }

  /** Low mechanical delete/recycle tone */
  public playDeleteSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.12);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Silent catch
    }
  }

  /** Vintage VT100 / IBM phosphor terminal return key chirp */
  public playTerminalEnter(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.02);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Silent catch
    }
  }

  /** Retro warning / error chime */
  public playErrorChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low descending two-tone error chime
      const freqs = [329.63, 220.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.035, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.15);
      });
    } catch {
      // Silent catch
    }
  }

  /** Tactile mechanical keystroke sound with organic micro-pitch variations */
  public playKeypress(key?: string): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (key === ' ' || key === 'Spacebar') {
        // Spacebar: deeper mechanical clack with low-mid thud
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.03);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.038);
      } else if (key === 'Backspace' || key === 'Delete') {
        // Backspace: distinct hollow mechanical clack
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.025);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        // Alphanumeric keys: crisp micro-switch click with natural pitch variation
        const pitchJitter = (Math.random() - 0.5) * 160;
        const baseFreq = 960 + pitchJitter;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.42, now + 0.02);

        gain.gain.setValueAtTime(0.028, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
      }
    } catch {
      // Audio context error handling
    }
  }

  /** Vintage CRT / teletype matrix print burst when terminal outputs data */
  public playTerminalPrint(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Staccato 3-tone electronic burst (retro teleprinter data stream)
      const burstFreqs = [720, 880, 640];
      burstFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 60, now + idx * 0.022);

        gain.gain.setValueAtTime(0.015, now + idx * 0.022);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.022 + 0.018);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.022);
        osc.stop(now + idx * 0.022 + 0.02);
      });
    } catch {
      // Audio context error handling
    }
  }

  /** Subtle teletype chatter click when text streams line-by-line onto the terminal screen */
  public playTeletypeTick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // High-pitched retro phosphor line click
      const freq = 1250 + (Math.random() - 0.5) * 150;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.01);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.014);
    } catch {
      // Audio context error handling
    }
  }

  /** Majestic retro OS startup chime played on load, boot, and refresh */
  public playStartupChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Handle browser autoplay policies on cold page refresh
    if (ctx.state === 'suspended') {
      const resumeAndPlay = () => {
        window.removeEventListener('pointerdown', resumeAndPlay);
        window.removeEventListener('keydown', resumeAndPlay);
        window.removeEventListener('click', resumeAndPlay);
        if (!this.muted) {
          ctx.resume().then(() => this.playStartupChime()).catch(() => {});
        }
      };
      window.addEventListener('pointerdown', resumeAndPlay, { once: true });
      window.addEventListener('keydown', resumeAndPlay, { once: true });
      window.addEventListener('click', resumeAndPlay, { once: true });
      return;
    }

    try {
      const now = ctx.currentTime;
      // Majestic multi-harmonic retro OS startup chord (C3 bass, C4, G4, C5, E5, G5, B5, D6)
      const notes = [
        { freq: 130.81, time: 0, gain: 0.045, duration: 2.2, type: 'sine' as OscillatorType },
        { freq: 261.63, time: 0.03, gain: 0.04, duration: 2.0, type: 'triangle' as OscillatorType },
        { freq: 392.00, time: 0.07, gain: 0.035, duration: 1.9, type: 'sine' as OscillatorType },
        { freq: 523.25, time: 0.11, gain: 0.035, duration: 1.8, type: 'triangle' as OscillatorType },
        { freq: 659.25, time: 0.15, gain: 0.03, duration: 1.7, type: 'sine' as OscillatorType },
        { freq: 783.99, time: 0.19, gain: 0.025, duration: 1.6, type: 'triangle' as OscillatorType },
        { freq: 987.77, time: 0.23, gain: 0.02, duration: 1.5, type: 'sine' as OscillatorType },
        { freq: 1174.66, time: 0.27, gain: 0.015, duration: 1.4, type: 'sine' as OscillatorType },
      ];

      notes.forEach(({ freq, time, gain: noteGain, duration, type }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.0001, now + time);
        gain.gain.linearRampToValueAtTime(noteGain, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration + 0.05);
      });
    } catch {
      // Audio context error handling
    }
  }
}

export const sound = new SoundEngine();
