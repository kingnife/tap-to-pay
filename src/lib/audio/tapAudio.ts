/**
 * Sub-3-second Transit NFC Audio & Haptic Feedback Engine
 * Provides instant tactile and acoustic feedback using Web Audio API and Web Vibration API
 */

class TapAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Classic transit validator double-beep tone (880Hz -> 1760Hz)
   */
  public playTapSuccess(): void {
    try {
      // Haptic vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 30, 40]);
      }

      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // First tone (880Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second higher tone (1760Hz - A6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.08);
      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Declined or failed buzz tone (220Hz low buzz)
   */
  public playTapFailure(): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 50, 150]);
      }

      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Offline stored chime (amber tone: 600Hz -> 900Hz)
   */
  public playOfflineChime(): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40]);
      }
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // fallback
    }
  }

  // Aliases
  public playSuccess(): void {
    this.playTapSuccess();
  }

  public playError(): void {
    this.playTapFailure();
  }

  public playSuccessBeep(): void {
    this.playTapSuccess();
  }

  public playFailureBeep(): void {
    this.playTapFailure();
  }

  /**
   * Top-up funding success chime
   */
  public playTopUpChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const now = ctx.currentTime + index * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch {
      // fallback
    }
  }
}

export const tapAudio = new TapAudioEngine();
