// Premium audio synthesizer for interactive feedback
class PhysicalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private isEnabled: boolean = false;
  private humOscillator: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.12, this.ctx.currentTime); // Safe global volume
        this.masterVolume.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.initCtx();
      this.startContinuousHum();
    } else {
      this.stopContinuousHum();
    }
  }

  // A ultra-crisp luxury tactical micro-click
  playTick() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterVolume) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Quick sweep from 1500Hz down to 800Hz
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterVolume);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Clean wooden tap feedback for gravity locks
  playTap() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterVolume) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterVolume);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Premium bell chime for specs/hotspots
  playChime() {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterVolume) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5 note

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now); // E6 note (harmonic fifth)

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterVolume);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.82);
    osc2.stop(now + 0.82);
  }

  // Cosmic distortion sound
  playDistortEffect(level: number) {
    if (!this.isEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterVolume) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120 + level * 60, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.2);

    // Filter to suppress high harshness
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);

    osc.start();
    osc.stop(now + 0.25);
  }

  // Ongoing spatial/temporal electromagnetic hum
  private startContinuousHum() {
    if (!this.ctx || !this.masterVolume || this.humOscillator) return;

    try {
      const now = this.ctx.currentTime;
      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOscillator.type = "sine";
      this.humOscillator.frequency.setValueAtTime(75, now); // Cozy low background frequency

      this.humGain.gain.setValueAtTime(0, now);
      this.humGain.gain.linearRampToValueAtTime(0.05, now + 1.5); // Smooth fade in

      this.humOscillator.connect(this.humGain);
      this.humGain.connect(this.masterVolume);

      this.humOscillator.start();
    } catch (e) {
      console.warn("Could not start background hum:", e);
    }
  }

  private stopContinuousHum() {
    if (this.humOscillator) {
      try {
        const now = this.ctx ? this.ctx.currentTime : 0;
        if (this.humGain && this.ctx) {
          this.humGain.gain.cancelScheduledValues(now);
          this.humGain.gain.setValueAtTime(this.humGain.gain.value, now);
          this.humGain.gain.linearRampToValueAtTime(0, now + 0.5);
          setTimeout(() => {
            if (this.humOscillator) {
              this.humOscillator.stop();
              this.humOscillator.disconnect();
              this.humOscillator = null;
            }
          }, 600);
        } else {
          this.humOscillator.stop();
          this.humOscillator = null;
        }
      } catch (e) {
        this.humOscillator = null;
      }
    }
  }

  // Modulate the ambient hum depending on physical parameters
  modulateHum(gravity: number, timeSpeed: number, spaceDistort: number) {
    if (!this.isEnabled || !this.ctx || !this.humOscillator || !this.humGain) return;

    const baseFreq = 75;
    const targetFreq = baseFreq + (gravity * 18) + (timeSpeed * 15) + (spaceDistort * 22);
    const targetGain = 0.03 + (timeSpeed * 0.015) + (spaceDistort * 0.015);

    const now = this.ctx.currentTime;
    // Smooth transitions so it doesn't pop
    this.humOscillator.frequency.setTargetAtTime(targetFreq, now, 0.15);
    this.humGain.gain.setTargetAtTime(targetGain, now, 0.2);
  }
}

export const audio = new PhysicalAudioEngine();
export default audio;
