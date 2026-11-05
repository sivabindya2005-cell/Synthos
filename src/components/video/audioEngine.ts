// Audio Synthesizer for SYNTHOS Cinematic Video Intro
// Generates ambient drone chords, biometric heartbeats, and scanner pings via Web Audio API

export class SynthosAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private heartbeatInterval: number | null = null;
  private isRunning: boolean = false;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public start() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isRunning = true;
    this.startAmbientPad();
    this.startHeartbeat();
  }

  public stop() {
    this.isRunning = false;
    this.stopAmbientPad();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : 0.45;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  // Harmonic ambient chord progression based on current chapter
  public setChapterMood(chapterIndex: number) {
    if (!this.ctx || !this.isRunning) return;
    // Chords: D-minor -> F-maj7 -> Bb-maj7 -> G-min9 -> A-sus4 -> D-major resolve
    const frequenciesByChapter = [
      [73.42, 146.83, 220.00, 261.63], // D2, D3, A3, C4
      [87.31, 174.61, 220.00, 329.63], // F2, F3, A3, E4
      [58.27, 116.54, 233.08, 349.23], // Bb1, Bb2, Bb3, F4
      [49.00, 98.00, 196.00, 293.66],  // G1, G2, G3, D4
      [55.00, 110.00, 220.00, 293.66], // A1, A2, A3, D4
      [73.42, 146.83, 220.00, 369.99]  // D2, D3, A3, F#4 (Bright triumphant resolve)
    ];

    const targetFreqs = frequenciesByChapter[Math.min(chapterIndex, frequenciesByChapter.length - 1)];

    targetFreqs.forEach((freq, idx) => {
      if (this.droneOscillators[idx] && this.ctx) {
        this.droneOscillators[idx].frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.4);
      }
    });
  }

  private startAmbientPad() {
    if (!this.ctx || !this.masterGain) return;
    this.stopAmbientPad();

    const baseFreqs = [73.42, 146.83, 220.00, 261.63];

    baseFreqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.droneOscillators.push(osc);
      this.droneGains.push(gain);
    });
  }

  private stopAmbientPad() {
    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore
      }
    });
    this.droneOscillators = [];
    this.droneGains = [];
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    // 64 BPM physiological resting pulse
    const msPerBeat = (60 / 64) * 1000;

    this.heartbeatInterval = window.setInterval(() => {
      if (!this.isRunning || this.isMuted) return;
      this.playHeartbeatPulse();
    }, msPerBeat);
  }

  private playHeartbeatPulse() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Lub (First sound: 52Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(56, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Dub (Second sound: slightly higher, 0.16s after)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(64, now + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(36, now + 0.28);

      gain2.gain.setValueAtTime(0.14, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.29);
    } catch {
      // Audio context may be closed
    }
  }

  // Futuristic biometric scanner ping
  public playScannerPing(frequency = 880) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio error fallback
    }
  }
}
