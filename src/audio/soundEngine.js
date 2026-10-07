// ─── Web Audio Synthesis Engine ───────────────────────────────
// All sounds are synthesized at runtime — zero external audio files.

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.isMuted = false;
    this.volume = 0.55;
  }

  // ── Lazy AudioContext init (must be called from user gesture) ──
  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this._ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this._ensureContext();
    this.isMuted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  _track(node) {
    this.activeNodes.push(node);
    return node;
  }

  // ── Collapsing: sub-bass drone + rising whine ────────────────
  startCollapse() {
    this._ensureContext();
    this.stopAll();
    const now = this.ctx.currentTime;

    // 1) Sub-bass drone (40 Hz) with LFO pulsing
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = 40;
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.35, now + 1.5);
    bass.connect(bassGain).connect(this.masterGain);
    bass.start(now);
    this._track({ osc: bass, gain: bassGain });

    // LFO to pulse the bass
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain).connect(bass.frequency);
    lfo.start(now);
    this._track({ osc: lfo, gain: lfoGain });

    // 2) Rising whine (200 Hz → 3 kHz exponential sweep)
    const whine = this.ctx.createOscillator();
    whine.type = 'sawtooth';
    whine.frequency.setValueAtTime(200, now);
    whine.frequency.exponentialRampToValueAtTime(3200, now + 10);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3;
    const whineGain = this.ctx.createGain();
    whineGain.gain.setValueAtTime(0, now);
    whineGain.gain.linearRampToValueAtTime(0.12, now + 2.5);
    whine.connect(filter).connect(whineGain).connect(this.masterGain);
    whine.start(now);
    this._track({ osc: whine, gain: whineGain });

    // 3) Subtle crackle noise bed
    const noiseLen = this.ctx.sampleRate * 4;
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 4000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 3);
    noise.connect(noiseFilter).connect(noiseGain).connect(this.masterGain);
    noise.start(now);
    this._track({ osc: noise, gain: noiseGain });
  }

  // ── Stopping: fade out ongoing drones ────────────────────────
  fadeOutCollapse() {
    this._ensureContext();
    const now = this.ctx.currentTime;
    this.activeNodes.forEach(node => {
      if (node.gain) {
        try {
          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setValueAtTime(node.gain.gain.value, now);
          node.gain.gain.linearRampToValueAtTime(0, now + 1.0);
        } catch { /* ignore */ }
      }
    });
    setTimeout(() => this.stopAll(), 1200);
  }

  // ── Supernova: explosive impact ──────────────────────────────
  playSupernova() {
    this._ensureContext();
    this.stopAll();
    const now = this.ctx.currentTime;

    // White noise burst with exponential decay
    const burstLen = this.ctx.sampleRate * 0.6;
    const burstBuf = this.ctx.createBuffer(1, burstLen, this.ctx.sampleRate);
    const bd = burstBuf.getChannelData(0);
    for (let i = 0; i < burstLen; i++) {
      bd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.06));
    }
    const burst = this.ctx.createBufferSource();
    burst.buffer = burstBuf;
    const burstFilter = this.ctx.createBiquadFilter();
    burstFilter.type = 'lowpass';
    burstFilter.frequency.value = 4000;
    const burstGain = this.ctx.createGain();
    burstGain.gain.setValueAtTime(0.55, now);
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    burst.connect(burstFilter).connect(burstGain).connect(this.masterGain);
    burst.start(now);

    // Anime magical explosion trigger chirp (Megumin sakuga transient)
    const chirp = this.ctx.createOscillator();
    chirp.type = 'sawtooth';
    chirp.frequency.setValueAtTime(2800, now);
    chirp.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    const chirpGain = this.ctx.createGain();
    chirpGain.gain.setValueAtTime(0.45, now);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    chirp.connect(chirpGain).connect(this.masterGain);
    chirp.start(now);
    chirp.stop(now + 0.15);

    // Sub impact: 80 Hz → 20 Hz sweep
    const impact = this.ctx.createOscillator();
    impact.type = 'sine';
    impact.frequency.setValueAtTime(95, now);
    impact.frequency.exponentialRampToValueAtTime(18, now + 0.7);
    const impactGain = this.ctx.createGain();
    impactGain.gain.setValueAtTime(0.65, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    impact.connect(impactGain).connect(this.masterGain);
    impact.start(now);
    impact.stop(now + 1.2);

    // Metallic ring
    const ring = this.ctx.createOscillator();
    ring.type = 'triangle';
    ring.frequency.value = 1800;
    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.12, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    ring.connect(ringGain).connect(this.masterGain);
    ring.start(now);
    ring.stop(now + 0.6);

    // Sizzling fireworks crackles
    const crackleLen = this.ctx.sampleRate * 1.4;
    const crackleBuf = this.ctx.createBuffer(1, crackleLen, this.ctx.sampleRate);
    const cd = crackleBuf.getChannelData(0);
    for (let i = 0; i < crackleLen; i++) {
      const prob = Math.random();
      cd[i] = (prob > 0.98 ? (Math.random() * 2 - 1) : 0) * Math.exp(-i / (this.ctx.sampleRate * 0.8));
    }
    const crackle = this.ctx.createBufferSource();
    crackle.buffer = crackleBuf;
    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 2500;
    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.35, now + 0.12);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    crackle.connect(crackleFilter).connect(crackleGain).connect(this.masterGain);
    crackle.start(now + 0.12);
  }

  // ── Reveal: ascending bell chime ─────────────────────────────
  playReveal() {
    this._ensureContext();
    const now = this.ctx.currentTime;

    // Major chord arpeggiation  C5 → E5 → G5 → C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const t = now + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc.connect(gain).connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 2.0);
    });

    // Shimmer overtone
    const shimmer = this.ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 2093;
    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0, now + 0.5);
    sGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    shimmer.connect(sGain).connect(this.masterGain);
    shimmer.start(now + 0.5);
    shimmer.stop(now + 2.6);
  }

  // ── Stop all active oscillators ──────────────────────────────
  stopAll() {
    this.activeNodes.forEach(node => {
      try { node.osc.stop(); } catch { /* already stopped */ }
    });
    this.activeNodes = [];
  }
}
