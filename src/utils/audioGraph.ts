/**
 * Web Audio API Graph Sonification
 * Allows users (including visually impaired users) to "hear" the shape of any mathematical curve
 * As time sweeps x from xMin to xMax, the oscillator pitch maps to f(x).
 */

class AudioGraphPlayer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private animFrameId: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playCurve(
    evaluateFn: (x: number) => number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    durationMs: number = 3000,
    onProgress?: (progressFraction: number, currentX: number, currentY: number) => void,
    onComplete?: () => void
  ) {
    this.stop();
    this.initContext();

    if (!this.audioCtx) {
      console.warn('Web Audio API not supported in this browser.');
      onComplete?.();
      return;
    }

    try {
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscillator.type = 'sine';
      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();
      // Smooth fade in
      this.gainNode.gain.exponentialRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.05);

      this.isPlaying = true;
      const startTime = performance.now();

      const minFreq = 180; // Hz (low C3 range)
      const maxFreq = 1100; // Hz (high C6 range)

      const tick = (now: number) => {
        if (!this.isPlaying) return;

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const currentX = xMin + progress * (xMax - xMin);
        const currentY = evaluateFn(currentX);

        if (this.audioCtx && this.oscillator && this.gainNode) {
          if (isNaN(currentY) || !Number.isFinite(currentY)) {
            // Mute during discontinuities/undefined domain
            this.gainNode.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
          } else {
            // Unmute
            this.gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            // Clamp y into normalized range 0..1
            const clampedY = Math.max(yMin, Math.min(yMax, currentY));
            const normY = (clampedY - yMin) / (yMax - yMin || 1);
            // Exponential frequency scaling for musical pitch
            const targetFreq = minFreq * Math.pow(maxFreq / minFreq, normY);
            this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.015);
          }
        }

        onProgress?.(progress, currentX, isNaN(currentY) ? 0 : currentY);

        if (progress < 1) {
          this.animFrameId = requestAnimationFrame(tick);
        } else {
          this.stop();
          onComplete?.();
        }
      };

      this.animFrameId = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Audio sonification error:', err);
      this.stop();
      onComplete?.();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {}
      this.oscillator = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
  }

  public get active(): boolean {
    return this.isPlaying;
  }
}

export const audioGraph = new AudioGraphPlayer();
