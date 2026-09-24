// Sound Manager for Pixel Pool
// Uses Web Audio API with generated sounds for zero dependencies

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.3;

  constructor() {
    // Initialize on user interaction to comply with browser policies
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported', error);
      this.enabled = false;
    }
  }

  private ensureContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Play cue ball hit sound (high click)
  playCueHit(power: number) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const gainNode = ctx.createGain();
    const oscillator = ctx.createOscillator();
    
    // Higher pitch for cue ball
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(Math.min(0.4 * power, 0.6) * this.masterVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  // Play ball collision sound (varies by impact speed)
  playBallCollision(impactSpeed: number) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const gainNode = ctx.createGain();
    const oscillator = ctx.createOscillator();
    
    // Map impact speed to sound characteristics
    const volume = Math.min(impactSpeed * 0.15, 0.5) * this.masterVolume;
    const frequency = 200 + (impactSpeed * 30);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }

  // Play ball sink sound (pocket)
  playBallSink() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const gainNode = ctx.createGain();
    const oscillator = ctx.createOscillator();
    
    // Descending pitch for "falling into pocket"
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.4 * this.masterVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  // Play turn change notification
  playTurnChange() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    
    // Two-tone notification
    [400, 600].forEach((freq, index) => {
      const gainNode = ctx.createGain();
      const oscillator = ctx.createOscillator();
      
      const startTime = ctx.currentTime + (index * 0.1);
      
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.2 * this.masterVolume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  // Play victory sound
  playVictory() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    
    // Ascending chord
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, index) => {
      const gainNode = ctx.createGain();
      const oscillator = ctx.createOscillator();
      
      const startTime = ctx.currentTime + (index * 0.15);
      
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  // Play defeat sound
  playDefeat() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    
    // Descending tone
    const gainNode = ctx.createGain();
    const oscillator = ctx.createOscillator();
    
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3 * this.masterVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
