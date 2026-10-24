// ============================================================================
// MODULE 2: PROCEDURAL WEB AUDIO SYNTHESIZER & STORAGE MANAGER
// ============================================================================

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.65;
    this.engineOsc = null;
    this.engineSub = null;
    this.engineGain = null;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.rainNode = null;
    this.rainGain = null;
    this.initialized = false;
    this.sirenPhase = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.masterVolume;
      this.master.connect(this.ctx.destination);

      // Engine continuous synthesizer
      this.engineOsc = this.ctx.createOscillator();
      this.engineSub = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineSub.type = 'triangle';
      this.engineOsc.frequency.value = 55;
      this.engineSub.frequency.value = 27.5;
      this.engineGain.gain.value = 0.0;
      this.engineOsc.connect(this.engineGain);
      this.engineSub.connect(this.engineGain);
      this.engineGain.connect(this.master);
      this.engineOsc.start();
      this.engineSub.start();

      // Police siren synthesizer
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = 'square';
      this.sirenOsc.frequency.value = 620;
      this.sirenGain.gain.value = 0.0;
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.master);
      this.sirenOsc.start();

      // White noise buffer for rain and skids
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.rainNode = this.ctx.createBufferSource();
      this.rainNode.buffer = this.noiseBuffer;
      this.rainNode.loop = true;
      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 1100;
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0;
      this.rainNode.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.master);
      this.rainNode.start();

      this.initialized = true;
    } catch (e) {
      // Ignore audio context blocks until gesture
    }
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.master && !this.muted) {
      this.master.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  updateContinuous(inVehicle, speed, maxSpeed, wantedLevel, isRaining, dt) {
    if (!this.initialized || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const now = this.ctx.currentTime;

    // Engine RPM pitch + gear shift modulation
    if (inVehicle) {
      const ratio = Math.min(1, Math.abs(speed) / (maxSpeed || 45));
      const gearMod = (ratio * 4) % 1;
      const baseFreq = 48 + ratio * 115 + gearMod * 32;
      this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.04);
      this.engineSub.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04);
      this.engineGain.gain.setTargetAtTime(0.08 + ratio * 0.09, now, 0.06);
    } else {
      this.engineGain.gain.setTargetAtTime(0.0, now, 0.08);
    }

    // Police Siren modulation
    if (wantedLevel >= 2) {
      this.sirenPhase += dt * (3.5 + wantedLevel * 0.6);
      const sFreq = 640 + Math.sin(this.sirenPhase) * 240;
      this.sirenOsc.frequency.setTargetAtTime(sFreq, now, 0.03);
      this.sirenGain.gain.setTargetAtTime(0.055, now, 0.1);
    } else {
      this.sirenGain.gain.setTargetAtTime(0.0, now, 0.1);
    }

    // Rain loop
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(isRaining ? 0.06 : 0.0, now, 0.25);
    }
  }

  playHorn(type = 'car') {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    if (type === 'bus' || type === 'suv') {
      // Musical Indian Horn (3 notes)
      const notes = [440, 554.37, 659.25, 554.37];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        g.gain.setValueAtTime(0.14, now + idx * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.085);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.09);
      });
    } else {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.value = type === 'autorickshaw' ? 580 : 390;
      osc2.frequency.value = type === 'autorickshaw' ? 720 : 490;
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc1.connect(g);
      osc2.connect(g);
      g.connect(this.master);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.33);
      osc2.stop(now + 0.33);
    }
  }

  playSkid() {
    this.init();
    if (!this.ctx || this.muted || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1950;
    filter.Q.value = 4.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(now);
    src.stop(now + 0.19);
  }

  playCrash(intensity = 1) {
    this.init();
    if (!this.ctx || this.muted || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 480;
    const g = this.ctx.createGain();
    const vol = Math.min(0.35, 0.12 * intensity);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(now);
    src.stop(now + 0.36);
  }

  playChime(type = 'success') {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const freqs =
      type === 'success'
        ? [523.25, 659.25, 783.99, 1046.5]
        : type === 'fail'
        ? [349.23, 311.13, 261.63]
        : [587.33, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      g.gain.setValueAtTime(0.16, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
      osc.connect(g);
      g.connect(this.master);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.24);
    });
  }
}

export const STORAGE_KEY = 'gta_chandigarh_save_v1';

export const DEFAULT_SAVE_STATE = {
  money: 6500,
  health: 100,
  unlockedVehicles: ['hatchback', 'sedan', 'autorickshaw', 'bike'],
  selectedVehicle: 'hatchback',
  vehicleCustomizations: {
    hatchback: { color: '#e11d48', wheelColor: '#e2e8f0', engineLevel: 1, armorLevel: 1 },
    sedan: { color: '#f8fafc', wheelColor: '#e2e8f0', engineLevel: 1, armorLevel: 1 },
    suv: { color: '#1e293b', wheelColor: '#94a3b8', engineLevel: 1, armorLevel: 1 },
    sports: { color: '#f59e0b', wheelColor: '#fde047', engineLevel: 1, armorLevel: 1 },
    autorickshaw: { color: '#16a34a', wheelColor: '#cbd5e1', engineLevel: 1, armorLevel: 1 },
    bike: { color: '#b91c1c', wheelColor: '#cbd5e1', engineLevel: 1, armorLevel: 1 },
    bus: { color: '#dc2626', wheelColor: '#cbd5e1', engineLevel: 1, armorLevel: 1 },
    police: { color: '#ffffff', wheelColor: '#94a3b8', engineLevel: 1, armorLevel: 1 },
    ambulance: { color: '#f8fafc', wheelColor: '#cbd5e1', engineLevel: 1, armorLevel: 1 }
  },
  completedMissions: [],
  collectedTrophies: [],
  stats: {
    missionsCompleted: 0,
    totalFinesPaid: 0,
    redLightsRun: 0,
    distanceDrivenKm: 0,
    cheatsUsed: 0
  },
  settings: {
    volume: 0.65,
    graphicsQuality: 'high',
    cameraSensitivity: 1.0,
    trafficDensity: 'normal'
  }
};

export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
    const parsed = JSON.parse(raw);
    return {
      ...JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE)),
      ...parsed,
      vehicleCustomizations: {
        ...DEFAULT_SAVE_STATE.vehicleCustomizations,
        ...(parsed.vehicleCustomizations || {})
      },
      settings: {
        ...DEFAULT_SAVE_STATE.settings,
        ...(parsed.settings || {})
      }
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE));
  }
}

export function saveGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}
